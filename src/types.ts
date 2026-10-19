export type MuscleGroup = 'Chest' | 'Back' | 'Legs' | 'Core' | 'Shoulders' | 'Arms' | 'Full Body' | 'Calisthenics' | 'Cardio';

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  description: string;
  instructions: string[];
  image: string;
  defaultSets: number;
  defaultReps?: number;
  defaultWeight?: number;
  defaultRest: number; // in seconds
  type: 'reps' | 'time' | 'cardio';
  defaultDuration?: number; // in seconds, for time-based exercises
  defaultDistance?: number; // target distance in km
  cardioType?: 'Walking' | 'Running' | 'Sprinting' | 'Cycling' | 'Paddleboarding' | 'Hiking';
}

export interface SetRecord {
  setId: number;
  reps?: number;
  weight?: number;
  duration?: number; // in seconds, for time-based
  distance?: number; // actual/target distance in km
  elevation?: number; // actual/target elevation in meters
  gpsPath?: { lat: number; lng: number; alt: number | null; timestamp: number }[]; // tracked route coordinates
  isCompleted: boolean;
  isPersonalBest?: boolean;
}

export interface WorkoutExercise {
  id: string; // unique instance ID in this workout
  exerciseId: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: SetRecord[];
  restDuration: number; // seconds
  type: 'reps' | 'time' | 'cardio';
  defaultDuration?: number;
  image: string;
  instructions: string[];
  cardioType?: 'Walking' | 'Running' | 'Sprinting' | 'Cycling' | 'Paddleboarding' | 'Hiking';
}

export interface Workout {
  id: string;
  name: string;
  description: string;
  muscleGroup: MuscleGroup;
  exercises: WorkoutExercise[];
  isCustom?: boolean;
}

export interface PersonalBest {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: MuscleGroup;
  maxWeight?: number; // for strength
  maxReps?: number; // for bodyweight or specific reps
  maxDuration?: number; // for time-based (e.g. plank)
  date: string; // YYYY-MM-DD
}

export interface WorkoutHistoryEntry {
  id: string;
  workoutId: string;
  workoutName: string;
  muscleGroup: MuscleGroup;
  date: string; // YYYY-MM-DD
  durationSeconds: number; // total workout time
  totalSetsCompleted: number;
  newPersonalBestsCount: number;
  totalWeightMoved?: number;
  exercises?: WorkoutExercise[];
}

export interface ScheduledWorkout {
  id: string;
  workoutId: string;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
}

export interface WeightLogEntry {
  id: string;
  weight: number;
  unit: 'lbs' | 'kg';
  date: string; // YYYY-MM-DD
  image?: string; // base64 or placeholder URL
  notes?: string;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  amount: number; // in ml
  target: number; // in ml
}

export interface WaterReminderSettings {
  enabled: boolean;
  intervalMinutes: number; // e.g., 60, 120, 180
  startHour: number; // 24h format
  endHour: number; // 24h format
}



