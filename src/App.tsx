import React, { useState, useEffect, useRef } from 'react';
import { Workout, PersonalBest, Exercise, WorkoutHistoryEntry, MuscleGroup, ScheduledWorkout, WeightLogEntry, WaterLog, WorkoutExercise, SetRecord } from './types';
import { PREMADE_WORKOUTS, INITIAL_EXERCISES } from './data';
import { getWeightComparison } from './weightComparisons';
import ActiveWorkoutSession from './components/ActiveWorkoutSession';
import CardioWizard from './components/CardioWizard';
import ActiveCardioSession, { LeafletMap } from './components/ActiveCardioSession';
import WorkoutCreator from './components/WorkoutCreator';
import PersonalBestsDashboard from './components/PersonalBestsDashboard';
import ExerciseList from './components/ExerciseList';
import WeeklyPlanner from './components/WeeklyPlanner';
import ProfileDashboard from './components/ProfileDashboard';
import SettingsDashboard from './components/SettingsDashboard';
import WaterTracker from './components/WaterTracker';
import TitanHeatmap, { HeatmapRuneIcon } from './components/TitanHeatmap';
import heatmapLogo from './assets/images/heatmap_logo.png';
import appIcon from './assets/images/app_icon_l.png';
import LokiAICoach, { ValknutIcon } from './components/LokiAICoach';
import StepsTracker from './components/StepsTracker';
import AppUpdateModal from './components/AppUpdateModal';
import { checkForUpdate, isUpdateDismissed, getAutoCheckEnabled, AppUpdateInfo } from './services/updateService';
import { 
  Dumbbell, Trophy, BookOpen, Compass, Plus, Flame, 
  Clock, Award, ChevronRight, Check, RefreshCw, Sparkles,
  Trophy as TrophyIcon, X, Calendar, FlameKindling, Info, Zap,
  Hammer, Shield, Crown, Trash2, ChevronDown, Edit2, Scale, Droplet,
  Activity, Navigation, Star, Maximize
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Motivational quotes
const MOTIVATIONAL_QUOTES = [
  "The only bad workout is the one that didn't happen. Move your body!",
  "Strength does not come from winning. Your struggles develop your strengths.",
  "Your body can stand almost anything. It's your mind that you have to convince.",
  "Continuous improvement is better than delayed perfection.",
  "Action is the foundational key to all athletic success."
];


// React Error Boundary to catch and display runtime crashes in ActiveWorkoutSession on devices
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  state: { hasError: boolean; error: Error | null } = { hasError: false, error: null };
  props: { children: React.ReactNode };
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-dark-bg text-[#F0F0F0] flex flex-col items-center justify-center p-6 text-center font-sans">
          <div className="w-16 h-16 bg-dark-panel border border-border-dark flex items-center justify-center text-rose-500 mb-6">
            <span className="text-2xl font-bold">⚠️</span>
          </div>
          <h2 className="text-xl font-display font-black italic uppercase text-white mb-2">Workout Session Crashed</h2>
          <p className="text-rose-400 text-xs max-w-lg mb-4 font-mono bg-dark-panel p-4 border border-border-dark text-left overflow-x-auto whitespace-pre-wrap">
            {this.state.error?.toString()}
          </p>
          <p className="text-[#888] text-[10px] max-w-xs mb-6 leading-relaxed">
            A runtime error occurred in the active session. Take a screenshot of the error above to help us diagnose the issue.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="py-3 px-8 bg-brand hover:bg-white text-black font-black uppercase text-xs tracking-wider transition-colors cursor-pointer"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  // Navigation: 'planner' | 'water' | 'routines' | 'exercises' | 'pbs' | 'creator' | 'profile' | 'settings'
  const [activeTab, setActiveTab] = useState<'planner' | 'water' | 'routines' | 'exercises' | 'pbs' | 'creator' | 'profile' | 'settings'>('planner');
  const [isLokiCoachOpen, setIsLokiCoachOpen] = useState(false);
  const [isHeatmapOpen, setIsHeatmapOpen] = useState(false);
  const [selectedDetailExercise, setSelectedDetailExercise] = useState<WorkoutExercise | null>(null);

  // Gemini API Integration State
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('workout_gemini_api_key') || '';
  });

  // Health Connect Steps Sync State
  const [todaySteps, setTodaySteps] = useState<number>(() => {
    const savedSteps = localStorage.getItem('workout_today_steps');
    const savedDate = localStorage.getItem('workout_today_steps_date');
    const todayStr = new Date().toISOString().split('T')[0];
    if (savedDate === todayStr && savedSteps) {
      return Number(savedSteps);
    }
    return 0;
  });

  // Health Connect Calorie Sync State
  const [activeCalories, setActiveCalories] = useState<number>(() => {
    const savedActive = localStorage.getItem('workout_active_calories');
    const savedDate = localStorage.getItem('workout_active_calories_date');
    const todayStr = new Date().toISOString().split('T')[0];
    if (savedDate === todayStr && savedActive) {
      return Number(savedActive);
    }
    return 0;
  });

  const [totalCalories, setTotalCalories] = useState<number>(() => {
    const savedTotal = localStorage.getItem('workout_total_calories');
    const savedDate = localStorage.getItem('workout_total_calories_date');
    const todayStr = new Date().toISOString().split('T')[0];
    if (savedDate === todayStr && savedTotal) {
      return Number(savedTotal);
    }
    return 0;
  });

  const [todayHeartRate, setTodayHeartRate] = useState<number>(() => {
    const savedHR = localStorage.getItem('workout_today_heart_rate');
    const savedDate = localStorage.getItem('workout_today_heart_rate_date');
    const todayStr = new Date().toISOString().split('T')[0];
    if (savedDate === todayStr && savedHR) {
      return Number(savedHR);
    }
    return 0;
  });

  const [heartRateMin, setHeartRateMin] = useState<number>(() => {
    const savedMin = localStorage.getItem('workout_heart_rate_min');
    const savedDate = localStorage.getItem('workout_heart_rate_min_date');
    const todayStr = new Date().toISOString().split('T')[0];
    if (savedDate === todayStr && savedMin) {
      return Number(savedMin);
    }
    return 0;
  });

  const [heartRateMax, setHeartRateMax] = useState<number>(() => {
    const savedMax = localStorage.getItem('workout_heart_rate_max');
    const savedDate = localStorage.getItem('workout_heart_rate_max_date');
    const todayStr = new Date().toISOString().split('T')[0];
    if (savedDate === todayStr && savedMax) {
      return Number(savedMax);
    }
    return 0;
  });

  const [todayDistance, setTodayDistance] = useState<number>(() => {
    const savedDist = localStorage.getItem('workout_today_distance');
    const savedDate = localStorage.getItem('workout_today_distance_date');
    const todayStr = new Date().toISOString().split('T')[0];
    if (savedDate === todayStr && savedDist) {
      return Number(savedDist);
    }
    return 0;
  });



  // Core Persisted State
  const [personalBests, setPersonalBests] = useState<PersonalBest[]>([]);
  const [customWorkouts, setCustomWorkouts] = useState<Workout[]>([]);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);
  const [history, setHistory] = useState<WorkoutHistoryEntry[]>([]);
  const [favoriteExerciseIds, setFavoriteExerciseIds] = useState<string[]>([]);
  const [favoriteWorkoutIds, setFavoriteWorkoutIds] = useState<string[]>([]);
  const [scheduledWorkouts, setScheduledWorkouts] = useState<ScheduledWorkout[]>([]);
  const [weightHistory, setWeightHistory] = useState<WeightLogEntry[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);

  // Warrior Moniker/Nickname State
  const [userNickname, setUserNickname] = useState<string>(() => {
    return localStorage.getItem('workout_user_nickname') || '';
  });

  const handleUpdateUserNickname = (nickname: string) => {
    setUserNickname(nickname);
    localStorage.setItem('workout_user_nickname', nickname);
  };

  // Loki AI Engine Choice (gemini_api or gemini_nano)
  const [lokiAiEngine, setLokiAiEngine] = useState<'gemini_api' | 'gemini_nano'>(() => {
    return (localStorage.getItem('workout_loki_ai_engine') as any) || 'gemini_api';
  });

  const handleUpdateLokiAiEngine = (engine: 'gemini_api' | 'gemini_nano') => {
    setLokiAiEngine(engine);
    localStorage.setItem('workout_loki_ai_engine', engine);
  };

  // Health Cards configuration state (bottom 3 slots)
  const [healthCards, setHealthCards] = useState<string[]>(() => {
    const saved = localStorage.getItem('workout_health_cards');
    return saved ? JSON.parse(saved) : ['calories', 'distance', 'heart_rate'];
  });

  const handleUpdateHealthCards = (newCards: string[]) => {
    setHealthCards(newCards);
    localStorage.setItem('workout_health_cards', JSON.stringify(newCards));
  };

  // Active workout session state
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);

  // Cardio tracking wizard states
  const [isCardioWizardOpen, setIsCardioWizardOpen] = useState(false);
  const [isCardioExpanded, setIsCardioExpanded] = useState(false);
  const [selectedCardioActivity, setSelectedCardioActivity] = useState<string | null>(null);
  const [activeCardioSession, setActiveCardioSession] = useState<{
    activity: string;
    mode: 'timer' | 'free';
    targetMinutes?: number;
    trackingProfile?: 'Walking' | 'Running' | 'Sprinting' | 'Cycling' | 'Paddleboarding';
  } | null>(null);

  // Accordion state for Routines categories
  const [expandedRoutineCategory, setExpandedRoutineCategory] = useState<string | null>(null);

  // Discord Integration State
  const [discordWebhookUrl, setDiscordWebhookUrl] = useState<string>(() => {
    return localStorage.getItem('workout_discord_webhook') || '';
  });
  const [isSharingToDiscord, setIsSharingToDiscord] = useState(false);
  const [hasSharedToDiscord, setHasSharedToDiscord] = useState(false);

  // Units of Measure Preferences
  const [distanceUnit, setDistanceUnit] = useState<'km' | 'mi'>(() => {
    return (localStorage.getItem('workout_distance_unit') as 'km' | 'mi') || 'km';
  });
  const [weightUnit, setWeightUnit] = useState<'lbs' | 'kg'>(() => {
    return (localStorage.getItem('workout_weight_unit') as 'lbs' | 'kg') || 'lbs';
  });

  const handleUpdateDistanceUnit = (unit: 'km' | 'mi') => {
    setDistanceUnit(unit);
    localStorage.setItem('workout_distance_unit', unit);
  };

  const handleUpdateWeightUnit = (unit: 'lbs' | 'kg') => {
    setWeightUnit(unit);
    localStorage.setItem('workout_weight_unit', unit);
  };

  // App Theme State
  const [appTheme, setAppTheme] = useState<string>(() => {
    return localStorage.getItem('workout_app_theme') || 'volt';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', appTheme);
    localStorage.setItem('workout_app_theme', appTheme);
  }, [appTheme]);

  // Auto-scroll active tab button into view in the top navigation bar
  useEffect(() => {
    const activeBtnId = `nav-${activeTab}-tab`;
    const element = document.getElementById(activeBtnId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeTab]);
  const allExercises = [...INITIAL_EXERCISES, ...customExercises];
  // Home Assistant Integration State
  const [homeAssistantWebhookUrl, setHomeAssistantWebhookUrl] = useState<string>(() => {
    return localStorage.getItem('workout_ha_webhook') || '';
  });
  const [haTriggerOnStart, setHaTriggerOnStart] = useState<boolean>(() => {
    return localStorage.getItem('workout_ha_trigger_start') === 'true';
  });
  const [haTriggerOnComplete, setHaTriggerOnComplete] = useState<boolean>(() => {
    return localStorage.getItem('workout_ha_trigger_complete') === 'true';
  });

  // Completion report modal details
  const [showCompletionReport, setShowCompletionReport] = useState<{
    workoutName: string;
    muscleGroup: MuscleGroup;
    durationSeconds: number;
    totalSetsCompleted: number;
    newPBsCount: number;
    totalWeightLifted: number;
    cardioDistanceKm?: number;
    cardioElevationMeters?: number;
    cardioGpsPath?: { lat: number; lng: number; alt: number | null; timestamp: number }[];
    isCardioOnly?: boolean;
  } | null>(null);

  // State to manage viewing a completed workout entry in detail
  const [viewingHistoryEntry, setViewingHistoryEntry] = useState<WorkoutHistoryEntry | null>(null);
  const [isEditingHistory, setIsEditingHistory] = useState(false);
  const [isHistoryCollapsed, setIsHistoryCollapsed] = useState(false);
  const [fullscreenMapPoints, setFullscreenMapPoints] = useState<{ lat: number; lng: number; alt: number | null; timestamp: number }[] | null>(null);

  // GitHub App Update Modal State
  const [availableUpdate, setAvailableUpdate] = useState<AppUpdateInfo | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  // Auto-check for GitHub releases on launch
  useEffect(() => {
    if (!getAutoCheckEnabled()) return;

    const timer = setTimeout(async () => {
      try {
        const info = await checkForUpdate(false);
        if (info.hasUpdate && !isUpdateDismissed(info.latestVersion)) {
          setAvailableUpdate(info);
          setIsUpdateModalOpen(true);
        }
      } catch (e) {
        // Silent catch on automatic startup check
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleUpdateHistoryEntry = (updatedEntry: WorkoutHistoryEntry) => {
    // Automatically recalculate sets completed and weight moved if exercises are present
    let totalSets = updatedEntry.totalSetsCompleted;
    let totalWeight = updatedEntry.totalWeightMoved || 0;
    
    if (updatedEntry.exercises) {
      totalSets = 0;
      totalWeight = 0;
      updatedEntry.exercises.forEach(ex => {
        ex.sets.forEach(set => {
          totalSets++;
          const reps = set.reps || 0;
          const weight = set.weight || 0;
          totalWeight += reps * weight;
        });
      });
    }

    const finalEntry: WorkoutHistoryEntry = {
      ...updatedEntry,
      totalSetsCompleted: totalSets,
      totalWeightMoved: totalWeight
    };

    const newHistory = history.map(h => h.id === finalEntry.id ? finalEntry : h);
    saveHistory(newHistory);
    setViewingHistoryEntry(null);
    setIsEditingHistory(false);
  };

  // State to manage deleting a completed workout entry
  const [deleteHistoryEntryId, setDeleteHistoryEntryId] = useState<string | null>(null);

  // Accordion state for Health Connect Sync category
  const [isHealthConnectExpanded, setIsHealthConnectExpanded] = useState(true);

  // Accordion states for Records and Water Intake
  const [isRecordsExpanded, setIsRecordsExpanded] = useState(false);
  const [isWaterExpanded, setIsWaterExpanded] = useState(false);

  // Random quote
  const [randomQuote, setRandomQuote] = useState('');

  // 1. Load data from Local Storage
  useEffect(() => {
    try {
      const storedPBs = localStorage.getItem('workout_pbs_tracker');
      const storedCustomWorkouts = localStorage.getItem('workout_custom_routines');
      const storedCustomExercises = localStorage.getItem('workout_custom_movements');
      const storedHistory = localStorage.getItem('workout_history_log');
      const storedFavorites = localStorage.getItem('workout_favorite_exercises');
      const storedFavoriteRoutines = localStorage.getItem('workout_favorite_routines');
      const storedSchedule = localStorage.getItem('workout_weekly_schedule');
      const storedWeightHistory = localStorage.getItem('workout_weight_history');
      const storedWaterLogs = localStorage.getItem('workout_water_logs');

      if (storedPBs) setPersonalBests(JSON.parse(storedPBs));
      if (storedCustomWorkouts) setCustomWorkouts(JSON.parse(storedCustomWorkouts));
      if (storedCustomExercises) setCustomExercises(JSON.parse(storedCustomExercises));
      if (storedHistory) setHistory(JSON.parse(storedHistory));
      if (storedFavorites) setFavoriteExerciseIds(JSON.parse(storedFavorites));
      if (storedFavoriteRoutines) setFavoriteWorkoutIds(JSON.parse(storedFavoriteRoutines));
      if (storedWeightHistory) setWeightHistory(JSON.parse(storedWeightHistory));
      if (storedWaterLogs) setWaterLogs(JSON.parse(storedWaterLogs));

      if (storedSchedule) {
        setScheduledWorkouts(JSON.parse(storedSchedule));
      } else {
        // Pre-populate with standard split for great initial user experience
        const defaultSchedule: ScheduledWorkout[] = [
          { id: 'sched_init_1', workoutId: 'chest_day', day: 'Monday' },
          { id: 'sched_init_2', workoutId: 'back_day', day: 'Wednesday' },
          { id: 'sched_init_3', workoutId: 'legs_day', day: 'Friday' }
        ];
        setScheduledWorkouts(defaultSchedule);
        localStorage.setItem('workout_weekly_schedule', JSON.stringify(defaultSchedule));
      }
    } catch (e) {
      console.error("Failed to load records from LocalStorage:", e);
    }

    setRandomQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  }, []);

  // 1a-2. Request native permissions on app mount (specifically for installed PWA/APK)
  useEffect(() => {
    const requestAppPermissions = async () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (isStandalone) {
        // 1. Request Notification Permission
        if ('Notification' in window && Notification.permission === 'default') {
          try {
            await Notification.requestPermission();
          } catch (e) {
            console.warn("Notification permission request failed:", e);
          }
        }

        // 2. Request Camera Permission
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            // Immediately release camera
            stream.getTracks().forEach(track => track.stop());
            console.log("Camera permission pre-granted");
          } catch (e) {
            console.warn("Camera permission pre-grant declined or unsupported:", e);
          }
        }
      }
    };

    requestAppPermissions();
  }, []);



  // 1b. Listen for message/query notifications (PWA & Android Integration)
  useEffect(() => {
    // 1. Process Service Worker Messages (adds water from background notification clicks)
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'ADD_WATER_FROM_NOTIFICATION') {
        const amount = Number(event.data.amount);
        if (amount > 0) {
          addWaterDirectly(amount);
        }
      }
    };
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
    }

    // 2. Parse query parameters on load (handles app opening from notification actions)
    const params = new URLSearchParams(window.location.search);
    const addWaterVal = params.get('add_water');
    if (addWaterVal) {
      const amount = Number(addWaterVal);
      if (amount > 0) {
        addWaterDirectly(amount);
      }
      // Clean query string from browser URL so refreshing does not double-add
      const url = new URL(window.location.href);
      url.searchParams.delete('add_water');
      window.history.replaceState({}, document.title, url.pathname + url.search);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      }
    };
  }, []);

  const addWaterDirectly = (amount: number) => {
    const todayStr = new Date().toISOString().split('T')[0];
    setWaterLogs((prevLogs) => {
      const updated = [...prevLogs];
      const idx = updated.findIndex((l) => l.date === todayStr);
      if (idx >= 0) {
        updated[idx] = {
          ...updated[idx],
          amount: updated[idx].amount + amount
        };
      } else {
        updated.push({
          date: todayStr,
          amount: amount,
          target: 2500 // Default target capacity
        });
      }
      localStorage.setItem('workout_water_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // 2. State-saver utility
  const savePersonalBests = (newPBs: PersonalBest[]) => {
    setPersonalBests(newPBs);
    localStorage.setItem('workout_pbs_tracker', JSON.stringify(newPBs));
  };

  const saveFavoriteExercises = (newFavorites: string[]) => {
    setFavoriteExerciseIds(newFavorites);
    localStorage.setItem('workout_favorite_exercises', JSON.stringify(newFavorites));
  };

  const handleToggleFavorite = (exerciseId: string) => {
    if (favoriteExerciseIds.includes(exerciseId)) {
      saveFavoriteExercises(favoriteExerciseIds.filter(id => id !== exerciseId));
    } else {
      saveFavoriteExercises([...favoriteExerciseIds, exerciseId]);
    }
  };

  const saveFavoriteWorkouts = (newFavorites: string[]) => {
    setFavoriteWorkoutIds(newFavorites);
    localStorage.setItem('workout_favorite_routines', JSON.stringify(newFavorites));
  };

  const handleToggleFavoriteWorkout = (workoutId: string) => {
    if (favoriteWorkoutIds.includes(workoutId)) {
      saveFavoriteWorkouts(favoriteWorkoutIds.filter(id => id !== workoutId));
    } else {
      saveFavoriteWorkouts([...favoriteWorkoutIds, workoutId]);
    }
  };

  const saveCustomWorkouts = (newWorkouts: Workout[]) => {
    setCustomWorkouts(newWorkouts);
    localStorage.setItem('workout_custom_routines', JSON.stringify(newWorkouts));
  };

  const saveCustomExercises = (newExercises: Exercise[]) => {
    setCustomExercises(newExercises);
    localStorage.setItem('workout_custom_movements', JSON.stringify(newExercises));
  };

  const saveHistory = (newHistory: WorkoutHistoryEntry[]) => {
    setHistory(newHistory);
    localStorage.setItem('workout_history_log', JSON.stringify(newHistory));
  };

  const saveWeightHistory = (newHistory: WeightLogEntry[]) => {
    setWeightHistory(newHistory);
    localStorage.setItem('workout_weight_history', JSON.stringify(newHistory));
  };

  const handleAddWeightEntry = (entry: WeightLogEntry) => {
    saveWeightHistory([...weightHistory, entry]);
  };

  const handleDeleteWeightEntry = (id: string) => {
    saveWeightHistory(weightHistory.filter(w => w.id !== id));
  };

  const handleUpdateWaterLogs = (newLogs: WaterLog[]) => {
    setWaterLogs(newLogs);
    localStorage.setItem('workout_water_logs', JSON.stringify(newLogs));
  };

  // Handler: Manual logging/adding of PB
  const handleAddManualPB = (newPB: PersonalBest) => {
    const updated = personalBests.filter(pb => pb.exerciseId !== newPB.exerciseId);
    savePersonalBests([...updated, newPB]);
  };

  // Handler: Clearing PB
  const handleClearPB = (exerciseId: string) => {
    const filtered = personalBests.filter(pb => pb.exerciseId !== exerciseId);
    savePersonalBests(filtered);
  };

  // Handler: Saving created custom workout routine
  const handleSaveWorkout = (newWorkout: Workout, startNow?: boolean) => {
    saveCustomWorkouts([...customWorkouts, newWorkout]);
    if (startNow) {
      handleStartWorkout(newWorkout);
    }
    setActiveTab('routines');
  };

  // Weekly Planner state saving and scheduling handlers
  const saveScheduledWorkouts = (newSchedule: ScheduledWorkout[]) => {
    setScheduledWorkouts(newSchedule);
    localStorage.setItem('workout_weekly_schedule', JSON.stringify(newSchedule));
  };

  const handleScheduleWorkout = (day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday', workoutId: string) => {
    const newScheduled: ScheduledWorkout = {
      id: `scheduled_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      workoutId,
      day
    };
    saveScheduledWorkouts([...scheduledWorkouts, newScheduled]);
  };

  const handleUnscheduleWorkout = (scheduledId: string) => {
    const updated = scheduledWorkouts.filter(sw => sw.id !== scheduledId);
    saveScheduledWorkouts(updated);
  };

  // Handler: Delete custom workout routine
  const handleDeleteCustomWorkout = (workoutId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering startup click
    if (confirm("Delete this custom routine permanently?")) {
      const filtered = customWorkouts.filter(w => w.id !== workoutId);
      saveCustomWorkouts(filtered);
    }
  };

  // Helper to render a workout card in the Routines list
  const renderWorkoutCard = (routine: Workout, isCustom: boolean) => {
    return (
      <div 
        key={routine.id}
        className="bg-dark-panel border border-border-dark hover:border-brand/40 p-5 md:p-6 rounded-none flex flex-col justify-between shadow-sm transition group"
      >
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="bg-dark-surface border border-border-dark text-brand text-[10px] font-bold font-mono px-2 py-0.5 rounded-none uppercase tracking-wider">
              {isCustom ? 'Custom' : 'Preset'}
            </span>
            
            <div className="flex items-center gap-2.5">
              {/* Routine Favorite Star Toggle */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavoriteWorkout(routine.id);
                }}
                className="p-1 hover:scale-110 transition cursor-pointer flex-shrink-0 focus:outline-none"
                title={favoriteWorkoutIds.includes(routine.id) ? "Remove from favorites" : "Add to favorites"}
              >
                <Star className={`w-3.5 h-3.5 transition ${favoriteWorkoutIds.includes(routine.id) ? 'fill-brand text-brand drop-shadow-[0_0_4px_#FFE600]' : 'text-zinc-600 hover:text-zinc-300'}`} />
              </button>

              <span className="text-[10px] text-[#666] uppercase font-bold font-mono">
                {routine.exercises.length} Exercises
              </span>
              {isCustom && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCustomWorkout(routine.id, e);
                  }}
                  className="text-zinc-500 hover:text-rose-500 hover:bg-rose-950/20 border border-border-dark/60 hover:border-rose-500/30 p-1.5 rounded-none transition cursor-pointer"
                  title="Delete Custom Routine"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <h4 className="text-base font-display font-black italic uppercase text-white tracking-tight leading-tight mt-2">{routine.name}</h4>
          <p className="text-[#CCC] text-xs leading-relaxed mt-2">{routine.description}</p>

          {/* Exercises preview pills */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {routine.exercises.map(ex => (
              <button
                key={ex.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDetailExercise(ex);
                }}
                className="bg-dark-surface hover:bg-zinc-900 text-[#CCC] hover:text-white border border-border-dark hover:border-brand/40 text-[10px] py-1 px-2.5 rounded-none font-mono transition cursor-pointer select-none"
              >
                {ex.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border-dark flex justify-end">
          <button
            onClick={() => handleStartWorkout(routine)}
            className="py-2 px-4 bg-white hover:bg-brand text-black font-black uppercase text-xs tracking-tighter transition-colors flex items-center gap-1 rounded-none cursor-pointer"
          >
            <span>Launch Active Session</span>
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    );
  };

  // Handler: Add Custom exercise
  const handleAddCustomExercise = (newExercise: Exercise) => {
    saveCustomExercises([...customExercises, newExercise]);
  };

  // Handler: Delete Custom exercise
  const handleDeleteCustomExercise = (exerciseId: string) => {
    if (confirm("Are you sure you want to remove this custom exercise from the library?")) {
      saveCustomExercises(customExercises.filter(ex => ex.id !== exerciseId));
      saveFavoriteExercises(favoriteExerciseIds.filter(id => id !== exerciseId));
      savePersonalBests(personalBests.filter(pb => pb.exerciseId !== exerciseId));
      const cardioRoutineId = `cardio_custom_${exerciseId}`;
      setScheduledWorkouts(prev => {
        const updated = prev.filter(sw => sw.workoutId !== cardioRoutineId);
        localStorage.setItem('workout_scheduled', JSON.stringify(updated));
        return updated;
      });
    }
  };
  // Handler: Start a workout session
  const handleStartWorkout = (workout: Workout) => {
    if (workout.id.startsWith('cardio_preset_') || workout.id.startsWith('cardio_custom_')) {
      let activity = '';
      if (workout.id.startsWith('cardio_preset_')) {
        const activityMap: Record<string, string> = {
          'cardio_preset_walking': 'Walking',
          'cardio_preset_running': 'Running',
          'cardio_preset_sprinting': 'Sprinting',
          'cardio_preset_cycling': 'Cycling',
          'cardio_preset_paddleboarding': 'Paddleboarding'
        };
        activity = activityMap[workout.id] || 'Walking';
      } else {
        activity = workout.name.replace(/^Cardio:\s*/, '');
      }

      if (activity) {
        setSelectedCardioActivity(activity);
        setIsCardioWizardOpen(true);
        return;
      }
    }
    setActiveWorkout(workout);
    if (haTriggerOnStart) {
      triggerHomeAssistant('started', {
        workoutName: workout.name,
        muscleGroup: workout.muscleGroup,
        totalExercises: workout.exercises.length
      });
    }
  };

  // Handler: Export all app data as JSON backup
  const handleExportBackup = () => {
    try {
      const backupData = {
        version: "1.0",
        timestamp: Date.now(),
        data: {
          personalBests,
          customWorkouts,
          customExercises,
          history,
          favoriteExerciseIds,
          scheduledWorkouts,
          weightHistory,
          waterLogs,
          favoriteWorkoutIds
        }
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `loki_gym_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("Failed to export backup: " + e);
    }
  };

  // Handler: Import app data from JSON backup
  const handleImportBackup = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!json || json.version !== "1.0" || !json.data) {
          alert("Invalid backup file format!");
          return;
        }

        const { data } = json;
        if (confirm("Importing this backup will overwrite your current workout history, weight logs, custom routines, and settings. Proceed?")) {
          if (data.personalBests) savePersonalBests(data.personalBests);
          if (data.customWorkouts) saveCustomWorkouts(data.customWorkouts);
          if (data.customExercises) saveCustomExercises(data.customExercises);
          if (data.history) saveHistory(data.history);
          if (data.favoriteExerciseIds) saveFavoriteExercises(data.favoriteExerciseIds);
          if (data.scheduledWorkouts) saveScheduledWorkouts(data.scheduledWorkouts);
          if (data.weightHistory) saveWeightHistory(data.weightHistory);
          if (data.waterLogs) handleUpdateWaterLogs(data.waterLogs);
          if (data.favoriteWorkoutIds) saveFavoriteWorkouts(data.favoriteWorkoutIds);

          alert("Backup restored successfully!");
          window.location.reload();
        }
      } catch (err) {
        alert("Failed to parse backup file: " + err);
      }
    };
    reader.readAsText(file);
  };  const handleFinishCardioSession = (stats: {
    activity: 'Walking' | 'Running' | 'Sprinting' | 'Cycling' | 'Paddleboarding';
    durationSeconds: number;
    distanceKm: number;
    elevationMeters: number;
    gpsPoints: { lat: number; lng: number; alt: number | null; timestamp: number }[];
  }) => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const cardioExercise: WorkoutExercise = {
      id: `cardio_ex_${Date.now()}`,
      exerciseId: `ex_cardio_${stats.activity.toLowerCase()}`,
      name: `${stats.activity} Session`,
      muscleGroup: 'Cardio',
      sets: [
        {
          setId: 1,
          isCompleted: true,
          duration: stats.durationSeconds,
          distance: stats.distanceKm,
          elevation: stats.elevationMeters,
          gpsPath: stats.gpsPoints
        }
      ],
      restDuration: 0,
      type: 'time',
      image: '',
      instructions: ['Tracked outdoor cardio activity via GPS.']
    };

    const newEntry: WorkoutHistoryEntry = {
      id: `history_${Date.now()}`,
      workoutId: `cardio_${stats.activity.toLowerCase()}`,
      workoutName: `Cardio: ${stats.activity}`,
      muscleGroup: 'Cardio',
      date: todayStr,
      durationSeconds: stats.durationSeconds,
      totalSetsCompleted: 1,
      newPersonalBestsCount: 0,
      totalWeightMoved: 0,
      exercises: [cardioExercise]
    };

    saveHistory([...history, newEntry]);
    setActiveCardioSession(null);

    setShowCompletionReport({
      workoutName: `Cardio: ${stats.activity}`,
      muscleGroup: 'Cardio',
      durationSeconds: stats.durationSeconds,
      totalSetsCompleted: 1,
      newPBsCount: 0,
      totalWeightLifted: 0,
      cardioDistanceKm: stats.distanceKm,
      cardioGpsPath: stats.gpsPoints
    });
  };

  // Handler: Completing workout session
  const handleWorkoutComplete = (
    durationSeconds: number, 
    totalSetsCompleted: number, 
    newPBsCount: number,
    totalWeightLifted: number,
    finalExercises?: WorkoutExercise[]
  ) => {
    if (!activeWorkout) return;

    const usedExercises = finalExercises || activeWorkout.exercises;
    const isCardioOnly = usedExercises.length > 0 && usedExercises.every(ex => ex.type === 'cardio');

    const todayStr = new Date().toISOString().split('T')[0];
    const newEntry: WorkoutHistoryEntry = {
      id: `history_${Date.now()}`,
      workoutId: activeWorkout.id,
      workoutName: activeWorkout.name,
      muscleGroup: activeWorkout.muscleGroup,
      date: todayStr,
      durationSeconds,
      totalSetsCompleted,
      newPersonalBestsCount: newPBsCount,
      totalWeightMoved: totalWeightLifted,
      exercises: JSON.parse(JSON.stringify(usedExercises))
    };

    saveHistory([...history, newEntry]);
    setActiveWorkout(null);

    // Extract cardio stats if a cardio exercise was present in this workout
    const cardioEx = usedExercises.find(ex => ex.type === 'cardio');
    const cardioDistanceKm = cardioEx?.sets?.[0]?.distance;
    const cardioGpsPath = cardioEx?.sets?.[0]?.gpsPath;
    const cardioElevationMeters = cardioEx?.sets?.[0]?.elevation;

    // Trigger success completion dashboard modal
    setShowCompletionReport({
      workoutName: activeWorkout.name,
      muscleGroup: activeWorkout.muscleGroup,
      durationSeconds,
      totalSetsCompleted,
      newPBsCount,
      totalWeightLifted,
      cardioDistanceKm,
      cardioElevationMeters,
      cardioGpsPath,
      isCardioOnly
    });
    setHasSharedToDiscord(false);

    if (haTriggerOnComplete) {
      triggerHomeAssistant('completed', {
        workoutName: activeWorkout.name,
        muscleGroup: activeWorkout.muscleGroup,
        durationSeconds,
        totalSetsCompleted,
        newPBsCount,
        totalWeightLifted
      });
    }

    // Pick new quote
    setRandomQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]);
  };

  const saveHomeAssistantSettings = (url: string, triggerStart: boolean, triggerComplete: boolean) => {
    setHomeAssistantWebhookUrl(url);
    setHaTriggerOnStart(triggerStart);
    setHaTriggerOnComplete(triggerComplete);
    localStorage.setItem('workout_ha_webhook', url);
    localStorage.setItem('workout_ha_trigger_start', String(triggerStart));
    localStorage.setItem('workout_ha_trigger_complete', String(triggerComplete));
  };

  const triggerHomeAssistant = async (event: 'started' | 'completed', extraData: any) => {
    if (!homeAssistantWebhookUrl) return;
    try {
      await fetch(homeAssistantWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          timestamp: new Date().toISOString(),
          ...extraData
        })
      });
    } catch (e) {
      console.error("Failed to trigger Home Assistant webhook:", e);
    }
  };

  const saveDiscordWebhookUrl = (url: string) => {
    setDiscordWebhookUrl(url);
    localStorage.setItem('workout_discord_webhook', url);
  };

  const saveGeminiApiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('workout_gemini_api_key', key);
  };

  const handleUpdateSteps = (steps: number) => {
    setTodaySteps(steps);
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem('workout_today_steps', String(steps));
    localStorage.setItem('workout_today_steps_date', todayStr);
  };

  const handleUpdateCalories = (active: number, total: number) => {
    setActiveCalories(active);
    setTotalCalories(total);
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem('workout_active_calories', String(active));
    localStorage.setItem('workout_active_calories_date', todayStr);
    localStorage.setItem('workout_total_calories', String(total));
    localStorage.setItem('workout_total_calories_date', todayStr);
  };

  const handleUpdateHeartRate = (avg: number, min: number, max: number) => {
    setTodayHeartRate(avg);
    setHeartRateMin(min);
    setHeartRateMax(max);
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem('workout_today_heart_rate', String(avg));
    localStorage.setItem('workout_today_heart_rate_date', todayStr);
    localStorage.setItem('workout_heart_rate_min', String(min));
    localStorage.setItem('workout_heart_rate_min_date', todayStr);
    localStorage.setItem('workout_heart_rate_max', String(max));
    localStorage.setItem('workout_heart_rate_max_date', todayStr);
  };

  const handleUpdateDistance = (dist: number) => {
    setTodayDistance(dist);
    const todayStr = new Date().toISOString().split('T')[0];
    localStorage.setItem('workout_today_distance', String(dist));
    localStorage.setItem('workout_today_distance_date', todayStr);
  };





  const handleExecuteLokiAction = (action: {
    routines?: Workout[];
    schedule?: { day: string; routineName: string }[];
    clearPlanner?: boolean;
  }) => {
    let updatedCustomWorkouts = [...customWorkouts];
    const savedRoutinesMap: Record<string, string> = {}; // maps name to generated ID

    // 1. Save new routines
    if (action.routines && action.routines.length > 0) {
      action.routines.forEach((r, idx) => {
        // Generate solid unique ID
        const generatedId = `workout_ai_${Date.now()}_${idx}`;
        const newWorkout: Workout = {
          ...r,
          id: generatedId,
          isCustom: true,
          exercises: r.exercises.map((ex, exIdx) => ({
            ...ex,
            id: `ex_ai_${Date.now()}_${idx}_${exIdx}`,
            sets: ex.sets.map((s, sIdx) => ({ ...s, setId: sIdx + 1, isCompleted: false }))
          }))
        };
        updatedCustomWorkouts.push(newWorkout);
        savedRoutinesMap[r.name] = generatedId;
      });
      saveCustomWorkouts(updatedCustomWorkouts);
    }

    // 2. Modify planner
    if (action.schedule && action.schedule.length > 0) {
      let updatedSchedule = action.clearPlanner ? [] : [...scheduledWorkouts];

      action.schedule.forEach((s, idx) => {
        // Find the routine ID (either newly saved, or existing in customWorkouts, or preset)
        let workoutId = savedRoutinesMap[s.routineName];
        if (!workoutId) {
          const found = updatedCustomWorkouts.find(w => w.name.toLowerCase() === s.routineName.toLowerCase());
          if (found) {
            workoutId = found.id;
          } else {
            // Check preset routines
            const presetFound = PREMADE_WORKOUTS.find(w => w.name.toLowerCase() === s.routineName.toLowerCase());
            if (presetFound) {
              workoutId = presetFound.id;
            }
          }
        }

        if (workoutId) {
          // If clearPlanner is false, we should avoid duplicates on the same day for this workout
          if (!action.clearPlanner) {
            updatedSchedule = updatedSchedule.filter(item => !(item.day === s.day && item.workoutId === workoutId));
          }
          // Add new scheduling
          updatedSchedule.push({
            id: `sched_ai_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
            workoutId,
            day: s.day as any
          });
        }
      });

      saveScheduledWorkouts(updatedSchedule);
    }
  };

  // Handler: Share workout summary to Discord channel via Webhook
  const handleShareToDiscord = async () => {
    if (!discordWebhookUrl || !showCompletionReport) return;
    setIsSharingToDiscord(true);
    try {
      const comparison = getWeightComparison(showCompletionReport.totalWeightLifted);
      const payload = {
        username: "Loki Gym Tracker",
        avatar_url: "https://raw.githubusercontent.com/justin/Workout-Tracker-&-Timer/main/public/pwa_icon_512_1782540582378.jpg",
        embeds: [{
          title: `⚡ Workout Session Completed: ${showCompletionReport.workoutName} ⚡`,
          color: 16770560, // #FFE600 decimal
          fields: [
            { name: "Focus Area", value: showCompletionReport.muscleGroup, inline: true },
            { name: "Total Time", value: formatTimeMinutes(showCompletionReport.durationSeconds), inline: true },
            { name: "Sets Completed", value: `${showCompletionReport.totalSetsCompleted} Sets`, inline: true },
            { name: "New Records", value: showCompletionReport.newPBsCount > 0 ? `🔥 +${showCompletionReport.newPBsCount} PBs!` : "None", inline: true },
            { name: "Volume Lifted", value: `${showCompletionReport.totalWeightLifted.toLocaleString()} lbs`, inline: true },
            { name: "Weight Equivalent", value: `Lifting a ${comparison.item}!`, inline: true }
          ],
          description: `*"${comparison.description}"*`,
          footer: { text: "Loki Gym Tracker • Keep pushing boundaries" },
          timestamp: new Date().toISOString()
        }]
      };

      const res = await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setHasSharedToDiscord(true);
      } else {
        alert("Failed to send to Discord. Please check your Webhook URL.");
      }
    } catch (e) {
      alert("Error sharing to Discord: " + e);
    } finally {
      setIsSharingToDiscord(false);
    }
  };

  // Calculate cumulative stats
  const totalCompletedWorkouts = history.length;
  const totalMinutesTrained = Math.round(
    history.reduce((sum, entry) => sum + entry.durationSeconds, 0) / 60
  );
  const totalPersonalBestsActive = personalBests.length;

  // Format time
  const formatTimeMinutes = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}m ${secs}s`;
  };

  // Horizontal Swipe Tab Navigation Handlers
  const swipeStartX = useRef<number | null>(null);
  const swipeStartY = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (activeWorkout) return;
    swipeStartX.current = e.touches[0].clientX;
    swipeStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeStartX.current === null || swipeStartY.current === null) return;
    const diffX = swipeStartX.current - e.changedTouches[0].clientX;
    const diffY = swipeStartY.current - e.changedTouches[0].clientY;
    swipeStartX.current = null;
    swipeStartY.current = null;

    if (activeTab === 'creator') return;

    if (Math.abs(diffX) > Math.abs(diffY) * 1.5 && Math.abs(diffX) > 75) {
      const baseTabs = ['planner', 'routines', 'exercises', 'profile', 'settings'];
      const index = baseTabs.indexOf(activeTab);
      if (index === -1) return;

      if (diffX > 0) {
        if (index < baseTabs.length - 1) {
          setActiveTab(baseTabs[index + 1] as any);
        }
      } else {
        if (index > 0) {
          setActiveTab(baseTabs[index - 1] as any);
        }
      }
    }
  };

  if (!userNickname) {
    return (
      <div className="min-h-screen bg-black text-[#F0F0F0] flex flex-col items-center justify-center p-6 font-mono">
        <div className="w-full max-w-sm border-2 border-brand p-8 bg-zinc-950/60 shadow-[0_0_60px_rgba(255,230,0,0.15)] space-y-6 text-center">
          <div className="w-20 h-20 rounded-none border border-brand/40 bg-black/60 flex items-center justify-center text-brand mx-auto">
            <ValknutIcon className="w-12 h-12 animate-pulse" />
          </div>
          <div className="space-y-2">
            <span className="text-[10px] tracking-widest text-zinc-600 font-extrabold uppercase block font-mono">First Time Setup</span>
            <h1 className="text-xl font-display font-black italic uppercase text-white tracking-tight leading-none">Welcome, Warrior</h1>
            <p className="text-[11px] text-zinc-400 leading-relaxed pt-2 font-mono">
              Every legend begins with a name. Enter the moniker by which the Loki AI Coach shall address you in your trials.
            </p>
          </div>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const inputVal = (e.target as any).nickname.value.trim();
              if (inputVal) {
                handleUpdateUserNickname(inputVal);
              }
            }}
            className="space-y-4"
          >
            <input 
              type="text" 
              name="nickname"
              required
              maxLength={20}
              placeholder="Your Moniker..." 
              className="w-full bg-black border border-border-dark focus:border-brand focus:outline-none rounded-none py-3 px-4 text-center text-sm text-white placeholder-zinc-700 font-bold tracking-widest uppercase transition font-mono"
            />
            <button 
              type="submit"
              className="w-full py-3 bg-brand text-black text-xs font-black uppercase tracking-widest transition rounded-none cursor-pointer border border-brand hover:bg-white hover:border-white font-mono"
            >
              Begin Journey
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div id="application-container" className="bg-dark-bg text-[#F0F0F0] flex flex-col font-sans transition-colors duration-200 min-h-screen">
      
      {/* 1. ACTIVE SESSION WINDOW OVERLAY */}
      {activeCardioSession ? (
        <ActiveCardioSession
          activity={activeCardioSession.activity}
          mode={activeCardioSession.mode}
          targetMinutes={activeCardioSession.targetMinutes}
          trackingProfile={activeCardioSession.trackingProfile}
          onFinish={handleFinishCardioSession}
          onCancel={() => setActiveCardioSession(null)}
          distanceUnit={distanceUnit}
        />
      ) : activeWorkout ? (
        <ErrorBoundary>
          <ActiveWorkoutSession 
            workout={activeWorkout}
            personalBests={personalBests}
            onUpdatePersonalBests={savePersonalBests}
            onComplete={handleWorkoutComplete}
            onCancel={() => {
              setActiveWorkout(null);
            }}
            distanceUnit={distanceUnit}
            weightUnit={weightUnit}
            customExercises={customExercises}
            favoriteExerciseIds={favoriteExerciseIds}
          />
        </ErrorBoundary>
      ) : (
        <>
          {/* Main Top Navigation Header */}
          <header className="sticky top-0 z-40 bg-dark-panel border-b border-border-dark px-4 md:px-8 pt-[calc(1rem+env(safe-area-inset-top,12px))] pb-4 min-h-[5rem] flex items-center justify-between">
            <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
              
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                  <img src={appIcon} alt="Loki Gym Logo" className="w-12 h-12 object-cover" />
                  
                  {/* Divine Sparks */}
                  <Zap className="absolute w-3 h-3 text-brand fill-brand -top-1 -right-1 z-20 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-[10px] tracking-widest text-[#666] font-extrabold uppercase font-mono leading-none mb-1">Nordic</h1>
                  <p className="text-sm font-display font-black tracking-tight uppercase leading-none text-white">Loki Gym</p>
                </div>
              </div>

              {/* Navigation Menu Links */}
              <nav className="flex items-center gap-1 border border-border-dark p-1 bg-dark-bg rounded-none max-w-[calc(100vw-130px)] sm:max-w-none overflow-x-auto">
                <button
                  id="nav-planner-tab"
                  onClick={() => setActiveTab('planner')}
                  className={`px-3 sm:px-4 py-1.5 text-xs font-mono uppercase tracking-wider font-extrabold transition-all duration-150 rounded-none cursor-pointer flex-shrink-0 ${
                    activeTab === 'planner' 
                      ? 'bg-brand text-black' 
                      : 'text-[#CCC] hover:text-[#F0F0F0] hover:bg-dark-card'
                  }`}
                >
                  Planner
                </button>
                <button
                  id="nav-routines-tab"
                  onClick={() => setActiveTab('routines')}
                  className={`px-3 sm:px-4 py-1.5 text-xs font-mono uppercase tracking-wider font-extrabold transition-all duration-150 rounded-none cursor-pointer flex-shrink-0 ${
                    activeTab === 'routines' 
                      ? 'bg-brand text-black' 
                      : 'text-[#CCC] hover:text-[#F0F0F0] hover:bg-dark-card'
                  }`}
                >
                  Routines
                </button>
                <button
                  id="nav-exercises-tab"
                  onClick={() => setActiveTab('exercises')}
                  className={`px-3 sm:px-4 py-1.5 text-xs font-mono uppercase tracking-wider font-extrabold transition-all duration-150 rounded-none cursor-pointer flex-shrink-0 ${
                    activeTab === 'exercises' 
                      ? 'bg-brand text-black' 
                      : 'text-[#CCC] hover:text-[#F0F0F0] hover:bg-dark-card'
                  }`}
                >
                  Library
                </button>

                <button
                  id="nav-profile-tab"
                  onClick={() => setActiveTab('profile')}
                  className={`px-3 sm:px-4 py-1.5 text-xs font-mono uppercase tracking-wider font-extrabold transition-all duration-150 rounded-none cursor-pointer flex-shrink-0 ${
                    activeTab === 'profile' 
                      ? 'bg-brand text-black' 
                      : 'text-[#CCC] hover:text-[#F0F0F0] hover:bg-dark-card'
                  }`}
                >
                  Profile
                </button>
                <button
                  id="nav-settings-tab"
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 sm:px-4 py-1.5 text-xs font-mono uppercase tracking-wider font-extrabold transition-all duration-150 rounded-none cursor-pointer flex-shrink-0 ${
                    activeTab === 'settings' 
                      ? 'bg-brand text-black' 
                      : 'text-[#CCC] hover:text-[#F0F0F0] hover:bg-dark-card'
                  }`}
                >
                  Settings
                </button>

              </nav>

              <div className="flex items-center gap-2">
                {/* Fast Assembly Button */}
                <button
                  id="create-new-split-btn"
                  onClick={() => setActiveTab('creator')}
                  className="hidden sm:flex items-center gap-1.5 py-1.5 px-3 bg-dark-card hover:bg-border-dark text-brand hover:text-white text-xs font-black uppercase tracking-wider rounded-none border border-border-dark transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Build Split</span>
                </button>
              </div>

            </div>
          </header>

          {/* Main Body Stage */}
          <main 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex-1 max-w-6xl w-full mx-auto px-4 md:px-8 pt-4 md:pt-8 pb-[calc(2rem+env(safe-area-inset-bottom,16px))] pl-[calc(1rem+env(safe-area-inset-left,0px))] pr-[calc(1rem+env(safe-area-inset-right,0px))] space-y-8"
          >
            
            {/* PLANNER WEEKLY SPLIT CALENDAR */}
            {activeTab === 'planner' && (
              <div className="space-y-8">
                {/* 7-Day Split Planner */}
                <WeeklyPlanner 
                  customWorkouts={[
                    ...customWorkouts,
                    ...customExercises
                      .filter(ex => ex.muscleGroup === 'Cardio')
                      .map(ex => ({
                        id: `cardio_custom_${ex.id}`,
                        name: `Cardio: ${ex.name}`,
                        description: ex.description || `Custom Cardio activity.`,
                        muscleGroup: 'Cardio' as const,
                        exercises: []
                      }))
                  ]}
                  scheduledWorkouts={scheduledWorkouts}
                  onScheduleWorkout={handleScheduleWorkout}
                  onUnscheduleWorkout={handleUnscheduleWorkout}
                  onStartWorkout={handleStartWorkout}
                  favoriteWorkoutIds={favoriteWorkoutIds}
                />
              </div>
            )}



            {/* ROUTINES AND LOGS SPLIT */}
            {activeTab === 'routines' && (
              <div className="space-y-8">
                
                {/* Header */}
                <div className="flex justify-between items-end border-b border-border-dark pb-3">
                  <div>
                    <h2 className="text-xl md:text-2xl font-display font-black italic uppercase text-white tracking-tight flex items-center gap-2.5">
                      <Dumbbell className="w-6 h-6 text-brand" /> Training Routines
                    </h2>
                    <p className="text-xs text-[#666] mt-1">Select a split to launch your active tracking session.</p>
                  </div>

                  <button
                    onClick={() => setActiveTab('creator')}
                    className="py-2 px-4 bg-brand hover:bg-white text-black text-xs font-black uppercase tracking-wider rounded-none transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>Create Custom Routine</span>
                  </button>
                </div>

                {/* Cardio Tracking Section (Totally separate collapsible category) */}
                <div className="bg-dark-panel border border-border-dark shadow-md">
                  {/* Header (Always Visible & Clickable) */}
                  <button
                    onClick={() => setIsCardioExpanded(!isCardioExpanded)}
                    className="w-full text-left p-5 md:p-6 cursor-pointer hover:bg-dark-surface/30 transition flex justify-between items-center select-none"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-brand" />
                        <h3 className="text-xs uppercase tracking-wider text-brand font-black">
                          Cardio & Outdoor Routines
                        </h3>
                      </div>
                      <p className="text-zinc-500 text-[11px] leading-relaxed">
                        {allExercises.filter(ex => ex.muscleGroup === 'Cardio').length} activities available for outdoor/indoor GPS tracking.
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="bg-dark-surface border border-border-dark text-[#666] text-[9px] font-mono font-bold px-2 py-0.5 rounded-none uppercase">
                        {allExercises.filter(ex => ex.muscleGroup === 'Cardio').length} Activities
                      </span>
                      <ChevronDown 
                        className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${
                          isCardioExpanded ? 'rotate-180 text-brand' : ''
                        }`} 
                      />
                    </div>
                  </button>

                  {/* Expandable Body */}
                  <AnimatePresence initial={false}>
                    {isCardioExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden border-t border-border-dark/40"
                      >
                        <div className="p-5 md:p-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {allExercises
                              .filter(ex => ex.muscleGroup === 'Cardio')
                              .map(ex => {
                                const isCustom = customExercises.some(ce => ce.id === ex.id);
                                return (
                                  <div 
                                    key={ex.id}
                                    className="bg-dark-panel border border-border-dark hover:border-brand/40 p-5 md:p-6 rounded-none flex flex-col justify-between shadow-sm transition group"
                                  >
                                    <div>
                                      <div className="flex justify-between items-start mb-2">
                                        <span className="bg-dark-surface border border-border-dark text-brand text-[10px] font-bold font-mono px-2 py-0.5 rounded-none uppercase tracking-wider">
                                          Cardio
                                        </span>
                                        {isCustom && (
                                          <div className="flex items-center gap-1.5">
                                            <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[8px] font-mono px-1.5 py-0.2 rounded-none font-bold uppercase">
                                              Custom
                                            </span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCustomExercise(ex.id);
                                              }}
                                              className="text-zinc-500 hover:text-rose-500 hover:bg-rose-950/20 border border-border-dark/65 hover:border-rose-500/35 p-1 rounded-none transition cursor-pointer"
                                              title="Delete Custom Exercise"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        )}
                                      </div>

                                      <h4 className="text-base font-display font-black italic uppercase text-white tracking-tight leading-tight mt-2">{ex.name}</h4>
                                      <p className="text-[#CCC] text-xs leading-relaxed mt-2">{ex.description}</p>
                                    </div>

                                    <div className="mt-6 pt-4 border-t border-border-dark flex justify-end">
                                      <button
                                        onClick={() => {
                                          setSelectedCardioActivity(ex.name);
                                          setIsCardioWizardOpen(true);
                                        }}
                                        className="py-2 px-4 bg-white hover:bg-brand text-black font-black uppercase text-xs tracking-tighter transition-colors flex items-center gap-1 rounded-none cursor-pointer"
                                      >
                                        <span>Launch Active Session</span>
                                        <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })
                            }
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Collapsible Categories Accordion */}
                <div className="space-y-4">
                  {['Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Full Body', 'Calisthenics'].map((category) => {
                    const categoryPresets = PREMADE_WORKOUTS.filter(w => w.muscleGroup === category);
                    const categoryCustom = customWorkouts.filter(w => w.muscleGroup === category);
                    const totalWorkouts = categoryPresets.length + categoryCustom.length;

                    if (totalWorkouts === 0) return null;

                    const isExpanded = expandedRoutineCategory === category;

                    return (
                      <div key={category} className="bg-dark-panel border border-border-dark shadow-md">
                        {/* Header (Always Visible & Clickable) */}
                        <button
                          onClick={() => setExpandedRoutineCategory(isExpanded ? null : category)}
                          className="w-full text-left p-5 md:p-6 cursor-pointer hover:bg-dark-surface/30 transition flex justify-between items-center select-none"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full bg-brand" />
                              <h3 className="text-xs uppercase tracking-wider text-brand font-black">
                                {category} Routines
                              </h3>
                            </div>
                            <p className="text-zinc-500 text-[11px] leading-relaxed">
                              {categoryPresets.length} preset and {categoryCustom.length} custom splits available.
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="bg-dark-surface border border-border-dark text-[#666] text-[9px] font-mono font-bold px-2 py-0.5 rounded-none uppercase">
                              {totalWorkouts} {totalWorkouts === 1 ? 'Routine' : 'Routines'}
                            </span>
                            <ChevronDown 
                              className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${
                                isExpanded ? 'rotate-180 text-brand' : ''
                              }`} 
                            />
                          </div>
                        </button>

                        {/* Expandable Body */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2, ease: 'easeInOut' }}
                              className="overflow-hidden border-t border-border-dark/40"
                            >
                              <div className="p-5 md:p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {categoryPresets.map(w => renderWorkoutCard(w, false))}
                                  {categoryCustom.map(w => renderWorkoutCard(w, true))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* LIBRARY EXERCISES VIEW */}
            {activeTab === 'exercises' && (
              <ExerciseList 
                customExercises={customExercises}
                personalBests={personalBests}
                favoriteExerciseIds={favoriteExerciseIds}
                onToggleFavorite={handleToggleFavorite}
                onAddCustomExercise={handleAddCustomExercise}
                onDeleteCustomExercise={handleDeleteCustomExercise}
                weightUnit={weightUnit}
              />
            )}

            {/* WORKOUT CREATOR ASSEMBLY SPLIT VIEW */}
            {activeTab === 'creator' && (
              <WorkoutCreator 
                customExercises={customExercises}
                onAddCustomExercise={handleAddCustomExercise}
                onSaveWorkout={handleSaveWorkout}
                onClose={() => setActiveTab('routines')}
                favoriteExerciseIds={favoriteExerciseIds}
                onToggleFavorite={handleToggleFavorite}
                weightUnit={weightUnit}
              />
            )}

            {/* PROFILE PROGRESS & WEIGHT TRACKING VIEW */}
            {activeTab === 'profile' && (
              <div className="space-y-4">
                {/* Header Overview & Quick Stats at the Top */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border-dark pb-4">
                  <div>
                    <h2 className="text-xl md:text-2xl font-display font-black italic uppercase text-white tracking-tight flex items-center gap-2.5">
                      <Scale className="w-6 h-6 text-brand" /> Profile & Workout Achievements
                    </h2>
                    <p className="text-xs text-[#666] mt-1">
                      Engineered progress streams. Document, analyze, and map your training metrics and body composition.
                    </p>
                  </div>

                  {/* Dynamic Badge status */}
                  <div className="bg-dark-surface border border-border-dark px-3 py-2 flex items-center gap-2.5 rounded-none">
                    <Award className="w-5 h-5 text-brand" />
                    <div>
                      <span className="text-[9px] font-mono text-[#666] block uppercase font-bold leading-none">Fitness Status</span>
                      <span className="text-xs font-black text-white uppercase tracking-wider block mt-1">
                        {history.length === 0 
                          ? 'Academy Student' 
                          : history.length < 5 
                            ? 'Genin' 
                            : history.length < 15 
                              ? 'Chunin' 
                              : history.length < 30 
                                ? 'Jonin' 
                                : history.length < 50 
                                  ? 'Anbu' 
                                  : history.length < 80 
                                    ? 'Sannin' 
                                    : 'Kage'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Health Connect Accordion Category */}
                <div className="border border-border-dark bg-dark-panel rounded-none overflow-hidden shadow-md">
                  <button 
                    onClick={() => setIsHealthConnectExpanded(!isHealthConnectExpanded)}
                    className="w-full flex justify-between items-center p-4 bg-dark-surface hover:bg-dark-surface/85 transition text-left select-none cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 text-brand" />
                      <span className="font-display font-black italic uppercase text-xs text-white tracking-widest">Health Analytics</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isHealthConnectExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isHealthConnectExpanded && (
                    <div className="p-4 border-t border-border-dark bg-dark-surface/10">
                      <StepsTracker 
                        todaySteps={todaySteps} 
                        onUpdateSteps={handleUpdateSteps} 
                        activeCalories={activeCalories}
                        totalCalories={totalCalories}
                        onUpdateCalories={handleUpdateCalories}
                        todayDistance={todayDistance}
                        onUpdateDistance={handleUpdateDistance}
                        todayHeartRate={todayHeartRate}
                        heartRateMin={heartRateMin}
                        heartRateMax={heartRateMax}
                        onUpdateHeartRate={handleUpdateHeartRate}
                        weightHistory={weightHistory}
                        onUpdateWeightHistory={saveWeightHistory}
                        waterLogs={waterLogs}
                        onUpdateWaterLogs={handleUpdateWaterLogs}
                        healthCards={healthCards}
                      />
                    </div>
                  )}
                </div>

                <ProfileDashboard 
                  weightHistory={weightHistory}
                  onAddWeightEntry={handleAddWeightEntry}
                  onDeleteWeightEntry={handleDeleteWeightEntry}
                  waterLogs={waterLogs}
                  onUpdateWaterLogs={handleUpdateWaterLogs}
                  history={history}
                  personalBests={personalBests}
                  distanceUnit={distanceUnit}
                  weightUnit={weightUnit}
                  onViewHistoryEntry={setViewingHistoryEntry}
                />

                {/* Personal Best Records Accordion */}
                <div className="border border-border-dark bg-dark-panel rounded-none overflow-hidden shadow-md">
                  <button 
                    onClick={() => setIsRecordsExpanded(!isRecordsExpanded)}
                    className="w-full flex justify-between items-center p-4 bg-dark-surface hover:bg-dark-surface/85 transition text-left select-none cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-brand" />
                      <span className="font-display font-black italic uppercase text-xs text-white tracking-widest">Personal Records</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isRecordsExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isRecordsExpanded && (
                    <div className="p-4 border-t border-border-dark bg-dark-surface/10">
                      <PersonalBestsDashboard 
                        personalBests={personalBests}
                        customExercises={customExercises}
                        onAddPB={handleAddManualPB}
                        onClearPB={handleClearPB}
                        hideHeader={true}
                        weightUnit={weightUnit}
                      />
                    </div>
                  )}
                </div>

                {/* Water Intake Tracker Accordion */}
                <div className="border border-border-dark bg-dark-panel rounded-none overflow-hidden shadow-md">
                  <button 
                    onClick={() => setIsWaterExpanded(!isWaterExpanded)}
                    className="w-full flex justify-between items-center p-4 bg-dark-surface hover:bg-dark-surface/85 transition text-left select-none cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Droplet className="w-4 h-4 text-brand" />
                      <span className="font-display font-black italic uppercase text-xs text-white tracking-widest">Water Intake Tracker</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isWaterExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isWaterExpanded && (
                    <div className="p-4 border-t border-border-dark bg-dark-surface/10">
                      <WaterTracker 
                        waterLogs={waterLogs}
                        onUpdateWaterLogs={handleUpdateWaterLogs}
                        mode="intake"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}



            {/* SETTINGS VIEW */}
            {activeTab === 'settings' && (
              <SettingsDashboard 
                onExportBackup={handleExportBackup}
                onImportBackup={handleImportBackup}
                discordWebhookUrl={discordWebhookUrl}
                onSaveDiscordWebhookUrl={saveDiscordWebhookUrl}
                homeAssistantWebhookUrl={homeAssistantWebhookUrl}
                haTriggerOnStart={haTriggerOnStart}
                haTriggerOnComplete={haTriggerOnComplete}
                onSaveHomeAssistantSettings={saveHomeAssistantSettings}
                currentTheme={appTheme}
                onSelectTheme={setAppTheme}
                geminiApiKey={geminiApiKey}
                onSaveGeminiApiKey={saveGeminiApiKey}
                healthCards={healthCards}
                onUpdateHealthCards={handleUpdateHealthCards}
                waterLogs={waterLogs}
                onUpdateWaterLogs={handleUpdateWaterLogs}
                userNickname={userNickname}
                onUpdateUserNickname={handleUpdateUserNickname}
                lokiAiEngine={lokiAiEngine}
                onUpdateLokiAiEngine={handleUpdateLokiAiEngine}
                distanceUnit={distanceUnit}
                onUpdateDistanceUnit={handleUpdateDistanceUnit}
                weightUnit={weightUnit}
                onUpdateWeightUnit={handleUpdateWeightUnit}
              />
            )}


          </main>

          {/* Footer Info credit */}
          <footer className="bg-dark-panel border-t border-border-dark py-8 text-center text-[10px] font-mono text-[#666] font-bold uppercase tracking-widest mt-12">
            <span>Loki Gym workout tracker &copy; 2026. Keep pushing boundaries.</span>
          </footer>
        </>
      )}

      {/* 2. SUCCESSFUL WORKOUT COMPLETION REPORT MODAL */}
      <AnimatePresence>
        {showCompletionReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCompletionReport(null)}
              className="absolute inset-0 bg-black"
            />

            {/* Dialog Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-dark-panel border border-border-dark p-6 md:p-8 rounded-none max-w-lg w-full shadow-2xl text-center overflow-hidden"
            >
              {/* Confetti Glow Background */}
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-brand/10 rounded-full blur-3xl animate-pulse"></div>

              {/* Huge animated Trophy Icon */}
              <div className="mx-auto w-16 h-16 bg-brand rounded-none flex items-center justify-center text-black shadow-lg mb-6 rotate-3 hover:rotate-12 transition duration-300">
                <TrophyIcon className="w-8 h-8 stroke-[2.5]" />
              </div>

              <span className="text-[10px] font-mono text-brand tracking-widest uppercase font-extrabold block">Workout Session Finished</span>
              <h2 className="text-2xl md:text-3xl font-display font-black italic uppercase text-white mt-2 mb-3 tracking-tight">Session Completed</h2>
              <p className="text-[#CCC] text-xs leading-relaxed max-w-sm mx-auto mb-6">
                {showCompletionReport.isCardioOnly || showCompletionReport.muscleGroup === 'Cardio'
                  ? 'You successfully executed your cardio challenge! Here is your performance overview:'
                  : 'You successfully executed your routine and logged active sets! Here is your performance overview:'}
              </p>

              {showCompletionReport.isCardioOnly || showCompletionReport.muscleGroup === 'Cardio' ? (
                <>
                  {/* Cardio Stats Card Grid */}
                  <div className="grid grid-cols-4 gap-3 bg-dark-surface border border-border-dark p-4 rounded-none text-center mb-6">
                    <div>
                      <span className="text-[9px] font-mono text-[#666] uppercase block font-bold leading-none">Total Time</span>
                      <span className="text-sm font-black font-mono text-white block mt-1 tracking-tight">
                        {formatTimeMinutes(showCompletionReport.durationSeconds)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-[#666] uppercase block font-bold leading-none">Distance</span>
                      <span className="text-sm font-black font-mono text-white block mt-1 tracking-tight">
                        {showCompletionReport.cardioDistanceKm
                          ? (distanceUnit === 'mi' ? showCompletionReport.cardioDistanceKm * 0.621371 : showCompletionReport.cardioDistanceKm).toFixed(2)
                          : '0.00'}{' '}
                        {distanceUnit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-[#666] uppercase block font-bold leading-none">Avg Pace</span>
                      <span className="text-sm font-black font-mono text-white block mt-1 tracking-tight">
                        {(() => {
                          const totalMins = showCompletionReport.durationSeconds / 60;
                          const targetDistance = showCompletionReport.cardioDistanceKm
                            ? (distanceUnit === 'mi' ? showCompletionReport.cardioDistanceKm * 0.621371 : showCompletionReport.cardioDistanceKm)
                            : 0;
                          const paceMinPerUnit = targetDistance > 0 ? totalMins / targetDistance : 0;
                          if (paceMinPerUnit > 0) {
                            const pMins = Math.floor(paceMinPerUnit);
                            const pSecs = Math.round((paceMinPerUnit - pMins) * 60);
                            return `${pMins}:${pSecs.toString().padStart(2, '0')}`;
                          }
                          return '--:--';
                        })()}{' '}
                        <span className="text-[9px] text-[#888]">/{distanceUnit}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-[#666] uppercase block font-bold leading-none">Elevation</span>
                      <span className="text-sm font-black font-mono text-brand block mt-1 tracking-tight font-extrabold">
                        {showCompletionReport.cardioElevationMeters || 0} m
                      </span>
                    </div>
                  </div>

                  {/* Leaflet Route Map */}
                  {showCompletionReport.cardioGpsPath && showCompletionReport.cardioGpsPath.length > 0 && (
                    <div className="mb-6 h-[200px] border border-border-dark relative overflow-hidden bg-zinc-950">
                      <LeafletMap points={showCompletionReport.cardioGpsPath} />
                      <button
                        type="button"
                        onClick={() => setFullscreenMapPoints(showCompletionReport.cardioGpsPath)}
                        className="absolute top-2 right-2 z-20 p-2 bg-black/80 hover:bg-brand border border-border-dark hover:border-brand text-white hover:text-black transition cursor-pointer flex items-center justify-center"
                        title="Expand to Fullscreen"
                      >
                        <Maximize className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Stats Card Grid */}
                  <div className="grid grid-cols-3 gap-3 bg-dark-surface border border-border-dark p-4 rounded-none text-center mb-6">
                    <div>
                      <span className="text-[9px] font-mono text-[#666] uppercase block font-bold leading-none">Total Time</span>
                      <span className="text-sm font-black font-mono text-white block mt-1 tracking-tight">
                        {formatTimeMinutes(showCompletionReport.durationSeconds)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-[#666] uppercase block font-bold leading-none">Sets Lifted</span>
                      <span className="text-sm font-black font-mono text-white block mt-1 tracking-tight">
                        {showCompletionReport.totalSetsCompleted} Sets
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-[#666] uppercase block font-bold leading-none">PBs Broken</span>
                      <span className="text-sm font-black font-mono text-brand block mt-1 tracking-tight font-extrabold">
                        {showCompletionReport.newPBsCount > 0 ? `+${showCompletionReport.newPBsCount} records` : '0 records'}
                      </span>
                    </div>
                  </div>

                  {/* Comparative Weight Block */}
                  <div className="mb-6 p-4 bg-dark-surface border border-border-dark text-left rounded-none">
                    <span className="text-[9px] font-mono text-[#666] uppercase block font-bold tracking-wider mb-2">Total Weight Volume Lifted</span>
                    <div className="flex items-center gap-3">
                      <div className="text-3xl flex-shrink-0 bg-dark-panel p-2 border border-border-dark h-12 w-12 flex items-center justify-center">
                        {getWeightComparison(showCompletionReport.totalWeightLifted, weightUnit).emoji}
                      </div>
                      <div>
                        <div className="text-white font-mono text-base font-black">
                          {(() => {
                            const rawWeight = showCompletionReport.totalWeightLifted;
                            const displayW = weightUnit === 'kg' ? Math.round(rawWeight * 0.45359237) : rawWeight;
                            return `${displayW.toLocaleString()} ${weightUnit}`;
                          })()}
                        </div>
                        <div className="text-[#CCC] text-[11px] leading-snug mt-1 font-sans">
                          You lifted the equivalent of <span className="text-brand font-bold">{getWeightComparison(showCompletionReport.totalWeightLifted, weightUnit).item}</span>!
                        </div>
                      </div>
                    </div>
                    <p className="text-[#888] text-[10px] leading-relaxed mt-2.5 pt-2 border-t border-border-dark/40 italic font-medium">
                      {getWeightComparison(showCompletionReport.totalWeightLifted).description}
                    </p>
                  </div>

                  {showCompletionReport.newPBsCount > 0 && (
                    <div className="mb-6 py-2 px-4 bg-brand/10 border border-brand/20 rounded-none inline-flex items-center gap-1 text-brand text-[10px] font-bold font-mono uppercase tracking-wider animate-pulse">
                      <Award className="w-4 h-4 fill-brand/10" />
                      <span>You set {showCompletionReport.newPBsCount} new high-score records!</span>
                    </div>
                  )}
                </>
              )}

              {/* Discord Share Button */}
              {discordWebhookUrl && (
                <button
                  onClick={handleShareToDiscord}
                  disabled={isSharingToDiscord || hasSharedToDiscord}
                  className={`w-full py-3.5 mb-3 text-xs font-mono font-black uppercase tracking-wider transition rounded-none cursor-pointer flex items-center justify-center gap-2 border ${
                    hasSharedToDiscord
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400 cursor-default'
                      : 'bg-[#5865F2] hover:bg-white text-white hover:text-black border-transparent'
                  }`}
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 127.14 96.36">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,52.88,6.83,77.19,77.19,0,0,0,49.58,0,105.15,105.15,0,0,0,19.14,8.07C3,32.48-1.45,56.29.33,79.73A106.88,106.88,0,0,0,32.22,96.36a77.7,77.7,0,0,0,6.72-10.93,68.6,68.6,0,0,1-10.64-5.12c.91-.67,1.81-1.37,2.65-2.1a76.22,76.22,0,0,0,72.4,0c.84.73,1.74,1.43,2.65,2.1a68.6,68.6,0,0,1-10.64,5.12,77.7,77.7,0,0,0,6.72,10.93,106.88,106.88,0,0,0,31.9-16.63C128.59,56.29,124.14,32.48,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.9,46,53.72,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.14,46,96,53,91,65.69,84.69,65.69Z"/>
                  </svg>
                  <span>
                    {isSharingToDiscord 
                      ? 'Sharing to Discord...' 
                      : hasSharedToDiscord 
                        ? 'Shared to Discord! ✓' 
                        : 'Share to Discord'}
                  </span>
                </button>
              )}

              {/* Back to workout dashboard */}
              <button
                onClick={() => setShowCompletionReport(null)}
                className="w-full py-4 bg-brand hover:bg-white text-black font-black uppercase text-xs tracking-tighter transition-colors rounded-none cursor-pointer"
              >
                <span>Awesome, Back to Hub</span>
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. WORKOUT HISTORY ENTRY DETAIL & EDIT OVERLAY SCREEN */}
      <AnimatePresence>
        {viewingHistoryEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setViewingHistoryEntry(null);
                setIsEditingHistory(false);
              }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />

            {/* Viewport content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 20 }}
              className="relative bg-dark-panel border border-border-dark p-5 md:p-7 rounded-none max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col z-20 font-sans text-xs text-white"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-border-dark pb-4 mb-4">
                <div>
                  <span className="text-[8px] font-mono text-zinc-500 tracking-widest uppercase font-extrabold block">
                    {isEditingHistory ? "Editing Record of Valor" : "Record of Valor Details"}
                  </span>
                  <h3 className="text-sm font-display font-black italic uppercase text-brand mt-1 tracking-wide">
                    {viewingHistoryEntry.workoutName}
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400 block mt-0.5">
                    Logged on {viewingHistoryEntry.date}
                  </span>
                </div>
                <button 
                  onClick={() => {
                    setViewingHistoryEntry(null);
                    setIsEditingHistory(false);
                  }}
                  className="text-[#666] hover:text-white transition p-1 hover:bg-dark-surface"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* READ-ONLY DETAIL MODE */}
              {!isEditingHistory ? (
                <div className="space-y-6 flex-1">
                  {/* Summary grid */}
                  {viewingHistoryEntry.muscleGroup === 'Cardio' ? (
                    <div className="space-y-4 w-full">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-dark-surface/50 border border-border-dark p-3.5 text-center">
                        <div>
                          <span className="text-[8px] font-mono text-[#666] uppercase block">Focus Area</span>
                          <span className="text-[10px] uppercase font-bold text-brand block mt-0.5">Cardio</span>
                        </div>
                        <div>
                          <span className="text-[8px] font-mono text-[#666] uppercase block">Duration</span>
                          <span className="text-[10px] font-mono font-bold text-white block mt-0.5">
                            {Math.floor(viewingHistoryEntry.durationSeconds / 60)}m {viewingHistoryEntry.durationSeconds % 60}s
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-mono text-[#666] uppercase block">Distance</span>
                          <span className="text-[10px] font-mono font-bold text-white block mt-0.5">
                            {(() => {
                              const rawDist = viewingHistoryEntry.exercises?.[0]?.sets?.[0]?.distance || 0;
                              const displayDist = distanceUnit === 'mi' ? rawDist * 0.621371 : rawDist;
                              return `${displayDist.toFixed(2)} ${distanceUnit}`;
                            })()}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-mono text-[#666] uppercase block">Elevation Gain</span>
                          <span className="text-[10px] font-mono font-bold text-white block mt-0.5">
                            +{viewingHistoryEntry.exercises?.[0]?.sets?.[0]?.elevation || 0} m
                          </span>
                        </div>
                      </div>

                      {/* Map Overlay if path is recorded */}
                      {viewingHistoryEntry.exercises?.[0]?.sets?.[0]?.gpsPath && 
                       viewingHistoryEntry.exercises[0].sets[0].gpsPath.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-extrabold block">
                            Tracked Route Path Map
                          </span>
                          <div className="h-[200px] border border-border-dark p-0.5 bg-zinc-950 relative group">
                            <LeafletMap points={viewingHistoryEntry.exercises[0].sets[0].gpsPath} />
                            <button
                              type="button"
                              onClick={() => setFullscreenMapPoints(viewingHistoryEntry.exercises[0].sets[0].gpsPath!)}
                              className="absolute top-2.5 right-2.5 z-20 p-2 bg-black/80 hover:bg-brand border border-border-dark hover:border-brand text-white hover:text-black transition cursor-pointer flex items-center justify-center"
                              title="Expand to Fullscreen"
                            >
                              <Maximize className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-dark-surface/50 border border-border-dark p-3.5">
                      <div>
                        <span className="text-[8px] font-mono text-[#666] uppercase block">Focus Area</span>
                        <span className="text-[10px] uppercase font-bold text-white block mt-0.5">{viewingHistoryEntry.muscleGroup}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-[#666] uppercase block">Duration</span>
                        <span className="text-[10px] font-mono font-bold text-white block mt-0.5">{Math.round(viewingHistoryEntry.durationSeconds / 60)} min</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-[#666] uppercase block">Sets Completed</span>
                        <span className="text-[10px] font-mono font-bold text-white block mt-0.5">{viewingHistoryEntry.totalSetsCompleted}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-mono text-[#666] uppercase block">Weight Moved</span>
                        <span className="text-[10px] font-mono font-bold text-[#FFE600] block mt-0.5">
                          {(() => {
                            const rawWeight = viewingHistoryEntry.totalWeightMoved || 0;
                            const displayWeight = weightUnit === 'kg' ? Math.round(rawWeight * 0.45359237) : rawWeight;
                            return `${displayWeight.toLocaleString()} ${weightUnit}`;
                          })()}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Exercises Details list (Only for standard workouts) */}
                  {viewingHistoryEntry.muscleGroup !== 'Cardio' && (
                    <div className="space-y-3">
                      <h4 className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-extrabold border-b border-border-dark/60 pb-1.5 flex items-center gap-1.5">
                        <Dumbbell className="w-3 h-3 text-brand" />
                        <span>Exercises & Sets Completed</span>
                      </h4>

                      {(!viewingHistoryEntry.exercises || viewingHistoryEntry.exercises.length === 0) ? (
                        <div className="text-center py-6 text-zinc-500 font-mono text-[10px] bg-dark-surface/30 border border-border-dark/30">
                          No exercise detail records found for this legacy log.
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                          {viewingHistoryEntry.exercises.map((ex, exIdx) => (
                            <div key={ex.id || exIdx} className="bg-dark-surface/30 border border-border-dark/60 p-3">
                              <div className="flex justify-between items-center mb-2.5">
                                <span className="font-bold text-white uppercase text-[11px] tracking-wide">{ex.name}</span>
                                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider bg-dark-panel border border-border-dark px-1.5 py-0.5">
                                  {ex.muscleGroup}
                                </span>
                              </div>

                              {/* Sets inside the exercise */}
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {ex.sets.map((set, setIdx) => (
                                  <div key={set.setId || setIdx} className="bg-dark-panel border border-border-dark p-2 flex items-center justify-between gap-2">
                                    <span className="text-[9px] font-mono text-zinc-500">Set {setIdx + 1}</span>
                                    <span className="font-mono text-[10px] font-bold text-white">
                                      {ex.type === 'time' 
                                        ? `${set.duration || 0}s` 
                                        : `${weightUnit === 'kg' ? Math.round((set.weight || 0) * 0.45359237) : (set.weight || 0)} ${weightUnit} x ${set.reps || 0}`}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions panel */}
                  <div className="flex gap-3 border-t border-border-dark pt-5 mt-4">
                    <button 
                      onClick={() => {
                        setDeleteHistoryEntryId(viewingHistoryEntry.id);
                        setViewingHistoryEntry(null);
                      }}
                      className="flex-1 py-3 border border-red-950 text-zinc-500 hover:text-red-500 hover:bg-red-950/20 text-[9px] font-mono font-black uppercase tracking-widest transition cursor-pointer"
                    >
                      Strike Down Log
                    </button>
                    <button 
                      onClick={() => setIsEditingHistory(true)}
                      className="flex-1 py-3 bg-brand text-black hover:bg-white text-[9px] font-mono font-black uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit Log Details</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* EDIT MODE */
                <div className="space-y-5 flex-1">
                  {/* Edit Metadata details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-dark-surface/40 border border-border-dark p-3.5">
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-[#666] mb-1 font-bold">Routine Name</label>
                      <input 
                        type="text"
                        value={viewingHistoryEntry.workoutName}
                        onChange={(e) => setViewingHistoryEntry({ ...viewingHistoryEntry, workoutName: e.target.value })}
                        className="w-full bg-dark-surface border border-border-dark text-white py-1.5 px-2.5 text-xs focus:border-brand focus:outline-none uppercase font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-[#666] mb-1 font-bold">Date</label>
                      <input 
                        type="date"
                        value={viewingHistoryEntry.date}
                        onChange={(e) => setViewingHistoryEntry({ ...viewingHistoryEntry, date: e.target.value })}
                        className="w-full bg-dark-surface border border-border-dark text-white py-1.5 px-2.5 text-xs focus:border-brand focus:outline-none font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-mono uppercase text-[#666] mb-1 font-bold">Duration (Min)</label>
                      <input 
                        type="number"
                        min="1"
                        value={Math.round(viewingHistoryEntry.durationSeconds / 60)}
                        onChange={(e) => setViewingHistoryEntry({ ...viewingHistoryEntry, durationSeconds: (parseInt(e.target.value) || 0) * 60 })}
                        className="w-full bg-dark-surface border border-border-dark text-white py-1.5 px-2.5 text-xs focus:border-brand focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  {/* Exercises Details list editor */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-border-dark/60 pb-1.5">
                      <h4 className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                        <Dumbbell className="w-3 h-3 text-brand" />
                        <span>Edit Exercises & Sets</span>
                      </h4>

                      {/* Dropdown to add new exercises */}
                      <select
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const selectedId = e.target.value;
                          const allAvail = [...INITIAL_EXERCISES, ...customExercises];
                          const found = allAvail.find(ex => ex.id === selectedId);
                          if (found) {
                            const newEx: WorkoutExercise = {
                              id: `ex_${Date.now()}`,
                              exerciseId: found.id,
                              name: found.name,
                              muscleGroup: found.muscleGroup,
                              type: found.type,
                              image: found.image,
                              instructions: found.instructions,
                              restDuration: found.defaultRest || 60,
                              sets: [{ setId: 1, reps: found.defaultReps || 10, weight: found.defaultWeight || 20, isCompleted: true }]
                            };
                            const currentExercises = viewingHistoryEntry.exercises || [];
                            setViewingHistoryEntry({
                              ...viewingHistoryEntry,
                              exercises: [...currentExercises, newEx]
                            });
                          }
                          e.target.value = ""; // Reset dropdown selection
                        }}
                        className="bg-dark-surface border border-border-dark/80 text-brand py-1 px-2 text-[9px] focus:outline-none rounded-none uppercase font-mono font-bold cursor-pointer"
                      >
                        <option value="">+ Add Exercise...</option>
                        {/* Premade Exercises */}
                        <optgroup label="Premade Exercises">
                          {INITIAL_EXERCISES.map(ex => (
                            <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscleGroup})</option>
                          ))}
                        </optgroup>
                        {/* Custom Exercises */}
                        {customExercises.length > 0 && (
                          <optgroup label="Custom Exercises">
                            {customExercises.map(ex => (
                              <option key={ex.id} value={ex.id}>{ex.name}</option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                    </div>

                    {(!viewingHistoryEntry.exercises || viewingHistoryEntry.exercises.length === 0) ? (
                      <div className="text-center py-6 text-zinc-500 font-mono text-[10px] bg-dark-surface/30 border border-border-dark/30">
                        No exercises logged. Choose an exercise from the dropdown above to add one.
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[42vh] overflow-y-auto pr-1">
                        {viewingHistoryEntry.exercises.map((ex, exIdx) => (
                          <div key={ex.id || exIdx} className="bg-dark-surface/30 border border-border-dark/60 p-3 relative">
                            {/* Remove Exercise Button */}
                            <button
                              onClick={() => {
                                const newExercises = viewingHistoryEntry.exercises?.filter((_, idx) => idx !== exIdx) || [];
                                setViewingHistoryEntry({
                                  ...viewingHistoryEntry,
                                  exercises: newExercises
                                });
                              }}
                              className="absolute top-2.5 right-2.5 text-zinc-500 hover:text-red-500 p-1 hover:bg-dark-surface transition"
                              title="Delete Exercise"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="mb-3 pr-8">
                              <span className="font-bold text-white uppercase text-[10px] tracking-wide block">{ex.name}</span>
                              <span className="text-[7px] font-mono text-brand uppercase tracking-widest mt-0.5 block">
                                {ex.muscleGroup}
                              </span>
                            </div>

                            {/* Sets Editor */}
                            <div className="space-y-2">
                              {ex.sets.map((set, setIdx) => (
                                <div key={set.setId || setIdx} className="grid grid-cols-12 gap-2 items-center bg-dark-panel/60 border border-border-dark p-2">
                                  <span className="col-span-2 text-[9px] font-mono text-zinc-500">Set {setIdx + 1}</span>
                                  
                                  {ex.type === 'time' ? (
                                    /* Time-based set editor */
                                    <div className="col-span-8 flex items-center gap-1.5">
                                      <input 
                                        type="number"
                                        min="1"
                                        placeholder="Duration"
                                        value={set.duration || 0}
                                        onChange={(e) => {
                                          const val = parseInt(e.target.value) || 0;
                                          const newExs = [...(viewingHistoryEntry.exercises || [])];
                                          newExs[exIdx].sets[setIdx].duration = val;
                                          setViewingHistoryEntry({ ...viewingHistoryEntry, exercises: newExs });
                                        }}
                                        className="w-16 bg-dark-surface border border-border-dark text-white py-0.5 px-1.5 text-[10px] text-center focus:border-brand focus:outline-none font-mono"
                                      />
                                      <span className="text-[9px] font-mono text-zinc-500">seconds</span>
                                    </div>
                                  ) : (
                                    /* Strength set editor */
                                    <div className="col-span-8 flex items-center gap-2">
                                      <div className="flex items-center gap-1">
                                        <input 
                                          type="number"
                                          min="0"
                                          placeholder="Weight"
                                          value={set.weight || 0}
                                          onChange={(e) => {
                                            const val = parseFloat(e.target.value) || 0;
                                            const newExs = [...(viewingHistoryEntry.exercises || [])];
                                            newExs[exIdx].sets[setIdx].weight = val;
                                            setViewingHistoryEntry({ ...viewingHistoryEntry, exercises: newExs });
                                          }}
                                          className="w-14 bg-dark-surface border border-border-dark text-white py-0.5 px-1.5 text-[10px] text-center focus:border-brand focus:outline-none font-mono"
                                        />
                                        <span className="text-[9px] font-mono text-zinc-600">lbs</span>
                                      </div>
                                      
                                      <span className="text-zinc-600 font-mono text-[9px]">x</span>
                                      
                                      <div className="flex items-center gap-1">
                                        <input 
                                          type="number"
                                          min="0"
                                          placeholder="Reps"
                                          value={set.reps || 0}
                                          onChange={(e) => {
                                            const val = parseInt(e.target.value) || 0;
                                            const newExs = [...(viewingHistoryEntry.exercises || [])];
                                            newExs[exIdx].sets[setIdx].reps = val;
                                            setViewingHistoryEntry({ ...viewingHistoryEntry, exercises: newExs });
                                          }}
                                          className="w-12 bg-dark-surface border border-border-dark text-white py-0.5 px-1.5 text-[10px] text-center focus:border-brand focus:outline-none font-mono"
                                        />
                                        <span className="text-[9px] font-mono text-zinc-600">reps</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Delete Set Button */}
                                  <div className="col-span-2 text-right">
                                    <button
                                      onClick={() => {
                                        const newExs = [...(viewingHistoryEntry.exercises || [])];
                                        const newSets = newExs[exIdx].sets.filter((_, idx) => idx !== setIdx);
                                        // Update setId numbers
                                        newExs[exIdx].sets = newSets.map((s, idx) => ({ ...s, setId: idx + 1 }));
                                        setViewingHistoryEntry({ ...viewingHistoryEntry, exercises: newExs });
                                      }}
                                      className="text-zinc-600 hover:text-red-500 p-1 hover:bg-dark-surface transition"
                                      title="Delete Set"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              ))}

                              {/* Add Set Button */}
                              <div className="pt-1">
                                <button
                                  onClick={() => {
                                    const newExs = [...(viewingHistoryEntry.exercises || [])];
                                    const currentSets = newExs[exIdx].sets;
                                    const lastSet = currentSets[currentSets.length - 1];
                                    const newSet: SetRecord = {
                                      setId: currentSets.length + 1,
                                      reps: lastSet?.reps || 10,
                                      weight: lastSet?.weight || 20,
                                      duration: lastSet?.duration || 45,
                                      isCompleted: true
                                    };
                                    newExs[exIdx].sets = [...currentSets, newSet];
                                    setViewingHistoryEntry({ ...viewingHistoryEntry, exercises: newExs });
                                  }}
                                  className="text-[8px] font-mono uppercase text-brand hover:text-white font-bold tracking-wider cursor-pointer select-none"
                                >
                                  + Add Set
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions panel */}
                  <div className="flex gap-3 border-t border-border-dark pt-5 mt-4">
                    <button 
                      onClick={() => setIsEditingHistory(false)}
                      className="flex-1 py-3 border border-border-dark text-[#888] hover:text-white uppercase tracking-widest text-[9px] font-mono font-black transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => handleUpdateHistoryEntry(viewingHistoryEntry)}
                      className="flex-1 py-3 bg-brand text-black hover:bg-white text-[9px] font-mono font-black uppercase tracking-widest transition cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CUSTOM NORSE HISTORY DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteHistoryEntryId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteHistoryEntryId(null)}
              className="absolute inset-0 bg-black"
            />

            {/* Dialog Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-dark-panel border border-red-950 p-6 md:p-8 rounded-none max-w-sm w-full shadow-2xl text-center overflow-hidden z-20"
            >
              {/* Alert Indicator */}
              <div className="mx-auto w-12 h-12 bg-red-950/40 border border-red-800 rounded-none flex items-center justify-center text-red-500 mb-4 animate-pulse">
                <Trash2 className="w-5 h-5" />
              </div>

              <span className="text-[9px] font-mono text-red-500 tracking-widest uppercase font-extrabold block">Strike Down Feat</span>
              <h3 className="text-base font-display font-black italic uppercase text-white mt-2 mb-3 leading-tight">
                Do you wish to strike down this feat of strength from the records?
              </h3>
              <p className="text-zinc-500 text-[10px] leading-relaxed max-w-xs mx-auto mb-6">
                This workout session will be deleted from your logs permanently.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteHistoryEntryId(null)}
                  className="flex-1 border border-border-dark text-[#888] hover:text-white uppercase tracking-widest text-[9px] font-mono font-black py-3 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    const newHistory = history.filter(h => h.id !== deleteHistoryEntryId);
                    saveHistory(newHistory);
                    setDeleteHistoryEntryId(null);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white uppercase tracking-widest text-[9px] font-mono font-black py-3 transition cursor-pointer"
                >
                  Strike Down
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING LOKI AI & HEATMAP OVERLAYS & CONTROLS */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
        
        {/* Popout Windows Container (Absolute Positioning to float above buttons stack) */}
        <div className="absolute bottom-[116px] right-0 z-50 pointer-events-auto flex flex-col items-end">
          <AnimatePresence>
            {isLokiCoachOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="w-[calc(100vw-32px)] sm:w-[360px] h-[600px] max-h-[75vh] flex flex-col shadow-[0_12px_40px_rgba(0,0,0,0.8)] border border-brand bg-black/15 backdrop-blur-xl rounded-none relative overflow-hidden"
                style={{
                  boxShadow: '0 0 40px rgba(255,230,0,0.15)'
                }}
              >
                <LokiAICoach 
                  history={history}
                  personalBests={personalBests}
                  weightHistory={weightHistory}
                  waterLogs={waterLogs}
                  customWorkouts={customWorkouts}
                  onExecuteLokiAction={handleExecuteLokiAction}
                  geminiApiKey={geminiApiKey}
                  onGoToSettings={() => {
                    setActiveTab('settings');
                    setIsLokiCoachOpen(false);
                  }}
                  todaySteps={todaySteps}
                  activeCalories={activeCalories}
                  totalCalories={totalCalories}
                  onClose={() => setIsLokiCoachOpen(false)}
                  userNickname={userNickname}
                  lokiAiEngine={lokiAiEngine}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isHeatmapOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 250 }}
                className="w-[calc(100vw-32px)] sm:w-[360px] shadow-[0_12px_40px_rgba(0,0,0,0.8)] rounded-none overflow-hidden relative"
                onTouchStart={(e) => e.stopPropagation()}
                onTouchEnd={(e) => e.stopPropagation()}
              >
                <TitanHeatmap 
                  history={history}
                  userNickname={userNickname}
                  onClose={() => setIsHeatmapOpen(false)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Heatmap Toggle Button (Top in stack) */}
        <button
          type="button"
          onClick={() => {
            setIsHeatmapOpen(!isHeatmapOpen);
            if (!isHeatmapOpen) setIsLokiCoachOpen(false);
          }}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border-2 transition duration-200 cursor-pointer pointer-events-auto ${
            isHeatmapOpen
              ? 'bg-brand border-black text-black scale-110 shadow-brand/20'
              : 'bg-black border-brand text-brand hover:scale-105 hover:bg-zinc-950'
          }`}
          style={{
            boxShadow: isHeatmapOpen ? '0 0 25px rgba(255,230,0,0.4)' : '0 6px 20px rgba(0,0,0,0.6)'
          }}
          title={isHeatmapOpen ? "Close Heatmap" : "View Muscle Heatmap"}
        >
          {isHeatmapOpen ? (
            <span className="text-xl font-bold font-sans">✕</span>
          ) : (
            <img src={heatmapLogo} alt="Heatmap Logo" className="w-8.5 h-8.5 rounded-full object-cover animate-pulse" style={{ filter: 'url(#theme-tint)' }} />
          )}
        </button>

        {/* Loki AI Coach Toggle Button (Bottom in stack) */}
        <button
          type="button"
          onClick={() => {
            setIsLokiCoachOpen(!isLokiCoachOpen);
            if (!isLokiCoachOpen) setIsHeatmapOpen(false);
          }}
          className={`w-12 h-12 rounded-full flex items-center justify-center shadow-2xl border-2 transition duration-200 cursor-pointer pointer-events-auto ${
            isLokiCoachOpen
              ? 'bg-brand border-black text-black scale-110 shadow-brand/20'
              : 'bg-black border-brand text-brand hover:scale-105 hover:bg-zinc-950'
          }`}
          style={{
            boxShadow: isLokiCoachOpen ? '0 0 25px rgba(255,230,0,0.4)' : '0 6px 20px rgba(0,0,0,0.6)'
          }}
          title={isLokiCoachOpen ? "Close AI Coach" : "Ask Loki AI Coach"}
        >
          {isLokiCoachOpen ? (
            <span className="text-xl font-bold font-sans">✕</span>
          ) : (
            <ValknutIcon className="w-5.5 h-5.5 animate-pulse" />
          )}
        </button>
      </div>

      {/* Exercise Detail Popup Modal */}
      <AnimatePresence>
        {selectedDetailExercise && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedDetailExercise(null)}
              className="absolute inset-0 bg-black/85 backdrop-blur-sm"
            />

            {/* Modal Content */}
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-dark-panel border border-border-dark p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-y-auto z-10"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedDetailExercise(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white border border-border-dark/60 hover:border-white/30 p-1.5 rounded-none transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header */}
              <div className="mb-4">
                <span className="bg-dark-surface border border-border-dark text-brand text-[10px] font-bold font-mono px-2 py-0.5 rounded-none uppercase tracking-wider">
                  {selectedDetailExercise.muscleGroup}
                </span>
                <h3 className="text-xl md:text-2xl font-display font-black italic uppercase text-white tracking-tight leading-tight mt-2.5">
                  {selectedDetailExercise.name}
                </h3>
              </div>

              {/* Category Image */}
              {selectedDetailExercise.image && (
                <div className="w-full h-44 overflow-hidden border border-border-dark mb-4 bg-zinc-950 flex items-center justify-center">
                  <img 
                    src={selectedDetailExercise.image} 
                    alt={selectedDetailExercise.name} 
                    className="w-full h-full object-cover opacity-80"
                  />
                </div>
              )}

              {/* Meta Info Grid */}
              <div className="grid grid-cols-3 gap-2.5 mb-6 text-center">
                <div className="bg-dark-surface border border-border-dark p-3">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Volume</div>
                  <div className="text-sm font-display font-black uppercase text-brand mt-1">
                    {selectedDetailExercise.sets.length} Sets
                  </div>
                </div>
                <div className="bg-dark-surface border border-border-dark p-3">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Target</div>
                  <div className="text-sm font-display font-black uppercase text-white mt-1">
                    {selectedDetailExercise.type === 'time' 
                      ? `${selectedDetailExercise.defaultDuration || 60}s`
                      : `${selectedDetailExercise.sets[0]?.reps || 10} Reps`
                    }
                  </div>
                </div>
                <div className="bg-dark-surface border border-border-dark p-3">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase font-bold">Rest</div>
                  <div className="text-sm font-display font-black uppercase text-white mt-1">
                    {selectedDetailExercise.restDuration}s
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedDetailExercise.instructions && selectedDetailExercise.instructions.length > 0 ? (
                <div className="space-y-4">
                  <div>
                    <h5 className="text-[10px] tracking-widest text-[#666] font-extrabold uppercase font-mono mb-2">Instructions</h5>
                    <ol className="list-decimal pl-4 space-y-2 text-zinc-300 text-xs font-mono leading-relaxed">
                      {selectedDetailExercise.instructions.map((step, sIdx) => (
                        <li key={sIdx} className="pl-1">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-zinc-500 font-mono italic">No instructions available for this exercise.</div>
              )}

              {/* Bottom Action */}
              <div className="mt-8 pt-4 border-t border-border-dark flex justify-end">
                <button
                  onClick={() => setSelectedDetailExercise(null)}
                  className="py-2 px-6 bg-brand hover:bg-white text-black font-black uppercase text-xs tracking-wider transition-colors rounded-none cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cardio Setup Wizard */}
      <CardioWizard
        isOpen={isCardioWizardOpen}
        selectedActivity={selectedCardioActivity}
        onClose={() => {
          setIsCardioWizardOpen(false);
          setSelectedCardioActivity(null);
        }}
        onStart={(activity, mode, targetMinutes) => {
          const customEx = customExercises.find(ex => ex.name === activity && ex.muscleGroup === 'Cardio');
          const trackingProfile = customEx?.cardioType || (activity as any);
          setActiveCardioSession({ activity, mode, targetMinutes, trackingProfile });
        }}
      />

      {/* Fullscreen Map Overlay Modal */}
      <AnimatePresence>
        {fullscreenMapPoints && (
          <div className="fixed inset-0 z-50 bg-black flex flex-col">
            <div className="flex-1 w-full h-full relative">
              <LeafletMap points={fullscreenMapPoints} />
              
              <button
                type="button"
                onClick={() => setFullscreenMapPoints(null)}
                className="absolute top-4 right-4 z-[9999] p-3 bg-black/80 hover:bg-brand border border-border-dark hover:border-brand text-white hover:text-black transition cursor-pointer flex items-center justify-center shadow-2xl"
                title="Exit Fullscreen Map"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>

              <div className="absolute bottom-4 left-4 z-20 bg-black/80 border border-border-dark py-2 px-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">
                  Fullscreen Topo Route View
                </span>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* GitHub App Update Modal */}
      <AppUpdateModal
        isOpen={isUpdateModalOpen}
        updateInfo={availableUpdate}
        onClose={() => setIsUpdateModalOpen(false)}
      />

      {/* Global SVG Theme Tint Filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }}>
        <defs>
          <filter id="theme-tint" colorInterpolationFilters="sRGB">
            <feFlood floodColor="var(--color-brand)" result="flood" />
            <feBlend mode="multiply" in="flood" in2="SourceGraphic" result="blend" />
            <feComposite in="blend" in2="SourceGraphic" operator="in" />
          </filter>
        </defs>
      </svg>
    </div>
  );
}
