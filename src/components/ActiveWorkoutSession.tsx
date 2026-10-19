import React, { useState, useEffect, useRef } from 'react';
import { Workout, WorkoutExercise, SetRecord, PersonalBest, Exercise } from '../types';
import { INITIAL_EXERCISES } from '../data';
import ActiveCardioSession, { LeafletMap } from './ActiveCardioSession';
import { 
  Play, Pause, RotateCcw, Check, ChevronRight, ChevronLeft, 
  Flame, HelpCircle, X, Plus, Minus, Trophy, Calendar, Clock,
  Sparkles, RotateCw, Volume2, ShieldAlert, Dumbbell, CheckCircle2, Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Haptics, NotificationType } from '@capacitor/haptics';

interface ActiveWorkoutSessionProps {
  workout: Workout;
  personalBests: PersonalBest[];
  onUpdatePersonalBests: (newPBs: PersonalBest[]) => void;
  onComplete: (
    durationSeconds: number,
    totalSetsCompleted: number,
    newPBsCount: number,
    totalWeightLifted: number,
    finalExercises?: WorkoutExercise[]
  ) => void;
  onCancel: () => void;
  distanceUnit?: 'km' | 'mi';
  weightUnit?: 'lbs' | 'kg';
  customExercises: Exercise[];
  favoriteExerciseIds?: string[];
}

// A simple beep sound using browser native Web Audio API - configured as a slightly longer, pleasant warning chime
const playBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now); // E5, a clean high-chime pitch
    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55); // Slightly longer, smooth chime decay
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.55);
  } catch (e) {
    console.warn("AudioContext error playing single warning chime:", e);
  }
};

// A double beep sound using browser native Web Audio API - configured as a slightly longer, premium double-tap chime
const playDoubleBeep = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // First tap chime (A5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880.00, now);
    gain1.gain.setValueAtTime(0.9, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.5);

    // Second tap chime (C6)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, now + 0.25);
    gain2.gain.setValueAtTime(0.9, now + 0.25);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25 + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.25);
    osc2.stop(now + 0.25 + 0.6);
  } catch (e) {
    console.warn("AudioContext error playing double chime:", e);
  }
};

// A high-quality synthesized sound chime using browser native Web Audio API
const playChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    
    // Low tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    gain1.gain.setValueAtTime(0.9, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.55);

    // High tone chime overlayed
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1046.50, now + 0.12); // C6, clean octaved chime
    gain2.gain.setValueAtTime(0.95, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.12 + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.5);
  } catch (e) {
    console.warn("AudioContext not allowed or supported by browser permission policies yet:", e);
  }
};

// Triggers an Android push/local notification via Service Worker
const triggerTimerNotification = (title: string, body: string) => {
  try {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        navigator.serviceWorker.ready.then(registration => {
          registration.showNotification(title, {
            body: body,
            icon: '/pwa_icon_512_1782540582378.jpg',
            badge: '/pwa_icon_512_1782540582378.jpg',
            tag: 'loki-timer-alert',
            renotify: true,
            vibrate: [200, 100, 200],
            silent: false
          } as any);
        }).catch(err => {
          console.warn("SW showNotification failed for timer:", err);
        });
      }
    }
  } catch (e) {
    console.warn("Failed to trigger timer notification:", e);
  }
};

export default function ActiveWorkoutSession({
  workout,
  personalBests,
  onUpdatePersonalBests,
  onComplete,
  onCancel,
  distanceUnit = 'km',
  weightUnit = 'lbs',
  customExercises = [],
  favoriteExerciseIds = []
}: ActiveWorkoutSessionProps) {
  // Clone workout exercises to let users modify actual reps/weights during the workout
  // and set default target weight to personal best if it exists
  const [exercises, setExercises] = useState<WorkoutExercise[]>(() => {
    if (!workout || !workout.exercises) return [];
    
    try {
      const cloned: WorkoutExercise[] = JSON.parse(JSON.stringify(workout.exercises));
      return cloned.map(ex => {
        if (!ex) return ex;
        const pb = (personalBests || []).find(p => p && p.exerciseId === ex.exerciseId);
        if (pb && pb.maxWeight !== undefined && ex.type === 'reps') {
          return {
            ...ex,
            sets: (ex.sets || []).map(set => ({
              ...set,
              weight: pb.maxWeight
            }))
          };
        }
        return ex;
      });
    } catch (e) {
      console.error("Loki Gym: Failed to clone exercises:", e);
      return [];
    }
  });

  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const currentExercise = exercises[currentExerciseIdx];

  // Selected Set Index override
  const [selectedSetIdxOverride, setSelectedSetIdxOverride] = useState<number | null>(null);

  // Timers
  const [workoutSeconds, setWorkoutSeconds] = useState(0);
  const [setSeconds, setSetSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Rest Timer State
  const [isResting, setIsResting] = useState(false);
  const [restRemaining, setRestRemaining] = useState(0);
  const [totalRestDuration, setTotalRestDuration] = useState(0);

  // Inline Cardio states
  const [inlineCardioMode, setInlineCardioMode] = useState<'timer' | 'free'>('free');
  const [inlineCardioTargetMinutes, setInlineCardioTargetMinutes] = useState(15);
  const [activeCardioTracking, setActiveCardioTracking] = useState<{ activity: string; mode: 'timer' | 'free'; targetMinutes?: number } | null>(null);

  // Time-based exercise active timers (like plank countdown)
  const [activeExerciseTimerRunning, setActiveExerciseTimerRunning] = useState(false);
  const [activeExerciseSecondsLeft, setActiveExerciseSecondsLeft] = useState(0);

  // PBs broken during this session
  const [pbsBrokenThisSession, setPbsBrokenThisSession] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState<string | null>(null);

  // Instruction Modal toggle
  const [showInstructions, setShowInstructions] = useState(false);

  // Quick Start state hooks
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState('');
  const [exerciseCategoryFilter, setExerciseCategoryFilter] = useState('All');
  const [showAddExerciseSelector, setShowAddExerciseSelector] = useState(false);
  const [showQuickStartChoice, setShowQuickStartChoice] = useState(false);
  const [showFavoriteExercisesOnly, setShowFavoriteExercisesOnly] = useState(false);



  // Refs for timers to avoid interval drifts
  const workoutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeExerciseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Delta time tracking refs for background accuracy
  const workoutStartTimeRef = useRef<number | null>(null);
  const setStartTimeRef = useRef<number | null>(null);
  const restEndTimeRef = useRef<number | null>(null);
  const exerciseEndTimeRef = useRef<number | null>(null);
  const accumulatedWorkoutSecondsRef = useRef<number>(0);
  const accumulatedSetSecondsRef = useRef<number>(0);
  const hasRestWarningFiredRef = useRef<boolean>(false);
  const hasExerciseWarningFiredRef = useRef<boolean>(false);

  useEffect(() => {
    setSelectedSetIdxOverride(null);
  }, [currentExerciseIdx]);

  // Request Notification permission on mount for Android push timers
  useEffect(() => {
    try {
      if ('Notification' in window && typeof Notification.requestPermission === 'function' && Notification.permission === 'default') {
        Notification.requestPermission().catch(err => {
          console.warn("Notification.requestPermission promise rejected:", err);
        });
      }
    } catch (e) {
      console.warn("Failed to request notification permission on mount:", e);
    }
  }, []);

  // Background Keep-Alive (Wake Lock & Silent Audio Loop)
  const wakeLockRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        console.log("Loki Wake Lock acquired successfully");
      }
    } catch (err) {
      console.warn("Loki Wake Lock acquisition failed:", err);
    }
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release().then(() => {
        wakeLockRef.current = null;
        console.log("Loki Wake Lock released");
      }).catch((err: any) => {
        console.warn("Loki Wake Lock release error:", err);
      });
    }
  };

  useEffect(() => {
    try {
      // Generate a tiny silent 1-second WAV file as a data URI to keep the audio session alive
      const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAAA");
      audio.loop = true;
      audioRef.current = audio;
    } catch (e) {
      console.warn("Failed to initialize background audio keep-alive:", e);
    }

    return () => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      } catch (e) {
        console.warn("Failed to pause background audio keep-alive in cleanup:", e);
      }
      releaseWakeLock();
    };
  }, []);

  useEffect(() => {
    const playAudio = () => {
      try {
        if (audioRef.current) {
          audioRef.current.play().catch(err => {
            console.warn("Background audio keep-alive play failed (interaction required):", err);
          });
        }
      } catch (e) {
        console.warn("Failed to play background audio keep-alive:", e);
      }
    };

    const pauseAudio = () => {
      try {
        if (audioRef.current) {
          audioRef.current.pause();
        }
      } catch (e) {
        console.warn("Failed to pause background audio keep-alive:", e);
      }
    };

    if (!isPaused) {
      requestWakeLock();
      playAudio();
    } else {
      releaseWakeLock();
      pauseAudio();
    }

    // Re-acquire Wake Lock if the app comes back to the foreground
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !isPaused) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
      pauseAudio();
    };
  }, [isPaused]);



  // 1. Overall Workout Timer (always counts up unless paused, using delta-time for background accuracy)
  useEffect(() => {
    if (!isPaused) {
      workoutStartTimeRef.current = Date.now() - accumulatedWorkoutSecondsRef.current * 1000;
      if (!isResting) {
        setStartTimeRef.current = Date.now() - accumulatedSetSecondsRef.current * 1000;
      }

      workoutTimerRef.current = setInterval(() => {
        const now = Date.now();
        if (workoutStartTimeRef.current) {
          const elapsedWorkout = Math.floor((now - workoutStartTimeRef.current) / 1000);
          setWorkoutSeconds(elapsedWorkout);
          accumulatedWorkoutSecondsRef.current = elapsedWorkout;
        }
        if (!isResting && setStartTimeRef.current) {
          const elapsedSet = Math.floor((now - setStartTimeRef.current) / 1000);
          setSetSeconds(elapsedSet);
          accumulatedSetSecondsRef.current = elapsedSet;
        }
      }, 500);
    }

    return () => {
      if (workoutTimerRef.current) clearInterval(workoutTimerRef.current);
    };
  }, [isPaused, isResting]);

  // 2. Rest Timer Countdown (using delta-time for background accuracy)
  useEffect(() => {
    let restInterval: NodeJS.Timeout | null = null;
    if (isResting && restRemaining > 0) {
      if (!restEndTimeRef.current) {
        restEndTimeRef.current = Date.now() + restRemaining * 1000;
        hasRestWarningFiredRef.current = false;
      }

      restInterval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((restEndTimeRef.current! - now) / 1000));

        // 10-second warning
        if (remaining <= 10 && remaining > 0 && !hasRestWarningFiredRef.current) {
          hasRestWarningFiredRef.current = true;
          playBeep();
          Haptics.vibrate({ duration: 200 }).catch(() => {});
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200]);
          }
          triggerTimerNotification("Rest Timer: 10s left! ⏱️", "Get ready for the next set.");
        }

        setRestRemaining(remaining);

        if (remaining <= 0) {
          if (restInterval) clearInterval(restInterval);
          setIsResting(false);
          restEndTimeRef.current = null;
          playDoubleBeep();
          playChime();
          Haptics.notification({ type: NotificationType.Success }).catch(() => {});
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([300, 150, 300]);
          }
          triggerTimerNotification("Rest Over! 💪", "Time to start your next set!");
          setSetSeconds(0);
          accumulatedSetSecondsRef.current = 0;
          setStartTimeRef.current = Date.now();
        }
      }, 200);
    } else {
      restEndTimeRef.current = null;
    }

    return () => {
      if (restInterval) clearInterval(restInterval);
    };
  }, [isResting, restRemaining]);

  // 3. Time-based Active Set Countdown Timer (using delta-time for background accuracy)
  useEffect(() => {
    let activeExerciseTimer: NodeJS.Timeout | null = null;
    if (activeExerciseTimerRunning && activeExerciseSecondsLeft > 0 && !isPaused) {
      if (!exerciseEndTimeRef.current) {
        exerciseEndTimeRef.current = Date.now() + activeExerciseSecondsLeft * 1000;
        hasExerciseWarningFiredRef.current = false;
      }

      activeExerciseTimer = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.ceil((exerciseEndTimeRef.current! - now) / 1000));

        // 10-second warning
        if (remaining <= 10 && remaining > 0 && !hasExerciseWarningFiredRef.current) {
          hasExerciseWarningFiredRef.current = true;
          playBeep();
          Haptics.vibrate({ duration: 200 }).catch(() => {});
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200]);
          }
          triggerTimerNotification("Exercise Timer: 10s left! ⏱️", "Keep pushing until the end!");
        }

        setActiveExerciseSecondsLeft(remaining);

        if (remaining <= 0) {
          if (activeExerciseTimer) clearInterval(activeExerciseTimer);
          setActiveExerciseTimerRunning(false);
          exerciseEndTimeRef.current = null;
          playChime();
          Haptics.notification({ type: NotificationType.Success }).catch(() => {});
          if (typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([300, 150, 300]);
          }
          triggerTimerNotification("Time's Up! 🎉", "Exercise completed successfully.");

          // Automatically complete the set and transition to the rest timer
          const activeSetIdx = currentExercise.sets.findIndex(s => !s.isCompleted);
          const autoSetIdx = activeSetIdx === -1 ? currentExercise.sets.length - 1 : activeSetIdx;
          const targetSetIdx = selectedSetIdxOverride !== null && selectedSetIdxOverride < currentExercise.sets.length
            ? selectedSetIdxOverride
            : autoSetIdx;
          
          if (targetSetIdx !== -1 && !currentExercise.sets[targetSetIdx].isCompleted) {
            toggleSetComplete(currentExerciseIdx, targetSetIdx);
          }
        }
      }, 200);
    } else {
      exerciseEndTimeRef.current = null;
    }

    return () => {
      if (activeExerciseTimer) clearInterval(activeExerciseTimer);
    };
  }, [activeExerciseTimerRunning, activeExerciseSecondsLeft, isPaused, currentExercise, currentExerciseIdx, selectedSetIdxOverride]);

  // Handle set values change
  const handleSetChange = (
    exerciseIdx: number, 
    setIdx: number, 
    field: 'reps' | 'weight' | 'duration' | 'distance', 
    value: number
  ) => {
    setExercises(prev => {
      const copy = [...prev];
      const targetExercise = copy[exerciseIdx];
      const targetSet = targetExercise.sets[setIdx];
      
      if (field === 'reps') targetSet.reps = Math.max(0, value);
      if (field === 'weight') targetSet.weight = Math.max(0, value);
      if (field === 'duration') targetSet.duration = Math.max(0, value);
      if (field === 'distance') targetSet.distance = Math.max(0, value);
      
      return copy;
    });
  };

  // Add exercise to session dynamically (for Quick Start workouts)
  const handleAddExerciseToSession = (ex: Exercise) => {
    const isCardio = ex.type === 'cardio';
    const setsArray: SetRecord[] = isCardio
      ? [{ setId: 1, isCompleted: false }]
      : Array.from({ length: ex.defaultSets || 1 }).map((_, sIdx) => ({
          setId: sIdx + 1,
          reps: ex.type === 'reps' ? (ex.defaultReps || 10) : undefined,
          weight: ex.type === 'reps' ? (ex.defaultWeight || 0) : undefined,
          duration: ex.type === 'time' ? (ex.defaultDuration || 15) : undefined,
          isCompleted: false
        }));

    const newWorkoutEx: WorkoutExercise = {
      id: `session_${ex.id}_${Date.now()}`,
      exerciseId: ex.id,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      sets: setsArray,
      restDuration: isCardio ? 0 : ex.defaultRest || 60,
      type: ex.type,
      defaultDuration: ex.defaultDuration,
      image: ex.image,
      instructions: ex.instructions
    };

    setExercises(prev => [...prev, newWorkoutEx]);
    setCurrentExerciseIdx(exercises.length);
    setShowAddExerciseSelector(false);
    setExerciseSearchQuery('');
    setExerciseCategoryFilter('All');
  };

  // Toggle set completion & update Personal Bests on the fly
  const toggleSetComplete = (exerciseIdx: number, setIdx: number) => {
    const exerciseInstance = exercises[exerciseIdx];
    const setRecord = exerciseInstance.sets[setIdx];
    const willBeCompleted = !setRecord.isCompleted;

    // Reset override on complete/toggle to auto-advance
    setSelectedSetIdxOverride(null);

    // We can only check PB if setting as completed
    if (willBeCompleted) {
      // Find current PB for this exercise type
      const currentPB = personalBests.find(pb => pb.exerciseId === exerciseInstance.exerciseId);
      let isNewPB = false;
      const todayStr = new Date().toISOString().split('T')[0];

      let updatedPBEntry: PersonalBest = currentPB || {
        exerciseId: exerciseInstance.exerciseId,
        exerciseName: exerciseInstance.name,
        muscleGroup: exerciseInstance.muscleGroup,
        date: todayStr
      };

      if (exerciseInstance.type === 'reps') {
        const inputWeight = setRecord.weight || 0;
        const inputReps = setRecord.reps || 0;

        if (!currentPB) {
          isNewPB = inputWeight > 0 || inputReps > 0;
          updatedPBEntry.maxWeight = inputWeight;
          updatedPBEntry.maxReps = inputReps;
        } else {
          // If weighted exercise
          if (inputWeight > (currentPB.maxWeight || 0)) {
            isNewPB = true;
            updatedPBEntry.maxWeight = inputWeight;
            updatedPBEntry.maxReps = inputReps;
            updatedPBEntry.date = todayStr;
          } 
          // If same weight but higher reps
          else if (inputWeight === (currentPB.maxWeight || 0) && inputReps > (currentPB.maxReps || 0)) {
            isNewPB = true;
            updatedPBEntry.maxReps = inputReps;
            updatedPBEntry.date = todayStr;
          }
          // If bodyweight and higher reps
          else if (inputWeight === 0 && (currentPB.maxWeight || 0) === 0 && inputReps > (currentPB.maxReps || 0)) {
            isNewPB = true;
            updatedPBEntry.maxReps = inputReps;
            updatedPBEntry.date = todayStr;
          }
        }
      } else {
        // Time-based exercise (e.g. plank)
        const inputDuration = setRecord.duration || 0;
        if (!currentPB || inputDuration > (currentPB.maxDuration || 0)) {
          isNewPB = true;
          updatedPBEntry.maxDuration = inputDuration;
          updatedPBEntry.date = todayStr;
        }
      }

      if (isNewPB) {
        setRecord.isPersonalBest = true;
        
        // Show celebratory feedback
        setShowCelebration(exerciseInstance.name);
        setTimeout(() => setShowCelebration(null), 3000);

        if (!pbsBrokenThisSession.includes(exerciseInstance.exerciseId)) {
          setPbsBrokenThisSession(prev => [...prev, exerciseInstance.exerciseId]);
        }

        // Save immediately to parent state/local storage
        const filteredPBs = personalBests.filter(pb => pb.exerciseId !== exerciseInstance.exerciseId);
        onUpdatePersonalBests([...filteredPBs, updatedPBEntry]);
      }

      // Automatically trigger rest timer between sets (if it is not the very last set of the entire workout)
      const isLastSetOfExercise = exerciseInstance.sets.every((s, idx) => idx === setIdx ? willBeCompleted : s.isCompleted);
      const isLastExercise = exerciseIdx === exercises.length - 1;

      if (!(isLastSetOfExercise && isLastExercise)) {
        setIsResting(true);
        setTotalRestDuration(exerciseInstance.restDuration);
        setRestRemaining(exerciseInstance.restDuration);
        restEndTimeRef.current = Date.now() + exerciseInstance.restDuration * 1000;
        hasRestWarningFiredRef.current = false;
        playChime();
      }

      // For Quick Start mode, show the option choice when the current exercise is finished
      const isQuickStart = workout.id.startsWith('workout_quick_');

      if (willBeCompleted && isLastSetOfExercise && isQuickStart) {
        setTimeout(() => {
          setShowQuickStartChoice(true);
        }, 800);
      }

      // Auto-advance to the next exercise if this was the last set of the current exercise (non Quick-Start mode)
      if (willBeCompleted && isLastSetOfExercise && !isLastExercise && !isQuickStart) {
        setTimeout(() => {
          setCurrentExerciseIdx(prev => prev + 1);
        }, 800);
      }
    }

    setExercises(prev => {
      const copy = [...prev];
      copy[exerciseIdx].sets[setIdx].isCompleted = willBeCompleted;
      return copy;
    });
  };

  // Add set on the fly to increment/add extra set
  const handleAddSetToExercise = (exerciseIdx: number) => {
    setExercises(prev => {
      const copy = [...prev];
      const targetExercise = copy[exerciseIdx];
      const newSetId = targetExercise.sets.length + 1;
      const lastSet = targetExercise.sets[targetExercise.sets.length - 1];
      
      const pb = personalBests.find(p => p.exerciseId === targetExercise.exerciseId);
      const pbWeight = pb && pb.maxWeight !== undefined ? pb.maxWeight : 0;

      targetExercise.sets.push({
        setId: newSetId,
        reps: lastSet ? (lastSet.reps || 10) : 10,
        weight: lastSet ? (lastSet.weight !== undefined ? lastSet.weight : pbWeight) : pbWeight,
        duration: lastSet ? (lastSet.duration || 60) : 60,
        isCompleted: false
      });
      
      // Auto-focus the newly added set
      setSelectedSetIdxOverride(newSetId - 1);
      
      return copy;
    });
  };

  // Adjust total set amounts for an exercise dynamically
  const handleSetCountChange = (exerciseIdx: number, targetCount: number) => {
    if (targetCount < 1) return;
    setExercises(prev => {
      const copy = [...prev];
      const targetExercise = copy[exerciseIdx];
      const currentCount = targetExercise.sets.length;
      
      const pb = personalBests.find(p => p.exerciseId === targetExercise.exerciseId);
      const pbWeight = pb && pb.maxWeight !== undefined ? pb.maxWeight : 0;

      if (targetCount > currentCount) {
        // Add sets
        for (let i = currentCount; i < targetCount; i++) {
          const lastSet = targetExercise.sets[targetExercise.sets.length - 1];
          targetExercise.sets.push({
            setId: i + 1,
            reps: lastSet ? (lastSet.reps || 10) : 10,
            weight: lastSet ? (lastSet.weight !== undefined ? lastSet.weight : pbWeight) : pbWeight,
            duration: lastSet ? (lastSet.duration || 60) : 60,
            isCompleted: false
          });
        }
      } else if (targetCount < currentCount) {
        // Remove sets from the end
        targetExercise.sets = targetExercise.sets.slice(0, targetCount);
      }
      
      // Keep override index safe
      setSelectedSetIdxOverride(null);
      
      return copy;
    });
  };

  // Skip, increase, or decrease rest timer
  const skipRest = () => {
    setIsResting(false);
    setRestRemaining(0);
    restEndTimeRef.current = null;
    setSetSeconds(0);
    accumulatedSetSecondsRef.current = 0;
  };

  const adjustRestTime = (seconds: number) => {
    setRestRemaining(prev => {
      const newVal = Math.max(0, prev + seconds);
      if (restEndTimeRef.current) {
        restEndTimeRef.current += seconds * 1000;
      }
      return newVal;
    });
    setTotalRestDuration(prev => Math.max(0, prev + seconds));
  };

  // Active Timer for Time-Based set
  const startActiveSetTimer = (duration: number) => {
    setActiveExerciseSecondsLeft(duration);
    exerciseEndTimeRef.current = Date.now() + duration * 1000;
    hasExerciseWarningFiredRef.current = false;
    setActiveExerciseTimerRunning(true);
  };

  const toggleActiveSetTimer = () => {
    setActiveExerciseTimerRunning(prev => {
      const nextVal = !prev;
      if (nextVal) {
        exerciseEndTimeRef.current = Date.now() + activeExerciseSecondsLeft * 1000;
      } else {
        exerciseEndTimeRef.current = null;
      }
      return nextVal;
    });
  };

  const resetActiveSetTimer = (duration: number) => {
    setActiveExerciseSecondsLeft(duration);
    exerciseEndTimeRef.current = null;
    setActiveExerciseTimerRunning(false);
  };

  // Complete Workout Session
  const finishWorkout = () => {
    const totalSetsCompleted = exercises.reduce((sum, ex) => {
      return sum + ex.sets.filter(s => s.isCompleted).length;
    }, 0);

    const totalWeightLifted = exercises.reduce((total, ex) => {
      if (ex.type === 'reps') {
        return total + ex.sets.reduce((setSum, s) => {
          if (s.isCompleted && s.weight && s.reps) {
            return setSum + (s.weight * s.reps);
          }
          return setSum;
        }, 0);
      }
      return total;
    }, 0);

    onComplete(workoutSeconds, totalSetsCompleted, pbsBrokenThisSession.length, totalWeightLifted, exercises);
  };

  // Automatically finish workout once all sets of all exercises are completed (non Quick-Start mode)
  useEffect(() => {
    if (exercises.length === 0) return;
    const isQuickStart = workout.id.startsWith('workout_quick_');
    if (isQuickStart) return;

    const allCompleted = exercises.every(ex => ex.sets.every(s => s.isCompleted));
    if (allCompleted) {
      finishWorkout();
    }
  }, [exercises]);

  // Helper formats
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-dark-bg text-[#F0F0F0] flex flex-col p-6 font-sans">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border-dark pb-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand animate-pulse" />
            <h2 className="text-lg font-display font-black uppercase text-white tracking-wide">
              Quick Start Workout
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="px-3 py-1.5 border border-brand text-xs font-mono font-bold text-brand bg-dark-panel cursor-pointer hover:bg-brand/10 hover:border-brand/80 transition"
          >
            Cancel Session
          </button>
        </div>

        {/* Selection Content */}
        <div className="flex-1 max-w-xl mx-auto w-full flex flex-col justify-center animate-fade-in">
          <div className="text-center mb-6 space-y-2">
            <Dumbbell className="w-10 h-10 text-brand mx-auto stroke-[1.5]" />
            <h3 className="text-base font-display font-black uppercase text-white tracking-wide">Select Your First Exercise</h3>
            <p className="text-zinc-500 text-xs leading-relaxed max-w-md mx-auto">
              Build your routine on the fly. Search for an exercise to begin your training session.
            </p>
          </div>

          <div className="bg-dark-panel border border-border-dark p-5 space-y-4 shadow-xl">
            {/* Search Input + Favorites Filter */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search exercises..."
                value={exerciseSearchQuery}
                onChange={(e) => setExerciseSearchQuery(e.target.value)}
                className="flex-1 bg-black border border-border-dark focus:border-brand focus:outline-none rounded-none py-2 px-3 text-xs text-white placeholder-zinc-700 transition"
              />
              <button
                type="button"
                onClick={() => setShowFavoriteExercisesOnly(prev => !prev)}
                className={`px-3 py-2 text-[10px] font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer border rounded-none ${
                  showFavoriteExercisesOnly 
                    ? 'bg-brand/15 border-brand text-brand shadow-[0_0_8px_rgba(255,230,0,0.15)] font-extrabold' 
                    : 'bg-dark-surface border-border-dark text-[#666] hover:text-[#CCC]'
                }`}
                title="Filter by favorite exercises"
              >
                <Star className={`w-3.5 h-3.5 ${showFavoriteExercisesOnly ? 'fill-brand text-brand' : 'text-[#666]'}`} />
                <span className="hidden sm:inline">Favorites</span>
              </button>
            </div>

            {/* Quick Categories */}
            <div className="flex flex-wrap gap-1.5">
              {['All', 'Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Cardio'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setExerciseCategoryFilter(cat)}
                  className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase border transition-all cursor-pointer ${
                    exerciseCategoryFilter === cat
                      ? 'bg-brand/10 border-brand text-brand font-extrabold'
                      : 'bg-dark-surface border-border-dark text-[#888] hover:text-[#CCC]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {(() => {
                const list = [...INITIAL_EXERCISES, ...customExercises].filter(ex => {
                  if (showFavoriteExercisesOnly && !favoriteExerciseIds.includes(ex.id)) return false;

                  const matchesSearch = ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
                  const matchesCategory = exerciseCategoryFilter === 'All' || ex.muscleGroup === exerciseCategoryFilter;
                  return matchesSearch && matchesCategory;
                });

                if (list.length === 0) {
                  return (
                    <div className="text-center py-8 text-zinc-600 text-xs font-mono">
                      No matching exercises found.
                    </div>
                  );
                }

                return list.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => handleAddExerciseToSession(ex)}
                    className="w-full p-3 bg-dark-surface border border-border-dark hover:border-brand/40 text-left flex justify-between items-center cursor-pointer transition group"
                  >
                    <div>
                      <div className="text-xs font-display font-black uppercase text-white tracking-wide group-hover:text-brand transition font-extrabold">
                        {ex.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {ex.muscleGroup} | {ex.type === 'reps' ? 'Reps & Weight' : 'Timed Hold'}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-brand transition" />
                  </button>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div className="min-h-screen bg-dark-bg text-[#F0F0F0] flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="w-16 h-16 bg-dark-panel border border-border-dark flex items-center justify-center text-rose-500 mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-display font-black italic uppercase text-white mb-2">No Exercises Found</h2>
        <p className="text-[#CCC] text-xs max-w-sm mb-6 leading-relaxed">This routine does not contain any exercises. Please add movements to this routine before launching.</p>
        <button 
          onClick={onCancel} 
          className="py-3.5 px-8 bg-brand hover:bg-white text-black font-black uppercase text-xs tracking-wider transition-colors cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div id="active-session-container" className="min-h-screen bg-dark-bg text-[#F0F0F0] flex flex-col font-sans pt-[calc(0.5rem+env(safe-area-inset-top,12px))] pb-[calc(0.5rem+env(safe-area-inset-bottom,12px))] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]">
      
      {/* Celebration Alert */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-brand text-black font-black uppercase text-xs tracking-wider px-6 py-3 rounded-none shadow-2xl flex items-center gap-2 border border-black"
          >
            <Trophy className="w-5 h-5 fill-current animate-bounce" />
            <span>NEW PERSONAL BEST broke in {showCelebration}! 🔥</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Left Workout panel */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 md:p-6 overflow-y-auto">
        
        {/* Top bar with Workout Stats */}
        <div className="flex justify-between items-center bg-dark-panel border border-border-dark p-3 md:p-4 rounded-none mb-3 shadow-md h-16">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono text-[#666] uppercase tracking-widest font-bold">Active Workout</span>
            <h1 className="text-xl font-display font-black italic uppercase leading-none tracking-tight text-white mt-1">{workout.name}</h1>
          </div>
          
          {/* Workout timers */}
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] font-mono text-[#666] uppercase block font-bold leading-none mb-1">Total Time</span>
              <span className="text-2xl font-mono font-bold text-brand tracking-tighter flex items-center gap-1.5 leading-none">
                <Clock className="w-5 h-5 text-brand inline" />
                {formatTime(workoutSeconds)}
              </span>
            </div>

            <div className="h-10 w-[1px] bg-border-dark"></div>

            <button 
              id="pause-workout-btn"
              onClick={() => setIsPaused(p => !p)}
              className={`p-2 rounded-none border flex items-center justify-center transition-all ${
                isPaused 
                  ? 'bg-brand border-brand text-black' 
                  : 'bg-dark-surface border-border-dark hover:bg-border-dark text-white'
              }`}
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            </button>
          </div>
        </div>

        {/* Exercises Navigation Rails */}
        <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1.5">
          {exercises.map((ex, index) => {
            const isCompleted = ex.sets.every(s => s.isCompleted);
            const isActive = index === currentExerciseIdx;
            return (
              <button
                key={ex.id}
                onClick={() => setCurrentExerciseIdx(index)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-none text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border ${
                  isActive 
                    ? 'bg-brand/10 border-brand text-brand shadow-[0_0_12px_rgba(255,230,0,0.15)]' 
                    : isCompleted
                      ? 'bg-yellow-500/5 border-yellow-500/30 text-yellow-400'
                      : 'bg-dark-panel border-border-dark text-[#666] hover:text-[#CCC]'
                }`}
              >
                {isCompleted && <Check className="w-3.5 h-3.5 text-yellow-400 stroke-[3]" />}
                <span>{index + 1}. {ex.name}</span>
              </button>
            );
          })}
        </div>

        {/* Condensed Current Exercise Details */}
        <div className="bg-dark-panel border border-border-dark p-3 mb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="bg-dark-surface text-brand border border-border-dark text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-none uppercase tracking-wider">
                {currentExercise.muscleGroup}
              </span>
              <span className="text-[#666] text-[10px] font-mono font-bold uppercase">
                {currentExerciseIdx + 1} of {exercises.length} Exercises
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <h2 className="text-base font-display font-black italic uppercase text-white tracking-tight leading-none">
                {currentExercise.name}
              </h2>
              <button 
                onClick={() => setShowInstructions(true)}
                className="text-zinc-500 hover:text-brand transition-colors cursor-pointer"
                title="View Guide Instructions"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
            <p className="text-zinc-400 text-[10px] mt-1 leading-normal line-clamp-1">
              {INITIAL_EXERCISES.find(e => e.id === currentExercise.exerciseId)?.description}
            </p>
          </div>

        {/* Interactive Sets Control Card (Consolidated single line with inline Rest Timer) */}
        {currentExercise.type !== 'cardio' ? (
          <div className="bg-dark-panel border border-border-dark rounded-none p-4 mb-3 shadow-md">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-border-dark pb-3">
              <h3 className="font-display font-black italic uppercase text-white tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand" />
                <span>Sets & Rest Control</span>
              </h3>
              <div className="flex items-center gap-3 self-end sm:self-auto">
                <span className="text-xs font-mono font-bold text-[#888] uppercase">Sets Count:</span>
                <div className="flex items-center border border-border-dark bg-dark-surface font-mono text-sm">
                  <button
                    onClick={() => handleSetCountChange(currentExerciseIdx, currentExercise.sets.length - 1)}
                    disabled={currentExercise.sets.length <= 1}
                    className="px-2 py-1 hover:bg-border-dark text-[#888] hover:text-white transition disabled:opacity-30 cursor-pointer"
                    title="Decrease sets"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-3 font-bold text-white text-xs">{currentExercise.sets.length}</span>
                  <button
                    onClick={() => handleSetCountChange(currentExerciseIdx, currentExercise.sets.length + 1)}
                    className="px-2 py-1 hover:bg-border-dark text-[#888] hover:text-white transition cursor-pointer"
                    title="Increase sets"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <span className="text-xs font-mono font-bold text-[#666] uppercase">
                  ({currentExercise.sets.filter(s => s.isCompleted).length} Completed)
                </span>
              </div>
            </div>

            {(() => {
              const activeSetIdx = currentExercise.sets.findIndex(s => !s.isCompleted);
              const autoSetIdx = activeSetIdx === -1 ? currentExercise.sets.length - 1 : activeSetIdx;
              const displaySetIdx = selectedSetIdxOverride !== null && selectedSetIdxOverride < currentExercise.sets.length 
                ? selectedSetIdxOverride 
                : autoSetIdx;
              const set = currentExercise.sets[displaySetIdx];

              return (
                <div className="space-y-4">
                  {/* Completed Sets History Roll */}
                  <div className="flex flex-wrap gap-2">
                    {currentExercise.sets.map((s, idx) => (
                      <button 
                        key={s.setId}
                        onClick={() => setSelectedSetIdxOverride(idx)}
                        className={`px-3 py-1.5 text-xs font-mono border flex items-center gap-1.5 transition-all cursor-pointer ${
                          s.isCompleted 
                            ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400' 
                            : idx === displaySetIdx 
                              ? 'bg-brand/10 border-brand text-brand font-black shadow-[0_0_8px_rgba(255,230,0,0.1)] font-bold' 
                              : 'bg-dark-surface border-border-dark text-[#555]'
                        }`}
                      >
                        <span>S{s.setId}:</span>
                        <span>
                          {currentExercise.type === 'reps' 
                            ? `${s.reps || 0}r ${s.weight ? `@ ${weightUnit === 'kg' ? Math.round(s.weight * 0.45359237) : s.weight}${weightUnit}` : ''}` 
                            : `${s.duration || 0}s`}
                        </span>
                        {s.isCompleted && <Check className="w-3 h-3 text-yellow-400 stroke-[3]" />}
                      </button>
                    ))}
                  </div>

                  {isResting ? (
                    /* Inline Rest Timer in the same area */
                    <div className="bg-brand/5 border border-brand/30 p-4 rounded-none text-center space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-brand animate-pulse" />
                          <span className="text-xs font-display font-black italic uppercase text-white tracking-wider">Rest Period Active</span>
                        </div>
                        <span className="text-xl font-mono font-black text-brand tracking-widest animate-pulse">
                          {formatTime(restRemaining)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-1 bg-dark-card rounded-none overflow-hidden border border-border-dark">
                        <div 
                          className="h-full bg-brand transition-all duration-1000 ease-linear"
                          style={{ width: `${(restRemaining / totalRestDuration) * 100}%` }}
                        />
                      </div>

                      {/* Control Buttons */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => adjustRestTime(-15)}
                            className="px-2.5 py-1 bg-dark-card border border-border-dark hover:bg-border-dark text-[10px] font-mono font-bold uppercase text-white transition rounded-none cursor-pointer"
                          >
                            -15s
                          </button>
                          <button 
                            onClick={() => adjustRestTime(15)}
                            className="px-2.5 py-1 bg-dark-card border border-border-dark hover:bg-border-dark text-[10px] font-mono font-bold uppercase text-white transition rounded-none cursor-pointer"
                          >
                            +15s
                          </button>
                        </div>

                        <button
                          onClick={skipRest}
                          className="px-3 py-1 bg-white text-black font-mono font-black uppercase text-[10px] tracking-wider hover:bg-brand transition rounded-none cursor-pointer"
                        >
                          Skip Rest
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Single Line Set Editor */
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-dark-surface border border-border-dark rounded-none">
                      {/* Set Identifier & Info */}
                      <div className="flex items-center gap-3">
                        <span className={`w-10 h-10 font-display font-black italic text-sm flex items-center justify-center transition-all ${
                          set.isCompleted
                            ? 'bg-yellow-500 text-slate-950 font-extrabold'
                            : 'bg-brand text-black'
                        }`}>
                          S{set.setId}
                        </span>
                        <div>
                          <span className="text-[10px] font-mono text-[#666] uppercase block font-bold leading-none">Active Set Editor</span>
                          <span className="text-xs font-mono font-bold uppercase text-white mt-1.5 block">
                            {set.isCompleted ? 'Already Completed' : `Set ${set.setId} of ${currentExercise.sets.length}`}
                          </span>
                        </div>
                      </div>

                      {/* Reps/Time adjusters and Complete button stacked */}
                      <div className="flex flex-col gap-4 flex-1 w-full md:max-w-md">
                        {/* Inputs Row */}
                        <div className="flex items-center gap-3 sm:gap-6 justify-between md:justify-end w-full">
                          {currentExercise.type === 'reps' ? (
                            <div className="flex items-center gap-3 sm:gap-4 w-full justify-between md:justify-end">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleSetChange(currentExerciseIdx, displaySetIdx, 'reps', (set.reps || 0) - 1)}
                                  disabled={set.isCompleted}
                                  className="p-1.5 bg-dark-card hover:bg-border-dark border border-border-dark text-[#CCC] disabled:opacity-30 cursor-pointer"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <div className="text-center min-w-[40px] sm:min-w-[50px]">
                                  <input 
                                    type="number"
                                    value={set.reps || 0}
                                    onChange={(e) => handleSetChange(currentExerciseIdx, displaySetIdx, 'reps', parseInt(e.target.value) || 0)}
                                    disabled={set.isCompleted}
                                    className="w-8 sm:w-10 text-center bg-transparent text-base font-bold text-white font-mono focus:outline-none"
                                  />
                                  <span className="text-[9px] text-[#666] block uppercase font-mono font-bold">Reps</span>
                                </div>
                                <button
                                  onClick={() => handleSetChange(currentExerciseIdx, displaySetIdx, 'reps', (set.reps || 0) + 1)}
                                  disabled={set.isCompleted}
                                  className="p-1.5 bg-dark-card hover:bg-border-dark border border-border-dark text-[#CCC] disabled:opacity-30 cursor-pointer"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="h-8 w-[1px] bg-border-dark"></div>

                              {/* Weight */}
                              <div className="flex items-center gap-1">
                                <input 
                                  type="number" 
                                  value={set.weight ? (weightUnit === 'kg' ? Math.round(set.weight * 0.45359237) : set.weight) : 0} 
                                  disabled={set.isCompleted}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    const storedVal = weightUnit === 'kg' ? Math.round(val / 0.45359237) : val;
                                    handleSetChange(currentExerciseIdx, displaySetIdx, 'weight', storedVal);
                                  }}
                                  className="w-14 sm:w-16 bg-dark-card border border-border-dark py-1 px-1.5 text-center font-mono font-bold text-sm text-brand focus:outline-none focus:border-brand disabled:bg-transparent disabled:border-transparent"
                                />
                                <span className="text-[9px] text-[#666] font-mono font-bold uppercase">{weightUnit}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 w-full justify-between md:justify-end">
                              <button
                                onClick={() => handleSetChange(currentExerciseIdx, displaySetIdx, 'duration', (set.duration || 0) - 15)}
                                disabled={set.isCompleted}
                                className="p-1.5 bg-dark-card hover:bg-border-dark border border-border-dark text-[#CCC] disabled:opacity-30 cursor-pointer"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <div className="text-center min-w-[50px] sm:min-w-[60px]">
                                <input 
                                  type="number"
                                  value={set.duration || 0}
                                  onChange={(e) => handleSetChange(currentExerciseIdx, displaySetIdx, 'duration', parseInt(e.target.value) || 0)}
                                  disabled={set.isCompleted}
                                  className="w-10 sm:w-12 text-center bg-transparent text-base font-bold text-white font-mono focus:outline-none"
                                  step={15}
                                />
                                <span className="text-[9px] text-[#666] block uppercase font-mono font-bold">Secs</span>
                              </div>
                              <button
                                onClick={() => handleSetChange(currentExerciseIdx, displaySetIdx, 'duration', (set.duration || 0) + 15)}
                                disabled={set.isCompleted}
                                className="p-1.5 bg-dark-card hover:bg-border-dark border border-border-dark text-[#CCC] disabled:opacity-30 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Complete / Done toggle button below OR Timer controls for hold exercises */}
                        {currentExercise.type === 'time' ? (
                          <div className="space-y-2 w-full">
                            {set.isCompleted ? (
                              <button
                                onClick={() => {
                                  toggleSetComplete(currentExerciseIdx, displaySetIdx);
                                  resetActiveSetTimer(set.duration || currentExercise.defaultDuration || 60);
                                }}
                                className="h-10 w-full px-4 flex items-center justify-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer bg-yellow-500 text-slate-950 shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                                title="Mark set as incomplete"
                              >
                                <Check className="w-4 h-4 stroke-[3]" />
                                <span>Done (Tap to Redo)</span>
                              </button>
                            ) : (
                              <div className="flex flex-col gap-2 w-full">
                                {/* Timer Countdown Display */}
                                <div className="bg-black/60 border border-border-dark py-2 px-4 flex items-center justify-between font-mono">
                                  <span className="text-[10px] text-[#666] font-bold uppercase tracking-wider">Hold Timer</span>
                                  <span className={`text-xl font-bold tracking-tight ${activeExerciseTimerRunning ? 'text-brand animate-pulse' : 'text-white'}`}>
                                    {activeExerciseSecondsLeft > 0 
                                      ? formatTime(activeExerciseSecondsLeft) 
                                      : formatTime(set.duration || currentExercise.defaultDuration || 60)}
                                  </span>
                                </div>

                                {/* Controls Row */}
                                <div className="flex items-center gap-2">
                                  {!activeExerciseTimerRunning && activeExerciseSecondsLeft === 0 ? (
                                    // Start button (takes full width if timer not started)
                                    <button
                                      type="button"
                                      onClick={() => startActiveSetTimer(set.duration || currentExercise.defaultDuration || 60)}
                                      className="h-10 flex-1 px-4 bg-brand hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                      <Play className="w-4 h-4 fill-current" />
                                      <span>Start Timer</span>
                                    </button>
                                  ) : (
                                    <>
                                      {/* Pause / Resume Button */}
                                      <button
                                        type="button"
                                        onClick={toggleActiveSetTimer}
                                        className="h-10 flex-1 px-4 bg-dark-card hover:bg-border-dark border border-border-dark text-white text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
                                      >
                                        {activeExerciseTimerRunning ? (
                                          <>
                                            <Pause className="w-4 h-4 fill-current" />
                                            <span>Pause</span>
                                          </>
                                        ) : (
                                          <>
                                            <Play className="w-4 h-4 fill-current" />
                                            <span>Resume</span>
                                          </>
                                        )}
                                      </button>

                                      {/* Reset Button */}
                                      <button
                                        type="button"
                                        onClick={() => resetActiveSetTimer(set.duration || currentExercise.defaultDuration || 60)}
                                        className="h-10 w-12 bg-dark-card hover:bg-border-dark border border-border-dark text-[#CCC] transition flex items-center justify-center cursor-pointer"
                                        title="Reset Timer"
                                      >
                                        <RotateCcw className="w-4 h-4" />
                                      </button>

                                      {/* Manual Complete / Skip Button */}
                                      <button
                                        type="button"
                                        onClick={() => toggleSetComplete(currentExerciseIdx, displaySetIdx)}
                                        className="h-10 px-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-mono font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer"
                                        title="Complete Set manually"
                                      >
                                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                                        <span>Skip</span>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          // Standard Complete Set button for reps-based exercises
                          <button
                            onClick={() => toggleSetComplete(currentExerciseIdx, displaySetIdx)}
                            className={`h-10 w-full px-4 flex items-center justify-center gap-1.5 text-xs font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                              set.isCompleted 
                                ? 'bg-yellow-500 text-slate-950 shadow-[0_0_8px_rgba(234,179,8,0.4)]' 
                                : 'bg-brand text-black hover:bg-white'
                            }`}
                            title={set.isCompleted ? 'Mark set as incomplete' : 'Mark set as complete'}
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span className="inline">{set.isCompleted ? 'Done' : 'Complete Set'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        ) : (
          /* Render Cardio Specific Mode Selector or Summary Details */
          <div className="bg-dark-panel border border-border-dark rounded-none p-5 mb-3 shadow-md">
            {(() => {
              const targetSet = currentExercise.sets?.[0];
              const hasCompletedSession = targetSet?.isCompleted;
              
              if (hasCompletedSession && targetSet) {
                return (
                  <div className="space-y-4">
                    <div className="bg-brand/10 border border-brand/20 p-4 rounded-none text-center space-y-2">
                      <Check className="w-8 h-8 text-brand mx-auto animate-bounce" />
                      <h3 className="text-sm font-display font-black italic uppercase text-white">Cardio Tracking Complete!</h3>
                      <p className="text-zinc-400 text-[10px] font-mono uppercase">
                        Logged {targetSet.distance?.toFixed(2)} km in {Math.floor(targetSet.duration! / 60)}m {targetSet.duration! % 60}s
                      </p>
                    </div>

                    {targetSet.gpsPath && targetSet.gpsPath.length > 0 && (
                      <div className="h-[200px] border border-border-dark relative overflow-hidden">
                        <LeafletMap points={targetSet.gpsPath} />
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setExercises(prev => {
                            const copy = [...prev];
                            const ex = copy[currentExerciseIdx];
                            ex.sets = [{ setId: 1, isCompleted: false }];
                            return copy;
                          });
                        }}
                        className="w-full py-2.5 bg-dark-card hover:bg-border-dark border border-border-dark text-white font-mono font-bold uppercase text-[10px] tracking-wider transition cursor-pointer"
                      >
                        Redo Cardio Session
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-border-dark pb-2 mb-3">
                    <span className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                    <h3 className="text-xs uppercase tracking-wider text-brand font-black">
                      Cardio Session Setup
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setInlineCardioMode('timer');
                      }}
                      className={`p-4 border text-center transition-all cursor-pointer flex flex-col items-center gap-2.5 ${
                        inlineCardioMode === 'timer'
                          ? 'bg-brand/10 border-brand text-brand shadow-[0_0_12px_rgba(255,230,0,0.08)]'
                          : 'bg-dark-surface border-border-dark text-[#888] hover:text-[#CCC]'
                      }`}
                    >
                      <Clock className={`w-5 h-5 ${inlineCardioMode === 'timer' ? 'text-brand' : 'text-zinc-500'}`} />
                      <div>
                        <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">Countdown Timer</div>
                        <div className="text-[9px] text-zinc-500 mt-1">Target duration alert</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setInlineCardioMode('free');
                      }}
                      className={`p-4 border text-center transition-all cursor-pointer flex flex-col items-center gap-2.5 ${
                        inlineCardioMode === 'free'
                          ? 'bg-brand/10 border-brand text-brand shadow-[0_0_12px_rgba(255,230,0,0.08)]'
                          : 'bg-dark-surface border-border-dark text-[#888] hover:text-[#CCC]'
                      }`}
                    >
                      <Play className={`w-5 h-5 ${inlineCardioMode === 'free' ? 'text-brand' : 'text-zinc-500'}`} />
                      <div>
                        <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">Free Tracker</div>
                        <div className="text-[9px] text-zinc-500 mt-1">Open stopwatch & GPS</div>
                      </div>
                    </button>
                  </div>

                  {inlineCardioMode === 'timer' && (
                    <div className="p-3.5 bg-black/20 border border-border-dark space-y-1.5 animate-slide-up">
                      <label className="block text-[9px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                        Target Duration (Minutes)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={360}
                        value={inlineCardioTargetMinutes}
                        onChange={(e) => setInlineCardioTargetMinutes(Math.max(1, parseInt(e.target.value) || 15))}
                        className="w-full bg-dark-surface border border-border-dark focus:border-brand focus:outline-none py-1.5 px-3 text-xs text-white font-mono"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setActiveCardioTracking({
                        activity: currentExercise.name,
                        mode: inlineCardioMode,
                        targetMinutes: inlineCardioMode === 'timer' ? inlineCardioTargetMinutes : undefined
                      });
                    }}
                    className="w-full py-3 bg-brand hover:bg-white text-black font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-black text-black" />
                    <span>Start Cardio Tracker</span>
                  </button>
                </div>
              );
            })()}
          </div>
        )}


        </div>

        {/* Exercises back and forward navigation */}
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCurrentExerciseIdx(prev => Math.max(0, prev - 1))}
            disabled={currentExerciseIdx === 0}
            className="flex items-center gap-1.5 px-4 py-3 bg-dark-panel border border-border-dark rounded-none text-xs font-mono font-black uppercase tracking-widest text-white hover:border-brand disabled:opacity-45 disabled:pointer-events-none transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Exercise</span>
          </button>

          <button
            onClick={() => setCurrentExerciseIdx(prev => Math.min(exercises.length - 1, prev + 1))}
            disabled={currentExerciseIdx === exercises.length - 1}
            className="flex items-center gap-1.5 px-4 py-3 bg-dark-panel border border-border-dark rounded-none text-xs font-mono font-black uppercase tracking-widest text-white hover:border-brand disabled:opacity-45 disabled:pointer-events-none transition cursor-pointer"
          >
            <span>Next Exercise</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex gap-4 border-t border-border-dark pt-3 mt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-4 px-4 bg-dark-panel hover:bg-rose-950/20 text-rose-400 hover:text-rose-300 text-xs font-mono font-black uppercase tracking-widest border border-border-dark hover:border-rose-900/40 transition rounded-none cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Cancel Workout</span>
          </button>

          <button
            onClick={finishWorkout}
            className="flex-1 py-4 px-4 bg-white hover:bg-brand text-black font-black uppercase text-xs tracking-tighter transition-colors rounded-none cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Finish Workout</span>
          </button>
        </div>

      </div>

      {/* Guide Instructions Slide-Over Modal */}
      <AnimatePresence>
        {showInstructions && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowInstructions(false)}
              className="absolute inset-0 bg-black"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-dark-panel border border-border-dark rounded-none max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl p-6"
            >
              <button 
                onClick={() => setShowInstructions(false)}
                className="absolute top-4 right-4 p-2 bg-dark-surface text-[#888] hover:text-white border border-border-dark rounded-none transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <span className="p-2 bg-dark-surface border border-border-dark text-brand">
                  <HelpCircle className="w-5 h-5" />
                </span>
                <h3 className="text-xl font-display font-black italic uppercase text-white">How to Perform</h3>
              </div>

              <div className="mb-4 rounded-none overflow-hidden border border-border-dark">
                <img 
                  src={currentExercise.image} 
                  alt={currentExercise.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-44 object-cover opacity-80"
                />
              </div>

              <h4 className="font-display font-black italic uppercase text-white mb-2 text-lg">{currentExercise.name}</h4>
              <p className="text-[#CCC] text-xs leading-relaxed mb-4">
                {INITIAL_EXERCISES.find(e => e.id === currentExercise.exerciseId)?.description}
              </p>

              <h5 className="text-xs font-mono tracking-widest text-brand uppercase font-extrabold mb-3">Step-By-Step Guide</h5>
              <ol className="space-y-3">
                {currentExercise.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-3 text-[#CCC] text-xs leading-relaxed">
                    <span className="flex-shrink-0 w-6 h-6 rounded-none bg-dark-surface border border-border-dark text-brand font-mono text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>

              <button
                onClick={() => setShowInstructions(false)}
                className="w-full mt-6 py-3 bg-white text-black font-black uppercase text-xs tracking-tighter hover:bg-brand transition rounded-none cursor-pointer"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Geolocation Cardio Tracking Session Overlay */}
      {activeCardioTracking && (
        <div className="fixed inset-0 z-50 bg-black">
          <ActiveCardioSession
            activity={activeCardioTracking.activity}
            mode={activeCardioTracking.mode}
            targetMinutes={activeCardioTracking.targetMinutes}
            distanceUnit={distanceUnit}
            onFinish={(stats) => {
              setExercises(prev => {
                const copy = [...prev];
                const targetEx = copy[currentExerciseIdx];
                if (!targetEx.sets || targetEx.sets.length === 0) {
                  targetEx.sets = [{ setId: 1, isCompleted: false }];
                }
                const targetSet = targetEx.sets[0];
                targetSet.duration = stats.durationSeconds;
                targetSet.distance = stats.distanceKm;
                targetSet.elevation = stats.elevationMeters;
                targetSet.gpsPath = stats.gpsPoints;
                targetSet.isCompleted = true;
                return copy;
              });
              setActiveCardioTracking(null);
            }}
            onCancel={() => {
              setActiveCardioTracking(null);
            }}
          />
        </div>
      )}

      {/* Quick Start Next Step choice overlay modal */}
      <AnimatePresence>
        {showQuickStartChoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-dark-panel border border-border-dark p-6 rounded-none max-w-sm w-full shadow-2xl z-50 text-center space-y-5"
            >
              <div className="space-y-2">
                <CheckCircle2 className="w-10 h-10 text-brand mx-auto stroke-[1.5]" />
                <h3 className="text-base font-display font-black uppercase text-white tracking-wide">Exercise Finished!</h3>
                <p className="text-zinc-500 text-xs leading-relaxed">
                  You have completed all sets for the current exercise. What would you like to do next?
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowQuickStartChoice(false);
                    setShowAddExerciseSelector(true);
                  }}
                  className="w-full py-3 bg-brand hover:bg-white text-black font-mono text-xs font-black uppercase tracking-wider transition rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Select Next Exercise</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowQuickStartChoice(false);
                    finishWorkout();
                  }}
                  className="w-full py-3 bg-dark-surface border border-border-dark hover:border-[#666] text-[#CCC] hover:text-white font-mono text-xs font-black uppercase tracking-wider transition rounded-none cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Complete Workout</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Exercise Modal (For Quick Start mid-session addition) */}
      <AnimatePresence>
        {showAddExerciseSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddExerciseSelector(false)}
              className="absolute inset-0 bg-black/90 cursor-pointer"
            />
            
            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-dark-panel border border-border-dark p-6 rounded-none max-w-md w-full shadow-2xl z-50 flex flex-col max-h-[80vh]"
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-border-dark pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-brand" />
                  <h3 className="text-xs uppercase tracking-wider text-brand font-black">Add Next Exercise</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddExerciseSelector(false)}
                  className="p-1 text-[#888] hover:text-white border border-border-dark hover:border-[#444] transition bg-dark-surface cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search & Categories */}
              <div className="space-y-3 mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search exercises..."
                    value={exerciseSearchQuery}
                    onChange={(e) => setExerciseSearchQuery(e.target.value)}
                    className="flex-1 bg-black border border-border-dark focus:border-brand focus:outline-none rounded-none py-2 px-3 text-xs text-white placeholder-zinc-700 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFavoriteExercisesOnly(prev => !prev)}
                    className={`px-3 py-2 text-[10px] font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer border rounded-none ${
                      showFavoriteExercisesOnly 
                        ? 'bg-brand/15 border-brand text-brand shadow-[0_0_8px_rgba(255,230,0,0.15)] font-extrabold' 
                        : 'bg-dark-surface border-border-dark text-[#666] hover:text-[#CCC]'
                    }`}
                    title="Filter by favorite exercises"
                  >
                    <Star className={`w-3.5 h-3.5 ${showFavoriteExercisesOnly ? 'fill-brand text-brand' : 'text-[#666]'}`} />
                    <span className="hidden sm:inline">Favorites</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {['All', 'Chest', 'Back', 'Legs', 'Arms', 'Shoulders', 'Core', 'Cardio'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setExerciseCategoryFilter(cat)}
                      className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase border transition-all cursor-pointer ${
                        exerciseCategoryFilter === cat
                          ? 'bg-brand/10 border-brand text-brand font-extrabold'
                          : 'bg-dark-surface border-border-dark text-[#888] hover:text-[#CCC]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {(() => {
                  const list = [...INITIAL_EXERCISES, ...customExercises].filter(ex => {
                    if (showFavoriteExercisesOnly && !favoriteExerciseIds.includes(ex.id)) return false;

                    const matchesSearch = ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
                    const matchesCategory = exerciseCategoryFilter === 'All' || ex.muscleGroup === exerciseCategoryFilter;
                    return matchesSearch && matchesCategory;
                  });

                  if (list.length === 0) {
                    return (
                      <div className="text-center py-8 text-zinc-600 text-xs font-mono">
                        No matching exercises found.
                      </div>
                    );
                  }

                  return list.map(ex => (
                    <button
                      key={ex.id}
                      type="button"
                      onClick={() => handleAddExerciseToSession(ex)}
                      className="w-full p-3 bg-dark-surface border border-border-dark hover:border-brand/40 text-left flex justify-between items-center cursor-pointer transition group"
                    >
                      <div>
                        <div className="text-xs font-display font-black uppercase text-white tracking-wide group-hover:text-brand transition font-extrabold">
                          {ex.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                          {ex.muscleGroup} | {ex.type === 'reps' ? 'Reps & Weight' : 'Timed Hold'}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-brand transition" />
                    </button>
                  ));
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
