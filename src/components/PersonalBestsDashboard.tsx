import React, { useState, useEffect } from 'react';
import { PersonalBest, MuscleGroup, Exercise } from '../types';
import { INITIAL_EXERCISES } from '../data';
import { 
  Trophy, Search, Award, Flame, Calendar, Plus, Trash2, Edit2, X,
  Dumbbell, Filter, Sparkles, Check, Compass, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PersonalBestsDashboardProps {
  personalBests: PersonalBest[];
  customExercises: Exercise[];
  onAddPB: (pb: PersonalBest) => void;
  onClearPB: (exerciseId: string) => void;
  hideHeader?: boolean;
  weightUnit?: 'lbs' | 'kg';
}

export default function PersonalBestsDashboard({
  personalBests,
  customExercises,
  onAddPB,
  onClearPB,
  hideHeader = false,
  weightUnit = 'lbs'
}: PersonalBestsDashboardProps) {
  const allExercises = [...INITIAL_EXERCISES, ...customExercises];

  // Filters
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Manual PB Log Form State
  const [showLogForm, setShowLogForm] = useState(false);
  const [selectedExId, setSelectedExId] = useState(allExercises[0]?.id || '');
  const [pbWeight, setPbWeight] = useState(0);
  const [pbReps, setPbReps] = useState(10);
  const [pbDuration, setPbDuration] = useState(60);

  // Edit PB State
  const [editingPB, setEditingPB] = useState<PersonalBest | null>(null);
  const [editWeight, setEditWeight] = useState(0);
  const [editReps, setEditReps] = useState(10);
  const [editDuration, setEditDuration] = useState(60);
  const [editDate, setEditDate] = useState('');

  // Delete Confirmation State
  const [deleteConfirmExId, setDeleteConfirmExId] = useState<string | null>(null);

  // Populate edit fields when selected record changes
  useEffect(() => {
    if (editingPB) {
      setEditWeight(editingPB.maxWeight ? (weightUnit === 'kg' ? Math.round(editingPB.maxWeight * 0.45359237) : editingPB.maxWeight) : 0);
      setEditReps(editingPB.maxReps || 0);
      setEditDuration(editingPB.maxDuration || 0);
      setEditDate(editingPB.date || new Date().toISOString().split('T')[0]);
    }
  }, [editingPB, weightUnit]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPB) return;

    const updatedPB: PersonalBest = {
      ...editingPB,
      maxWeight: editingPB.maxWeight !== undefined 
        ? (weightUnit === 'kg' ? Math.round(editWeight / 0.45359237) : editWeight) 
        : undefined,
      maxReps: editingPB.maxReps !== undefined ? editReps : undefined,
      maxDuration: editingPB.maxDuration !== undefined ? editDuration : undefined,
      date: editDate
    };

    onAddPB(updatedPB);
    setEditingPB(null);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const exercise = allExercises.find(ex => ex.id === selectedExId);
    if (!exercise) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const newPB: PersonalBest = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      muscleGroup: exercise.muscleGroup,
      maxWeight: exercise.type === 'reps' 
        ? (weightUnit === 'kg' ? Math.round(pbWeight / 0.45359237) : pbWeight) 
        : undefined,
      maxReps: exercise.type === 'reps' ? pbReps : undefined,
      maxDuration: exercise.type === 'time' ? pbDuration : undefined,
      date: todayStr
    };

    onAddPB(newPB);
    setShowLogForm(false);
  };

  // Filter personal bests based on search and category
  const filteredPBs = personalBests.filter(pb => {
    const matchesMuscle = selectedMuscle === 'All' || pb.muscleGroup === selectedMuscle;
    const matchesSearch = pb.exerciseName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  return (
    <div id="personal-bests-dashboard" className="max-w-4xl mx-auto space-y-6">
      
      {hideHeader ? (
        <div className="flex justify-between items-center pb-2 border-b border-border-dark/60">
          <span className="text-[10px] font-mono text-[#666] font-bold uppercase tracking-wider flex items-center gap-1.5 select-none">
            <Trophy className="w-3.5 h-3.5 text-brand" /> Personal Best Records
          </span>
          <button
            onClick={() => setShowLogForm(true)}
            className="py-1.5 px-3 bg-white hover:bg-brand text-black font-mono font-black text-[9px] uppercase tracking-wider rounded-none transition flex items-center gap-1 shadow-md cursor-pointer"
          >
            <Plus className="w-3 h-3 stroke-[2.5]" />
            <span>Log Record</span>
          </button>
        </div>
      ) : (
        /* Motivational Title Banner */
        <div className="bg-dark-panel border border-border-dark p-6 rounded-none shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-display font-black italic uppercase text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-6 h-6 text-brand fill-current/10 animate-pulse" />
              <span>Hall of Personal Bests</span>
            </h2>
            <p className="text-[#CCC] text-xs mt-1.5 max-w-lg leading-relaxed font-sans">
              Track your peak achievements in strength and endurance. Beat your limits to trigger celebrations during live workouts!
            </p>
          </div>

          <button
            onClick={() => setShowLogForm(true)}
            className="self-start md:self-auto py-2.5 px-4 bg-white hover:bg-brand text-black font-mono font-black uppercase text-xs tracking-wider rounded-none transition flex items-center gap-1.5 shadow-lg cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Log Record Manually</span>
          </button>
        </div>
      )}

      {/* Filters and search section */}
      <div className="bg-dark-panel border border-border-dark p-4 rounded-none flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#666]" />
          <input 
            type="text" 
            placeholder="Search exercises..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-dark-surface border border-border-dark focus:border-brand focus:outline-none rounded-none py-2.5 pl-10 pr-4 text-xs text-white placeholder-[#555] transition font-sans"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {(['All', 'Chest', 'Back', 'Legs', 'Core', 'Shoulders'] as const).map(muscle => (
            <button
              key={muscle}
              onClick={() => setSelectedMuscle(muscle)}
              className={`px-3 py-1.5 rounded-none text-xs font-mono font-bold uppercase border transition-all cursor-pointer ${
                selectedMuscle === muscle 
                  ? 'bg-brand/10 border-brand text-brand font-bold shadow-[0_0_8px_rgba(255,230,0,0.1)]' 
                  : 'bg-dark-surface border-border-dark text-[#666] hover:text-[#CCC]'
              }`}
            >
              {muscle}
            </button>
          ))}
        </div>
      </div>

      {/* PB Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPBs.length === 0 ? (
          <div className="col-span-full bg-dark-panel border border-border-dark border-dashed rounded-none text-center py-16 text-[#666] flex flex-col items-center gap-2">
            <Award className="w-8 h-8 text-[#333]" />
            <p className="text-xs uppercase font-mono font-bold tracking-wider">No records registered for this selection.</p>
            <p className="text-[10px] text-[#555] uppercase font-mono tracking-widest mt-1">Complete exercises in live workouts to automatically register records!</p>
          </div>
        ) : (
          filteredPBs.map((pb) => {
            const correspondingEx = allExercises.find(e => e.id === pb.exerciseId);
            return (
              <div 
                key={pb.exerciseId}
                className="bg-dark-panel border border-border-dark hover:border-brand/40 p-5 rounded-none flex flex-col justify-between transition-all group border-b-2 border-b-border-dark hover:border-b-brand"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-dark-surface border border-border-dark text-brand text-[9px] font-bold font-mono px-2 py-0.5 rounded-none uppercase tracking-widest">
                      {pb.muscleGroup}
                    </span>
                    <div className="flex items-center gap-1.5 transition">
                      <button 
                        onClick={() => setEditingPB(pb)}
                        className="text-zinc-400 hover:text-brand p-1.5 transition border border-border-dark bg-dark-surface hover:bg-dark-panel rounded-none cursor-pointer flex items-center justify-center"
                        title="Edit Record"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirmExId(pb.exerciseId)}
                        className="text-zinc-400 hover:text-rose-400 p-1.5 transition border border-border-dark bg-dark-surface hover:bg-red-950/20 rounded-none cursor-pointer flex items-center justify-center"
                        title="Clear Personal Best"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <h3 className="font-display font-black italic uppercase text-white text-sm tracking-tight line-clamp-1 mt-1">{pb.exerciseName}</h3>
                </div>

                {/* Score representation */}
                <div className="my-4 bg-dark-surface border border-border-dark rounded-none p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-none bg-brand/10 flex items-center justify-center border border-brand/20">
                      <Flame className="w-4 h-4 text-brand fill-brand/20 animate-pulse" />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-[#666] block uppercase font-bold">Peak Score</span>
                      <span className="text-base font-black font-mono text-white tracking-tight leading-none mt-0.5 block">
                        {pb.maxWeight !== undefined ? (
                          <span>
                            {weightUnit === 'kg' ? Math.round(pb.maxWeight * 0.45359237) : pb.maxWeight}{' '}
                            <span className="text-xs font-normal text-slate-400 font-sans uppercase">{weightUnit}</span>
                            {pb.maxReps ? ` × ${pb.maxReps} reps` : ''}
                          </span>
                        ) : pb.maxDuration !== undefined ? (
                          <span>{pb.maxDuration} <span className="text-xs font-normal text-slate-400 font-sans uppercase">secs</span></span>
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </span>
                    </div>
                  </div>

                  <Award className="w-5 h-5 text-[#333] group-hover:text-brand/40 transition" />
                </div>

                {/* Date achieved footer */}
                <div className="flex items-center gap-1.5 text-[9px] font-mono text-[#666] uppercase font-bold border-t border-border-dark pt-3 mt-1">
                  <Calendar className="w-3.5 h-3.5 text-[#444]" />
                  <span>Achieved {pb.date}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* LOG MANUAL PB DIALOG MODAL */}
      {showLogForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85" onClick={() => setShowLogForm(false)}></div>
          <form 
            onSubmit={handleManualSubmit}
            className="relative bg-dark-panel border border-border-dark p-6 rounded-none max-w-md w-full shadow-2xl"
          >
            <h3 className="text-lg font-display font-black italic uppercase text-white mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-brand" />
              <span>Log Baseline Record</span>
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono uppercase text-[#666] mb-1.5 font-bold">Select Exercise</label>
                <select
                  value={selectedExId}
                  onChange={(e) => setSelectedExId(e.target.value)}
                  className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand"
                >
                  {allExercises.map(ex => (
                    <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscleGroup})</option>
                  ))}
                </select>
              </div>

              {allExercises.find(e => e.id === selectedExId)?.type === 'reps' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#666] mb-1.5 font-bold">Max Weight ({weightUnit})</label>
                    <input 
                      type="number"
                      value={pbWeight}
                      onChange={(e) => setPbWeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-[#666] mb-1.5 font-bold">Max Reps</label>
                    <input 
                      type="number"
                      value={pbReps}
                      onChange={(e) => setPbReps(parseInt(e.target.value) || 0)}
                      className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[10px] font-mono uppercase text-[#666] mb-1.5 font-bold">Max Hold Duration (seconds)</label>
                  <input 
                    type="number"
                    value={pbDuration}
                    onChange={(e) => setPbDuration(parseInt(e.target.value) || 0)}
                    className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand font-mono"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 justify-end mt-6 pt-4 border-t border-border-dark">
              <button 
                type="button"
                onClick={() => setShowLogForm(false)}
                className="py-2 px-4 bg-dark-card border border-border-dark hover:bg-border-dark text-xs font-mono font-bold uppercase text-white transition rounded-none cursor-pointer"
              >
                Close
              </button>
              <button 
                type="submit"
                className="py-2 px-4 bg-white hover:bg-brand text-black text-xs font-mono font-black uppercase tracking-wider transition rounded-none cursor-pointer"
              >
                Record Achievement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT PB DIALOG MODAL */}
      {editingPB && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85" onClick={() => setEditingPB(null)}></div>
          <form 
            onSubmit={handleEditSubmit}
            className="relative bg-dark-panel border border-border-dark p-6 rounded-none max-w-md w-full shadow-2xl"
          >
            <div className="flex justify-between items-center border-b border-border-dark pb-3 mb-4">
              <h3 className="text-sm font-display font-black italic uppercase text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-brand" />
                <span>Edit Personal Record</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingPB(null)}
                className="text-[#666] hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <span className="block text-[9px] font-mono uppercase text-[#666] mb-1 font-bold">Exercise</span>
                <span className="block text-xs font-bold text-white uppercase">{editingPB.exerciseName}</span>
              </div>

              <div>
                <label className="block text-[9px] font-mono uppercase text-[#666] mb-1 font-bold">Date Achieved</label>
                <input 
                  type="date" 
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full bg-dark-surface border border-border-dark text-white p-2.5 text-xs focus:border-brand focus:outline-none font-mono"
                />
              </div>

              {editingPB.maxWeight !== undefined ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-mono uppercase text-[#666] mb-1.5 font-bold">Max Weight ({weightUnit})</label>
                    <input 
                      type="number"
                      value={editWeight}
                      onChange={(e) => setEditWeight(parseFloat(e.target.value) || 0)}
                      className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono uppercase text-[#666] mb-1.5 font-bold">Max Reps</label>
                    <input 
                      type="number"
                      value={editReps}
                      onChange={(e) => setEditReps(parseInt(e.target.value) || 0)}
                      className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-[9px] font-mono uppercase text-[#666] mb-1.5 font-bold">Max Hold Duration (seconds)</label>
                  <input 
                    type="number"
                    value={editDuration}
                    onChange={(e) => setEditDuration(parseInt(e.target.value) || 0)}
                    className="w-full bg-dark-surface border border-border-dark rounded-none py-2 px-3 text-xs text-white focus:outline-none focus:border-brand font-mono"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-border-dark">
              <button 
                type="button"
                onClick={() => setEditingPB(null)}
                className="flex-1 border border-border-dark text-[#888] hover:text-white uppercase tracking-widest text-[9px] font-mono font-black py-3 transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 bg-brand text-black uppercase tracking-widest text-[9px] font-mono font-black py-3 transition hover:bg-brand/90"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CUSTOM NORSE DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteConfirmExId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmExId(null)}
              className="absolute inset-0 bg-black"
            />

            {/* Dialog Content */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative bg-dark-panel border border-red-950 p-6 md:p-8 rounded-none max-w-sm w-full shadow-2xl text-center overflow-hidden z-10"
            >
              {/* Alert Indicator */}
              <div className="mx-auto w-12 h-12 bg-red-950/40 border border-red-800 rounded-none flex items-center justify-center text-red-500 mb-4 animate-pulse">
                <Trash2 className="w-5 h-5" />
              </div>

              <span className="text-[9px] font-mono text-red-500 tracking-widest uppercase font-extrabold block">Strike Down Record</span>
              <h3 className="text-base font-display font-black italic uppercase text-white mt-2 mb-3 leading-tight">
                Do you wish to strike down this personal record from the logs?
              </h3>
              <p className="text-zinc-500 text-[10px] leading-relaxed max-w-xs mx-auto mb-6">
                This record will be struck from your Hall of Personal Bests permanently. Your past feats will be lost.
              </p>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button 
                  onClick={() => setDeleteConfirmExId(null)}
                  className="flex-1 border border-border-dark text-[#888] hover:text-white uppercase tracking-widest text-[9px] font-mono font-black py-3 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    onClearPB(deleteConfirmExId);
                    setDeleteConfirmExId(null);
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

    </div>
  );
}
