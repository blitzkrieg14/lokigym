import React, { useState, useEffect } from 'react';
import { X, Navigation, Timer, ArrowRight, ArrowLeft } from 'lucide-react';

interface CardioWizardProps {
  isOpen: boolean;
  onClose: () => void;
  selectedActivity: string | null;
  onStart: (activity: string, mode: 'timer' | 'free', durationMinutes?: number) => void;
}

const ACTIVITIES = [
  { id: 'Walking', name: 'Walking', desc: 'Low-impact recovery walk or power walk.' },
  { id: 'Running', name: 'Running', desc: 'Aerobic endurance or tempo run.' },
  { id: 'Sprinting', name: 'Sprinting', desc: 'High-intensity intervals & acceleration.' },
  { id: 'Cycling', name: 'Cycling', desc: 'Road bike, mountain bike, or indoor trainer.' },
  { id: 'Paddleboarding', name: 'Paddleboarding', desc: 'Water sports core stability and cardio.' },
  { id: 'Hiking', name: 'Hiking', desc: 'Trail hiking with topographic terrain tracking.' }
] as const;

export default function CardioWizard({ isOpen, onClose, selectedActivity: selectedActivityProp, onStart }: CardioWizardProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedActivity, setSelectedActivity] = useState<string>('Walking');
  const [mode, setMode] = useState<'timer' | 'free'>('free');
  const [duration, setDuration] = useState<number>(30); // default 30 mins

  // Sync step and pre-selected activity when wizard is opened
  useEffect(() => {
    if (isOpen) {
      if (selectedActivityProp) {
        setSelectedActivity(selectedActivityProp);
        setStep(2);
      } else {
        setStep(1);
      }
    }
  }, [isOpen, selectedActivityProp]);

  if (!isOpen) return null;

  const handleNext = () => {
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
  };

  const handleLaunch = () => {
    onStart(selectedActivity, mode, mode === 'timer' ? duration : undefined);
    // Reset wizard
    setStep(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-dark-panel border border-border-dark shadow-2xl relative overflow-hidden font-sans">
        {/* Neon Gold Accent Top Strip */}
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-brand via-yellow-400 to-amber-500" />

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-border-dark">
          <div>
            <h3 className="text-sm font-display font-black tracking-widest text-brand uppercase">
              Configure Cardio
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
              {selectedActivityProp ? `${selectedActivity} Target` : `Step ${step} of 2`}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-zinc-500 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Content */}
        <div className="p-6">
          {step === 1 ? (
            <div className="space-y-4">
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold">
                1. Select Cardio Preset
              </label>

              <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                {ACTIVITIES.map((act) => (
                  <button
                    key={act.id}
                    onClick={() => setSelectedActivity(act.id)}
                    className={`w-full text-left p-3.5 border transition-all cursor-pointer flex items-center gap-3.5 ${
                      selectedActivity === act.id
                        ? 'bg-brand/10 border-brand text-brand shadow-[0_0_12px_rgba(255,230,0,0.08)]'
                        : 'bg-dark-surface border-border-dark text-[#888] hover:text-[#CCC] hover:border-zinc-750'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        {act.name}
                      </div>
                      <div className="text-[10px] text-zinc-500 mt-0.5 leading-normal">
                        {act.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <button
                onClick={handleNext}
                className="w-full mt-4 py-3 bg-brand hover:bg-white text-black font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <span>Select Target Mode</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <label className="block text-xs font-mono text-zinc-400 uppercase tracking-wider font-bold">
                2. Choose Tracking Mode
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Timer Mode Button */}
                <button
                  type="button"
                  onClick={() => setMode('timer')}
                  className={`p-4 border text-center transition-all cursor-pointer flex flex-col items-center gap-2.5 ${
                    mode === 'timer'
                      ? 'bg-brand/10 border-brand text-brand shadow-[0_0_12px_rgba(255,230,0,0.08)]'
                      : 'bg-dark-surface border-border-dark text-[#888] hover:text-[#CCC]'
                  }`}
                >
                  <Timer className={`w-6 h-6 ${mode === 'timer' ? 'text-brand' : 'text-zinc-500'}`} />
                  <div>
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">Countdown Timer</div>
                    <div className="text-[9px] text-zinc-500 mt-1">Target duration alert</div>
                  </div>
                </button>

                {/* Free Mode Button */}
                <button
                  type="button"
                  onClick={() => setMode('free')}
                  className={`p-4 border text-center transition-all cursor-pointer flex flex-col items-center gap-2.5 ${
                    mode === 'free'
                      ? 'bg-brand/10 border-brand text-brand shadow-[0_0_12px_rgba(255,230,0,0.08)]'
                      : 'bg-dark-surface border-border-dark text-[#888] hover:text-[#CCC]'
                  }`}
                >
                  <Navigation className={`w-6 h-6 ${mode === 'free' ? 'text-brand' : 'text-zinc-500'}`} />
                  <div>
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-white">Free Tracker</div>
                    <div className="text-[9px] text-zinc-500 mt-1">Open stopwatch & GPS</div>
                  </div>
                </button>
              </div>

              {/* Timer Duration Input */}
              {mode === 'timer' && (
                <div className="p-4 bg-black/30 border border-border-dark space-y-2 animate-slide-up">
                  <label className="block text-[10px] font-mono text-zinc-400 uppercase tracking-widest font-bold">
                    Target Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={360}
                    value={duration}
                    onChange={(e) => setDuration(Math.max(1, parseInt(e.target.value) || 30))}
                    className="w-full bg-dark-surface border border-border-dark focus:border-brand focus:outline-none py-2 px-3 text-xs text-white font-mono"
                  />
                </div>
              )}

              {/* Navigation Action Footer */}
              <div className="flex gap-3 mt-6">
                {!selectedActivityProp && (
                  <button
                    onClick={handleBack}
                    className="flex-1 py-3 border border-border-dark hover:border-zinc-700 text-zinc-400 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>
                )}
                <button
                  onClick={handleLaunch}
                  className="flex-1 py-3 bg-brand hover:bg-white text-black font-mono text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Launch Session</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
