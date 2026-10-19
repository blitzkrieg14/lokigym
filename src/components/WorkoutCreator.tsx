import React, { useState } from 'react';
import { Exercise, Workout, WorkoutExercise, SetRecord, MuscleGroup } from '../types';
import { INITIAL_EXERCISES } from '../data';
import { 
  Plus, Dumbbell, Save, ArrowLeft, ArrowRight, Check, 
  Sparkles, BookOpen, Star, Heart, X, ChevronLeft, ChevronRight, Play
} from 'lucide-react';

interface WorkoutCreatorProps {
  customExercises: Exercise[];
  onAddCustomExercise: (newExercise: Exercise) => void;
  onSaveWorkout: (newWorkout: Workout, startNow?: boolean) => void;
  onClose: () => void;
  favoriteExerciseIds: string[];
  onToggleFavorite: (exerciseId: string) => void;
  weightUnit?: 'lbs' | 'kg';
}

export default function WorkoutCreator({
  customExercises,
  onAddCustomExercise,
  onSaveWorkout,
  onClose,
  favoriteExerciseIds,
  onToggleFavorite,
  weightUnit = 'lbs'
}: WorkoutCreatorProps) {
  const [workoutName, setWorkoutName] = useState('');
  const [workoutDesc, setWorkoutDesc] = useState('');
  const [selectedMuscles, setSelectedMuscles] = useState<MuscleGroup[]>([]);
  const [step, setStep] = useState<'details' | 'exercises' | 'sets'>('details');
  
  // Selected Exercises (allows duplicates for circuits)
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [exerciseConfigs, setExerciseConfigs] = useState<WorkoutExercise[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);

  // Quick add exercise modal form state
  const [newExName, setNewExName] = useState('');
  const [newExMuscle, setNewExMuscle] = useState<MuscleGroup>('Chest');
  const [newExDesc, setNewExDesc] = useState('');
  const [newExType, setNewExType] = useState<'reps' | 'time'>('reps');
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState(12);
  const [newExRest, setNewExRest] = useState(60);
  const [newExDuration, setNewExDuration] = useState(15);

  const allExercises = [...INITIAL_EXERCISES, ...customExercises];

  // Filter exercises to match selected muscle groups (or show all if full body)
  const filteredExercises = allExercises.filter(ex => {
    if (showFavoritesOnly && !favoriteExerciseIds.includes(ex.id)) return false;
    if (selectedMuscles.includes('Full Body')) return ex.muscleGroup !== 'Cardio';
    return selectedMuscles.includes(ex.muscleGroup);
  });

  const handleToggleMuscle = (muscle: MuscleGroup) => {
    setSelectedMuscles(prev => {
      if (prev.includes(muscle)) {
        return prev.filter(m => m !== muscle);
      } else {
        if (muscle === 'Full Body') {
          return ['Full Body'];
        }
        return [...prev.filter(m => m !== 'Full Body'), muscle];
      }
    });
  };

  const handleToggleExerciseSelection = (id: string) => {
    setSelectedExerciseIds(prev => [...prev, id]);
  };

  const handleNextToExercises = () => {
    if (!workoutName.trim()) {
      alert("Please provide a name for your custom workout!");
      return;
    }
    if (selectedMuscles.length === 0) {
      alert("Please select at least one target muscle group!");
      return;
    }
    setStep('exercises');
  };

  const handleNextToSets = () => {
    if (selectedExerciseIds.length === 0) {
      alert("Please select at least one exercise for your workout!");
      return;
    }

    // Build initial configurations for selected exercises preserving duplicates
    const configs = selectedExerciseIds.map((exId, idx) => {
      const original = allExercises.find(e => e.id === exId);
      if (!original) return null;
      const isCardio = original.type === 'cardio';
      const setsArray: SetRecord[] = isCardio
        ? [{ setId: 1, isCompleted: false }]
        : Array.from({ length: original.defaultSets || 1 }).map((_, sIdx) => ({
            setId: sIdx + 1,
            reps: original.type === 'reps' ? (original.defaultReps || 10) : undefined,
            weight: original.type === 'reps' ? (original.defaultWeight || 0) : undefined,
            duration: original.type === 'time' ? (original.defaultDuration || 60) : undefined,
            isCompleted: false
          }));

      return {
        id: `custom_${exId}_${Date.now()}_${idx}`,
        exerciseId: original.id,
        name: original.name,
        muscleGroup: original.muscleGroup,
        sets: setsArray,
        restDuration: isCardio ? 0 : original.defaultRest || 60,
        type: original.type,
        defaultDuration: original.defaultDuration,
        image: original.image,
        instructions: original.instructions
      };
    }).filter(Boolean) as WorkoutExercise[];

    setExerciseConfigs(configs);
    setStep('sets');
  };

  const handleAddSet = (configIdx: number) => {
    setExerciseConfigs(prev => {
      const copy = [...prev];
      const target = copy[configIdx];
      const nextId = target.sets.length + 1;
      const lastSet = target.sets[target.sets.length - 1];
      target.sets.push({
        setId: nextId,
        reps: lastSet ? lastSet.reps : 10,
        weight: lastSet ? lastSet.weight : 0,
        duration: lastSet ? lastSet.duration : 60,
        distance: lastSet ? lastSet.distance : 1.0,
        isCompleted: false
      });
      return copy;
    });
  };

  const handleRemoveSet = (configIdx: number) => {
    setExerciseConfigs(prev => {
      const copy = [...prev];
      if (copy[configIdx].sets.length > 1) {
        copy[configIdx].sets.pop();
      }
      return copy;
    });
  };

  const handleSetFieldChange = (
    configIdx: number,
    setIdx: number,
    field: 'reps' | 'weight' | 'duration' | 'distance',
    value: number
  ) => {
    setExerciseConfigs(prev => {
      const copy = [...prev];
      const targetSet = copy[configIdx].sets[setIdx];
      if (field === 'reps') targetSet.reps = Math.max(0, value);
      if (field === 'weight') targetSet.weight = Math.max(0, value);
      if (field === 'duration') targetSet.duration = Math.max(0, value);
      if (field === 'distance') targetSet.distance = Math.max(0, value);
      return copy;
    });
  };

  const handleRestChange = (configIdx: number, value: number) => {
    setExerciseConfigs(prev => {
      const copy = [...prev];
      copy[configIdx].restDuration = Math.max(0, value);
      return copy;
    });
  };

  const handleRemoveExerciseConfig = (configIdx: number) => {
    setExerciseConfigs(prev => prev.filter((_, idx) => idx !== configIdx));
  };

  const handleSaveWorkout = (startNow: boolean = false) => {
    const primaryMuscleGroup = selectedMuscles.includes('Full Body') || selectedMuscles.length > 1
      ? 'Full Body'
      : selectedMuscles[0];

    const finalWorkout: Workout = {
      id: `workout_custom_${Date.now()}`,
      name: workoutName,
      description: workoutDesc || `Custom ${selectedMuscles.join(', ')} routine.`,
      muscleGroup: primaryMuscleGroup,
      exercises: exerciseConfigs,
      isCustom: true
    };

    onSaveWorkout(finalWorkout, startNow);
  };

  const handleCreateCustomExercise = () => {
    if (!newExName.trim()) {
      alert("Please provide an exercise name!");
      return;
    }

    const newEx: Exercise = {
      id: `custom_exercise_${Date.now()}`,
      name: newExName,
      muscleGroup: newExMuscle,
      description: newExDesc,
      instructions: [],
      type: newExMuscle === 'Cardio' ? 'cardio' : newExType,
      defaultSets: newExSets,
      defaultReps: newExType === 'reps' ? newExReps : undefined,
      defaultRest: newExRest,
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200&auto=format&fit=crop'
    };

    onAddCustomExercise(newEx);
    setSelectedExerciseIds(prev => [...prev, newEx.id]);
    setShowAddExerciseModal(false);
    
    // Reset modal form
    setNewExName('');
    setNewExDesc('');
    setNewExSets(3);
    setNewExReps(12);
    setNewExRest(60);
    setNewExDuration(15);
  };

  return (
    <div id="workout-creator" className="max-w-4xl mx-auto bg-dark-panel border border-border-dark rounded-none shadow-xl font-sans flex flex-col h-[82vh] md:h-[78vh]">
      
      {/* Header & Step Wizard - Static Top */}
      <div className="flex-shrink-0 p-4 md:p-6 pb-2">
        <div className="flex justify-between items-center mb-5 border-b border-border-dark pb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-black italic uppercase text-white tracking-tight flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-brand rotate-45" />
              <span>Assemble Routine</span>
            </h2>
            <p className="text-[#CCC] text-xs mt-1">Build a high-performance workout tailored to your splits.</p>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="text-white hover:text-brand text-xs font-mono font-bold uppercase px-3 py-1.5 rounded-none border border-border-dark bg-dark-surface transition cursor-pointer"
          >
            Cancel
          </button>
        </div>

        {/* Progress Wizard tracker */}
        <div className="grid grid-cols-3 gap-2 mb-2 text-center text-[9px] font-mono tracking-widest uppercase font-bold">
          <div className={`pb-2 border-b-2 ${step === 'details' ? 'border-brand text-brand font-black' : 'border-border-dark text-[#555]'}`}>
            1. Workout Details
          </div>
          <div className={`pb-2 border-b-2 ${step === 'exercises' ? 'border-brand text-brand font-black' : 'border-border-dark text-[#555]'}`}>
            2. Pick Movements
          </div>
          <div className={`pb-2 border-b-2 ${step === 'sets' ? 'border-brand text-brand font-black' : 'border-border-dark text-[#555]'}`}>
            3. Configure Sets
          </div>
        </div>
      </div>

      {/* Scrollable Content Body */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 pt-2 min-h-0 space-y-6">
        
        {/* STEP 1: WORKOUT DETAILS */}
        {step === 'details' && (
          <div className="space-y-6">
            <div className="bg-dark-surface/40 border border-border-dark p-5 rounded-none">
              <h3 className="text-sm font-display font-black italic uppercase text-white mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand" />
                <span>Primary Focus & Description</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-[#666] uppercase tracking-widest mb-1.5 font-bold">Workout Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Hypertrophy Chest, Friday Shred..." 
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    className="w-full bg-dark-surface border border-border-dark hover:border-brand/20 focus:border-brand focus:outline-none rounded-none py-2.5 px-4 text-sm text-white font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-[#666] uppercase tracking-widest mb-1.5 font-bold">Short Description</label>
                  <textarea 
                    rows={2}
                    placeholder="Describe your goals, targets, or specific directions..." 
                    value={workoutDesc}
                    onChange={(e) => setWorkoutDesc(e.target.value)}
                    className="w-full bg-dark-surface border border-border-dark hover:border-brand/20 focus:border-brand focus:outline-none rounded-none py-2.5 px-4 text-sm text-white font-medium transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="bg-dark-surface/40 border border-border-dark p-5 rounded-none space-y-4">
              <div className="space-y-1">
                <h3 className="text-sm font-display font-black italic uppercase text-white flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-brand" />
                  <span>Select Target Muscles</span>
                </h3>
                <p className="text-[#888] text-[10px] uppercase font-mono">Pick one or more targeted muscle regions</p>
              </div>

              <div className="pt-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['Chest', 'Back', 'Legs', 'Core', 'Shoulders', 'Arms', 'Full Body', 'Calisthenics', 'Cardio'] as MuscleGroup[]).map(muscle => {
                    const isSelected = selectedMuscles.includes(muscle);
                    return (
                      <button
                        key={muscle}
                        type="button"
                        onClick={() => handleToggleMuscle(muscle)}
                        className={`py-2 px-3 rounded-none text-xs font-mono font-bold uppercase border transition-all text-center cursor-pointer ${
                          isSelected 
                            ? 'bg-brand/10 border-brand text-brand font-bold shadow-[0_0_12px_rgba(255,230,0,0.1)] font-extrabold' 
                            : 'bg-dark-surface border-border-dark text-[#666] hover:text-[#CCC]'
                        }`}
                      >
                        {muscle}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CHOOSE EXERCISES */}
        {step === 'exercises' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-[#666] text-xs font-mono uppercase font-bold">
                  <BookOpen className="w-4 h-4 text-brand" />
                  <span>Matching <strong className="text-[#CCC]">{selectedMuscles.join(', ')}</strong></span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFavoritesOnly(prev => !prev)}
                  className={`py-1 px-2 text-[10px] font-mono font-bold uppercase transition flex items-center gap-1.5 cursor-pointer border rounded-none ${
                    showFavoritesOnly 
                      ? 'bg-brand/15 border-brand text-brand shadow-[0_0_8px_rgba(255,230,0,0.15)]' 
                      : 'bg-dark-surface border-border-dark text-[#666] hover:text-[#CCC]'
                  }`}
                  title="Filter by favorite movements"
                >
                  <Star className={`w-3 h-3 ${showFavoritesOnly ? 'fill-brand text-brand' : 'text-[#666]'}`} />
                  <span>Favorites Only</span>
                </button>
              </div>
              
              <button
                type="button"
                onClick={() => setShowAddExerciseModal(true)}
                className="py-1.5 px-3 bg-dark-panel hover:bg-dark-surface text-brand font-bold text-xs font-mono uppercase rounded-none transition flex items-center gap-1 border border-border-dark cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Custom Move</span>
              </button>
            </div>

            {/* Selected Routine Sequence Preview */}
            {selectedExerciseIds.length > 0 && (
              <div className="bg-dark-surface/40 border border-border-dark p-4 rounded-none space-y-3">
                <div className="flex justify-between items-center border-b border-border-dark pb-2">
                  <h4 className="text-xs font-mono font-bold text-brand uppercase tracking-wider">
                    Routine Sequence ({selectedExerciseIds.length} Exercises)
                  </h4>
                  <button
                    onClick={() => setSelectedExerciseIds([])}
                    className="text-[10px] font-mono text-rose-400 hover:text-rose-300 uppercase cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 max-h-[140px] overflow-y-auto p-1">
                  {selectedExerciseIds.map((exId, idx) => {
                    const ex = allExercises.find(e => e.id === exId);
                    if (!ex) return null;
                    return (
                      <div 
                        key={`${exId}_${idx}`}
                        className="bg-dark-panel border border-border-dark pl-2 pr-1.5 py-1 flex items-center gap-2 text-xs font-mono"
                      >
                        <span className="text-[#666] font-bold">{idx + 1}.</span>
                        <span className="text-white font-medium max-w-[120px] truncate">{ex.name}</span>
                        <div className="flex items-center gap-1 ml-1 border-l border-border-dark pl-1.5">
                          <button
                            onClick={() => {
                              if (idx === 0) return;
                              setSelectedExerciseIds(prev => {
                                const copy = [...prev];
                                const tmp = copy[idx];
                                copy[idx] = copy[idx - 1];
                                copy[idx - 1] = tmp;
                                return copy;
                              });
                            }}
                            disabled={idx === 0}
                            className="p-0.5 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move up"
                          >
                            <ChevronLeft className="w-3.5 h-3.5 rotate-90" />
                          </button>
                          <button
                            onClick={() => {
                              if (idx === selectedExerciseIds.length - 1) return;
                              setSelectedExerciseIds(prev => {
                                const copy = [...prev];
                                const tmp = copy[idx];
                                copy[idx] = copy[idx + 1];
                                copy[idx + 1] = tmp;
                                return copy;
                              });
                            }}
                            disabled={idx === selectedExerciseIds.length - 1}
                            className="p-0.5 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer"
                            title="Move down"
                          >
                            <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedExerciseIds(prev => prev.filter((_, i) => i !== idx));
                            }}
                            className="p-0.5 text-rose-400 hover:text-rose-300 cursor-pointer ml-0.5"
                            title="Remove"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[45vh] overflow-y-auto pr-1">
              {filteredExercises.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-[#666] text-xs font-mono uppercase">
                  {showFavoritesOnly 
                    ? 'No favorite exercises match the current selection.' 
                    : 'No exercises found matching this muscle group. Use "Create Custom Move" above!'}
                </div>
              ) : (
                filteredExercises.map(ex => {
                  const selectCount = selectedExerciseIds.filter(id => id === ex.id).length;
                  const isSelected = selectCount > 0;
                  const isFav = favoriteExerciseIds.includes(ex.id);
                  return (
                    <div 
                      key={ex.id}
                      onClick={() => handleToggleExerciseSelection(ex.id)}
                      className={`p-4 rounded-none border transition-all cursor-pointer flex gap-3 items-center ${
                        isSelected 
                          ? 'bg-brand/5 border-brand shadow-[0_0_12px_rgba(255,230,0,0.1)]' 
                          : 'bg-dark-surface border-border-dark hover:border-brand/20'
                      }`}
                    >
                      {/* Favorite Star Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(ex.id);
                        }}
                        className="p-1 hover:scale-110 transition cursor-pointer flex-shrink-0 focus:outline-none"
                        title={isFav ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star className={`w-4 h-4 transition ${isFav ? 'fill-brand text-brand drop-shadow-[0_0_4px_#FFE600]' : 'text-[#444] hover:text-[#CCC]'}`} />
                      </button>

                      <div className="w-12 h-12 rounded-none overflow-hidden flex-shrink-0 bg-black border border-border-dark">
                        <img 
                          src={ex.image} 
                          alt={ex.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-80" 
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono uppercase font-bold text-brand">{ex.muscleGroup}</span>
                          <span className="text-[10px] text-[#666] font-mono font-bold uppercase">• {ex.type === 'reps' ? 'Reps' : 'Timed'}</span>
                        </div>
                        <h4 className="font-display font-black italic uppercase text-white text-xs truncate leading-none mt-1">{ex.name}</h4>
                        <p className="text-[#CCC] text-[10px] line-clamp-1 leading-relaxed mt-0.5">{ex.description}</p>
                      </div>

                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <div className="flex items-center border border-brand bg-brand/10 font-mono text-xs">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedExerciseIds(prev => {
                                  const lastIdx = prev.lastIndexOf(ex.id);
                                  return lastIdx === -1 ? prev : prev.filter((_, i) => i !== lastIdx);
                                });
                              }}
                              className="px-2 py-1 hover:bg-brand/20 text-brand font-bold cursor-pointer"
                              title="Decrease occurrence"
                            >
                              -
                            </button>
                            <span className="px-2 font-bold text-white text-xs">{selectCount}x</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedExerciseIds(prev => [...prev, ex.id]);
                              }}
                              className="px-2 py-1 hover:bg-brand/20 text-brand font-bold cursor-pointer"
                              title="Add another occurrence"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-none flex items-center justify-center border border-border-dark text-transparent hover:border-brand transition-all">
                            <Plus className="w-3 h-3 text-[#555] hover:text-[#CCC]" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* STEP 3: CONFIGURE SETS */}
        {step === 'sets' && (
          <div className="space-y-6">
            <div className="space-y-4">
              {exerciseConfigs.map((config, cIdx) => {
                const isCardio = config.type === 'cardio';
                return (
                  <div 
                    key={config.id}
                    className="bg-dark-surface/40 border border-border-dark p-4 rounded-none"
                  >
                    <div className="flex justify-between items-start mb-3 border-b border-border-dark pb-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase font-bold text-brand">{config.muscleGroup}</span>
                        <h4 className="font-display font-black italic uppercase text-white text-sm">{config.name}</h4>
                      </div>
                      
                      {!isCardio && (
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[#666] uppercase font-bold">Rest:</span>
                          <input 
                            type="number"
                            value={config.restDuration}
                            onChange={(e) => handleRestChange(cIdx, parseInt(e.target.value) || 0)}
                            className="w-14 bg-dark-surface border border-border-dark text-white font-mono text-xs text-center font-bold rounded-none py-1.5 px-1 focus:outline-none focus:border-brand"
                          />
                          <span className="text-[10px] font-mono text-[#666] uppercase font-bold">secs</span>
                        </div>
                      )}
                    </div>

                    {isCardio ? (
                      <div className="bg-dark-panel border border-border-dark/65 p-4 text-center text-zinc-400 text-xs font-mono uppercase tracking-wide">
                        Timer countdown & Free tracker GPS modes will trigger when you reach this activity in your active workout session.
                      </div>
                    ) : (
                      <>
                        <div className="space-y-2 mb-3">
                          {config.sets.map((set, sIdx) => (
                            <div key={set.setId} className="grid grid-cols-12 items-center gap-2 p-2 bg-dark-surface/50 rounded-none border border-border-dark">
                              <span className="col-span-2 text-xs font-mono font-bold text-[#666] text-center">Set {set.setId}</span>
                              
                              {config.type === 'reps' ? (
                                <>
                                  <div className="col-span-5 flex items-center justify-center gap-1 bg-dark-panel border border-border-dark py-1.5 px-2 rounded-none">
                                    <span className="text-[9px] font-mono text-[#555] uppercase font-bold">Reps</span>
                                    <input 
                                      type="number"
                                      value={set.reps || 0}
                                      onChange={(e) => handleSetFieldChange(cIdx, sIdx, 'reps', parseInt(e.target.value) || 0)}
                                      className="w-12 bg-transparent text-center font-mono font-bold text-white text-xs focus:outline-none"
                                    />
                                  </div>

                                  <div className="col-span-5 flex items-center justify-center gap-1 bg-dark-panel border border-border-dark py-1.5 px-2 rounded-none">
                                    <span className="text-[9px] font-mono text-[#555] uppercase font-bold">Weight</span>
                                    <input 
                                      type="number"
                                      value={set.weight ? (weightUnit === 'kg' ? Math.round(set.weight * 0.45359237) : set.weight) : 0}
                                      onChange={(e) => {
                                        const val = parseInt(e.target.value) || 0;
                                        const storedVal = weightUnit === 'kg' ? Math.round(val / 0.45359237) : val;
                                        handleSetFieldChange(cIdx, sIdx, 'weight', storedVal);
                                      }}
                                      className="w-12 bg-transparent text-center font-mono font-bold text-white text-xs focus:outline-none"
                                    />
                                    <span className="text-[9px] text-[#555] font-mono font-bold">{weightUnit}</span>
                                  </div>
                                </>
                              ) : (
                                <div className="col-span-10 flex items-center justify-center gap-1 bg-dark-panel border border-border-dark py-1.5 px-2 rounded-none">
                                  <span className="text-[9px] font-mono text-[#555] uppercase font-bold">Hold Time</span>
                                  <input 
                                    type="number"
                                    value={set.duration || 0}
                                    onChange={(e) => handleSetFieldChange(cIdx, sIdx, 'duration', parseInt(e.target.value) || 0)}
                                    className="w-14 bg-transparent text-center font-mono font-bold text-white text-xs focus:outline-none"
                                    step={15}
                                  />
                                  <span className="text-[9px] text-[#555] font-mono font-bold">seconds</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex gap-2 justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveSet(cIdx)}
                            disabled={config.sets.length <= 1}
                            className="py-1.5 px-3 bg-dark-panel border border-border-dark hover:bg-border-dark text-rose-400 hover:text-rose-300 rounded-none text-[10px] font-mono font-bold uppercase disabled:opacity-40 transition cursor-pointer"
                          >
                            - Remove Set
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAddSet(cIdx)}
                            className="py-1.5 px-3 bg-dark-panel border border-border-dark hover:bg-border-dark text-brand hover:text-white rounded-none text-[10px] font-mono font-bold uppercase transition flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add Set</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Static Footer Navigation - Static Bottom */}
      <div className="flex-shrink-0 p-4 md:p-6 border-t border-border-dark bg-black/40 flex justify-between items-center">
        {step === 'details' && (
          <div className="w-full flex justify-end">
            <button
              type="button"
              onClick={handleNextToExercises}
              className="py-2.5 px-5 bg-white hover:bg-brand text-black font-mono font-black uppercase text-xs tracking-wider rounded-none transition flex items-center gap-1 cursor-pointer"
            >
              <span>Next: Pick Exercises</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'exercises' && (
          <>
            <button
              type="button"
              onClick={() => setStep('details')}
              className="py-2.5 px-4 bg-dark-surface hover:bg-border-dark border border-border-dark text-white font-mono font-bold uppercase text-xs rounded-none transition flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <span className="text-xs font-mono text-[#666] uppercase font-bold">
              Selected <strong className="text-white font-bold">{selectedExerciseIds.length}</strong> movements
            </span>

            <button
              type="button"
              onClick={handleNextToSets}
              className="py-2.5 px-5 bg-white hover:bg-brand text-black font-mono font-black uppercase text-xs tracking-wider rounded-none transition flex items-center gap-1 cursor-pointer"
            >
              <span>Next: Adjust Sets</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}

        {step === 'sets' && (
          <>
            <button
              type="button"
              onClick={() => setStep('exercises')}
              className="py-2.5 px-4 bg-dark-surface hover:bg-border-dark border border-border-dark text-white font-mono font-bold uppercase text-xs rounded-none transition flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveWorkout(false)}
                className="py-2.5 px-4 bg-dark-surface hover:bg-border-dark border border-border-dark text-white font-mono font-bold uppercase text-xs rounded-none transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4 text-[#AAA]" />
                <span>Save & Register</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveWorkout(true)}
                className="py-3 px-5 bg-white hover:bg-brand text-black font-mono font-black uppercase text-xs tracking-wider rounded-none transition flex items-center gap-1.5 shadow-[0_0_16px_rgba(255,230,0,0.15)] cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Save & Start Now</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* QUICK ADD CUSTOM EXERCISE MODAL */}
      {showAddExerciseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85" onClick={() => setShowAddExerciseModal(false)} />
          <div className="relative bg-dark-panel border border-border-dark p-6 rounded-none max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-display font-black italic uppercase text-white mb-4">Create Custom Exercise</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#666] mb-1 font-bold">Movement Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Hammer Curls, Calf Raises..." 
                  value={newExName}
                  onChange={(e) => setNewExName(e.target.value)}
                  className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#666] mb-1 font-bold">Muscle Group</label>
                <select 
                  value={newExMuscle}
                  onChange={(e) => setNewExMuscle(e.target.value as MuscleGroup)}
                  className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand"
                >
                  <option value="Chest">Chest</option>
                  <option value="Back">Back</option>
                  <option value="Legs">Legs</option>
                  <option value="Core">Core</option>
                  <option value="Shoulders">Shoulders</option>
                  <option value="Arms">Arms</option>
                  <option value="Calisthenics">Calisthenics</option>
                  <option value="Cardio">Cardio</option>
                </select>
              </div>
              {newExMuscle !== 'Cardio' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#666] mb-1 font-bold">Tracking Type</label>
                      <select 
                        value={newExType}
                        onChange={(e) => setNewExType(e.target.value as 'reps' | 'time')}
                        className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand"
                      >
                        <option value="reps">Reps & Weight</option>
                        <option value="time">Hold Duration (Time)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-[#666] mb-1 font-bold">Rest (Seconds)</label>
                      <input 
                        type="number"
                        value={newExRest}
                        onChange={(e) => setNewExRest(parseInt(e.target.value) || 0)}
                        className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand"
                        step={15}
                      />
                    </div>
                  </div>
                  {newExType === 'reps' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#666] mb-1 font-bold">Default Sets</label>
                        <input 
                          type="number"
                          value={newExSets}
                          onChange={(e) => setNewExSets(parseInt(e.target.value) || 0)}
                          className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#666] mb-1 font-bold">Default Reps</label>
                        <input 
                          type="number"
                          value={newExReps}
                          onChange={(e) => setNewExReps(parseInt(e.target.value) || 0)}
                          className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand font-mono"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#666] mb-1 font-bold">Default Sets</label>
                        <input 
                          type="number"
                          value={newExSets}
                          onChange={(e) => setNewExSets(parseInt(e.target.value) || 0)}
                          className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-[#666] mb-1 font-bold">Hold Time (Seconds)</label>
                        <input 
                          type="number"
                          value={newExDuration}
                          onChange={(e) => setNewExDuration(parseInt(e.target.value) || 0)}
                          className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand font-mono"
                          step={15}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#666] mb-1 font-bold">Brief Description</label>
                <input 
                  type="text" 
                  placeholder="e.g. Build lateral shoulders using controlled speed..." 
                  value={newExDesc}
                  onChange={(e) => setNewExDesc(e.target.value)}
                  className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-border-dark">
              <button 
                type="button"
                onClick={() => setShowAddExerciseModal(false)}
                className="py-2 px-4 bg-dark-card border border-border-dark hover:bg-border-dark rounded-none text-xs text-white font-mono font-bold uppercase transition cursor-pointer"
              >
                Close
              </button>
              <button 
                type="button"
                onClick={handleCreateCustomExercise}
                className="py-2 px-4 bg-white hover:bg-brand rounded-none text-xs text-black font-mono font-black uppercase tracking-wider transition cursor-pointer"
              >
                Create & Select
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
