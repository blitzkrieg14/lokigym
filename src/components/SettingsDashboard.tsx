import React, { useState, useRef, useEffect } from 'react';
import { 
  Cloud, Upload, Download, Home, Settings, Palette, ChevronDown, Sparkles,
  Heart, CheckCircle2, ShieldAlert, Footprints, Droplets, User, Scale,
  RefreshCw, ExternalLink, AlertCircle, Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Health } from '@capgo/capacitor-health';
import { WaterLog } from '../types';
import WaterTracker from './WaterTracker';
import { APP_VERSION, GITHUB_REPO_URL, GITHUB_RELEASES_URL, GITHUB_FULL_REPO } from '../version';
import { checkForUpdate, triggerDownload, getAutoCheckEnabled, setAutoCheckEnabled, AppUpdateInfo } from '../services/updateService';
import { getDartsServerUrl, setDartsServerUrl, getDartsBroadcastEnabled, setDartsBroadcastEnabled, testDartsServerConnection } from '../services/broadcastService';

interface SettingsDashboardProps {
  onExportBackup: () => void;
  onImportBackup: (file: File) => void;
  discordWebhookUrl: string;
  onSaveDiscordWebhookUrl: (url: string) => void;
  homeAssistantWebhookUrl: string;
  haTriggerOnStart: boolean;
  haTriggerOnComplete: boolean;
  onSaveHomeAssistantSettings: (url: string, triggerStart: boolean, triggerComplete: boolean) => void;
  currentTheme: string;
  onSelectTheme: (theme: string) => void;
  geminiApiKey: string;
  onSaveGeminiApiKey: (key: string) => void;
  healthCards: string[];
  onUpdateHealthCards: (cards: string[]) => void;
  waterLogs: WaterLog[];
  onUpdateWaterLogs: (logs: WaterLog[]) => void;
  userNickname: string;
  onUpdateUserNickname: (nickname: string) => void;
  lokiAiEngine: 'gemini_api' | 'gemini_nano';
  onUpdateLokiAiEngine: (engine: 'gemini_api' | 'gemini_nano') => void;
  distanceUnit: 'km' | 'mi';
  onUpdateDistanceUnit: (unit: 'km' | 'mi') => void;
  weightUnit: 'lbs' | 'kg';
  onUpdateWeightUnit: (unit: 'lbs' | 'kg') => void;
}

export default function SettingsDashboard({
  onExportBackup,
  onImportBackup,
  discordWebhookUrl,
  onSaveDiscordWebhookUrl,
  homeAssistantWebhookUrl,
  haTriggerOnStart,
  haTriggerOnComplete,
  onSaveHomeAssistantSettings,
  currentTheme,
  onSelectTheme,
  geminiApiKey,
  onSaveGeminiApiKey,
  healthCards,
  onUpdateHealthCards,
  waterLogs,
  onUpdateWaterLogs,
  userNickname,
  onUpdateUserNickname,
  lokiAiEngine,
  onUpdateLokiAiEngine,
  distanceUnit,
  onUpdateDistanceUnit,
  weightUnit,
  onUpdateWeightUnit
}: SettingsDashboardProps) {
  // Accordion active state (null = all collapsed by default)
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Popout modal for customizing slots
  const [activeSlotModal, setActiveSlotModal] = useState<number | null>(null);

  // Discord Integration State
  const [webhookInput, setWebhookInput] = useState(discordWebhookUrl);
  const [isTestingDiscord, setIsTestingDiscord] = useState(false);

  // Home Assistant Integration State
  const [haWebhookInput, setHaWebhookInput] = useState(homeAssistantWebhookUrl);
  const [haStartInput, setHaStartInput] = useState(haTriggerOnStart);
  const [haCompleteInput, setHaCompleteInput] = useState(haTriggerOnComplete);
  const [isTestingHA, setIsTestingHA] = useState(false);

  // Gemini API Integration State
  const [geminiKeyInput, setGeminiKeyInput] = useState(geminiApiKey);
  const [activeIntegrationSubTab, setActiveIntegrationSubTab] = useState<'gemini' | 'discord' | 'ha' | 'darts'>('gemini');
  const [isTestingGemini, setIsTestingGemini] = useState(false);

  // Darts Scoreboard Integration State
  const [dartsUrlInput, setDartsUrlInput] = useState(() => getDartsServerUrl());
  const [dartsBroadcastInput, setDartsBroadcastInput] = useState(() => getDartsBroadcastEnabled());
  const [isTestingDarts, setIsTestingDarts] = useState(false);
  const [dartsTestResult, setDartsTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveDartsSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setDartsServerUrl(dartsUrlInput);
    setDartsBroadcastEnabled(dartsBroadcastInput);
    setDartsUrlInput(getDartsServerUrl());
    alert("Darts Scoreboard settings saved successfully!");
  };

  const handleTestDarts = async () => {
    setIsTestingDarts(true);
    setDartsTestResult(null);
    try {
      const res = await testDartsServerConnection(dartsUrlInput);
      setDartsTestResult(res);
    } finally {
      setIsTestingDarts(false);
    }
  };

  const fileInputRefBackup = useRef<HTMLInputElement>(null);

  // Health Connect Integration State
  const [isHealthAvailable, setIsHealthAvailable] = useState<boolean | null>(null);
  const [healthPermissionStatus, setHealthPermissionStatus] = useState<'granted' | 'denied' | 'checking'>('checking');

  // GitHub App Updates State
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateResult, setUpdateResult] = useState<AppUpdateInfo | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [autoCheckUpdates, setAutoCheckUpdates] = useState<boolean>(() => getAutoCheckEnabled());

  const handleCheckUpdate = async () => {
    setCheckingUpdate(true);
    setUpdateError(null);
    try {
      const res = await checkForUpdate(true);
      setUpdateResult(res);
    } catch (err: any) {
      setUpdateError(err?.message || 'Failed to check GitHub releases');
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleToggleAutoCheck = (enabled: boolean) => {
    setAutoCheckUpdates(enabled);
    setAutoCheckEnabled(enabled);
  };

  // Verify permission status silently on mount
  useEffect(() => {
    async function checkHealthStatus() {
      try {
        const availableStatus = await Health.isAvailable();
        const available = availableStatus.available;
        setIsHealthAvailable(available);
        if (available) {
          const authorized = await Health.checkAuthorization({
            read: ['steps', 'calories', 'weight', 'heartRate'],
            write: ['weight']
          });
          const allGranted = authorized.readDenied.length === 0 && authorized.writeDenied.length === 0;
          setHealthPermissionStatus(allGranted ? 'granted' : 'denied');
        } else {
          setHealthPermissionStatus('denied');
        }
      } catch (e) {
        setHealthPermissionStatus('denied');
      }
    }
    checkHealthStatus();
  }, []);

  const handleRequestHealthPermission = async () => {
    try {
      const authorized = await Health.requestAuthorization({
        read: ['steps', 'calories', 'weight', 'heartRate'],
        write: []
      });
      const allGranted = authorized.readDenied.length === 0 && authorized.writeDenied.length === 0;
      setHealthPermissionStatus(allGranted ? 'granted' : 'denied');
      if (allGranted) {
        alert("Health Connect authorization granted successfully!");
      } else {
        alert("Some permissions were not granted. Please verify your settings.");
      }
    } catch (e: any) {
      alert("Permission request failed: " + (e?.message || e));
    }
  };



  const handleSlotChange = (slotIndex: number, value: string) => {
    const updated = [...healthCards];
    updated[slotIndex] = value;
    onUpdateHealthCards(updated);
  };

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportBackup(e.target.files[0]);
    }
  };

  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveDiscordWebhookUrl(webhookInput.trim());
    alert("Discord Webhook URL saved successfully!");
  };

  const handleSendTestMessage = async () => {
    if (!discordWebhookUrl) return;
    setIsTestingDiscord(true);
    try {
      const res = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: "Loki Gym Tracker",
          content: "⚡ **Loki Gym Connection Successful!** Your workout tracker is now linked to this channel. Keep crushing your limits! ⚡"
        })
      });
      if (res.ok) {
        alert("Test message sent successfully! Check your Discord channel.");
      } else {
        alert("Failed to send test message. Please verify your Webhook URL.");
      }
    } catch (e) {
      alert("Error sending test message: " + e);
    } finally {
      setIsTestingDiscord(false);
    }
  };

  const handleSaveHASettings = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveHomeAssistantSettings(haWebhookInput.trim(), haStartInput, haCompleteInput);
    alert("Home Assistant settings saved successfully!");
  };

  const handleSendHATestMessage = async () => {
    if (!homeAssistantWebhookUrl) return;
    setIsTestingHA(true);
    try {
      const res = await fetch(homeAssistantWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: "test_connection",
          message: "Hello from Loki Gym Tracker! Connection verified.",
          timestamp: new Date().toISOString()
        })
      });
      if (res.status >= 200 && res.status < 300) {
        alert("Test webhook sent successfully! Check your Home Assistant automation execution logs.");
      } else {
        alert(`Sent, but Home Assistant returned status code: ${res.status}`);
      }
    } catch (e) {
      alert("Error sending webhook: " + e + "\n\nNote: If using a local IP, make sure your phone is on the same WiFi network!");
    } finally {
      setIsTestingHA(false);
    }
  };

  const handleSaveGeminiKey = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveGeminiApiKey(geminiKeyInput.trim());
    alert("Gemini API Key saved successfully!");
  };

  const handleTestGeminiKey = async () => {
    if (!geminiKeyInput) return;
    setIsTestingGemini(true);
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiKeyInput.trim()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Hello! Reply with exactly 'Loki connection verified!'." }] }]
        })
      });
      const data = await res.json();
      if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
        alert("Success! Connection to Gemini API verified successfully.");
      } else {
        alert("Failed to connect. Please verify your API Key. Error: " + (data.error?.message || JSON.stringify(data)));
      }
    } catch (e) {
      alert("Error connecting to Gemini API: " + e);
    } finally {
      setIsTestingGemini(false);
    }
  };

  const themesList = [
    { id: 'volt', name: 'Loki Volt', colorClass: 'bg-[#FFE600]', borderClass: 'border-[#FFE600]', desc: 'Electric Yellow' },
    { id: 'crimson', name: 'Viking Crimson', colorClass: 'bg-[#EF4444]', borderClass: 'border-[#EF4444]', desc: 'Warrior Red' },
    { id: 'frost', name: 'Nordic Frost', colorClass: 'bg-[#06B6D4]', borderClass: 'border-[#06B6D4]', desc: 'Arctic Cyan' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon', colorClass: 'bg-[#EC4899]', borderClass: 'border-[#EC4899]', desc: 'Synth Pink' },
    { id: 'forest', name: 'Ragnarok Forest', colorClass: 'bg-[#10B981]', borderClass: 'border-[#10B981]', desc: 'Emerald Green' }
  ];

  // Load today's biometrics for display on metric choices modal
  const getMetricCurrentValue = (metricId: string): string => {
    const todayStr = new Date().toISOString().split('T')[0];
    const daySeed = new Date(todayStr).getDate() || 1;

    switch (metricId) {
      case 'calories': {
        const saved = localStorage.getItem('workout_today_total_calories');
        return saved ? `${saved} kcal` : '0 kcal';
      }
      case 'active_calories': {
        const saved = localStorage.getItem('workout_today_active_calories');
        return saved ? `${saved} kcal` : '0 kcal';
      }
      case 'steps': {
        const saved = localStorage.getItem('workout_today_steps');
        return saved ? `${Number(saved).toLocaleString()} steps` : '0 steps';
      }
      case 'water': {
        const todayWater = waterLogs.find(w => w.date === todayStr);
        const amount = todayWater ? todayWater.amount : 0;
        return amount >= 1000 ? `${(amount / 1000).toFixed(1)} L` : `${amount} ml`;
      }
      case 'weight': {
        const savedWeight = localStorage.getItem('workout_weight_history');
        if (savedWeight) {
          try {
            const logs = JSON.parse(savedWeight);
            const todayLog = logs.find((w: any) => w.date === todayStr) || logs[0];
            if (todayLog) return `${todayLog.weight} ${todayLog.unit}`;
          } catch (_) {}
        }
        return 'No Log';
      }
      case 'distance': {
        const savedBio = localStorage.getItem('workout_biometrics_history');
        if (savedBio) {
          try {
            const history = JSON.parse(savedBio);
            const todayBio = history.find((h: any) => h.date === todayStr);
            if (todayBio && todayBio.distance > 0) {
              return `${(todayBio.distance * 0.000621371).toFixed(2)} mi`;
            }
          } catch (_) {}
        }
        return '0.00 mi';
      }
      case 'heart_rate': {
        const savedBio = localStorage.getItem('workout_biometrics_history');
        if (savedBio) {
          try {
            const history = JSON.parse(savedBio);
            const todayBio = history.find((h: any) => h.date === todayStr);
            if (todayBio && todayBio.avgHeartRate > 0) {
              return `${Math.round(todayBio.avgHeartRate)} bpm`;
            }
          } catch (_) {}
        }
        return 'No Data';
      }
      case 'sleep': {
        const val = (7 + (daySeed % 3) * 0.5).toFixed(1);
        return `${val} hrs`;
      }
      case 'body_fat': {
        const val = (14.5 + (daySeed % 6) * 0.5).toFixed(1);
        return `${val} %`;
      }
      case 'stairs': {
        const val = 2 + (daySeed % 12);
        return `${val} flights`;
      }
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-dark pb-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-black italic uppercase text-white tracking-tight flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-brand" /> Settings & Integrations
          </h2>
          <p className="text-xs text-[#666] mt-1">
            Manage your local database backup files and configure third-party webhook integrations.
          </p>
        </div>
      </div>

      {/* Warrior Moniker settings block */}
      <div className="bg-dark-panel border border-border-dark shadow-md">
        <div className="p-5 md:p-6 space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-brand" />
              <h3 className="text-xs uppercase tracking-wider text-brand font-black">Warrior Moniker</h3>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-xl">
              Customize the name or moniker by which the Loki AI Coach addresses you in Midgard.
            </p>
          </div>

          <div className="max-w-xs pt-1">
            <input 
              type="text" 
              value={userNickname}
              onChange={(e) => onUpdateUserNickname(e.target.value.substring(0, 20))}
              placeholder="Enter your nickname..."
              className="w-full bg-black border border-border-dark focus:border-brand focus:outline-none rounded-none py-2 px-3 text-xs text-white placeholder-zinc-700 transition"
            />
          </div>
        </div>
      </div>

      {/* Units of Measure Preferences Card */}
      <div className="bg-dark-panel border border-border-dark shadow-md">
        <button
          onClick={() => toggleSection('units')}
          className="w-full text-left p-5 md:p-6 cursor-pointer hover:bg-dark-surface/30 transition flex justify-between items-center select-none"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="w-4.5 h-4.5 text-brand" />
              <h3 className="text-xs uppercase tracking-wider text-brand font-black">Units of Measure</h3>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-xl">
              Configure your preferences for speed, distance, and weight units.
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${
              activeSection === 'units' ? 'rotate-180 text-brand' : ''
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {activeSection === 'units' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-border-dark/40"
            >
              <div className="p-5 md:p-6 space-y-4 font-sans text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                  {/* Distance & Speed Unit */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">Distance & Speed System</label>
                    <div className="flex bg-black border border-border-dark p-1 max-w-xs">
                      <button
                        type="button"
                        onClick={() => onUpdateDistanceUnit('km')}
                        className={`flex-1 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition rounded-none cursor-pointer ${
                          distanceUnit === 'km'
                            ? 'bg-brand text-black font-black'
                            : 'text-[#888] hover:text-white hover:bg-dark-surface'
                        }`}
                      >
                        Metric (km & km/h)
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateDistanceUnit('mi')}
                        className={`flex-1 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition rounded-none cursor-pointer ${
                          distanceUnit === 'mi'
                            ? 'bg-brand text-black font-black'
                            : 'text-[#888] hover:text-white hover:bg-dark-surface'
                        }`}
                      >
                        Imperial (mi & mph)
                      </button>
                    </div>
                  </div>

                  {/* Weight Unit */}
                  <div className="space-y-2.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">Weight System</label>
                    <div className="flex bg-black border border-border-dark p-1 max-w-xs">
                      <button
                        type="button"
                        onClick={() => onUpdateWeightUnit('lbs')}
                        className={`flex-1 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition rounded-none cursor-pointer ${
                          weightUnit === 'lbs'
                            ? 'bg-brand text-black font-black'
                            : 'text-[#888] hover:text-white hover:bg-dark-surface'
                        }`}
                      >
                        Pounds (lbs)
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateWeightUnit('kg')}
                        className={`flex-1 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition rounded-none cursor-pointer ${
                          weightUnit === 'kg'
                            ? 'bg-brand text-black font-black'
                            : 'text-[#888] hover:text-white hover:bg-dark-surface'
                        }`}
                      >
                        Kilograms (kg)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 1. Color Scheme Selection Card */}
      <div className="bg-dark-panel border border-border-dark shadow-md">
        <button
          onClick={() => toggleSection('scheme')}
          className="w-full text-left p-5 md:p-6 cursor-pointer hover:bg-dark-surface/30 transition flex justify-between items-center select-none"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Palette className="w-4.5 h-4.5 text-brand" />
              <h3 className="text-xs uppercase tracking-wider text-brand font-black">App Color Scheme</h3>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-xl">
              Customize the primary accent color and background style of the Loki Gym interface.
            </p>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${
              activeSection === 'scheme' ? 'rotate-180 text-brand' : ''
            }`} 
          />
        </button>

        <AnimatePresence initial={false}>
          {activeSection === 'scheme' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-border-dark/40"
            >
              <div className="p-5 md:p-6 space-y-4 font-sans">
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  {themesList.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onSelectTheme(t.id)}
                      className={`p-3 border flex flex-col items-center justify-center text-center rounded-none transition cursor-pointer select-none gap-2.5 bg-dark-surface hover:bg-dark-card ${
                        currentTheme === t.id 
                          ? `${t.borderClass} text-white` 
                          : 'border-border-dark text-zinc-400 hover:text-white'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full ${t.colorClass} border border-black shadow-md flex items-center justify-center`}>
                        {currentTheme === t.id && (
                          <div className="w-2 h-2 bg-black rounded-full" />
                        )}
                      </div>
                      
                      <div>
                        <span className="text-xs font-bold block leading-none">{t.name}</span>
                        <span className="text-[8px] text-zinc-500 block mt-1.5 uppercase font-mono leading-none">{t.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 1.5 Health Analytics Customization Accordion */}
      <div className="bg-dark-panel border border-border-dark shadow-md">
        <button
          onClick={() => toggleSection('health_analytics')}
          className="w-full text-left p-5 md:p-6 cursor-pointer hover:bg-dark-surface/30 transition flex justify-between items-center select-none"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Footprints className="w-4.5 h-4.5 text-brand" />
              <h3 className="text-xs uppercase tracking-wider text-brand font-black">Health Analytics Customization</h3>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-xl">
              Choose which metrics to display in the three slots at the bottom of your Health Analytics tab.
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${
              activeSection === 'health_analytics' ? 'rotate-180 text-brand' : ''
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {activeSection === 'health_analytics' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-border-dark/40"
            >
              <div className="p-5 md:p-6 space-y-4 font-sans text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Slot 1 Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">Slot 1 (Left Card)</label>
                    <button
                      type="button"
                      onClick={() => setActiveSlotModal(0)}
                      className="w-full flex justify-between items-center bg-black border border-brand/40 text-brand py-2.5 px-3 rounded-none font-mono text-[11px] font-bold focus:border-brand focus:outline-none cursor-pointer text-left uppercase select-none transition hover:bg-zinc-950"
                    >
                      <span>{metricOptions.find(o => o.value === healthCards[0])?.label || 'Total Energy'}</span>
                      <span className="text-[8px] text-brand/70 font-sans ml-1">▼</span>
                    </button>
                  </div>

                  {/* Slot 2 Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">Slot 2 (Middle Card)</label>
                    <button
                      type="button"
                      onClick={() => setActiveSlotModal(1)}
                      className="w-full flex justify-between items-center bg-black border border-brand/40 text-brand py-2.5 px-3 rounded-none font-mono text-[11px] font-bold focus:border-brand focus:outline-none cursor-pointer text-left uppercase select-none transition hover:bg-zinc-950"
                    >
                      <span>{metricOptions.find(o => o.value === healthCards[1])?.label || 'Distance'}</span>
                      <span className="text-[8px] text-brand/70 font-sans ml-1">▼</span>
                    </button>
                  </div>

                  {/* Slot 3 Selection */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 block font-bold">Slot 3 (Right Card)</label>
                    <button
                      type="button"
                      onClick={() => setActiveSlotModal(2)}
                      className="w-full flex justify-between items-center bg-black border border-brand/40 text-brand py-2.5 px-3 rounded-none font-mono text-[11px] font-bold focus:border-brand focus:outline-none cursor-pointer text-left uppercase select-none transition hover:bg-zinc-950"
                    >
                      <span>{metricOptions.find(o => o.value === healthCards[2])?.label || 'Heart Rate'}</span>
                      <span className="text-[8px] text-brand/70 font-sans ml-1">▼</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Loki Hydration Alerts Accordion Category */}
      <div className="bg-dark-panel border border-border-dark shadow-md">
        <button
          onClick={() => toggleSection('hydration_alerts')}
          className="w-full text-left p-5 md:p-6 cursor-pointer hover:bg-dark-surface/30 transition flex justify-between items-center select-none"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Droplets className="w-4.5 h-4.5 text-brand fill-brand/20 animate-pulse" />
              <h3 className="text-xs uppercase tracking-wider text-brand font-black">Hydration Alerts</h3>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-xl">
              Configure automatic push hydration reminders and interval alert schedules.
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${
              activeSection === 'hydration_alerts' ? 'rotate-180 text-brand' : ''
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {activeSection === 'hydration_alerts' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-border-dark/40"
            >
              <div className="p-4 bg-dark-surface/10">
                <WaterTracker
                  waterLogs={waterLogs}
                  onUpdateWaterLogs={onUpdateWaterLogs}
                  mode="settings_and_history"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 2. Device Permissions & Backups */}
      <div className="bg-dark-panel border border-border-dark shadow-md">
        <button
          onClick={() => toggleSection('backup')}
          className="w-full text-left p-5 md:p-6 cursor-pointer hover:bg-dark-surface/30 transition flex justify-between items-center select-none"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cloud className="w-4.5 h-4.5 text-brand" />
              <h3 className="text-xs uppercase tracking-wider text-brand font-black">Device Permissions & Backups</h3>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-xl">
              Manage Health Connect sync, microphone permissions, and local database backups.
            </p>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${
              activeSection === 'backup' ? 'rotate-180 text-brand' : ''
            }`} 
          />
        </button>

        <AnimatePresence initial={false}>
          {activeSection === 'backup' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-border-dark/40"
            >
              <div className="p-5 md:p-6 space-y-6 font-sans text-xs">
                


                {/* Health Connect Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-white">
                    <Heart className="w-4 h-4 text-brand" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">Google Health Connect Sync</span>
                  </div>
                  
                  <p className="text-[#CCC] leading-relaxed max-w-2xl">
                    Loki Gym reads daily steps and active calories from Google Health Connect, and automatically synchronizes logged body weight. You must grant the application permissions to access this data.
                  </p>

                  <div className="bg-dark-surface border border-border-dark p-4 rounded-none flex items-center justify-between gap-4 max-w-2xl">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 border flex items-center justify-center rounded-none ${
                        isHealthAvailable === false
                          ? 'border-zinc-700 bg-zinc-950 text-zinc-500'
                          : healthPermissionStatus === 'granted'
                            ? 'border-emerald-500/35 bg-emerald-950/40 text-emerald-400'
                            : 'border-brand/35 bg-brand/5 text-brand'
                      }`}>
                        {isHealthAvailable === false ? (
                          <ShieldAlert className="w-5 h-5" />
                        ) : healthPermissionStatus === 'granted' ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : (
                          <Footprints className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-white block uppercase tracking-wide">
                          {isHealthAvailable === false 
                            ? 'Platform Unsupported' 
                            : healthPermissionStatus === 'granted' 
                              ? 'Permission Active' 
                              : 'Authorization Required'}
                        </span>
                        <span className="text-[10px] text-zinc-500 block mt-0.5 font-mono">
                          {isHealthAvailable === false
                            ? 'Health SDK is not available (running in Mock Mode)'
                            : healthPermissionStatus === 'granted'
                              ? 'Loki is linked and monitoring steps, calories, and weight'
                              : 'Tap authorize to grant step and calorie access'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-1 max-w-2xl">
                    <button
                      type="button"
                      onClick={handleRequestHealthPermission}
                      disabled={isHealthAvailable === false || healthPermissionStatus === 'granted'}
                      className={`w-full sm:w-auto py-2.5 px-6 text-xs font-mono font-black uppercase tracking-wider transition rounded-none cursor-pointer flex items-center justify-center gap-1.5 ${
                        healthPermissionStatus === 'granted'
                          ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                          : 'bg-brand hover:bg-white text-black'
                      }`}
                    >
                      <span>Request Permissions</span>
                    </button>
                  </div>
                </div>

                <div className="border-t border-border-dark/40 my-3" />

                {/* Local JSON Backup Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 text-white">
                    <Cloud className="w-4 h-4 text-brand" />
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider block">JSON Database Backup</span>
                  </div>

                  <p className="text-[#CCC] leading-relaxed max-w-2xl">
                    Export your entire Loki Gym training database (including custom splits, weight history, progress photos, personal records, and water logs) to a file. You can restore this file on any device to continue your progress.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2 max-w-2xl">
                    <button
                      onClick={onExportBackup}
                      className="flex-1 py-3 px-4 bg-brand hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider transition rounded-none cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>Export Backup (Save File)</span>
                    </button>
                    
                    <button
                      onClick={() => fileInputRefBackup.current?.click()}
                      className="flex-1 py-3 px-4 bg-dark-surface hover:bg-dark-card text-white text-xs font-mono font-black uppercase tracking-wider border border-border-dark transition rounded-none cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Upload className="w-4 h-4 text-brand stroke-[2.5]" />
                      <span>Import Backup (Load File)</span>
                    </button>
                    
                    <input 
                      type="file"
                      ref={fileInputRefBackup}
                      onChange={handleImportFileChange}
                      className="hidden"
                      accept=".json"
                    />
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. Consolidated API & Webhook Integrations Card */}
      <div className="bg-dark-panel border border-border-dark shadow-md">
        <button
          onClick={() => toggleSection('integrations')}
          className="w-full text-left p-5 md:p-6 cursor-pointer hover:bg-dark-surface/30 transition flex justify-between items-center select-none"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4.5 h-4.5 text-brand" />
              <h3 className="text-xs uppercase tracking-wider text-brand font-black">API & Webhook Integrations</h3>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-xl">
              Configure external services like Gemini AI Coach, Discord webhook alerts, and Home Assistant.
            </p>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${
              activeSection === 'integrations' ? 'rotate-180 text-brand' : ''
            }`} 
          />
        </button>

        <AnimatePresence initial={false}>
          {activeSection === 'integrations' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-border-dark/40"
            >
              <div className="p-5 md:p-6 space-y-4 font-sans text-xs">
                
                {/* Segmented Sub-Tabs */}
                <div className="flex bg-black border border-border-dark p-1 max-w-2xl">
                  {(['gemini', 'discord', 'ha', 'darts'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveIntegrationSubTab(tab)}
                      className={`flex-1 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition rounded-none cursor-pointer ${
                        activeIntegrationSubTab === tab
                          ? 'bg-brand text-black font-black'
                          : 'text-[#888] hover:text-white hover:bg-dark-surface'
                      }`}
                    >
                      {tab === 'gemini' ? 'Gemini AI' : tab === 'discord' ? 'Discord' : tab === 'ha' ? 'Home Assistant' : 'Darts Scoreboard'}
                    </button>
                  ))}
                </div>

                {/* Sub-Tab content renders below */}
                <div className="pt-2 max-w-2xl">
                  {/* Gemini AI Sub-Tab */}
                  {activeIntegrationSubTab === 'gemini' && (
                    <div className="space-y-4">
                      <p className="text-[#CCC] leading-relaxed">
                        Loki Gym integrates with Google's Gemini models. Once connected, you can chat with the Loki AI Coach about your workouts, get custom routine plans, or review your body composition trends.
                      </p>

                      <div className="space-y-1.5 mb-4">
                        <label className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">AI Coach Execution Engine</label>
                        <div className="flex bg-black border border-border-dark p-1 max-w-sm">
                          {(['gemini_api', 'gemini_nano'] as const).map((engine) => (
                            <button
                              key={engine}
                              type="button"
                              onClick={() => onUpdateLokiAiEngine(engine)}
                              className={`flex-1 py-1.5 text-[9px] font-mono font-bold uppercase tracking-wider transition rounded-none cursor-pointer ${
                                lokiAiEngine === engine
                                  ? 'bg-brand text-black font-black'
                                  : 'text-[#888] hover:text-white hover:bg-dark-surface'
                              }`}
                            >
                              {engine === 'gemini_api' ? 'Gemini API (Cloud)' : 'Gemini Nano (Local)'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {lokiAiEngine === 'gemini_api' ? (
                        <form onSubmit={handleSaveGeminiKey} className="space-y-3">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Gemini API Key</label>
                            <input 
                              type="password"
                              placeholder="AIzaSy..."
                              value={geminiKeyInput}
                              onChange={(e) => setGeminiKeyInput(e.target.value)}
                              className="w-full bg-dark-surface border border-border-dark focus:border-brand focus:outline-none rounded-none py-2 px-3 text-xs text-white placeholder-[#444] transition font-mono"
                            />
                            <span className="text-[9px] text-zinc-500 block font-mono leading-normal">
                              Get your free API key from the <a href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer" className="text-brand underline">Google AI Studio</a>.
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row gap-3 pt-1">
                            <button
                              type="submit"
                              className="flex-1 py-2.5 px-4 bg-brand hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider transition rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <span>Save API Key</span>
                            </button>

                            {geminiApiKey && (
                              <button
                                type="button"
                                onClick={handleTestGeminiKey}
                                disabled={isTestingGemini}
                                className="flex-1 py-2.5 px-4 bg-dark-surface hover:bg-dark-card text-white text-xs font-mono font-black uppercase tracking-wider border border-border-dark transition rounded-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                              >
                                  <span>{isTestingGemini ? 'Verifying Key...' : 'Verify API Connection'}</span>
                                </button>
                              )}
                            </div>
                          </form>
                        ) : (
                          <div className="p-4 border border-border-dark bg-black/40 space-y-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                typeof (window as any).ai !== 'undefined' || typeof (window as any).ai?.languageModel !== 'undefined'
                                  ? 'bg-emerald-500 animate-pulse'
                                  : 'bg-rose-500'
                              }`} />
                              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-white">
                                {typeof (window as any).ai !== 'undefined' || typeof (window as any).ai?.languageModel !== 'undefined'
                                  ? 'Gemini Nano: Ready (Local API Detected)'
                                  : 'Gemini Nano: Unsupported in this WebView'}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500 leading-relaxed font-sans">
                              {typeof (window as any).ai !== 'undefined' || typeof (window as any).ai?.languageModel !== 'undefined'
                                ? 'Loki Gym has successfully detected window.ai. The AI Coach will process queries locally on your device hardware with zero data outgoing and zero costs.'
                                : 'To run Gemini Nano on-device, you need a Chromium WebView/browser with Chrome Flags enabled (#optimization-guide-on-device-model and #prompt-api-for-gemini-nano).'}
                            </p>
                          </div>
                        )}
                    </div>
                  )}

                  {/* Discord Webhook Sub-Tab */}
                  {activeIntegrationSubTab === 'discord' && (
                    <div className="space-y-4">
                      <p className="text-[#CCC] leading-relaxed">
                        Configure a Discord Channel Webhook URL to automatically broadcast your training conquests. Every time you complete a workout session, your summaries, durations, set counts, and personal record tallies will be automatically logged to your channel.
                      </p>

                      <form onSubmit={handleSaveWebhook} className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Discord Webhook URL</label>
                          <input 
                            type="text"
                            placeholder="https://discord.com/api/webhooks/..."
                            value={webhookInput}
                            onChange={(e) => setWebhookInput(e.target.value)}
                            className="w-full bg-dark-surface border border-border-dark focus:border-brand focus:outline-none rounded-none py-2 px-3 text-xs text-white placeholder-[#444] transition font-mono"
                          />
                          <span className="text-[9px] text-zinc-500 block font-mono leading-normal">
                            Create a Webhook integration inside your Discord Server channel settings and paste the URL above.
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-1">
                          <button
                            type="submit"
                            className="flex-1 py-2.5 px-4 bg-brand hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider transition rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>Save Webhook</span>
                          </button>

                          {discordWebhookUrl && (
                            <button
                              type="button"
                              onClick={handleSendTestMessage}
                              disabled={isTestingDiscord}
                              className="flex-1 py-2.5 px-4 bg-dark-surface hover:bg-dark-card text-white text-xs font-mono font-black uppercase tracking-wider border border-border-dark transition rounded-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              <span>{isTestingDiscord ? 'Sending...' : 'Send Test Notification'}</span>
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Home Assistant Sub-Tab */}
                  {activeIntegrationSubTab === 'ha' && (
                    <div className="space-y-4">
                      <p className="text-[#CCC] leading-relaxed">
                        Connect Loki Gym to your local Home Assistant smart home webhook. Trigger automated lighting scenes, turn on fans, or play high-energy Viking themes when a workout begins or ends.
                      </p>

                      <form onSubmit={handleSaveHASettings} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Home Assistant Webhook URL</label>
                          <input 
                            type="text"
                            placeholder="http://homeassistant.local:8123/api/webhook/..."
                            value={haWebhookInput}
                            onChange={(e) => setHaWebhookInput(e.target.value)}
                            className="w-full bg-dark-surface border border-border-dark focus:border-brand focus:outline-none rounded-none py-2 px-3 text-xs text-white placeholder-[#444] transition font-mono"
                          />
                        </div>

                        <div className="space-y-2.5 bg-dark-surface/40 p-3.5 border border-border-dark/60">
                          <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider block mb-1">Trigger Actions</span>
                          
                          <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={haStartInput}
                              onChange={(e) => setHaStartInput(e.target.checked)}
                              className="rounded-none accent-brand"
                            />
                            <span>Trigger webhook when starting a session</span>
                          </label>

                          <label className="flex items-center gap-2 text-zinc-400 cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={haCompleteInput}
                              onChange={(e) => setHaCompleteInput(e.target.checked)}
                              className="rounded-none accent-brand"
                            />
                            <span>Trigger webhook when completing a session</span>
                          </label>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 pt-1">
                          <button
                            type="submit"
                            className="flex-1 py-2.5 px-4 bg-brand hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider transition rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>Save Trigger Settings</span>
                          </button>

                          {homeAssistantWebhookUrl && (
                            <button
                              type="button"
                              onClick={handleSendHATestMessage}
                              disabled={isTestingHA}
                              className="flex-1 py-2.5 px-4 bg-dark-surface hover:bg-dark-card text-white text-xs font-mono font-black uppercase tracking-wider border border-border-dark transition rounded-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                            >
                              <span>{isTestingHA ? 'Sending Webhook...' : 'Test HA Trigger'}</span>
                            </button>
                          )}
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Darts Scoreboard Sub-Tab */}
                  {activeIntegrationSubTab === 'darts' && (
                    <div className="space-y-4">
                      <p className="text-[#CCC] leading-relaxed">
                        Stream live workout telemetry directly to your Darts Scoreboard app. While you exercise and throw darts, your scoreboard display can show your live session duration, active rest timers, current exercise, and total weight lifted.
                      </p>

                      <form onSubmit={handleSaveDartsSettings} className="space-y-3">
                        <div>
                          <label className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">
                            Darts Server HTTP Address
                          </label>
                          <input 
                            type="text" 
                            placeholder="http://192.168.1.50:8080 or http://localhost:8080"
                            value={dartsUrlInput}
                            onChange={(e) => setDartsUrlInput(e.target.value)}
                            className="mt-1 w-full bg-dark-surface border border-border-dark p-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-brand rounded-none font-mono"
                          />
                          <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                            Enter the IP address and port of the machine running your Darts app. Make sure both devices are on the same local Wi-Fi.
                          </p>
                        </div>

                        <div className="p-3 bg-dark-surface/60 border border-border-dark space-y-2">
                          <label className="flex items-center gap-2 text-zinc-300 font-bold cursor-pointer select-none">
                            <input 
                              type="checkbox"
                              checked={dartsBroadcastInput}
                              onChange={(e) => setDartsBroadcastInput(e.target.checked)}
                              className="rounded-none accent-brand w-3.5 h-3.5"
                            />
                            <span>Enable Live Workout Broadcast</span>
                          </label>
                          <p className="text-[10px] text-zinc-500 font-mono pl-5">
                            Broadcasts elapsed time, rest countdowns, and volume lifted every second while a workout is active.
                          </p>
                        </div>

                        {dartsTestResult && (
                          <div className={`p-3 border font-mono text-[11px] flex items-center gap-2 ${
                            dartsTestResult.success 
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' 
                              : 'bg-red-950/40 border-red-500/40 text-red-300'
                          }`}>
                            {dartsTestResult.success ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                            )}
                            <span>{dartsTestResult.message}</span>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 pt-1">
                          <button
                            type="submit"
                            className="flex-1 py-2.5 px-4 bg-brand hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider transition rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                          >
                            <span>Save Darts Settings</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleTestDarts}
                            disabled={isTestingDarts}
                            className="flex-1 py-2.5 px-4 bg-dark-surface hover:bg-dark-card text-white text-xs font-mono font-black uppercase tracking-wider border border-border-dark transition rounded-none cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isTestingDarts ? 'animate-spin' : ''}`} />
                            <span>{isTestingDarts ? 'Testing Connection...' : 'Test Server Connection'}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Application Update Card */}
      <div className="bg-dark-panel border border-border-dark shadow-md">
        <button
          type="button"
          onClick={() => toggleSection('update')}
          className="w-full text-left p-5 md:p-6 cursor-pointer hover:bg-dark-surface/30 transition flex justify-between items-center select-none"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Download className="w-4.5 h-4.5 text-brand" />
              <h3 className="text-xs uppercase tracking-wider text-brand font-black">App Update & GitHub Releases</h3>
              <span className="text-[9px] font-mono font-bold bg-brand/10 text-brand border border-brand/30 px-1.5 py-0.5">
                v{APP_VERSION}
              </span>
            </div>
            <p className="text-zinc-500 text-[11px] leading-relaxed max-w-xl">
              Check and install updates directly from GitHub releases for Loki Gym.
            </p>
          </div>
          <ChevronDown 
            className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${
              activeSection === 'update' ? 'rotate-180 text-brand' : ''
            }`} 
          />
        </button>

        <AnimatePresence initial={false}>
          {activeSection === 'update' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-border-dark/40"
            >
              <div className="p-5 md:p-6 space-y-4 font-sans text-xs">
                <p className="text-[#CCC] leading-relaxed max-w-2xl">
                  Loki Gym updates are published directly to the repository at{' '}
                  <a
                    href={GITHUB_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand hover:underline font-mono inline-flex items-center gap-0.5"
                  >
                    <span>{GITHUB_FULL_REPO}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  . You can check for newer APK distributions anytime or download directly.
                </p>

                {/* Status Card */}
                <div className="bg-dark-surface border border-border-dark p-4 rounded-none space-y-3 max-w-2xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="font-bold text-white block uppercase tracking-wide">
                        Installed App Version
                      </span>
                      <span className="text-[11px] text-brand block mt-0.5 font-mono font-bold">
                        v{APP_VERSION}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCheckUpdate}
                      disabled={checkingUpdate}
                      className="py-2 px-4 bg-brand hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider transition rounded-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${checkingUpdate ? 'animate-spin' : ''}`} />
                      <span>{checkingUpdate ? 'Checking GitHub...' : 'Check for Updates'}</span>
                    </button>
                  </div>

                  {/* Update Result Feedback */}
                  {updateResult && (
                    <div className="pt-2 border-t border-border-dark/60 space-y-3">
                      {updateResult.hasUpdate ? (
                        <div className="bg-brand/10 border border-brand/40 p-3.5 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-brand font-black">
                              ★ New Version Available: v{updateResult.latestVersion}
                            </span>
                            {updateResult.apkSizeFormatted && (
                              <span className="text-[10px] font-mono text-zinc-400">
                                Size: {updateResult.apkSizeFormatted}
                              </span>
                            )}
                          </div>
                          <p className="text-white font-bold text-sm">
                            {updateResult.releaseTitle}
                          </p>
                          {updateResult.releaseNotes && (
                            <p className="text-zinc-300 font-mono text-[11px] line-clamp-3 bg-black/40 p-2 border border-border-dark">
                              {updateResult.releaseNotes}
                            </p>
                          )}
                          <div className="pt-1 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => triggerDownload(updateResult.downloadUrl)}
                              className="py-2 px-5 bg-brand hover:bg-white text-black font-mono font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Download v{updateResult.latestVersion} APK</span>
                            </button>
                            <a
                              href={updateResult.releaseUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-2 px-3 border border-border-dark text-zinc-300 hover:text-white font-mono text-xs uppercase transition flex items-center gap-1"
                            >
                              <span>View Release</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        </div>
                      ) : updateResult.noReleasesYet ? (
                        <div className="flex items-start gap-2 p-3 bg-zinc-900 border border-border-dark text-zinc-400 font-mono text-[11px]">
                          <AlertCircle className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                          <span>
                            Connected to <strong className="text-white">{GITHUB_FULL_REPO}</strong>. No releases published yet on GitHub. When a release is published, it will be detected here automatically.
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            You are running the latest version (v{APP_VERSION})! Everything is up to date.
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {updateError && (
                    <div className="p-3 bg-red-950/40 border border-red-500/40 text-red-300 font-mono text-[11px] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 truncate">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="truncate">{updateError}</span>
                      </div>
                      <a
                        href={GITHUB_RELEASES_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-white shrink-0 hover:text-brand"
                      >
                        Open GitHub
                      </a>
                    </div>
                  )}
                </div>

                {/* Auto Check Setting & Direct Links */}
                <div className="max-w-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-[11px] font-mono text-zinc-400">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={autoCheckUpdates}
                      onChange={(e) => handleToggleAutoCheck(e.target.checked)}
                      className="accent-brand w-3.5 h-3.5 rounded-none cursor-pointer"
                    />
                    <span>Automatically check for updates when opening app</span>
                  </label>

                  <a
                    href={GITHUB_RELEASES_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-zinc-400 hover:text-brand transition"
                  >
                    <span>Browse All Releases on GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {/* Popout Modal for Slot Customization */}
      <AnimatePresence>
        {activeSlotModal !== null && (
          <div 
            onClick={() => setActiveSlotModal(null)}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 z-[9999] cursor-pointer"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black border-2 border-brand p-5 max-w-sm w-full shadow-[0_0_60px_rgba(255,230,0,0.2)] font-mono text-xs space-y-4 cursor-default"
            >
              <div className="flex justify-between items-center border-b border-border-dark/60 pb-2.5">
                <span className="font-display font-black italic uppercase text-xs text-brand tracking-wider">
                  {activeSlotModal === 0 ? "Slot 1 (Left Side)" : activeSlotModal === 1 ? "Slot 2 (Middle)" : "Slot 3 (Right Side)"}
                </span>
              </div>

              {/* 2-Column Grid to show all options at once without scrolling! */}
              <div className="grid grid-cols-2 gap-2">
                {metricOptions.map((opt) => {
                  const isSelected = healthCards[activeSlotModal] === opt.value;
                  const currentValue = getMetricCurrentValue(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        handleSlotChange(activeSlotModal, opt.value);
                        setActiveSlotModal(null);
                      }}
                      className={`p-2.5 border text-left transition select-none cursor-pointer flex flex-col justify-center min-h-[52px] ${
                        isSelected
                          ? 'border-brand bg-brand text-black font-black'
                          : 'border-border-dark hover:border-brand/40 text-brand bg-zinc-950/40 hover:bg-zinc-900/50'
                      }`}
                    >
                      <span className="text-[9px] font-bold uppercase leading-tight">{opt.label}</span>
                      {currentValue && (
                        <span className={`text-[8px] font-mono mt-0.5 ${isSelected ? 'text-black/60' : 'text-zinc-500'}`}>
                          {currentValue}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

const metricOptions = [
  { value: 'calories', label: 'Total Energy (Calories)' },
  { value: 'active_calories', label: 'Active Energy' },
  { value: 'distance', label: 'Distance Traveled' },
  { value: 'heart_rate', label: 'Heart Rate' },
  { value: 'weight', label: 'Weight Log' },
  { value: 'water', label: 'Water Intake' },
  { value: 'steps', label: 'Steps Count' },
  { value: 'sleep', label: 'Sleep Duration' },
  { value: 'body_fat', label: 'Body Fat %' },
  { value: 'stairs', label: 'Flights Climbed' }
];
