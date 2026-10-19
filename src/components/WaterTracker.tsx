import React, { useState, useEffect, useRef } from 'react';
import { WaterLog, WaterReminderSettings } from '../types';
import { 
  Droplet, Droplets, Plus, Minus, Bell, BellOff, RefreshCw, 
  Volume2, VolumeX, Sparkles, Check, ChevronRight, Calendar, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

interface WaterTrackerProps {
  waterLogs: WaterLog[];
  onUpdateWaterLogs: (newLogs: WaterLog[]) => void;
  mode?: 'intake' | 'settings_and_history';
}

// Custom sound synthesizer using Web Audio API to play a beautiful water droplet sound
const playWaterSound = (isMuted: boolean, type: 'pour' | 'reset' | 'test') => {
  if (isMuted) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'pour') {
      // Pouring sound: rising sine wave with a little bubble peak
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.35);
      
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'reset') {
      // Standard click/reset pitch
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      // Test notification bell/chime
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime); // A5
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.8);
      osc2.stop(ctx.currentTime + 0.8);
    }
  } catch (e) {
    console.warn('Web Audio playback failed', e);
  }
};

export default function WaterTracker({ waterLogs, onUpdateWaterLogs, mode = 'intake' }: WaterTrackerProps) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Current day data
  const currentLog = waterLogs.find(log => log.date === todayStr) || {
    date: todayStr,
    amount: 0,
    target: 2500
  };

  // State
  const [customAmount, setCustomAmount] = useState<string>('');
  const [activeAlertModal, setActiveAlertModal] = useState<'interval' | 'start' | 'end' | null>(null);
  const [modalAmPm, setModalAmPm] = useState<'AM' | 'PM'>('AM');
  const [selectedHourVal, setSelectedHourVal] = useState<number | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('water_muted') === 'true';
  });
  
  // Custom goal
  const [goalInput, setGoalInput] = useState<number>(currentLog.target);
  const [isEditingGoal, setIsEditingGoal] = useState<boolean>(false);

  // Notification States
  const [permission, setPermission] = useState<string>('default');
  const [settings, setSettings] = useState<WaterReminderSettings>(() => {
    const saved = localStorage.getItem('water_reminder_settings');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      intervalMinutes: 120,
      startHour: 8,
      endHour: 22
    };
  });

  // Animated visual effects
  const [showPourSplash, setShowPourSplash] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState<string | null>(null);

  // Check notification permission on mount
  useEffect(() => {
    const checkPerms = async () => {
      if (Capacitor.isNativePlatform()) {
        try {
          const status = await LocalNotifications.checkPermissions();
          setPermission(status.display);
        } catch (e) {
          console.warn("Failed to check native permissions", e);
        }
      } else if ('Notification' in window) {
        setPermission(Notification.permission);
      }
    };
    checkPerms();
  }, []);

  // Save Settings to local storage
  const saveSettings = (newSettings: WaterReminderSettings) => {
    setSettings(newSettings);
    localStorage.setItem('water_reminder_settings', JSON.stringify(newSettings));
  };

  // Start background notifier interval (within open app session)
  useEffect(() => {
    if (!settings.enabled) return;

    const intervalId = setInterval(() => {
      const now = new Date();
      const currentHour = now.getHours();

      // Ensure current hour fits user start/end configurations
      if (currentHour >= settings.startHour && currentHour < settings.endHour) {
        triggerNotification(
          "Loki Gym Hydration Check 💧", 
          `Keep your workout energy high! Time to drink some water. You are at ${currentLog.amount}/${currentLog.target} ml today.`
        );
      }
    }, settings.intervalMinutes * 60000);

    return () => clearInterval(intervalId);
  }, [settings, currentLog]);

  // Request Notification Permissions
  const handleRequestPermission = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const status = await LocalNotifications.requestPermissions();
        setPermission(status.display);
        if (status.display === 'granted') {
          saveSettings({ ...settings, enabled: true });
          triggerNotification(
            "Hydration Alerts Activated! ⚡", 
            "Excellent choice. We'll send you reminders to hydrate according to your schedule."
          );
        } else {
          alert("Notification permissions denied. Please enable them in your device settings.");
        }
      } catch (e) {
        console.error("Error asking for native permission", e);
      }
    } else {
      if (!('Notification' in window)) {
        alert("This device/browser does not support native push notifications.");
        return;
      }

      try {
        const resp = await Notification.requestPermission();
        setPermission(resp);
        if (resp === 'granted') {
          saveSettings({ ...settings, enabled: true });
          triggerNotification(
            "Hydration Alerts Activated! ⚡", 
            "Excellent choice. We'll send you reminders to hydrate according to your schedule."
          );
        } else if (resp === 'denied') {
          alert("Notification permissions denied. Turn them on manually in browser settings to receive native push notifications.");
        }
      } catch (e) {
        console.error("Error asking for permission", e);
      }
    }
  };

  // Schedule background reminder using Web Service Worker (Fallback)
  const scheduleBackgroundReminderWeb = () => {
    if (!settings.enabled || permission !== 'granted') return;

    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.ready.then(registration => {
        const delayMs = settings.intervalMinutes * 60 * 1000;
        const triggerTime = Date.now() + delayMs;

        // Check if TimestampTrigger is supported in the browser (e.g. Chrome on Android)
        if ('showTrigger' in Notification.prototype && (window as any).TimestampTrigger) {
          try {
            // Cancel existing scheduled notifications with the same tag
            (registration as any).getNotifications({ tag: 'loki-hydration-reminder' }).then((notifications: any[]) => {
              notifications.forEach((n: any) => n.close());
            });

            registration.showNotification("Loki Gym Hydration Check 💧", {
              body: `Keep your workout energy high! Time to drink some water. You are at ${currentLog.amount}/${currentLog.target} ml today.`,
              icon: '/pwa_icon_512_1782540582378.jpg',
              badge: '/pwa_icon_512_1782540582378.jpg',
              tag: 'loki-hydration-reminder',
              renotify: true,
              showTrigger: new (window as any).TimestampTrigger(triggerTime),
              vibrate: [200, 100, 200, 100, 300],
              silent: false,
              actions: [
                { action: 'drink-250', title: 'Drink 250ml 💧' },
                { action: 'drink-500', title: 'Drink 500ml ⚡' }
              ]
            } as any);
          } catch (e) {
            console.warn("Failed to schedule via TimestampTrigger:", e);
          }
        }
      });
    }
  };

  // Schedule background reminders using Capacitor LocalNotifications (Native Android)
  const scheduleBackgroundReminders = async () => {
    if (!settings.enabled || permission !== 'granted') {
      if (Capacitor.isNativePlatform()) {
        try {
          await LocalNotifications.cancel({ 
            notifications: [
              { id: 1001 }, { id: 1002 }, { id: 1003 }, { id: 1004 }, { id: 1005 }
            ] 
          });
        } catch (e) {
          console.warn("Failed to cancel native notifications", e);
        }
      }
      return;
    }

    if (Capacitor.isNativePlatform()) {
      try {
        // Cancel existing scheduled notifications in this range first
        await LocalNotifications.cancel({ 
          notifications: [
            { id: 1001 }, { id: 1002 }, { id: 1003 }, { id: 1004 }, { id: 1005 }
          ] 
        });

        // Schedule the next 5 reminders
        const notifications = [];
        let scheduledTime = Date.now();

        for (let i = 0; i < 5; i++) {
          scheduledTime += settings.intervalMinutes * 60 * 1000;
          const dateObj = new Date(scheduledTime);
          const hour = dateObj.getHours();

          // If scheduled time is outside waking hours, push to next startHour
          if (hour < settings.startHour || hour >= settings.endHour) {
            if (hour >= settings.endHour) {
              dateObj.setDate(dateObj.getDate() + 1);
            }
            dateObj.setHours(settings.startHour, 0, 0, 0);
            scheduledTime = dateObj.getTime();
          }

          notifications.push({
            title: "Loki Gym Hydration Check 💧",
            body: `Keep your workout energy high! Time to drink some water. You are at ${currentLog.amount}/${currentLog.target} ml today.`,
            id: 1001 + i,
            schedule: { at: new Date(scheduledTime) },
            sound: 'droplet.wav',
            vibrationPattern: [200, 100, 200, 100, 300],
            actionTypeId: 'loki-hydration-actions'
          });
        }

        await LocalNotifications.schedule({ notifications });
        console.log("Scheduled 5 native background reminders starting in", settings.intervalMinutes, "minutes");
      } catch (e) {
        console.error("Failed to schedule native notifications", e);
      }
    } else {
      scheduleBackgroundReminderWeb();
    }
  };

  // Automatically schedule background push notifications whenever settings, hydration levels, or permissions change
  useEffect(() => {
    scheduleBackgroundReminders();
  }, [settings, currentLog.amount, permission]);

  // Toggle Reminder alerts
  const handleToggleReminders = () => {
    if (permission !== 'granted') {
      handleRequestPermission();
    } else {
      saveSettings({ ...settings, enabled: !settings.enabled });
      playWaterSound(isMuted, 'reset');
    }
  };

  // Real or Simulated Push Trigger
  const triggerNotification = async (title: string, body: string, showToast = true) => {
    // 1. Play beautiful bell sound
    playWaterSound(isMuted, 'test');

    // 2. Trigger real Notification if authorized
    if (permission === 'granted') {
      if (Capacitor.isNativePlatform()) {
        try {
          await LocalNotifications.schedule({
            notifications: [
              {
                title: title,
                body: body,
                id: Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000),
                sound: 'droplet.wav',
                vibrationPattern: [200, 100, 200, 100, 300],
                actionTypeId: 'loki-hydration-actions'
              } as any
            ]
          });
        } catch (e) {
          console.error("Failed to trigger native notification", e);
        }
      } else {
        const options: any = {
          body: body,
          icon: '/pwa_icon_512_1782540582378.jpg',
          badge: '/pwa_icon_512_1782540582378.jpg',
          tag: 'loki-hydration-reminder',
          renotify: true,
          vibrate: [200, 100, 200, 100, 300], // Android double-vibration haptic pattern
          silent: false,
          actions: [
            {
              action: 'drink-250',
              title: 'Drink 250ml 💧',
            },
            {
              action: 'drink-500',
              title: 'Drink 500ml ⚡',
            }
          ]
        };

        // Always try Service Worker showNotification first (required for Chrome on Android & supports action haptics)
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(title, options).catch(err => {
              console.warn("SW showNotification failed, trying fallback...", err);
              tryFallbackNotification(title, options);
            });
          }).catch(err => {
            console.warn("ServiceWorker ready promise rejected, trying fallback...", err);
            tryFallbackNotification(title, options);
          });
        } else {
          tryFallbackNotification(title, options);
        }
      }
    }

    // 3. Always show highly-visible, polished internal PWA Toast notification for standard app consistency
    if (showToast) {
      setShowNotificationToast(`${title}: ${body}`);
      setTimeout(() => {
        setShowNotificationToast(null);
      }, 6000);
    }
  };

  const tryFallbackNotification = (title: string, options: any) => {
    try {
      new Notification(title, options);
    } catch (err) {
      console.warn("Direct Notification constructor failed.", err);
    }
  };

  // Log specific water volumes
  const addWater = (amount: number) => {
    if (amount <= 0) return;
    
    // Play splash sound!
    playWaterSound(isMuted, 'pour');

    // Trigger splash visualization
    setShowPourSplash(true);
    setTimeout(() => setShowPourSplash(false), 600);

    const updatedLogs = [...waterLogs];
    const logIdx = updatedLogs.findIndex(log => log.date === todayStr);

    if (logIdx >= 0) {
      updatedLogs[logIdx] = {
        ...updatedLogs[logIdx],
        amount: updatedLogs[logIdx].amount + amount
      };
    } else {
      updatedLogs.push({
        date: todayStr,
        amount: amount,
        target: goalInput
      });
    }

    onUpdateWaterLogs(updatedLogs);
    setCustomAmount('');
  };

  // Deduct/Subtract logged water
  const subtractWater = (amount: number) => {
    const updatedLogs = [...waterLogs];
    const logIdx = updatedLogs.findIndex(log => log.date === todayStr);

    if (logIdx >= 0) {
      const currentAmt = updatedLogs[logIdx].amount;
      updatedLogs[logIdx] = {
        ...updatedLogs[logIdx],
        amount: Math.max(0, currentAmt - amount)
      };
      playWaterSound(isMuted, 'reset');
      onUpdateWaterLogs(updatedLogs);
    }
  };

  // Update target goal
  const handleSaveGoal = () => {
    if (goalInput <= 100) return;
    setIsEditingGoal(false);
    playWaterSound(isMuted, 'reset');

    const updatedLogs = [...waterLogs];
    const logIdx = updatedLogs.findIndex(log => log.date === todayStr);

    if (logIdx >= 0) {
      updatedLogs[logIdx] = {
        ...updatedLogs[logIdx],
        target: goalInput
      };
    } else {
      updatedLogs.push({
        date: todayStr,
        amount: 0,
        target: goalInput
      });
    }
    onUpdateWaterLogs(updatedLogs);
  };

  const currentPercent = Math.min(100, Math.round((currentLog.amount / currentLog.target) * 100));

  // Collect last 7 days metrics
  const getLast7Days = () => {
    const results = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = date.toISOString().split('T')[0];
      const foundLog = waterLogs.find(l => l.date === formattedDate);
      
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
      results.push({
        date: formattedDate,
        dayLabel: dayOfWeek[0], // S, M, T, W, T, F, S
        fullDayLabel: dayOfWeek,
        amount: foundLog ? foundLog.amount : 0,
        target: foundLog ? foundLog.target : 2500,
        completed: foundLog ? foundLog.amount >= foundLog.target : false
      });
    }
    return results;
  };

  const last7DaysData = getLast7Days();

  if (mode === 'settings_and_history') {
    return (
      <div className="bg-dark-panel border border-border-dark p-5 md:p-6 shadow-md relative overflow-hidden space-y-6">
        
        {/* Dynamic PWA Toast Reminders overlay */}
        <AnimatePresence>
          {showNotificationToast && (
            <motion.div 
              initial={{ opacity: 0, y: -40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-4 left-4 right-4 z-40 bg-black border-2 border-brand p-4 shadow-2xl flex items-start gap-3 rounded-none cursor-pointer"
              onClick={() => setShowNotificationToast(null)}
            >
              <div className="p-1.5 bg-brand text-black rounded-none">
                <Droplets className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-mono font-black text-brand block uppercase tracking-widest leading-none">Hydration Notification</span>
                <p className="text-xs text-white mt-1.5 font-sans leading-relaxed">{showNotificationToast}</p>
              </div>
              <button className="text-zinc-500 hover:text-white font-mono text-xs">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border-dark pb-4">
          <div>
            <h3 className="text-md md:text-lg font-display font-black italic uppercase text-white tracking-tight flex items-center gap-2">
              <Droplets className="w-5 h-5 text-brand fill-brand/20" /> Hydration Alerts
            </h3>
            <p className="text-[11px] text-[#666] mt-0.5">
              Configure your automatic push reminders schedule and view past hydration history.
            </p>
          </div>

          {/* Alert button status */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleReminders}
              className={`px-3 py-1.5 border font-mono text-[9px] font-extrabold uppercase tracking-widest rounded-none transition flex items-center gap-1.5 cursor-pointer ${
                settings.enabled && permission === 'granted'
                  ? 'bg-brand/10 border-brand text-brand'
                  : 'bg-dark-surface border-border-dark text-zinc-500 hover:text-[#CCC]'
              }`}
            >
              {settings.enabled && permission === 'granted' ? <Bell className="w-3 h-3 animate-pulse" /> : <BellOff className="w-3 h-3" />}
              <span>Reminders {settings.enabled && permission === 'granted' ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={() => triggerNotification(
                "Loki Gym Hydrator Alert! \ud83d\udca7",
                "Your reminder operates on schedule! Keep those bicep fibers fueled. Drink up now!",
                false
              )}
              className="px-3 py-1.5 bg-black hover:bg-brand text-brand hover:text-black border border-brand/40 hover:border-brand font-mono text-[9px] font-extrabold uppercase tracking-widest rounded-none transition cursor-pointer flex items-center gap-1.5"
            >
              <Bell className="w-3 h-3" /> Test Notification
            </button>
          </div>
        </div>

        {/* Notification Customization Settings details (Toggle Accordion / Subpanel) */}
        <div className="bg-dark-surface/40 border border-border-dark p-3.5 rounded-none space-y-3">
          <div className="flex justify-between items-center border-b border-border-dark/60 pb-1.5">
            <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-brand" /> Reminder Schedule Preferences
            </span>
            {permission === 'denied' && (
              <span className="text-[9px] font-mono text-rose-500 font-bold flex items-center gap-1 uppercase">
                <AlertTriangle className="w-3 h-3" /> Notifications Blocked in Browser
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Interval Schedule Selector */}
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">Interval Schedule</label>
              <button
                type="button"
                onClick={() => setActiveAlertModal('interval')}
                className="w-full flex justify-between items-center bg-black border border-brand/40 text-brand py-2 px-3 rounded-none font-mono text-[11px] font-bold focus:border-brand focus:outline-none cursor-pointer text-left uppercase select-none transition hover:bg-zinc-950"
              >
                <span>
                  {settings.intervalMinutes === 30 && "Every 30 Minutes"}
                  {settings.intervalMinutes === 60 && "Every 1 Hour"}
                  {settings.intervalMinutes === 120 && "Every 2 Hours"}
                  {settings.intervalMinutes === 180 && "Every 3 Hours"}
                  {settings.intervalMinutes === 240 && "Every 4 Hours"}
                </span>
                <span className="text-[8px] text-brand/70 font-sans ml-1">▼</span>
              </button>
            </div>

            {/* Start Hour Selector */}
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">Start Reminder Hour</label>
              <button
                type="button"
                onClick={() => {
                  setSelectedHourVal(null);
                  setActiveAlertModal('start');
                }}
                className="w-full flex justify-between items-center bg-black border border-brand/40 text-brand py-2 px-3 rounded-none font-mono text-[11px] font-bold focus:border-brand focus:outline-none cursor-pointer text-left uppercase select-none transition hover:bg-zinc-950"
              >
                <span>
                  {settings.startHour === 0 ? '12' : settings.startHour > 12 ? settings.startHour - 12 : settings.startHour}:00 {settings.startHour >= 12 ? 'PM' : 'AM'}
                </span>
                <span className="text-[8px] text-brand/70 font-sans ml-1">▼</span>
              </button>
            </div>

            {/* End Hour Selector */}
            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-500 font-bold uppercase block">End Reminder Hour</label>
              <button
                type="button"
                onClick={() => {
                  setSelectedHourVal(null);
                  setActiveAlertModal('end');
                }}
                className="w-full flex justify-between items-center bg-black border border-brand/40 text-brand py-2 px-3 rounded-none font-mono text-[11px] font-bold focus:border-brand focus:outline-none cursor-pointer text-left uppercase select-none transition hover:bg-zinc-950"
              >
                <span>
                  {settings.endHour === 0 ? '12' : settings.endHour > 12 ? settings.endHour - 12 : settings.endHour}:00 {settings.endHour >= 12 ? 'PM' : 'AM'}
                </span>
                <span className="text-[8px] text-brand/70 font-sans ml-1">▼</span>
              </button>
            </div>
          </div>
        </div>


        {/* Popout Modal for Hydration Settings Customization */}
        <AnimatePresence>
          {activeAlertModal !== null && (
            <div 
              onClick={() => setActiveAlertModal(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] cursor-pointer"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                onClick={(e) => e.stopPropagation()}
                className={`bg-black border-2 border-brand p-5 w-full shadow-[0_0_60px_rgba(255,230,0,0.2)] font-mono text-xs space-y-4 cursor-default ${
                  activeAlertModal === 'interval' ? 'max-w-xs' : 'max-w-sm'
                }`}
              >
                <div className="flex justify-between items-center border-b border-border-dark/60 pb-2.5">
                  <span className="font-display font-black italic uppercase text-xs text-brand tracking-wider">
                    {activeAlertModal === 'interval' && "Reminder Interval"}
                    {activeAlertModal === 'start' && "Start Reminder Hour"}
                    {activeAlertModal === 'end' && "End Reminder Hour"}
                  </span>
                </div>

                {activeAlertModal === 'interval' ? (
                  /* Interval Choices (1 column layout) */
                  <div className="flex flex-col gap-2">
                    {[
                      { val: 30, lbl: "Every 30 Minutes" },
                      { val: 60, lbl: "Every 1 Hour" },
                      { val: 120, lbl: "Every 2 Hours" },
                      { val: 180, lbl: "Every 3 Hours" },
                      { val: 240, lbl: "Every 4 Hours" }
                    ].map((opt) => {
                      const isSelected = settings.intervalMinutes === opt.val;
                      return (
                        <button
                          key={opt.val}
                          onClick={() => {
                            saveSettings({ ...settings, intervalMinutes: opt.val });
                            setActiveAlertModal(null);
                          }}
                          className={`p-2.5 border text-left transition select-none cursor-pointer flex flex-col justify-center min-h-[44px] ${
                            isSelected
                              ? 'border-brand bg-brand text-black font-black'
                              : 'border-border-dark hover:border-brand/40 text-brand bg-zinc-950/40 hover:bg-zinc-900/50'
                          }`}
                        >
                          <span className="text-[9px] font-bold uppercase leading-tight">{opt.lbl}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : selectedHourVal === null ? (
                  /* Step 1: Choose Hour (12, 1, 2, ..., 11) */
                  <div className="space-y-2">
                    <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block text-center border-b border-border-dark/30 pb-1">Choose Hour</span>
                    <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
                      {Array.from({ length: 12 }).map((_, idx) => {
                        const hourDisplay = idx === 0 ? '12' : idx;
                        const currentHourSetting = activeAlertModal === 'start' ? settings.startHour : settings.endHour;
                        const currentHour12 = currentHourSetting === 0 ? 0 : currentHourSetting % 12;
                        const isSelected = currentHour12 === idx;

                        return (
                          <button
                            key={idx}
                            onClick={() => setSelectedHourVal(idx)}
                            className={`p-3 border text-center transition select-none cursor-pointer text-sm font-black tracking-widest uppercase min-h-[46px] flex items-center justify-center ${
                              isSelected
                                ? 'border-brand bg-brand/10 text-brand'
                                : 'border-border-dark hover:border-brand/40 text-brand bg-zinc-950/40 hover:bg-zinc-900/50'
                            }`}
                          >
                            {hourDisplay}:00
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Step 2: Choose AM or PM */
                  <div className="space-y-3">
                    <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block text-center border-b border-border-dark/30 pb-1">
                      Select Period for {selectedHourVal === 0 ? '12' : selectedHourVal}:00
                    </span>

                    <div className="flex flex-col gap-3 py-2">
                      {/* AM Button */}
                      <button
                        onClick={() => {
                          const finalHour = selectedHourVal; // 0 to 11
                          if (activeAlertModal === 'start') {
                            saveSettings({ ...settings, startHour: finalHour });
                          } else {
                            saveSettings({ ...settings, endHour: finalHour });
                          }
                          setActiveAlertModal(null);
                        }}
                        className="p-5 border-2 border-border-dark hover:border-brand text-brand bg-zinc-950/40 hover:bg-zinc-900/50 text-center transition select-none cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[64px]"
                      >
                        <span className="text-base font-black tracking-widest">AM</span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Set to {selectedHourVal === 0 ? '12' : selectedHourVal}:00 AM</span>
                      </button>

                      {/* PM Button */}
                      <button
                        onClick={() => {
                          const finalHour = selectedHourVal + 12; // 12 to 23
                          if (activeAlertModal === 'start') {
                            saveSettings({ ...settings, startHour: finalHour });
                          } else {
                            saveSettings({ ...settings, endHour: finalHour });
                          }
                          setActiveAlertModal(null);
                        }}
                        className="p-5 border-2 border-border-dark hover:border-brand text-brand bg-zinc-950/40 hover:bg-zinc-900/50 text-center transition select-none cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[64px]"
                      >
                        <span className="text-base font-black tracking-widest">PM</span>
                        <span className="text-[9px] text-zinc-500 font-bold uppercase">Set to {selectedHourVal === 0 ? '12' : selectedHourVal}:00 PM</span>
                      </button>
                    </div>

                    <button
                      onClick={() => setSelectedHourVal(null)}
                      className="w-full text-center py-2 text-zinc-500 hover:text-white transition text-[9px] uppercase tracking-wider font-bold block mt-2 border border-dashed border-border-dark/60 select-none cursor-pointer"
                    >
                      ← Back to Hours
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    );
  }

  return (
    <div className="bg-dark-panel border border-border-dark p-5 md:p-6 shadow-md relative overflow-hidden">
      
      {/* Dynamic PWA Toast Reminders overlay */}
      <AnimatePresence>
        {showNotificationToast && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-4 right-4 z-40 bg-black border-2 border-brand p-4 shadow-2xl flex items-start gap-3 rounded-none cursor-pointer"
            onClick={() => setShowNotificationToast(null)}
          >
            <div className="p-1.5 bg-brand text-black rounded-none">
              <Droplets className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <span className="text-[10px] font-mono font-black text-brand block uppercase tracking-widest leading-none">Hydration Notification</span>
              <p className="text-xs text-white mt-1.5 font-sans leading-relaxed">{showNotificationToast}</p>
            </div>
            <button className="text-zinc-500 hover:text-white font-mono text-xs">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Two Columns Grid: Hydration Display & Intake Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        {/* Left Side: Water Cylinder Animation */}
        <div className="md:col-span-5 flex flex-col items-center justify-center p-4 relative bg-dark-surface/40 border border-border-dark/60 py-6">
          <h3 className="text-xs font-mono font-black uppercase text-brand tracking-widest mb-4 flex items-center gap-1.5">
            <Droplet className="w-3.5 h-3.5 text-brand fill-brand/20 animate-pulse" /> WATER INTAKE
          </h3>
          
          {/* Splash particle feedback */}
          <AnimatePresence>
            {showPourSplash && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1.1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
              >
                <div className="w-24 h-24 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-brand animate-spin" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hydro Chamber Cylinder */}
          <div className="relative w-36 h-56 border-x-2 border-b-2 border-t border-border-dark bg-[#060606] shadow-inner overflow-hidden flex items-end">
            
            {/* Liquid level wave fill */}
            <motion.div 
              animate={{ height: `${currentPercent}%` }}
              transition={{ type: 'spring', damping: 20, stiffness: 60 }}
              className="w-full bg-brand/15 border-t border-brand flex flex-col items-center justify-center relative overflow-hidden"
              style={{ minHeight: currentPercent > 0 ? '5%' : '0%' }}
            >
              {/* Internal subtle wave patterns */}
              <div className="absolute inset-0 bg-gradient-to-t from-brand/5 to-transparent animate-pulse" />
              
              {/* Display inside fluid when filled enough */}
              {currentPercent >= 15 && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-[14px] font-black text-brand tracking-widest z-10 select-none mix-blend-difference"
                >
                  {currentPercent}%
                </motion.span>
              )}
            </motion.div>

            {/* Empty center metrics overlays */}
            <div className="absolute inset-0 flex flex-col items-center justify-between py-6 z-10 pointer-events-none text-center">
              <span className="text-[9px] font-mono text-zinc-800 font-extrabold tracking-widest">CHAMBER CAPACITY</span>
              
              {currentPercent < 15 && (
                <div className="space-y-0.5">
                  <span className="text-lg font-black font-mono text-zinc-400 block">{currentLog.amount}</span>
                  <span className="text-[9px] font-mono text-[#666] block">ML</span>
                </div>
              )}
              
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono text-[#666] block uppercase tracking-wider">Target Goal</span>
                {isEditingGoal ? (
                  <div className="flex items-center pointer-events-auto gap-1">
                    <input 
                      type="number" 
                      value={goalInput}
                      onChange={(e) => setGoalInput(Number(e.target.value))}
                      className="w-16 bg-black border border-border-dark text-[11px] text-center text-white p-0.5 font-mono"
                    />
                    <button 
                      onClick={handleSaveGoal}
                      className="bg-brand text-black px-1.5 text-[9px] font-mono font-bold"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <span 
                    onClick={() => setIsEditingGoal(true)}
                    className="text-[10px] font-mono text-brand font-black underline decoration-dotted cursor-pointer pointer-events-auto hover:text-white"
                  >
                    {currentLog.target} ML
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <div className="flex items-baseline gap-1 justify-center">
              <span className="text-xl font-black font-mono text-white">{currentLog.amount}</span>
              <span className="text-xs font-mono text-[#666]">/</span>
              <span className="text-xs font-mono text-zinc-400">{currentLog.target} ml</span>
            </div>
            {currentPercent >= 100 && (
              <span className="text-[9px] font-mono text-brand font-black tracking-widest uppercase block mt-1 animate-pulse">
                ✓ Muscle Hydration Achieved
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Intake Logs & Buttons Grid */}
        <div className="md:col-span-7 space-y-4">
          <div className="text-xs uppercase tracking-widest text-zinc-400 font-black font-mono block border-b border-border-dark pb-1.5">
            Log Water Intake
          </div>

          {/* Grid of standard sizes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={() => addWater(250)}
              className="bg-dark-surface border border-border-dark hover:border-brand/40 hover:bg-dark-card p-3 rounded-none text-left transition group cursor-pointer"
            >
              <span className="text-[9px] font-mono text-[#666] block uppercase font-bold">Small Cup</span>
              <span className="text-md font-black font-mono text-white block mt-1 group-hover:text-brand transition">+250ml</span>
            </button>

            <button
              onClick={() => addWater(350)}
              className="bg-dark-surface border border-border-dark hover:border-brand/40 hover:bg-dark-card p-3 rounded-none text-left transition group cursor-pointer"
            >
              <span className="text-[9px] font-mono text-[#666] block uppercase font-bold">Standard Glass</span>
              <span className="text-md font-black font-mono text-white block mt-1 group-hover:text-brand transition">+350ml</span>
            </button>

            <button
              onClick={() => addWater(500)}
              className="bg-dark-surface border border-border-dark hover:border-brand/40 hover:bg-dark-card p-3 rounded-none text-left transition group cursor-pointer"
            >
              <span className="text-[9px] font-mono text-[#666] block uppercase font-bold">Sports Bottle</span>
              <span className="text-md font-black font-mono text-white block mt-1 group-hover:text-brand transition">+500ml</span>
            </button>

            <button
              onClick={() => addWater(750)}
              className="bg-dark-surface border border-border-dark hover:border-brand/40 hover:bg-dark-card p-3 rounded-none text-left transition group cursor-pointer"
            >
              <span className="text-[9px] font-mono text-[#666] block uppercase font-bold">Massive Flask</span>
              <span className="text-md font-black font-mono text-white block mt-1 group-hover:text-brand transition">+750ml</span>
            </button>
          </div>

          {/* Custom volume input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="number" 
                placeholder="Custom log amount... (e.g., 400)" 
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full bg-dark-bg border border-border-dark focus:border-brand/50 px-3 py-2 text-xs font-mono font-bold text-white rounded-none outline-none focus:ring-0 transition"
              />
              <span className="absolute right-3 top-2 text-zinc-600 font-mono text-xs font-bold uppercase">ML</span>
            </div>
            
            <button
              onClick={() => addWater(Number(customAmount))}
              disabled={!customAmount || Number(customAmount) <= 0}
              className="bg-white hover:bg-brand text-black disabled:bg-zinc-800 disabled:text-zinc-500 font-black uppercase text-xs px-4 rounded-none transition cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Log
            </button>
            
            {currentLog.amount > 0 && (
              <button
                onClick={() => subtractWater(250)}
                title="Deduct 250ml"
                className="bg-dark-surface hover:bg-rose-950/20 text-zinc-500 hover:text-rose-500 border border-border-dark hover:border-rose-500/30 px-3 rounded-none transition cursor-pointer flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Historic Logs section (Last 7 Days) */}
      <div className="space-y-3 pt-6 border-t border-border-dark/60 mt-6">
        <div className="text-xs uppercase tracking-widest text-zinc-400 font-black font-mono block border-b border-border-dark pb-1.5 flex justify-between items-center">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 7-Day Hydration History</span>
          <span className="text-[10px] text-zinc-600 font-mono font-bold lowercase">target achievements marked in yellow</span>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {last7DaysData.map((d, index) => {
            const pct = Math.min(100, Math.round((d.amount / d.target) * 100));
            const isToday = d.date === todayStr;

            return (
              <div 
                key={d.date} 
                className={`bg-dark-surface border p-2 flex flex-col items-center justify-between rounded-none text-center min-h-[95px] relative group ${
                  isToday 
                    ? 'border-brand' 
                    : d.completed 
                      ? 'border-brand/40' 
                      : 'border-border-dark/60'
                }`}
              >
                {/* Visual height bar inside each day block */}
                <div className="absolute inset-x-0 bottom-0 bg-brand/5 transition-all" style={{ height: `${pct}%` }} />

                <span className="text-[9px] font-mono text-[#666] font-bold block uppercase z-10 leading-none">{d.fullDayLabel[0]}</span>
                
                <div className="z-10 mt-1">
                  <span className={`text-[11px] font-bold font-mono block leading-none ${d.completed ? 'text-brand' : 'text-zinc-400'}`}>
                    {d.amount > 1000 ? `${(d.amount/1000).toFixed(1)}l` : `${d.amount}`}
                  </span>
                  <span className="text-[8px] font-mono text-[#555] block mt-0.5 leading-none">logged</span>
                </div>

                <div className="z-10 mt-1">
                  {d.completed ? (
                    <div className="w-4 h-4 bg-brand rounded-full flex items-center justify-center border border-black animate-pulse" title="Daily Goal Met!">
                      <Check className="w-2.5 h-2.5 text-black stroke-[3.5]" />
                    </div>
                  ) : (
                    <span className="text-[8px] font-mono text-[#666]">{pct}%</span>
                  )}
                </div>

                {/* Hover label for date */}
                <div className="absolute -top-7 bg-black border border-border-dark text-[8px] font-mono px-1 py-0.5 pointer-events-none opacity-0 group-hover:opacity-100 transition duration-150 z-20 whitespace-nowrap">
                  {d.date} ({d.amount}/{d.target}ml)
                </div>
              </div>
            );
          })}
        </div>
      </div>      {/* Popout Modal for Hydration Settings Customization */}
      <AnimatePresence>
        {activeAlertModal !== null && (
          <div 
            onClick={() => setActiveAlertModal(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className={`bg-black border-2 border-brand p-5 w-full shadow-[0_0_60px_rgba(255,230,0,0.2)] font-mono text-xs space-y-4 cursor-default ${
                activeAlertModal === 'interval' ? 'max-w-xs' : 'max-w-sm'
              }`}
            >
              <div className="flex justify-between items-center border-b border-border-dark/60 pb-2.5">
                <span className="font-display font-black italic uppercase text-xs text-brand tracking-wider">
                  {activeAlertModal === 'interval' && "Reminder Interval"}
                  {activeAlertModal === 'start' && "Start Reminder Hour"}
                  {activeAlertModal === 'end' && "End Reminder Hour"}
                </span>
              </div>

              {activeAlertModal === 'interval' ? (
                /* Interval Choices (1 column layout) */
                <div className="flex flex-col gap-2">
                  {[
                    { val: 30, lbl: "Every 30 Minutes" },
                    { val: 60, lbl: "Every 1 Hour" },
                    { val: 120, lbl: "Every 2 Hours" },
                    { val: 180, lbl: "Every 3 Hours" },
                    { val: 240, lbl: "Every 4 Hours" }
                  ].map((opt) => {
                    const isSelected = settings.intervalMinutes === opt.val;
                    return (
                      <button
                        key={opt.val}
                        onClick={() => {
                          saveSettings({ ...settings, intervalMinutes: opt.val });
                          setActiveAlertModal(null);
                        }}
                        className={`p-2.5 border text-left transition select-none cursor-pointer flex flex-col justify-center min-h-[44px] ${
                          isSelected
                            ? 'border-brand bg-brand text-black font-black'
                            : 'border-border-dark hover:border-brand/40 text-brand bg-zinc-950/40 hover:bg-zinc-900/50'
                        }`}
                      >
                        <span className="text-[9px] font-bold uppercase leading-tight">{opt.lbl}</span>
                      </button>
                    );
                  })}
                </div>
              ) : selectedHourVal === null ? (
                /* Step 1: Choose Hour (12, 1, 2, ..., 11) */
                <div className="space-y-2">
                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block text-center border-b border-border-dark/30 pb-1">Choose Hour</span>
                  <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-1">
                    {Array.from({ length: 12 }).map((_, idx) => {
                      const hourDisplay = idx === 0 ? '12' : idx;
                      const currentHourSetting = activeAlertModal === 'start' ? settings.startHour : settings.endHour;
                      const currentHour12 = currentHourSetting === 0 ? 0 : currentHourSetting % 12;
                      const isSelected = currentHour12 === idx;

                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedHourVal(idx)}
                          className={`p-3 border text-center transition select-none cursor-pointer text-sm font-black tracking-widest uppercase min-h-[46px] flex items-center justify-center ${
                            isSelected
                              ? 'border-brand bg-brand/10 text-brand'
                              : 'border-border-dark hover:border-brand/40 text-brand bg-zinc-950/40 hover:bg-zinc-900/50'
                          }`}
                        >
                          {hourDisplay}:00
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Step 2: Choose AM or PM */
                <div className="space-y-3">
                  <span className="text-[9px] font-mono text-zinc-500 font-bold uppercase tracking-wider block text-center border-b border-border-dark/30 pb-1">
                    Select Period for {selectedHourVal === 0 ? '12' : selectedHourVal}:00
                  </span>

                  <div className="flex flex-col gap-3 py-2">
                    {/* AM Button */}
                    <button
                      onClick={() => {
                        const finalHour = selectedHourVal; // 0 to 11
                        if (activeAlertModal === 'start') {
                          saveSettings({ ...settings, startHour: finalHour });
                        } else {
                          saveSettings({ ...settings, endHour: finalHour });
                        }
                        setActiveAlertModal(null);
                      }}
                      className="p-5 border-2 border-border-dark hover:border-brand text-brand bg-zinc-950/40 hover:bg-zinc-900/50 text-center transition select-none cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[64px]"
                    >
                      <span className="text-base font-black tracking-widest">AM</span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase">Set to {selectedHourVal === 0 ? '12' : selectedHourVal}:00 AM</span>
                    </button>

                    {/* PM Button */}
                    <button
                      onClick={() => {
                        const finalHour = selectedHourVal + 12; // 12 to 23
                        if (activeAlertModal === 'start') {
                          saveSettings({ ...settings, startHour: finalHour });
                        } else {
                          saveSettings({ ...settings, endHour: finalHour });
                        }
                        setActiveAlertModal(null);
                      }}
                      className="p-5 border-2 border-border-dark hover:border-brand text-brand bg-zinc-950/40 hover:bg-zinc-900/50 text-center transition select-none cursor-pointer flex flex-col items-center justify-center gap-1 min-h-[64px]"
                    >
                      <span className="text-base font-black tracking-widest">PM</span>
                      <span className="text-[9px] text-zinc-500 font-bold uppercase">Set to {selectedHourVal === 0 ? '12' : selectedHourVal}:00 PM</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedHourVal(null)}
                    className="w-full text-center py-2 text-zinc-500 hover:text-white transition text-[9px] uppercase tracking-wider font-bold block mt-2 border border-dashed border-border-dark/60 select-none cursor-pointer"
                  >
                    ← Back to Hours
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
