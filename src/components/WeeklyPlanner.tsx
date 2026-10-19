import React, { useState } from 'react';
import { 
  Calendar, Play, Trash2, Plus, X, ChevronRight, Check, Dumbbell, Star, AlertCircle, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Workout, ScheduledWorkout, MuscleGroup } from '../types';
import { PREMADE_WORKOUTS } from '../data';

interface WeeklyPlannerProps {
  customWorkouts: Workout[];
  scheduledWorkouts: ScheduledWorkout[];
  onScheduleWorkout: (day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday', workoutId: string) => void;
  onUnscheduleWorkout: (scheduledId: string) => void;
  onStartWorkout: (workout: Workout) => void;
  favoriteWorkoutIds?: string[];
}

const DAYS_OF_WEEK: ('Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
];

export default function WeeklyPlanner({
  customWorkouts,
  scheduledWorkouts,
  onScheduleWorkout,
  onUnscheduleWorkout,
  onStartWorkout,
  favoriteWorkoutIds = []
}: WeeklyPlannerProps) {
  // State to track workout details inspection
  const [viewingWorkoutDetails, setViewingWorkoutDetails] = useState<Workout | null>(null);
  
  // State to track which day we are adding a workout to (null means modal closed)
  const [activeSchedulingDay, setActiveSchedulingDay] = useState<'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | null>(null);
  
  // State for searching/filtering in the schedule modal
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('All');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  // Combine PREMADE and Custom workouts for scheduling list
  const allAvailableWorkouts = [...PREMADE_WORKOUTS, ...customWorkouts];

  // Filter workouts in the scheduling list
  const filteredWorkouts = allAvailableWorkouts.filter(w => {
    if (showFavoritesOnly && !favoriteWorkoutIds.includes(w.id)) return false;

    const matchesSearch = w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          w.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMuscle = selectedMuscleFilter === 'All' || w.muscleGroup === selectedMuscleFilter;
    return matchesSearch && matchesMuscle;
  });

  // Unique list of muscle groups for filtering
  const muscleGroups = ['All', ...Array.from(new Set(allAvailableWorkouts.map(w => w.muscleGroup)))];

  // Get current day name to highlight "Today"
  const getTodayName = (): string => {
    return DAYS_OF_WEEK[new Date().getDay()];
  };

  const todayName = getTodayName();

  // Helper to resolve a workout reference by ID
  const resolveWorkout = (workoutId: string): Workout | undefined => {
    return allAvailableWorkouts.find(w => w.id === workoutId);
  };

  return (
    <div id="weekly-planner-container" className="space-y-6">
      
      {/* Calendar Header block */}
      <div className="border-b border-border-dark pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-brand">
            <Calendar className="w-5 h-5 stroke-[2]" />
            <h2 className="text-xl md:text-2xl font-display font-black italic uppercase tracking-tight text-white leading-none">Weekly Split Planner</h2>
          </div>
          <p className="text-[#666] text-xs mt-1.5 font-medium max-w-xl">
            Engineer your week. Schedule workout routines to specific days, launch active weightlifting sessions instantly, and keep your consistency locked in.
          </p>
        </div>

        <button
          onClick={() => {
            const blankWorkout: Workout = {
              id: `workout_quick_${Date.now()}`,
              name: 'Quick Workout',
              description: 'Blank quick start session.',
              muscleGroup: 'Full Body',
              exercises: [],
              isCustom: true
            };
            onStartWorkout(blankWorkout);
          }}
          className="flex-shrink-0 py-2.5 px-4 bg-brand hover:bg-white text-black text-xs font-black uppercase tracking-wider rounded-none transition cursor-pointer flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-black text-black stroke-[3]" />
          <span>Quick Start</span>
        </button>
      </div>

      {/* 7-DAY CALENDAR GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3 sm:gap-4">
        {DAYS_OF_WEEK.map((day) => {
          const isToday = day === todayName;
          const daySchedule = scheduledWorkouts.filter(sw => sw.day === day);

          return (
            <div 
              key={day}
              className={`flex flex-col bg-dark-panel border transition-all duration-200 relative ${
                isToday 
                  ? 'border-brand ring-1 ring-brand/20 bg-dark-panel shadow-[0_0_15px_rgba(var(--color-brand-dynamic),0.1)]' 
                  : 'border-border-dark hover:border-brand/20'
              }`}
            >
              {/* Day Header */}
              <div className={`p-3 border-b flex items-center justify-between ${
                isToday 
                  ? 'bg-brand/10' 
                  : 'bg-dark-panel'
              } ${
                isToday 
                  ? 'border-brand text-brand' 
                  : 'border-border-dark text-[#888]'
              }`}>
                <span className="text-xs font-mono font-black uppercase tracking-wider">{day}</span>
                {isToday && (
                  <span className="text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 bg-brand text-black tracking-tight rounded-none">
                    Today
                  </span>
                )}
              </div>

              {/* Day Scheduled Workouts List */}
              <div className="flex-1 p-3 space-y-2 min-h-[140px] flex flex-col justify-between">
                
                {/* Workouts container */}
                <div className="space-y-2">
                  {daySchedule.length === 0 ? (
                    <div className="py-8 text-center flex flex-col items-center justify-center gap-1.5 opacity-40">
                      <div className="w-5 h-[1px] bg-[#555]" />
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#555] font-bold">Rest Day</span>
                    </div>
                  ) : (
                    daySchedule.map((sw) => {
                      const workout = resolveWorkout(sw.workoutId);
                      if (!workout) return null;

                      return (
                        <div 
                          key={sw.id}
                          className="bg-dark-panel border border-border-dark hover:border-brand/30 p-2.5 rounded-none flex flex-col justify-between group transition relative"
                        >
                          {/* Close/Remove from schedule button */}
                          <button
                            onClick={() => onUnscheduleWorkout(sw.id)}
                            className="absolute top-1.5 right-1.5 transition-all p-1 text-[#666] hover:text-rose-500 hover:bg-rose-950/20 border border-transparent hover:border-rose-950/30 rounded-none cursor-pointer z-10"
                            title="Remove from planner"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>

                          <div>
                            <span className="text-[8px] bg-dark-panel border border-border-dark text-brand px-1.5 py-0.5 font-bold font-mono uppercase rounded-none tracking-wide inline-block mb-1">
                              {workout.muscleGroup}
                            </span>
                            <h4 className="text-[11px] font-display font-black uppercase tracking-tight text-white leading-tight line-clamp-2 pr-4">
                              {workout.name}
                            </h4>
                          </div>

                           <div className="mt-3 border-t border-border-dark/60 pt-2 flex items-center justify-between">
                            <span className="text-[9px] text-[#555] font-mono">
                              {workout.muscleGroup === 'Cardio' ? 'Cardio Activity' : `${workout.exercises.length} ex`}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              {workout.muscleGroup !== 'Cardio' && (
                                <button
                                  onClick={() => setViewingWorkoutDetails(workout)}
                                  className="px-2 py-1 border border-border-dark hover:border-brand/40 text-zinc-500 hover:text-brand text-[9px] font-mono font-black uppercase tracking-tighter flex items-center gap-0.5 transition cursor-pointer"
                                  title="View Routine Details"
                                >
                                  <HelpCircle className="w-2.5 h-2.5 text-brand" />
                                  <span>Info</span>
                                </button>
                              )}
                              <button
                                onClick={() => onStartWorkout(workout)}
                                className="px-2 py-1 bg-white hover:bg-brand text-black text-[9px] font-mono font-black uppercase tracking-tighter flex items-center gap-0.5 transition cursor-pointer"
                                  title="Launch Workout Session"
                              >
                                <Play className="w-2.5 h-2.5 fill-black" />
                                <span>Start</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add button always at the bottom */}
                <button
                  onClick={() => setActiveSchedulingDay(day)}
                  className="w-full mt-3 py-1.5 border border-dashed border-border-dark hover:border-brand/40 text-[10px] font-mono text-[#555] hover:text-brand transition flex items-center justify-center gap-1 cursor-pointer bg-dark-panel"
                >
                  <Plus className="w-3 h-3" />
                  <span>Schedule Split</span>
                </button>

              </div>

            </div>
          );
        })}
      </div>

      {/* SCHEDULING DIALOG MODAL */}
      <AnimatePresence>
        {activeSchedulingDay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveSchedulingDay(null)}
              className="absolute inset-0 bg-black/90 cursor-pointer"
            />

            {/* Modal Dialog Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              className="relative bg-dark-panel border border-border-dark p-6 rounded-none max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] z-50"
            >
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-dark pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-brand" />
                  <div>
                    <h3 className="text-sm font-display font-black uppercase text-white tracking-wide">
                      Schedule Routine
                    </h3>
                    <p className="text-[10px] text-brand font-mono uppercase font-black">
                      Target Day: {activeSchedulingDay}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveSchedulingDay(null)}
                  className="p-1 text-[#666] hover:text-white border border-border-dark rounded-none transition cursor-pointer bg-dark-surface"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Filters & Search Row */}
              <div className="space-y-3 mb-4">
                {/* Search Bar + Favorites Filter */}
                <div className="flex gap-2">
                  <input 
                    type="text"
                    placeholder="Search routines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-dark-surface border border-border-dark focus:border-brand focus:outline-none rounded-none py-2 px-3 text-xs text-white placeholder-[#555] transition font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowFavoritesOnly(prev => !prev)}
                    className={`px-3 py-2 text-[10px] font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer border rounded-none ${
                      showFavoritesOnly 
                        ? 'bg-brand/15 border-brand text-brand shadow-[0_0_8px_rgba(255,230,0,0.15)] font-extrabold' 
                        : 'bg-dark-surface border-border-dark text-[#666] hover:text-[#CCC]'
                    }`}
                    title="Filter by favorite routines"
                  >
                    <Star className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-brand text-brand' : 'text-[#666]'}`} />
                    <span className="hidden sm:inline">Favorites Only</span>
                  </button>
                </div>

                {/* Muscle Quick Filters */}
                <div className="flex flex-wrap gap-1.5">
                  {muscleGroups.map((muscle) => (
                    <button
                      key={muscle}
                      onClick={() => setSelectedMuscleFilter(muscle)}
                      className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase border transition-all cursor-pointer ${
                        selectedMuscleFilter === muscle 
                          ? 'bg-brand/10 border-brand text-brand font-extrabold' 
                          : 'bg-dark-surface border-border-dark text-[#666] hover:text-[#CCC]'
                      }`}
                    >
                      {muscle}
                    </button>
                  ))}
                </div>
              </div>

              {/* Routines Selection Area */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                {filteredWorkouts.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-border-dark bg-dark-surface/20 flex flex-col items-center gap-1">
                    <AlertCircle className="w-6 h-6 text-[#444]" />
                    <span className="text-xs text-[#555] font-mono">No matching workout splits found.</span>
                  </div>
                ) : (
                  filteredWorkouts.map((workout) => (
                    <div 
                      key={workout.id}
                      className="p-4 bg-dark-surface border border-border-dark hover:border-brand/40 flex items-center justify-between gap-4 transition group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="bg-dark-panel border border-border-dark text-brand text-[9px] font-mono px-2 py-0.5 rounded-none font-bold uppercase">
                            {workout.muscleGroup}
                          </span>
                          {workout.isCustom && (
                            <span className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[8px] font-mono px-1.5 py-0.2 rounded-none font-bold uppercase">
                              Custom
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-display font-black uppercase text-white mt-1.5 tracking-wide line-clamp-1">
                          {workout.name}
                        </h4>
                        <p className="text-[#666] text-[10px] leading-relaxed mt-0.5 line-clamp-1 font-medium">
                          {workout.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {workout.muscleGroup !== 'Cardio' && (
                          <button
                            type="button"
                            onClick={() => setViewingWorkoutDetails(workout)}
                            className="p-1.5 border border-border-dark hover:border-brand/40 text-zinc-500 hover:text-brand transition select-none cursor-pointer flex items-center justify-center rounded-none"
                            title="View Routine Details"
                          >
                            <HelpCircle className="w-3.5 h-3.5 text-brand" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            onScheduleWorkout(activeSchedulingDay, workout.id);
                            setActiveSchedulingDay(null);
                          }}
                          className="py-1.5 px-3 bg-brand text-black font-mono font-black uppercase text-[10px] tracking-wider rounded-none hover:bg-white transition flex items-center gap-1 cursor-pointer"
                        >
                          <span>Schedule</span>
                          <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Info text at bottom */}
              <div className="mt-4 pt-3 border-t border-border-dark text-[10px] text-[#555] font-mono flex items-center gap-1">
                <Dumbbell className="w-3.5 h-3.5 text-brand" />
                <span>You can schedule as many routines per day as you want.</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Routine Inspection Modal inside Weekly Planner */}
      <AnimatePresence>
        {viewingWorkoutDetails && (
          <div 
            onClick={() => setViewingWorkoutDetails(null)}
            className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 z-[9999] cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              onTouchEnd={(e) => e.stopPropagation()}
              className="bg-zinc-950 border-2 border-brand p-5 w-full max-w-md h-[500px] max-h-[80vh] flex flex-col space-y-4 cursor-default text-left shadow-[0_0_50px_rgba(255,230,0,0.2)] font-mono text-xs overflow-hidden"
            >
              <div className="flex justify-between items-start border-b border-border-dark/60 pb-2.5">
                <div>
                  <h3 className="text-sm font-display font-black text-brand uppercase tracking-wider leading-none">
                    {viewingWorkoutDetails.name}
                  </h3>
                  <span className="text-[9px] text-zinc-500 font-mono uppercase block mt-1">
                    Target Muscle: {viewingWorkoutDetails.muscleGroup}
                  </span>
                </div>
                <button 
                  onClick={() => setViewingWorkoutDetails(null)}
                  className="w-6 h-6 flex items-center justify-center border border-border-dark hover:border-brand text-zinc-500 hover:text-white font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {viewingWorkoutDetails.description && (
                <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                  {viewingWorkoutDetails.description}
                </p>
              )}

              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {viewingWorkoutDetails.exercises.map((ex, idx) => {
                  const numSets = ex.sets.length;
                  const firstSetReps = ex.sets[0]?.reps || 10;
                  return (
                    <div key={ex.id} className="border border-border-dark/40 bg-black/40 p-3 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-white font-mono">{idx + 1}. {ex.name}</span>
                        <span className="text-[8px] bg-dark-surface px-2 py-0.5 border border-border-dark text-zinc-400 font-mono uppercase">
                          {ex.muscleGroup}
                        </span>
                      </div>
                      <div className="text-[9px] text-zinc-500 font-mono flex items-center gap-3 mt-1">
                        <span>Sets: <strong className="text-zinc-300 font-bold">{numSets}</strong></span>
                        <span>Target: <strong className="text-zinc-300 font-bold">{firstSetReps} Reps</strong></span>
                        {ex.restDuration > 0 && (
                          <span>Rest: <strong className="text-zinc-300 font-bold">{ex.restDuration}s</strong></span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setViewingWorkoutDetails(null)}
                className="w-full text-center py-2.5 bg-brand text-black text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
