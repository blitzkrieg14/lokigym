import React, { useState } from 'react';
import { Exercise, MuscleGroup, PersonalBest } from '../types';
import { INITIAL_EXERCISES } from '../data';
import { 
  BookOpen, Search, Info, Check, Sparkles, ChevronDown, 
  ChevronUp, HelpCircle, Dumbbell, Award, Flame, Calendar, Star,
  Plus, Trash2, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import category images to automatically assign them to new custom exercises
import CHEST_IMAGE from '../assets/images/chest_workout_new_1782539284497.jpg';
import BACK_IMAGE from '../assets/images/back_workout_new_1782539296209.jpg';
import LEGS_IMAGE from '../assets/images/legs_workout_new_1782539307730.jpg';
import CORE_IMAGE from '../assets/images/core_workout_new_1782539318396.jpg';
import SHOULDERS_IMAGE from '../assets/images/shoulders_workout_1782539077834.jpg';
import ARMS_IMAGE from '../assets/images/arms_workout_1782539091571.jpg';
import CARDIO_IMAGE from '../assets/images/cardio_workout.jpg';
import CALISTHENICS_IMAGE from '../assets/images/calisthenics_workout.jpg';

const MUSCLE_IMAGE_MAP: Record<string, string> = {
  'Chest': CHEST_IMAGE,
  'Back': BACK_IMAGE,
  'Legs': LEGS_IMAGE,
  'Core': CORE_IMAGE,
  'Shoulders': SHOULDERS_IMAGE,
  'Arms': ARMS_IMAGE,
  'Full Body': CORE_IMAGE,
  'Cardio': CARDIO_IMAGE,
  'Calisthenics': CALISTHENICS_IMAGE
};

interface ExerciseListProps {
  customExercises: Exercise[];
  personalBests: PersonalBest[];
  favoriteExerciseIds: string[];
  onToggleFavorite: (exerciseId: string) => void;
  onAddCustomExercise: (newExercise: Exercise) => void;
  onDeleteCustomExercise: (exerciseId: string) => void;
  weightUnit?: 'lbs' | 'kg';
}

export default function ExerciseList({
  customExercises,
  personalBests,
  favoriteExerciseIds,
  onToggleFavorite,
  onAddCustomExercise,
  onDeleteCustomExercise,
  weightUnit = 'lbs'
}: ExerciseListProps) {
  const allExercises = [...INITIAL_EXERCISES, ...customExercises];

  // Filters
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All' | 'Favorites'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Expandable cards tracking (multiple cards can be open)
  const [expandedExerciseIds, setExpandedExerciseIds] = useState<string[]>([]);

  // Add Custom Exercise Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<'reps' | 'time' | 'cardio'>('reps');
  const [newSets, setNewSets] = useState(3);
  const [newReps, setNewReps] = useState(10);
  const [newDuration, setNewDuration] = useState(60);
  const [newDistance, setNewDistance] = useState(5.0);
  const [newCardioType, setNewCardioType] = useState<'Walking' | 'Running' | 'Sprinting' | 'Cycling' | 'Paddleboarding'>('Walking');
  const [newRest, setNewRest] = useState(60);
  const [newInstructions, setNewInstructions] = useState<string[]>(['']);

  const toggleExpand = (id: string) => {
    setExpandedExerciseIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      return [...prev, id];
    });
  };

  const handleAddInstructionStep = () => {
    setNewInstructions(prev => [...prev, '']);
  };

  const handleInstructionChange = (index: number, val: string) => {
    setNewInstructions(prev => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleRemoveInstructionStep = (index: number) => {
    setNewInstructions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const filteredSteps = selectedMuscle === 'Cardio'
      ? ['Active outdoor tracking session.']
      : newInstructions.map(s => s.trim()).filter(Boolean);
    const muscleGroup = (selectedMuscle === 'All' || selectedMuscle === 'Favorites') ? 'Chest' : selectedMuscle as MuscleGroup;
    const image = MUSCLE_IMAGE_MAP[muscleGroup] || CORE_IMAGE;

    const newExercise: Exercise = {
      id: `custom_ex_${Date.now()}`,
      name: newName.trim(),
      muscleGroup,
      description: newDesc.trim() || 'Custom exercise created by user.',
      instructions: filteredSteps.length > 0 ? filteredSteps : ['Perform the movement under control.'],
      image,
      defaultSets: Number(newSets) || 3,
      defaultRest: Number(newRest) || 60,
      type: newType
    };

    if (newType === 'reps') {
      newExercise.defaultReps = Number(newReps) || 10;
      newExercise.defaultWeight = 0;
    } else if (newType === 'time') {
      newExercise.defaultDuration = Number(newDuration) || 60;
    } else if (newType === 'cardio') {
      newExercise.defaultDistance = Number(newDistance) || 5.0;
      newExercise.defaultDuration = Number(newDuration) || 1200;
      newExercise.cardioType = newCardioType;
    }

    onAddCustomExercise(newExercise);

    // Reset Form
    setNewName('');
    setNewDesc('');
    setNewType(selectedMuscle === 'Cardio' ? 'cardio' : 'reps');
    setNewSets(selectedMuscle === 'Cardio' ? 1 : 3);
    setNewReps(10);
    setNewDuration(selectedMuscle === 'Cardio' ? 1200 : 60);
    setNewDistance(5.0);
    setNewCardioType('Walking');
    setNewRest(60);
    setNewInstructions(['']);
    setIsAddModalOpen(false);
  };

  const filteredExercises = allExercises.filter(ex => {
    const matchesMuscle = 
      selectedMuscle === 'All' ? true :
      selectedMuscle === 'Favorites' ? favoriteExerciseIds.includes(ex.id) :
      ex.muscleGroup === selectedMuscle;
    
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ex.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  return (
    <div id="exercise-list-container" className="max-w-4xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="border-b border-border-dark pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-display font-black italic uppercase text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-brand stroke-[2]" />
            <span>Movement Library</span>
          </h2>
          <p className="text-[#666] text-xs mt-1.5 font-medium max-w-xl">
            Explore workout movements, proper execution steps, and target muscle split zones.
          </p>
        </div>
        
        {/* Add Exercise button if a specific category is selected */}
        {selectedMuscle !== 'All' && selectedMuscle !== 'Favorites' && (
          <button
            onClick={() => {
              if (selectedMuscle === 'Cardio') {
                setNewType('cardio');
                setNewSets(1);
                setNewDuration(1200); // 20 min default
                setNewDistance(5.0);
                setNewCardioType('Walking');
              } else {
                setNewType('reps');
                setNewSets(3);
              }
              setIsAddModalOpen(true);
            }}
            className="py-2 px-3.5 bg-brand hover:bg-white text-black font-mono font-black uppercase text-[10px] tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 self-start sm:self-auto shadow-md"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add {selectedMuscle} Exercise</span>
          </button>
        )}
      </div>

      {/* Search and Category filters */}
      <div className="bg-dark-panel border border-border-dark p-5 rounded-none shadow-md space-y-4 font-sans">

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
            <input 
              type="text" 
              placeholder="Search by name, description, or guidelines..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-surface border border-border-dark focus:border-brand focus:outline-none rounded-none py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#555] transition"
            />
          </div>

          <div 
            className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0"
            onTouchStart={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {(['All', 'Favorites', 'Chest', 'Back', 'Legs', 'Core', 'Shoulders', 'Arms', 'Cardio', 'Calisthenics'] as const).map(muscle => (
              <button
                key={muscle}
                onClick={() => setSelectedMuscle(muscle)}
                className={`px-3 py-1.5 rounded-none text-xs font-mono font-bold uppercase border transition-all cursor-pointer flex items-center gap-1 ${
                  selectedMuscle === muscle 
                    ? 'bg-brand/10 border-brand text-brand font-bold shadow-[0_0_8px_rgba(255,230,0,0.1)]' 
                    : 'bg-dark-surface border-border-dark text-[#666] hover:text-[#CCC]'
                }`}
              >
                {muscle === 'Favorites' && (
                  <Star className={`w-3 h-3 ${favoriteExerciseIds.length > 0 && selectedMuscle === 'Favorites' ? 'fill-brand text-brand' : 'text-current'}`} />
                )}
                <span>{muscle}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Movements Grid */}
      <div className="space-y-3 font-sans">
        {filteredExercises.length === 0 ? (
          <div className="bg-dark-panel border border-border-dark border-dashed rounded-none text-center py-16 text-[#666]">
            {selectedMuscle === 'Favorites' 
              ? 'No favorite movements added yet. Mark some movements in the list with a star!'
              : 'No movements found matching the current search parameters.'}
          </div>
        ) : (
          filteredExercises.map(ex => {
            const isExpanded = expandedExerciseIds.includes(ex.id);
            const pbRecord = personalBests.find(pb => pb.exerciseId === ex.id);
            const isFav = favoriteExerciseIds.includes(ex.id);
            const isCustom = customExercises.some(ce => ce.id === ex.id);

            return (
              <div 
                key={ex.id}
                className="bg-dark-panel border border-border-dark rounded-none overflow-hidden shadow-sm hover:border-brand/40 border-b-2 border-b-border-dark hover:border-b-brand transition"
              >
                
                {/* Header Summary Tab */}
                <div 
                  onClick={() => toggleExpand(ex.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-dark-surface/30 transition"
                >
                  <div className="flex gap-4 items-center min-w-0">
                    {/* Favorite Star Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(ex.id);
                      }}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer flex-shrink-0 focus:outline-none"
                      title={isFav ? "Remove from favorites" : "Add to favorites"}
                    >
                      <Star 
                        className={`w-5 h-5 transition ${
                          isFav 
                            ? 'fill-brand text-brand drop-shadow-[0_0_4px_#FFE600]' 
                            : 'text-[#444] hover:text-[#CCC]'
                        }`} 
                      />
                    </button>

                    <div className="w-12 h-12 rounded-none overflow-hidden bg-black border border-border-dark flex-shrink-0">
                      <img 
                        src={ex.image} 
                        alt={ex.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover opacity-85"
                      />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-dark-surface border border-border-dark text-brand text-[9px] font-bold font-mono px-2.5 py-0.5 rounded-none uppercase tracking-widest">
                          {ex.muscleGroup}
                        </span>
                        <span className="text-[10px] text-[#666] font-mono uppercase font-bold">
                          {ex.type === 'reps' ? 'Reps & Weight' : 'Hold Time'}
                        </span>
                      </div>
                      <h3 className="font-display font-black italic uppercase text-white text-sm sm:text-base tracking-tight truncate leading-snug">{ex.name}</h3>
                    </div>
                  </div>

                  {/* Right hand details: status badges and expand toggles */}
                  <div className="flex items-center gap-3">
                    {pbRecord && (
                      <div className="hidden sm:flex items-center gap-1.5 bg-brand/10 text-brand border border-brand/20 px-2.5 py-1 rounded-none text-[10px] font-mono font-bold uppercase">
                        <Award className="w-3.5 h-3.5" />
                        <span>PB: {pbRecord.maxWeight !== undefined ? `${weightUnit === 'kg' ? Math.round(pbRecord.maxWeight * 0.45359237) : pbRecord.maxWeight} ${weightUnit}` : `${pbRecord.maxDuration}s`}</span>
                      </div>
                    )}

                    {isCustom && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteCustomExercise(ex.id);
                        }}
                        className="p-1.5 text-zinc-500 hover:text-rose-500 hover:bg-rose-950/20 border border-border-dark/65 hover:border-rose-500/35 transition cursor-pointer"
                        title="Remove Custom Exercise"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-[#888]" /> : <ChevronDown className="w-4 h-4 text-[#888]" />}
                  </div>
                </div>

                {/* Dropdown Detailed instructions and cover */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-border-dark bg-dark-surface/20 pt-4 space-y-4">
                    
                    {/* Visual and Description block */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      
                      {/* Image instruction cover */}
                      <div className="md:col-span-4 rounded-none overflow-hidden border border-border-dark h-36 bg-black">
                        <img 
                          src={ex.image} 
                          alt={ex.name} 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover opacity-85"
                        />
                      </div>

                      {/* Summary description details */}
                      <div className="md:col-span-8 flex flex-col justify-between">
                        <div>
                          <h4 className="text-[9px] font-mono tracking-widest uppercase text-[#666] mb-1 font-bold">About Movement</h4>
                          <p className="text-[#CCC] text-xs leading-relaxed">{ex.description}</p>
                        </div>

                        {/* Recommendation Specs */}
                        {ex.type !== 'cardio' ? (
                          <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                            <div className="bg-dark-surface border border-border-dark p-2 rounded-none">
                              <span className="text-[8px] font-mono text-[#666] uppercase font-bold">Default Sets</span>
                              <span className="text-xs font-mono font-bold text-white block mt-0.5">{ex.defaultSets} Sets</span>
                            </div>
                            <div className="bg-dark-surface border border-border-dark p-2 rounded-none">
                              <span className="text-[8px] font-mono text-[#666] uppercase font-bold">Target Style</span>
                              <span className="text-xs font-mono font-bold text-white block mt-0.5">
                                {ex.type === 'reps' ? `${ex.defaultReps || 10} Reps` : `${ex.defaultDuration || 60}s Hold`}
                              </span>
                            </div>
                            <div className="bg-dark-surface border border-border-dark p-2 rounded-none">
                              <span className="text-[8px] font-mono text-[#666] uppercase font-bold">Rest Timer</span>
                              <span className="text-xs font-mono font-bold text-white block mt-0.5">{ex.defaultRest}s Rest</span>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-dark-surface border border-border-dark p-3.5 rounded-none mt-4 text-center">
                            <span className="text-[9px] font-mono text-zinc-500 uppercase font-bold block">Tracking Setup</span>
                            <span className="text-xs font-display font-black text-brand uppercase tracking-wider block mt-1">
                              Timer countdown & Free stopwatch GPS modes supported
                            </span>
                          </div>
                        )}
                      </div>

                    </div>

                    {/* Step-by-step instructions list */}
                    <div className="bg-dark-surface border border-border-dark p-4 rounded-none space-y-3">
                      <h4 className="text-[10px] font-mono tracking-wider uppercase text-brand font-bold flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-brand" />
                        Execution Guidelines
                      </h4>

                      <ol className="space-y-2.5">
                        {ex.instructions.map((step, sIdx) => (
                          <li key={sIdx} className="flex gap-2.5 text-[#CCC] text-xs leading-relaxed">
                            <span className="flex-shrink-0 w-6 h-6 rounded-none bg-dark-panel border border-border-dark text-brand font-mono text-xs font-black flex items-center justify-center">
                              {sIdx + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Exercise Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-dark-panel border border-border-dark w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[85vh] font-sans text-[#F0F0F0] rounded-none"
            >
              <div className="flex items-center justify-between border-b border-border-dark pb-4 mb-5">
                <div>
                  <h3 className="text-base font-display font-black italic uppercase text-white tracking-tight flex items-center gap-1.5">
                    <Plus className="w-4 h-4 text-brand" />
                    <span>Add New {selectedMuscle} Exercise</span>
                  </h3>
                  <p className="text-[#666] text-[10px] uppercase font-mono mt-0.5">Custom movement creation</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1.5 hover:bg-dark-surface border border-border-dark/60 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Exercise Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g., Decline Cable Flyes"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-dark-surface border border-border-dark focus:border-brand focus:outline-none rounded-none py-2 px-3 text-xs text-white placeholder-[#444] transition font-mono"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Description</label>
                  <textarea 
                    placeholder="Describe the movement and target muscle area..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    rows={2}
                    className="w-full bg-dark-surface border border-border-dark focus:border-brand focus:outline-none rounded-none py-2 px-3 text-xs text-white placeholder-[#444] transition resize-none"
                  />
                </div>

                {/* Type & Sets */}
                {selectedMuscle !== 'Cardio' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Target Style</label>
                        <select
                          value={newType}
                          onChange={(e) => setNewType(e.target.value as 'reps' | 'time')}
                          className="w-full bg-dark-surface border border-border-dark focus:border-brand focus:outline-none rounded-none py-2 px-3 text-xs text-white transition font-mono"
                        >
                          <option value="reps">Reps & Weight</option>
                          <option value="time">Hold Time (Secs)</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Default Sets</label>
                        <input 
                          type="number"
                          min={1}
                          max={20}
                          value={newSets}
                          onChange={(e) => setNewSets(parseInt(e.target.value) || 3)}
                          className="w-full bg-dark-surface border border-border-dark focus:border-brand focus:outline-none rounded-none py-2 px-3 text-xs text-white transition font-mono"
                        />
                      </div>
                    </div>

                    {/* Reps/Duration & Rest */}
                    <div className="grid grid-cols-2 gap-4">
                      {newType === 'reps' ? (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Default Reps</label>
                          <input 
                            type="number"
                            min={1}
                            max={100}
                            value={newReps}
                            onChange={(e) => setNewReps(parseInt(e.target.value) || 10)}
                            className="w-full bg-dark-surface border border-border-dark focus:border-brand focus:outline-none rounded-none py-2 px-3 text-xs text-white transition font-mono"
                          />
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Default Duration (s)</label>
                          <input 
                            type="number"
                            min={1}
                            max={600}
                            value={newDuration}
                            onChange={(e) => setNewDuration(parseInt(e.target.value) || 60)}
                            className="w-full bg-dark-surface border border-border-dark focus:border-brand focus:outline-none rounded-none py-2 px-3 text-xs text-white transition font-mono"
                          />
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Rest Timer (s)</label>
                        <input 
                          type="number"
                          min={0}
                          max={600}
                          value={newRest}
                          onChange={(e) => setNewRest(parseInt(e.target.value) || 60)}
                          className="w-full bg-dark-surface border border-border-dark focus:border-brand focus:outline-none rounded-none py-2 px-3 text-xs text-white transition font-mono"
                        />
                      </div>
                    </div>
                  </>
                )}

                 {/* Execution Guidelines */}
                {selectedMuscle !== 'Cardio' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Execution Guidelines</label>
                      <button
                        type="button"
                        onClick={handleAddInstructionStep}
                        className="text-[10px] text-brand hover:underline font-bold uppercase tracking-wider cursor-pointer"
                      >
                        + Add Step
                      </button>
                    </div>
                    
                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                      {newInstructions.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-zinc-500 font-bold">{idx + 1}.</span>
                          <input 
                            type="text"
                            required={idx === 0}
                            placeholder={idx === 0 ? "e.g., Sit down on the bench with weights..." : "Next step..."}
                            value={step}
                            onChange={(e) => handleInstructionChange(idx, e.target.value)}
                            className="flex-1 bg-dark-surface border border-border-dark focus:border-brand focus:outline-none rounded-none py-1.5 px-2.5 text-xs text-white placeholder-[#444] transition"
                          />
                          {newInstructions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveInstructionStep(idx)}
                              className="p-1 text-zinc-500 hover:text-rose-500 hover:bg-rose-950/20 border border-border-dark/65 hover:border-rose-500/35 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-border-dark mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-3 px-4 bg-dark-surface hover:bg-dark-card text-zinc-300 text-xs font-mono font-black uppercase tracking-wider border border-border-dark transition rounded-none cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-brand hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider transition rounded-none cursor-pointer"
                  >
                    Save Movement
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
