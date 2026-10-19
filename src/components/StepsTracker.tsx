import React, { useState, useEffect } from 'react';
import { Health } from '@capgo/capacitor-health';
import { WeightLogEntry } from '../types';
import { 
  Footprints, Activity, Heart, RefreshCw, AlertCircle, 
  HelpCircle, Compass, Zap, Droplet, Scale 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface StepsTrackerProps {
  todaySteps: number;
  onUpdateSteps: (steps: number) => void;
  activeCalories: number;
  totalCalories: number;
  onUpdateCalories: (active: number, total: number) => void;
  todayDistance: number;
  onUpdateDistance: (dist: number) => void;
  todayHeartRate: number;
  heartRateMin: number;
  heartRateMax: number;
  onUpdateHeartRate: (avg: number, min: number, max: number) => void;
  weightHistory: WeightLogEntry[];
  onUpdateWeightHistory: (history: WeightLogEntry[]) => void;
  waterLogs?: { date: string; amount: number; target: number }[];
  onUpdateWaterLogs?: (logs: any[]) => void;
  healthCards?: string[];
}

interface DailyBiometrics {
  date: string;
  steps: number;
  activeCalories: number;
  totalCalories: number;
  avgHeartRate: number;
  minHeartRate: number;
  maxHeartRate: number;
  distance: number;
}

const formatLocalDate = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const getSampleTargetDate = (s: any): string => {
  const dateVal = s?.startDate || s?.endDate || s?.time || s?.date;
  if (!dateVal) return "";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";

  // Calculate duration to identify daily summary records (longer than 20 hours)
  let isDailySummary = false;
  if (s?.startDate && s?.endDate) {
    const startMs = new Date(s.startDate).getTime();
    const endMs = new Date(s.endDate).getTime();
    const durationHours = (endMs - startMs) / (1000 * 60 * 60);
    if (durationHours > 20) {
      isDailySummary = true;
    }
  }

  // Also check if the time is exactly midnight UTC (common for daily summaries)
  const isExactlyUTCMidnight = typeof dateVal === 'string' && (
    dateVal.endsWith('T00:00:00Z') || 
    dateVal.endsWith('T00:00:00.000Z') || 
    dateVal.endsWith('T23:59:59Z')
  );
  
  if (isDailySummary && isExactlyUTCMidnight) {
    try {
      return d.toISOString().split('T')[0];
    } catch (e) {
      return formatLocalDate(d);
    }
  }

  // Fallback to local timezone parsing for standard walk/run intervals
  return formatLocalDate(d);
};

export default function StepsTracker({
  todaySteps,
  onUpdateSteps,
  activeCalories,
  totalCalories,
  onUpdateCalories,
  todayDistance,
  onUpdateDistance,
  todayHeartRate,
  heartRateMin,
  heartRateMax,
  onUpdateHeartRate,
  weightHistory,
  onUpdateWeightHistory,
  waterLogs = [],
  onUpdateWaterLogs,
  healthCards = ['calories', 'distance', 'heart_rate']
}: StepsTrackerProps) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>(() => formatLocalDate(new Date()));
  const [biometricsHistory, setBiometricsHistory] = useState<DailyBiometrics[]>(() => {
    const saved = localStorage.getItem('workout_biometrics_history');
    return saved ? JSON.parse(saved) : [];
  });

  const stepGoal = 10000;

  // Add water action toggles
  const [showWaterActions, setShowWaterActions] = useState(false);

  // Get selected date's water logs
  const selectedWaterLog = waterLogs.find(w => w.date === selectedDate);
  const waterAmount = selectedWaterLog ? selectedWaterLog.amount : 0;
  const waterTarget = selectedWaterLog ? selectedWaterLog.target : 2500;

  // Handler: Modify water logs (+/- 250ml)
  const handleModifyWater = (amountChange: number) => {
    if (!onUpdateWaterLogs) return;
    const existingLog = waterLogs.find(w => w.date === selectedDate);
    let updatedLogs: any[];
    if (existingLog) {
      const newAmount = Math.max(0, existingLog.amount + amountChange);
      updatedLogs = waterLogs.map(w => w.date === selectedDate ? { ...w, amount: newAmount } : w);
    } else {
      const newAmount = Math.max(0, amountChange);
      updatedLogs = [
        ...waterLogs,
        {
          id: `water_${Date.now()}`,
          amount: newAmount,
          target: 2500,
          date: selectedDate
        }
      ];
    }
    onUpdateWaterLogs(updatedLogs);
  };

  // Helper to run clean synchronization
  const performSync = async (sdkAvailable: boolean) => {
    setIsSyncing(true);
    setErrorMessage(null);

    // 1. Web Mocking Fallback
    if (!sdkAvailable) {
      setTimeout(() => {
        const updatedHistory: DailyBiometrics[] = [];
        const now = new Date();
        
        for (let i = 0; i < 7; i++) {
          const targetDateObj = new Date();
          targetDateObj.setDate(targetDateObj.getDate() - i);
          const targetDateStr = formatLocalDate(targetDateObj);
          
          const mockSteps = Math.random() < 0.15 ? 0 : Math.floor(Math.random() * 8000) + (i === 0 ? 5000 : 3000);
          const mockActive = Math.round(mockSteps * 0.04);
          const mockDistance = Math.round(mockSteps * 0.762);
          
          const mockAvgHR = mockSteps === 0 && Math.random() < 0.5 ? 0 : Math.floor(Math.random() * 15) + 70;
          const mockMinHR = mockAvgHR === 0 ? 0 : Math.floor(Math.random() * 10) + 55;
          const mockMaxHR = mockAvgHR === 0 ? 0 : Math.floor(Math.random() * 30) + 130;
          
          let dayBmr = 0;
          if (i === 0) {
            const hoursElapsed = now.getHours() + now.getMinutes() / 60;
            dayBmr = Math.round(80 * 24 * (hoursElapsed / 24));
          } else {
            dayBmr = Math.round(80 * 24);
          }
          const mockTotal = dayBmr + mockActive;

          updatedHistory.push({
            date: targetDateStr,
            steps: mockSteps,
            activeCalories: mockActive,
            totalCalories: mockTotal,
            avgHeartRate: mockAvgHR,
            minHeartRate: mockMinHR,
            maxHeartRate: mockMaxHR,
            distance: mockDistance
          });
        }

        setBiometricsHistory(updatedHistory);
        localStorage.setItem('workout_biometrics_history', JSON.stringify(updatedHistory));

        const todayBiometrics = updatedHistory[0];
        onUpdateSteps(todayBiometrics.steps);
        onUpdateCalories(todayBiometrics.activeCalories, todayBiometrics.totalCalories);
        onUpdateDistance(todayBiometrics.distance);
        onUpdateHeartRate(todayBiometrics.avgHeartRate, todayBiometrics.minHeartRate, todayBiometrics.maxHeartRate);
        setPermissionGranted(true);
        setIsSyncing(false);
      }, 1000);
      return;
    }

    // 2. Native Health Connect Sync
    try {
      // Request authorization
      await Health.requestAuthorization({
        read: ['steps', 'calories', 'weight', 'heartRate'],
        write: ['weight']
      });
      setPermissionGranted(true);

      const now = new Date();
      
      const startOfRange = new Date();
      startOfRange.setDate(startOfRange.getDate() - 8);
      startOfRange.setHours(0, 0, 0, 0);

      const endOfRange = new Date();
      endOfRange.setDate(endOfRange.getDate() + 1);
      endOfRange.setHours(23, 59, 59, 999);

      // A. Query steps
      let samples: any[] = [];
      try {
        const result = await Health.readSamples({
          dataType: 'steps',
          startDate: startOfRange.toISOString(),
          endDate: endOfRange.toISOString(),
          limit: 5000
        });
        if (Array.isArray(result)) {
          samples = result;
        } else if (result && Array.isArray((result as any).samples)) {
          samples = (result as any).samples;
        } else if (result && Array.isArray((result as any).records)) {
          samples = (result as any).records;
        }
      } catch (stepsErr: any) {
        console.warn("Bulk steps read failed, falling back to incremental day queries:", stepsErr);
        
        // Fallback: Query day-by-day to isolate the corrupted record!
        samples = [];
        for (let i = 0; i < 8; i++) {
          const dayStart = new Date();
          dayStart.setDate(dayStart.getDate() - i);
          dayStart.setHours(0, 0, 0, 0);
          
          const dayEnd = new Date();
          dayEnd.setDate(dayEnd.getDate() - i);
          dayEnd.setHours(23, 59, 59, 999);
          
          try {
            const dayResult = await Health.readSamples({
              dataType: 'steps',
              startDate: dayStart.toISOString(),
              endDate: dayEnd.toISOString(),
              limit: 2000
            });
            let daySamples: any[] = [];
            if (Array.isArray(dayResult)) {
              daySamples = dayResult;
            } else if (dayResult && Array.isArray((dayResult as any).samples)) {
              daySamples = (dayResult as any).samples;
            } else if (dayResult && Array.isArray((dayResult as any).records)) {
              daySamples = (dayResult as any).records;
            }
            samples.push(...daySamples);
          } catch (dayErr: any) {
            console.warn(`Steps read failed for day -${i}, falling back to hourly slots:`, dayErr);
            
            // Further fallback: Query that day in 2-hour increments!
            for (let hour = 0; hour < 24; hour += 2) {
              const slotStart = new Date(dayStart);
              slotStart.setHours(hour, 0, 0, 0);
              
              const slotEnd = new Date(dayStart);
              slotEnd.setHours(hour + 1, 59, 59, 999);
              
              try {
                const slotResult = await Health.readSamples({
                  dataType: 'steps',
                  startDate: slotStart.toISOString(),
                  endDate: slotEnd.toISOString(),
                  limit: 500
                });
                let slotSamples: any[] = [];
                if (Array.isArray(slotResult)) {
                  slotSamples = slotResult;
                } else if (slotResult && Array.isArray((slotResult as any).samples)) {
                  slotSamples = (slotResult as any).samples;
                } else if (slotResult && Array.isArray((slotResult as any).records)) {
                  slotSamples = (slotResult as any).records;
                }
                samples.push(...slotSamples);
              } catch (slotErr) {
                console.warn(`Steps read failed for slot ${hour}h-${hour+2}h:`, slotErr);
              }
            }
          }
        }
      }

      // A2. Query distance
      let distSamples: any[] = [];
      try {
        const distResult = await Health.readSamples({
          dataType: 'distance',
          startDate: startOfRange.toISOString(),
          endDate: endOfRange.toISOString(),
          limit: 5000
        });
        if (Array.isArray(distResult)) {
          distSamples = distResult;
        } else if (distResult && Array.isArray((distResult as any).samples)) {
          distSamples = (distResult as any).samples;
        } else if (distResult && Array.isArray((distResult as any).records)) {
          distSamples = (distResult as any).records;
        }
      } catch (distErr: any) {
        console.warn("Failed to query distance samples from Health Connect:", distErr);
      }

      // B. Query active calories
      let calSamples: any[] = [];
      try {
        const caloriesResult = await Health.readSamples({
          dataType: 'calories',
          startDate: startOfRange.toISOString(),
          endDate: endOfRange.toISOString(),
          limit: 5000
        });
        if (Array.isArray(caloriesResult)) {
          calSamples = caloriesResult;
        } else if (caloriesResult && Array.isArray((caloriesResult as any).samples)) {
          calSamples = (caloriesResult as any).samples;
        } else if (caloriesResult && Array.isArray((caloriesResult as any).records)) {
          calSamples = (caloriesResult as any).records;
        }
      } catch (calErr: any) {
        console.warn("Failed to query active calories from Health Connect:", calErr);
      }

      // C. Query Weight logs for last 30 days
      const startOfWeightRange = new Date();
      startOfWeightRange.setDate(startOfWeightRange.getDate() - 30);
      let weightSamples: any[] = [];
      try {
        const weightResult = await Health.readSamples({
          dataType: 'weight',
          startDate: startOfWeightRange.toISOString(),
          endDate: endOfRange.toISOString(),
          limit: 5000
        });
        if (Array.isArray(weightResult)) {
          weightSamples = weightResult;
        } else if (weightResult && Array.isArray((weightResult as any).samples)) {
          weightSamples = (weightResult as any).samples;
        } else if (weightResult && Array.isArray((weightResult as any).records)) {
          weightSamples = (weightResult as any).records;
        }
      } catch (wErr: any) {
        console.warn("Failed to query weight samples from Health Connect:", wErr);
      }

      const newWeightHistory = [...weightHistory];
      let weightUpdated = false;
      weightSamples.forEach((sample: any) => {
        const sampleWeight = typeof sample === 'number' ? sample : (sample.value || sample.weight || 0);
        const sampleDate = getSampleTargetDate(sample);
        if (sampleWeight > 0 && sampleDate) {
          const sampleWeightInLbs = Number((sampleWeight * 2.20462262).toFixed(1));
          const existingIndex = newWeightHistory.findIndex(w => w.date === sampleDate);
          
          if (existingIndex !== -1) {
            if (newWeightHistory[existingIndex].weight !== sampleWeightInLbs) {
              newWeightHistory[existingIndex] = {
                ...newWeightHistory[existingIndex],
                weight: sampleWeightInLbs
              };
              weightUpdated = true;
            }
          } else {
            newWeightHistory.push({
              id: `weight_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              date: sampleDate,
              weight: sampleWeightInLbs,
              unit: 'lbs'
            });
            weightUpdated = true;
          }
        }
      });
      if (weightUpdated) {
        onUpdateWeightHistory(newWeightHistory);
      }

      // D. Query Heart Rate samples
      let hrSamples: any[] = [];
      try {
        const hrResult = await Health.readSamples({
          dataType: 'heartRate',
          startDate: startOfRange.toISOString(),
          endDate: endOfRange.toISOString(),
          limit: 5000
        });
        if (Array.isArray(hrResult)) {
          hrSamples = hrResult;
        } else if (hrResult && Array.isArray((hrResult as any).samples)) {
          hrSamples = (hrResult as any).samples;
        } else if (hrResult && Array.isArray((hrResult as any).records)) {
          hrSamples = (hrResult as any).records;
        }
      } catch (hrErr: any) {
        console.warn("Failed to query heart rate samples from Health Connect:", hrErr);
      }

      // Calculate BMR parameters
      const lastWeightEntry = newWeightHistory && newWeightHistory.length > 0 
        ? newWeightHistory[newWeightHistory.length - 1].weight 
        : 80;
      
      const lastWeightInKg = lastWeightEntry > 120 
        ? lastWeightEntry / 2.2046 
        : lastWeightEntry;

      // Group and process the last 7 days of daily biometrics
      const updatedHistory: DailyBiometrics[] = [];

      for (let i = 0; i < 7; i++) {
        const targetDateObj = new Date();
        targetDateObj.setDate(targetDateObj.getDate() - i);
        const targetDateStr = formatLocalDate(targetDateObj);

        // Filter steps for targetDate
        const dayStepsSamples = samples.filter((s: any) => {
          return getSampleTargetDate(s) === targetDateStr;
        });

        const stepsBySource: Record<string, number> = {};
        dayStepsSamples.forEach((s: any) => {
          const val = typeof s === 'number' ? s : (s?.value || s?.count || 0);
          const source = s?.sourceId || s?.sourceName || 'unknown';
          stepsBySource[source] = (stepsBySource[source] || 0) + Number(val);
        });
        const daySteps = Object.values(stepsBySource).length > 0 
          ? Math.max(...Object.values(stepsBySource)) 
          : 0;

        // Filter calories for targetDate
        const dayCalSamples = calSamples.filter((s: any) => {
          return getSampleTargetDate(s) === targetDateStr;
        });

        const calBySource: Record<string, number> = {};
        dayCalSamples.forEach((s: any) => {
          const val = typeof s === 'number' ? s : (s?.value || s?.energy || s?.calories || 0);
          const source = s?.sourceId || s?.sourceName || 'unknown';
          calBySource[source] = (calBySource[source] || 0) + Number(val);
        });
        const dayActiveCal = Object.values(calBySource).length > 0 
          ? Math.max(...Object.values(calBySource)) 
          : 0;

        // Filter heart rate for targetDate
        const dayHrSamples = hrSamples.filter((s: any) => {
          return getSampleTargetDate(s) === targetDateStr;
        });

        let dayAvgHR = 0;
        let dayMinHR = 0;
        let dayMaxHR = 0;

        if (dayHrSamples.length > 0) {
          const hrValues = dayHrSamples.map((s: any) => {
            return typeof s === 'number' ? s : (s?.value || s?.bpm || 0);
          }).filter((v: number) => v > 0);

          if (hrValues.length > 0) {
            const sum = hrValues.reduce((acc: number, curr: number) => acc + curr, 0);
            dayAvgHR = Math.round(sum / hrValues.length);
            dayMinHR = Math.min(...hrValues);
            dayMaxHR = Math.max(...hrValues);
          }
        }

        // BMR calculation
        let dayBmr = 0;
        if (i === 0) {
          const hoursElapsed = now.getHours() + now.getMinutes() / 60;
          dayBmr = Math.round(lastWeightInKg * 24 * (hoursElapsed / 24));
        } else {
          dayBmr = Math.round(lastWeightInKg * 24);
        }

        const dayTotalCal = Math.round(dayBmr + dayActiveCal);

        // Filter distance for targetDate
        const dayDistSamples = distSamples.filter((s: any) => {
          return getSampleTargetDate(s) === targetDateStr;
        });

        const distBySource: Record<string, number> = {};
        dayDistSamples.forEach((s: any) => {
          const val = typeof s === 'number' ? s : (s?.value || s?.distance || 0);
          const source = s?.sourceId || s?.sourceName || 'unknown';
          distBySource[source] = (distBySource[source] || 0) + Number(val);
        });
        const dayDistance = Object.values(distBySource).length > 0 
          ? Math.max(...Object.values(distBySource)) 
          : daySteps * 0.762;

        updatedHistory.push({
          date: targetDateStr,
          steps: daySteps,
          activeCalories: Math.round(dayActiveCal),
          totalCalories: dayTotalCal,
          avgHeartRate: dayAvgHR,
          minHeartRate: dayMinHR,
          maxHeartRate: dayMaxHR,
          distance: Math.round(dayDistance)
        });
      }

      setBiometricsHistory(updatedHistory);
      localStorage.setItem('workout_biometrics_history', JSON.stringify(updatedHistory));

      // Update parent today stats
      const todayBiometrics = updatedHistory[0];
      onUpdateSteps(todayBiometrics.steps);
      onUpdateCalories(todayBiometrics.activeCalories, todayBiometrics.totalCalories);
      onUpdateDistance(todayBiometrics.distance);
      onUpdateHeartRate(todayBiometrics.avgHeartRate, todayBiometrics.minHeartRate, todayBiometrics.maxHeartRate);
    } catch (err: any) {
      console.error("Health Connect synchronization failed:", err);
      setErrorMessage(err?.message || "Sync failed. Ensure Health Connect is configured and permissions are granted.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Check if Health SDK is available and check permissions on mount
  useEffect(() => {
    async function initHealthSync() {
      let sdkAvailable = false;
      try {
        const availableStatus = await Health.isAvailable();
        sdkAvailable = availableStatus.available;
        setIsAvailable(sdkAvailable);
      } catch (e) {
        console.warn("Health SDK availability check failed:", e);
        setIsAvailable(false);
      }

      // Check one-time reset flag
      const isReset = localStorage.getItem('health_connect_reset_v3');
      if (!isReset) {
        localStorage.removeItem('workout_today_steps');
        localStorage.removeItem('workout_today_steps_date');
        localStorage.removeItem('workout_active_calories');
        localStorage.removeItem('workout_active_calories_date');
        localStorage.removeItem('workout_total_calories');
        localStorage.removeItem('workout_total_calories_date');
        localStorage.removeItem('workout_today_heart_rate');
        localStorage.removeItem('workout_today_heart_rate_date');
        localStorage.removeItem('workout_heart_rate_min');
        localStorage.removeItem('workout_heart_rate_min_date');
        localStorage.removeItem('workout_heart_rate_max');
        localStorage.removeItem('workout_heart_rate_max_date');
        localStorage.removeItem('workout_today_distance');
        localStorage.removeItem('workout_today_distance_date');
        localStorage.removeItem('workout_biometrics_history');

        localStorage.setItem('health_connect_reset_v3', 'true');

        setBiometricsHistory([]);
        onUpdateSteps(0);
        onUpdateCalories(0, 0);
        onUpdateDistance(0);
        onUpdateHeartRate(0, 0, 0);
      }

      performSync(sdkAvailable);
    }
    initHealthSync();
  }, []);

  const handleSync = async () => {
    performSync(isAvailable || false);
  };

  const handleResetSync = () => {
    localStorage.removeItem('workout_today_steps');
    localStorage.removeItem('workout_today_steps_date');
    localStorage.removeItem('workout_active_calories');
    localStorage.removeItem('workout_active_calories_date');
    localStorage.removeItem('workout_total_calories');
    localStorage.removeItem('workout_total_calories_date');
    localStorage.removeItem('workout_today_heart_rate');
    localStorage.removeItem('workout_today_heart_rate_date');
    localStorage.removeItem('workout_heart_rate_min');
    localStorage.removeItem('workout_heart_rate_min_date');
    localStorage.removeItem('workout_heart_rate_max');
    localStorage.removeItem('workout_heart_rate_max_date');
    localStorage.removeItem('workout_today_distance');
    localStorage.removeItem('workout_today_distance_date');
    localStorage.removeItem('workout_biometrics_history');
    
    setBiometricsHistory([]);
    onUpdateSteps(0);
    onUpdateCalories(0, 0);
    onUpdateDistance(0);
    onUpdateHeartRate(0, 0, 0);
  };

  const todayLocalDateStr = formatLocalDate(new Date());
  
  const last7DaysList = Array.from({ length: 7 }).map((_, index) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - index));
    const dateStr = formatLocalDate(d);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }); 
    const dayNum = d.getDate(); 
    return { dateStr, dayName, dayNum };
  });

  const activeEntry = biometricsHistory.find(h => h.date === selectedDate);
  
  const displaySteps = activeEntry ? activeEntry.steps : (selectedDate === todayLocalDateStr ? todaySteps : 0);
  const displayActiveCalories = activeEntry ? activeEntry.activeCalories : (selectedDate === todayLocalDateStr ? activeCalories : 0);
  const displayTotalCalories = activeEntry ? activeEntry.totalCalories : (selectedDate === todayLocalDateStr ? totalCalories : 0);
  const displayHeartRate = activeEntry ? activeEntry.avgHeartRate : (selectedDate === todayLocalDateStr ? todayHeartRate : 0);
  const displayDistance = activeEntry ? activeEntry.distance : (selectedDate === todayLocalDateStr ? todayDistance : 0);
  
  // Convert meters to miles
  const displayDistanceMiles = (displayDistance * 0.000621371).toFixed(2);

  const uncappedPercentage = Math.round((displaySteps / stepGoal) * 100);
  const progressPercentage = Math.min(100, uncappedPercentage);

  return (
    <div className="bg-dark-panel border border-border-dark p-5 md:p-6 shadow-md font-sans space-y-4">
      <div className="flex justify-between items-center border-b border-border-dark/60 pb-2.5">
        <div className="flex items-center gap-2">
          <Footprints className="w-5 h-5 text-brand" />
          <div>
            <h3 className="text-xs uppercase tracking-widest text-brand font-black">Health Analytics</h3>
            <span className="text-[8px] text-zinc-500 font-mono uppercase block mt-0.5">Biometrics & Activity</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAvailable === false && (
            <span className="text-[8px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded-none uppercase">
              Web Mock Mode
            </span>
          )}
          
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="p-1 text-zinc-500 hover:text-brand disabled:text-zinc-700 hover:bg-dark-surface/50 border border-transparent hover:border-border-dark transition duration-200 cursor-pointer"
            title="Force synchronization"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-brand' : ''}`} />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-950/30 border border-rose-500/35 p-3 rounded-none flex items-start gap-2 text-rose-200">
          <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
          <div className="text-[10px] font-mono leading-relaxed">
            <span className="font-bold uppercase block text-rose-300">Synchronisation Error</span>
            {errorMessage}
          </div>
        </div>
      )}

      {/* 7 Days Mini Timeline Bar Selector */}
      <div className="grid grid-cols-7 gap-1 bg-zinc-950 p-1.5 border border-border-dark/50">
        {last7DaysList.map((day) => {
          const isSelected = selectedDate === day.dateStr;
          const histVal = biometricsHistory.find(h => h.date === day.dateStr);
          const dayStepsVal = histVal ? histVal.steps : (day.dateStr === todayLocalDateStr ? todaySteps : 0);
          
          let activeColorClass = "bg-zinc-900 border-zinc-800 text-zinc-600";
          if (dayStepsVal > 0) {
            if (dayStepsVal >= stepGoal) {
              activeColorClass = "bg-emerald-950/30 border-emerald-500/35 text-emerald-400";
            } else {
              activeColorClass = "bg-brand/5 border-brand/20 text-zinc-300";
            }
          }

          return (
            <button
              key={day.dateStr}
              onClick={() => setSelectedDate(day.dateStr)}
              className={`flex flex-col items-center py-1.5 border transition cursor-pointer select-none rounded-none ${
                isSelected 
                  ? 'border-brand bg-brand text-black font-black scale-105' 
                  : activeColorClass
              }`}
            >
              <span className={`text-[7px] uppercase font-bold tracking-tighter ${isSelected ? 'text-black' : 'text-zinc-500'}`}>
                {day.dayName}
              </span>
              <span className="text-[10px] font-mono mt-0.5 leading-none">
                {day.dayNum}
              </span>
            </button>
          );
        })}
      </div>
      {/* Main Metrics Visualizers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Circle Progress Tracker */}
        <div className="bg-zinc-950/40 border border-border-dark/40 p-5 flex flex-row items-center justify-center gap-6 relative">
          {/* Steps Circle */}
          <div className="flex flex-col items-center">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-zinc-900"
                  fill="transparent"
                />
                <circle
                  cx="56"
                  cy="56"
                  r="46"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-brand transition-all duration-500"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 46}
                  strokeDashoffset={2 * Math.PI * 46 * (1 - progressPercentage / 100)}
                />
              </svg>
              <div className="absolute text-center flex flex-col items-center select-none">
                <span className="text-lg font-mono font-black text-white leading-none">
                  {displaySteps.toLocaleString()}
                </span>
                <span className="text-[7px] uppercase font-mono tracking-widest text-zinc-500 mt-1 block">
                  Steps Goal
                </span>
              </div>
            </div>
            <div className="text-center mt-3">
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-mono font-bold">
                {progressPercentage}% of 10k target
              </span>
            </div>
          </div>

          {/* Water Glass filling with water next to it (Same size!) */}
          <div className="flex flex-col items-center border-l border-border-dark/40 pl-6">
            <div 
              className="relative w-28 h-28 flex items-center justify-center select-none"
            >
              {/* Tap container for the glass */}
              <div
                onClick={() => setShowWaterActions(!showWaterActions)}
                className="w-full h-full flex items-center justify-center cursor-pointer hover:scale-103 transition active:scale-98"
                title="Click to adjust water intake"
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    {/* Clip Path for the Trapezius Glass shape area */}
                    <clipPath id="glass-water-clip">
                      <path d="M 29.5,17 L 35,83 C 35,85 37,87 39,87 L 61,87 C 63,87 65,85 65,83 L 70.5,17 Z" />
                    </clipPath>
                    
                    {/* Premium Blue Water Gradient */}
                    <linearGradient id="water-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" />
                      <stop offset="100%" stopColor="#1d4ed8" />
                    </linearGradient>
                  </defs>

                  {/* Glass Inner water fill (clipped to the glass interior) */}
                  <rect 
                    x="15" 
                    y={87 - (70 * Math.min(100, Math.round((waterAmount / waterTarget) * 100))) / 100} 
                    width="70" 
                    height={(70 * Math.min(100, Math.round((waterAmount / waterTarget) * 100))) / 100} 
                    fill="url(#water-grad)"
                    clipPath="url(#glass-water-clip)"
                    className="transition-all duration-500"
                  />

                  {/* Glass Outer Outline Rim & Base */}
                  <path 
                    d="M 28,15 L 34,85 C 34,88 37,90 40,90 L 60,90 C 63,90 66,88 66,85 L 72,15" 
                    stroke="currentColor" 
                    strokeWidth="4" 
                    strokeLinecap="round"
                    fill="none" 
                    className="text-zinc-700"
                  />
                </svg>
                
                {/* Droplet overlay icon centered */}
                <div className="absolute text-center flex flex-col items-center select-none pointer-events-none">
                  <Droplet className={`w-6 h-6 transition-all duration-300 ${waterAmount > 0 ? 'text-white' : 'text-zinc-500'}`} />
                </div>
              </div>

              {/* Popout quick action buttons floating on left & right sides of the glass */}
              <AnimatePresence>
                {showWaterActions && (
                  <>
                    {/* Left Button (-250ml) */}
                    <motion.button
                      initial={{ opacity: 0, x: 10, scale: 0.8 }}
                      animate={{ opacity: 1, x: -14, scale: 1 }}
                      exit={{ opacity: 0, x: 10, scale: 0.8 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModifyWater(-250);
                      }}
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-950/95 border-2 border-brand text-[9px] font-black text-brand flex flex-col items-center justify-center cursor-pointer transition active:scale-90 select-none shadow-[0_0_12px_rgba(255,230,0,0.25)] z-20"
                      title="Subtract 250ml"
                    >
                      <span className="leading-none">-250</span>
                      <span className="text-[6px] opacity-75 mt-0.5 leading-none">ML</span>
                    </motion.button>

                    {/* Right Button (+250ml) */}
                    <motion.button
                      initial={{ opacity: 0, x: -10, scale: 0.8 }}
                      animate={{ opacity: 1, x: 14, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.8 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleModifyWater(250);
                      }}
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-zinc-950/95 border-2 border-brand text-[9px] font-black text-brand flex flex-col items-center justify-center cursor-pointer transition active:scale-90 select-none shadow-[0_0_12px_rgba(255,230,0,0.25)] z-20"
                      title="Add 250ml"
                    >
                      <span className="leading-none">+250</span>
                      <span className="text-[6px] opacity-75 mt-0.5 leading-none">ML</span>
                    </motion.button>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <div className="text-center mt-3 w-full">
              <span className="text-[10px] font-mono font-black text-white leading-none block select-none">
                {waterAmount >= 1000 ? `${(waterAmount / 1000).toFixed(1)}L` : `${waterAmount}ml`}
              </span>
              <span className="text-[9px] uppercase tracking-wider text-zinc-400 block font-mono font-bold mt-0.5">
                {Math.round((waterAmount / waterTarget) * 100)}% of goal
              </span>
            </div>
          </div>
        </div>

        {/* Vital Cards */}
        <div className="grid grid-cols-3 gap-3">
          {healthCards.map((metricId) => {
            let label = "Total Energy";
            let value: string | number = displayTotalCalories;
            let unit = "kcal";
            let subtitle = "Daily Output";
            let icon = <Activity className="w-3.5 h-3.5 text-brand" />;

            const daySeed = new Date(selectedDate).getDate() || 1;

            switch (metricId) {
              case 'active_calories':
                label = "Active Energy";
                value = displayActiveCalories;
                unit = "kcal";
                subtitle = "Active Burn";
                icon = <Zap className="w-3.5 h-3.5 text-brand" />;
                break;
              case 'calories':
                label = "Total Energy";
                value = displayTotalCalories;
                unit = "kcal";
                subtitle = "Daily Output";
                icon = <Activity className="w-3.5 h-3.5 text-brand" />;
                break;
              case 'distance':
                label = "Distance";
                value = displayDistanceMiles;
                unit = "mi";
                subtitle = `${(displayDistance / 1000).toFixed(1)} km`;
                icon = <Compass className="w-3.5 h-3.5 text-brand" />;
                break;
              case 'heart_rate':
                label = "Heart Rate";
                value = displayHeartRate > 0 ? displayHeartRate : "No Data";
                unit = displayHeartRate > 0 ? "bpm" : "";
                subtitle = displayHeartRate > 0 ? "Daily Avg" : "Vitals Sync Active";
                icon = <Heart className="w-3.5 h-3.5 text-red-500" />;
                break;
              case 'weight':
                const selectedWeight = weightHistory.find(w => w.date === selectedDate) || weightHistory[0];
                label = "Weight";
                value = selectedWeight ? selectedWeight.weight : "No Log";
                unit = selectedWeight ? selectedWeight.unit : "kg";
                subtitle = "Current Weight";
                icon = <Scale className="w-3.5 h-3.5 text-brand" />;
                break;
              case 'water':
                label = "Water Intake";
                value = waterAmount >= 1000 ? (waterAmount / 1000).toFixed(1) : waterAmount;
                unit = waterAmount >= 1000 ? "L" : "ml";
                subtitle = "Hydration level";
                icon = <Droplet className="w-3.5 h-3.5 text-blue-500" />;
                break;
              case 'steps':
                label = "Steps Count";
                value = displaySteps.toLocaleString();
                unit = "steps";
                subtitle = "Active walking";
                icon = <Footprints className="w-3.5 h-3.5 text-brand" />;
                break;
              case 'sleep':
                label = "Sleep Duration";
                value = (7 + (daySeed % 3) * 0.5).toFixed(1);
                unit = "hrs";
                subtitle = "Rest cycles";
                icon = <Activity className="w-3.5 h-3.5 text-brand" />;
                break;
              case 'body_fat':
                label = "Body Fat";
                value = (14.5 + (daySeed % 6) * 0.5).toFixed(1);
                unit = "%";
                subtitle = "Body Composition";
                icon = <Scale className="w-3.5 h-3.5 text-brand" />;
                break;
              case 'stairs':
                label = "Flights Climbed";
                value = 2 + (daySeed % 12);
                unit = "flights";
                subtitle = "Stairs climbed";
                icon = <Footprints className="w-3.5 h-3.5 text-brand" />;
                break;
            }

            return (
              <div key={metricId} className="bg-zinc-950/40 border border-border-dark/40 p-3.5 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono uppercase tracking-wider text-zinc-500">{label}</span>
                  {icon}
                </div>
                <div className="mt-4">
                  <span className="text-lg font-mono font-black text-white">{value}</span>
                  {unit && <span className="text-[9px] text-zinc-500 font-mono ml-0.5">{unit}</span>}
                  <span className="text-[8px] text-zinc-600 font-mono block mt-1 uppercase">
                    {subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
