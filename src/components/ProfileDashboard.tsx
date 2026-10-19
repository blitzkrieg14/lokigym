import React, { useState, useRef } from 'react';
import { WeightLogEntry, WaterLog, WorkoutHistoryEntry, PersonalBest } from '../types';
import TitanHeatmap from './TitanHeatmap';

import { 
  Scale, Calendar, Camera, Trash2, ChevronRight, TrendingUp, 
  Sparkles, Award, FileText, Dumbbell, Clock, Maximize2, X, Plus,
  Check, Trophy, ChevronDown, History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera as CapCamera, CameraResultType, CameraSource } from '@capacitor/camera';

// Import Gemini-generated Armored Titan assets
import titanBaseNew from '../assets/images/titan_base_new.jpg';
import titanGoldNew from '../assets/images/titan_gold_new.jpg';
import titanRedNew from '../assets/images/titan_red_new.jpg';
import titanBlueNew from '../assets/images/titan_blue_new.jpg';

interface ProfileDashboardProps {
  weightHistory: WeightLogEntry[];
  onAddWeightEntry: (entry: WeightLogEntry) => void;
  onDeleteWeightEntry: (id: string) => void;
  waterLogs: WaterLog[];
  onUpdateWaterLogs: (newLogs: WaterLog[]) => void;
  history: WorkoutHistoryEntry[];
  personalBests: PersonalBest[];
  distanceUnit?: 'km' | 'mi';
  weightUnit?: 'lbs' | 'kg';
  onViewHistoryEntry: (entry: WorkoutHistoryEntry) => void;
}

// Precise age/duration calculator for "days, months, years ago"
export const getRelativeTimePhrase = (dateStr: string): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Create Date object in local time for midnight of selected date
  const [year, month, day] = dateStr.split('-').map(Number);
  const logDate = new Date(year, month - 1, day);
  logDate.setHours(0, 0, 0, 0);
  
  const diffTime = today.getTime() - logDate.getTime();
  const diffDaysTotal = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDaysTotal === 0) return 'Today';
  if (diffDaysTotal < 0) return 'In the future';
  
  let years = today.getFullYear() - logDate.getFullYear();
  let months = today.getMonth() - logDate.getMonth();
  let days = today.getDate() - logDate.getDate();
  
  if (days < 0) {
    months -= 1;
    // Find previous month's total days
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  
  const segments: string[] = [];
  if (years > 0) {
    segments.push(`${years} ${years === 1 ? 'year' : 'years'}`);
  }
  if (months > 0) {
    segments.push(`${months} ${months === 1 ? 'month' : 'months'}`);
  }
  if (days > 0 || segments.length === 0) {
    segments.push(`${days} ${days === 1 ? 'day' : 'days'}`);
  }
  
  return `${segments.join(', ')} ago`;
};

// Format time to minutes
const formatTimeMinutes = (totalSeconds: number) => {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}m ${secs}s`;
};

export default function ProfileDashboard({ 
  weightHistory, 
  onAddWeightEntry, 
  onDeleteWeightEntry,
  waterLogs,
  onUpdateWaterLogs,
  history,
  personalBests,
  distanceUnit = 'km',
  weightUnit = 'lbs',
  onViewHistoryEntry
}: ProfileDashboardProps) {
  
  // Form State
  const [weight, setWeight] = useState<string>('');
  const [unit, setUnit] = useState<'lbs' | 'kg'>(weightUnit);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [image, setImage] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Sync unit with weightUnit when preference updates
  React.useEffect(() => {
    setUnit(weightUnit);
  }, [weightUnit]);
  
  // UI States
  const [selectedFullImage, setSelectedFullImage] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<WeightLogEntry | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Accordion active state (null = all collapsed by default)
  const [activeSection, setActiveSection] = useState<string | null>(null);

  // Accordion expansion states
  const [isAchievementsExpanded, setIsAchievementsExpanded] = useState(false);
  const [isMuscleAnalyticsExpanded, setIsMuscleAnalyticsExpanded] = useState(false);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isWeightTimelineExpanded, setIsWeightTimelineExpanded] = useState(false);

  const toggleSection = (section: string) => {
    setActiveSection(activeSection === section ? null : section);
  };
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-compress image to fit comfortably in LocalStorage
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload an image file (PNG/JPG).');
      return;
    }
    
    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPhoto = async () => {
    try {
      const photo = await CapCamera.getPhoto({
        quality: 100,
        allowEditing: false,
        resultType: CameraResultType.Uri, // Returns local file URI (webPath)
        source: CameraSource.Prompt // Prompts user to take a new photo or choose from gallery
      });

      if (photo && photo.webPath) {
        setImage(photo.webPath);
      }
    } catch (err: any) {
      console.warn("Capacitor camera failed/cancelled, trying fallback...", err);
      // Fallback to standard file input if Capacitor camera is not implemented/supported in this environment
      if (err && (err.message?.includes("implemented") || err.includes?.("implemented") || err.message?.includes("not implemented"))) {
        fileInputRef.current?.click();
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightVal = parseFloat(weight);
    if (isNaN(weightVal) || weightVal <= 0) {
      setErrorMsg('Please enter a valid weight.');
      return;
    }
    if (!date) {
      setErrorMsg('Please select a date.');
      return;
    }

    const newEntry: WeightLogEntry = {
      id: `weight_${Date.now()}`,
      weight: weightVal,
      unit,
      date,
      image: image || undefined,
      notes: notes.trim() || undefined
    };

    onAddWeightEntry(newEntry);
    
    // Reset Form (except unit)
    setWeight('');
    setImage('');
    setNotes('');
    setErrorMsg(null);
  };

  // Sort weight entries by date ascending for the chart, descending for the feed
  const chronologicalHistory = [...weightHistory].sort((a, b) => a.date.localeCompare(b.date));
  const reverseHistory = [...weightHistory].sort((a, b) => b.date.localeCompare(a.date));

  // Determine current, starting, and progress
  const currentWeight = reverseHistory[0];
  const startingWeight = chronologicalHistory[0];
  const weightChange = currentWeight && startingWeight 
    ? (currentWeight.weight - startingWeight.weight)
    : 0;

  // Render high-contrast SVG graph manually
  const renderSvgGraph = () => {
    if (chronologicalHistory.length < 2) {
      return (
        <div className="h-48 flex flex-col items-center justify-center text-center bg-dark-panel border border-border-dark py-12 px-4 rounded-none">
          <TrendingUp className="w-8 h-8 text-[#444] mb-2" />
          <p className="text-[#666] text-xs font-mono uppercase tracking-wider">Not enough entries to plot trendline</p>
          <p className="text-[#444] text-[10px] mt-1 max-w-xs">Log at least two weight tracking points to render your visual progress graph.</p>
        </div>
      );
    }

    const width = 600;
    const height = 180;
    const padding = 25;

    const weights = chronologicalHistory.map(h => {
      if (h.unit === weightUnit) return h.weight;
      return h.unit === 'lbs' ? h.weight * 0.45359237 : h.weight / 0.45359237;
    });
    const minW = Math.min(...weights) - 5;
    const maxW = Math.max(...weights) + 5;
    const rangeW = maxW - minW || 1;

    const points = chronologicalHistory.map((entry, index) => {
      const x = padding + (index / (chronologicalHistory.length - 1)) * (width - padding * 2);
      const val = entry.unit === weightUnit ? entry.weight : (entry.unit === 'lbs' ? entry.weight * 0.45359237 : entry.weight / 0.45359237);
      const y = height - padding - ((val - minW) / rangeW) * (height - padding * 2);
      return { x, y, entry };
    });

    const pathData = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    // Area fill path
    const areaData = chronologicalHistory.length > 0 
      ? `${pathData} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
      : '';

    return (
      <div className="bg-dark-surface/30 border border-border-dark p-4 rounded-none space-y-3 relative">
        <div className="flex justify-between items-center border-b border-border-dark/60 pb-2">
          <span className="text-[10px] font-mono text-[#666] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-brand" /> Weight Progress Chart
          </span>
          <span className="text-[10px] font-mono text-zinc-400">
            {chronologicalHistory[0].date} to {chronologicalHistory[chronologicalHistory.length - 1].date}
          </span>
        </div>

        <div className="relative overflow-x-auto w-full scrollbar-thin">
          <div className="min-w-[500px]">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
              {/* Grid Lines */}
              <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1A1A1A" strokeWidth="1" />
              <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1A1A1A" strokeWidth="1" />
              <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#222" strokeWidth="1.5" />

              {/* Shaded Area Under Line */}
              {areaData && (
                <path d={areaData} fill="url(#chartGradient)" />
              )}

              {/* Glowing Line */}
              <path d={pathData} fill="none" stroke="#E2FE30" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

              {/* Points & Interactive Zones */}
              {points.map((p, idx) => (
                <g key={p.entry.id} className="cursor-pointer group">
                  {/* Outer circle glow on hover */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="8" 
                    fill="#E2FE30" 
                    fillOpacity={hoveredPoint?.id === p.entry.id ? "0.3" : "0"} 
                    className="transition duration-150"
                  />
                  {/* Point circle */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r="4" 
                    fill="#0A0A0A" 
                    stroke="#E2FE30" 
                    strokeWidth="2" 
                    onMouseEnter={() => setHoveredPoint(p.entry)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* Mini-date label */}
                  {idx === 0 || idx === points.length - 1 || hoveredPoint?.id === p.entry.id ? (
                    <text 
                      x={p.x} 
                      y={height - 6} 
                      fill="#666" 
                      fontSize="9" 
                      fontFamily="monospace" 
                      textAnchor="middle"
                      fontWeight="bold"
                    >
                      {p.entry.date.slice(5)}
                    </text>
                  ) : null}
                </g>
              ))}

              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#E2FE30" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#E2FE30" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Hover Tooltip Overlay */}
            <AnimatePresence>
              {hoveredPoint && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black border border-border-dark px-3 py-1.5 shadow-xl rounded-none flex items-center gap-2 pointer-events-none"
                >
                  <Scale className="w-3.5 h-3.5 text-brand" />
                  <span className="text-xs font-mono font-black text-white">
                    {hoveredPoint.unit === weightUnit 
                      ? hoveredPoint.weight.toFixed(1) 
                      : (weightUnit === 'kg' ? (hoveredPoint.weight * 0.45359237).toFixed(1) : (hoveredPoint.weight / 0.45359237).toFixed(1))}{' '}
                    {weightUnit}
                  </span>
                  <span className="text-[10px] font-mono text-[#666] border-l border-border-dark pl-2">{hoveredPoint.date}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  };

  const getDaysSinceLastWorkout = (muscleGroup: string) => {
    const targetGroup = muscleGroup.toLowerCase();
    const matchingLogs = history.filter(log => {
      if (log.exercises && log.exercises.length > 0) {
        // Scan actual exercises completed in this log entry
        return log.exercises.some(ex => {
          if (!ex.muscleGroup) return false;
          const exGroup = ex.muscleGroup.toLowerCase();
          const hasCompletedSets = ex.sets && ex.sets.some(s => s.isCompleted);
          if (!hasCompletedSets) return false;

          if (exGroup === targetGroup) return true;
          if (exGroup === 'full body') return true;
          if (targetGroup === 'legs' && exGroup === 'cardio') return true;
          return false;
        });
      } else {
        // Fallback to parent muscleGroup
        if (!log.muscleGroup) return false;
        const logGroup = log.muscleGroup.toLowerCase();
        if (logGroup === targetGroup) return true;
        if (logGroup === 'full body') return true;
        if (targetGroup === 'legs' && logGroup === 'cardio') return true;
        return false;
      }
    });

    if (matchingLogs.length === 0) return null;

    // Get the most recent date
    const dates = matchingLogs.map(log => log.date ? new Date(log.date).getTime() : 0).filter(t => t > 0);
    if (dates.length === 0) return null;
    const mostRecentTime = Math.max(...dates);
    
    const diffTime = Date.now() - mostRecentTime;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getHeatmapColor = (days: number | null) => {
    if (days === null || days >= 6) return 'rgb(63, 63, 70)'; // Grey (untargeted / 6+ days)
    if (days >= 3) return 'rgb(234, 179, 8)'; // Yellow (secondary / 3-5 days)
    return 'rgb(220, 38, 38)'; // Red (primary / 0-2 days)
  };

  const getWeeklyVolume = () => {
    const volume: Record<string, number> = {
      Chest: 0,
      Back: 0,
      Legs: 0,
      Shoulders: 0,
      Arms: 0,
      Core: 0
    };

    // Filter history for the last 7 days
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentHistory = history.filter(log => log.date && new Date(log.date).getTime() >= oneWeekAgo);

    recentHistory.forEach(log => {
      if (log.exercises && log.exercises.length > 0) {
        // Map individual exercise volumes to their respective muscle groups
        log.exercises.forEach(ex => {
          const completedSets = ex.sets ? ex.sets.filter(s => s.isCompleted) : [];
          if (completedSets.length === 0) return;

          let exWeight = 0;
          let hasWeightMoved = false;
          completedSets.forEach(s => {
            if (s.weight && s.reps) {
              exWeight += s.weight * s.reps;
              hasWeightMoved = true;
            }
          });
          if (!hasWeightMoved) {
            exWeight = completedSets.length * 600;
          }

          let mg = ex.muscleGroup;
          if (mg === 'Cardio') {
            mg = 'Legs';
          }

          if (mg === 'Full Body') {
            const splitWeight = Math.round(exWeight / 6);
            volume.Chest += splitWeight;
            volume.Back += splitWeight;
            volume.Legs += splitWeight;
            volume.Shoulders += splitWeight;
            volume.Arms += splitWeight;
            volume.Core += splitWeight;
          } else if (volume[mg] !== undefined) {
            volume[mg] += exWeight;
          }
        });
      } else {
        // Fallback to parent routine muscleGroup if exercises are empty
        let group = log.muscleGroup;
        if (group === 'Cardio') {
          group = 'Legs';
        }
        const weight = log.totalWeightMoved !== undefined 
          ? log.totalWeightMoved 
          : (log.totalSetsCompleted ? log.totalSetsCompleted * 600 : 0);

        if (!group) return;

        if (group === 'Full Body') {
          const splitWeight = Math.round(weight / 6);
          volume.Chest += splitWeight;
          volume.Back += splitWeight;
          volume.Legs += splitWeight;
          volume.Shoulders += splitWeight;
          volume.Arms += splitWeight;
          volume.Core += splitWeight;
        } else if (volume[group] !== undefined) {
          volume[group] += weight;
        }
      }
    });

    return volume;
  };

  const getMusclesWorkedInLast5DaysCount = () => {
    const categories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
    const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
    
    // Filter history for the last 5 days
    const recentHistory = history.filter(log => log.date && new Date(log.date).getTime() >= fiveDaysAgo);

    const workedSet = new Set<string>();
    recentHistory.forEach(log => {
      if (log.exercises && log.exercises.length > 0) {
        log.exercises.forEach(ex => {
          if (!ex.muscleGroup) return;
          const hasCompletedSets = ex.sets && ex.sets.some(s => s.isCompleted);
          if (!hasCompletedSets) return;

          let mg = ex.muscleGroup;
          if (mg === 'Cardio') {
            workedSet.add('Legs');
          } else if (mg === 'Full Body') {
            categories.forEach(c => workedSet.add(c));
          } else {
            workedSet.add(mg);
          }
        });
      } else {
        if (!log.muscleGroup) return;
        if (log.muscleGroup === 'Full Body') {
          categories.forEach(c => workedSet.add(c));
        } else if (log.muscleGroup === 'Cardio') {
          workedSet.add('Legs');
        } else {
          workedSet.add(log.muscleGroup);
        }
      }
    });

    return workedSet.size;
  };

  const renderMuscleAnalytics = () => {
    return (
      <div className="font-sans space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Muscle Heatmap Column */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <TitanHeatmap history={history} />
          </div>

          {/* Weekly Volume Column */}
          <div className="lg:col-span-7 bg-dark-surface/40 border border-border-dark/60 p-4 flex flex-col justify-between z-10">
            <div>
              <div className="text-center lg:text-left mb-4">
                <span className="text-[10px] font-mono font-black text-white uppercase tracking-widest block">Weekly Volume per Muscle</span>
                <span className="text-[8px] text-zinc-500 font-mono uppercase block mt-0.5">Total Weight Moved (Last 7 Days)</span>
              </div>

              {/* Volume Plasma Bars List */}
              <div className="space-y-4">
                {Object.entries(getWeeklyVolume()).map(([muscle, weight]) => {
                  const targetWeight = weightUnit === 'kg' ? 5000 : 10000;
                  const displayWeight = weightUnit === 'kg' ? weight * 0.45359237 : weight;
                  const pct = Math.min(100, Math.round((displayWeight / targetWeight) * 100));
                  const days = getDaysSinceLastWorkout(muscle);
                  const recencyText = days === null ? 'Never' : days === 0 ? 'Today' : days === 1 ? '1d ago' : `${days}d ago`;
                  
                  // Plasma gradients and glow styling based on recency:
                  let gradient = 'from-zinc-800 via-zinc-650 to-zinc-850'; // Grey
                  let glowColor = 'rgba(113, 113, 122, 0.4)';
                  let bubbleBg = 'bg-zinc-500';

                  if (days !== null && days < 3) {
                    // Red Plasma
                    gradient = 'from-rose-950 via-red-500 via-rose-400 to-rose-950';
                    glowColor = 'rgba(239, 68, 68, 0.7)';
                    bubbleBg = 'bg-red-400';
                  } else if (days !== null && days >= 3 && days < 6) {
                    // Yellow/Amber Plasma
                    gradient = 'from-amber-950 via-yellow-500 via-amber-300 to-amber-950';
                    glowColor = 'rgba(245, 158, 11, 0.7)';
                    bubbleBg = 'bg-amber-350';
                  }

                  return (
                    <div key={muscle} className="space-y-2 group">
                      {/* Label Row */}
                      <div className="flex justify-between items-baseline font-mono text-[10px] font-bold uppercase leading-none">
                        <div className="flex items-center gap-2">
                          <span className="text-white tracking-wider">{muscle}</span>
                          <span className="text-zinc-700">|</span>
                          <span className="text-zinc-500">Last: {recencyText}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-white font-black">
                            {Math.round(displayWeight).toLocaleString()}
                          </span>
                          <span className="text-zinc-500 text-[8px]">
                            {weightUnit}
                          </span>
                        </div>
                      </div>

                      {/* Glass Tube Container for Plasma */}
                      <div className="relative h-4 bg-black/60 border border-border-dark/60 rounded-full overflow-hidden shadow-inner flex items-center p-[2px]">
                        
                        {/* Shimmering glass reflection highlight */}
                        <div className="absolute top-[1px] left-3 right-3 h-[1px] bg-white/10 rounded-full pointer-events-none z-20" />

                        {/* Liquid/Plasma Fill */}
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className={`h-full rounded-full relative overflow-hidden animate-plasma-flow bg-gradient-to-r ${gradient}`}
                          style={{
                            boxShadow: pct > 0 ? `0 0 12px ${glowColor}` : 'none'
                          }}
                        >
                          {/* Inner liquid ripple effect overlay */}
                          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.08)_75%,transparent_75%,transparent)] bg-[size:14px_14px] animate-[pulse_2s_infinite] opacity-60" />

                          {/* Glowing Meniscus bubble at the leading edge */}
                          {pct > 0 && (
                            <div 
                              className={`absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full mr-0.5 animate-liquid-bubble ${bubbleBg}`}
                              style={{
                                boxShadow: `0 0 8px 2px ${glowColor}`
                              }}
                            />
                          )}
                        </motion.div>

                        {/* Empty capacity ticks inside the tube */}
                        <div className="absolute inset-0 flex justify-between px-6 pointer-events-none opacity-15">
                          <div className="w-[1px] h-full bg-zinc-800" />
                          <div className="w-[1px] h-full bg-zinc-800" />
                          <div className="w-[1px] h-full bg-zinc-800" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Coaching Tip */}
            <div className="mt-5 border-t border-border-dark/60 pt-3.5 text-left">
              <span className="text-[9px] font-mono font-black text-brand uppercase tracking-wider block">Loki Coaching Tip</span>
              <p className="text-[10px] text-[#BBB] leading-relaxed mt-1">
                {(() => {
                  const volume = getWeeklyVolume();
                  const coldMuscles = Object.entries(volume)
                    .filter(([_, weight]) => weight === 0)
                    .map(([muscle]) => muscle);

                  if (coldMuscles.length > 0) {
                    return `⚠️ You have not targeted ${coldMuscles.join(', ')} this week. Consider adding them to your next active training session to avoid muscular imbalances.`;
                  }

                  const targetWeight = weightUnit === 'kg' ? 5000 : 10000;
                  const lowVolumeThreshold = targetWeight * 0.3; // 30% of weekly goal
                  const lowVolume = Object.entries(volume)
                    .filter(([_, weight]) => {
                      const displayW = weightUnit === 'kg' ? weight * 0.45359237 : weight;
                      return displayW > 0 && displayW < lowVolumeThreshold;
                    })
                    .map(([muscle]) => muscle);

                  if (lowVolume.length > 0) {
                    return `⚡ Good job hitting all muscles, but total weight moved for ${lowVolume.join(', ')} is relatively low. Push for more volume for optimal stimulation.`;
                  }

                  return `🔥 Exceptional training! All target muscle groups are fully stimulated with optimal tonnage. Maintain this intensity!`;
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Cumulative stats from history & personalBests
  const totalCompletedWorkouts = history.length;
  const totalMinutesTrained = Math.round(
    history.reduce((sum, entry) => sum + entry.durationSeconds, 0) / 60
  );
  const totalPersonalBestsActive = personalBests.length;

  return (
    <div className="space-y-4">
      {/* Accordion B: Loki Muscle Analytics */}
      <div className="border border-border-dark bg-dark-panel rounded-none overflow-hidden shadow-md">
        <button 
          onClick={() => setIsMuscleAnalyticsExpanded(!isMuscleAnalyticsExpanded)}
          className="w-full flex justify-between items-center p-4 bg-dark-surface hover:bg-dark-surface/85 transition text-left select-none cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand" />
            <span className="font-display font-black italic uppercase text-xs text-white tracking-widest">Loki Muscle Analytics</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isMuscleAnalyticsExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        {isMuscleAnalyticsExpanded && (
          <div className="p-4 md:p-6 border-t border-border-dark bg-dark-surface/5">
            {renderMuscleAnalytics()}
          </div>
        )}
      </div>

      {/* Accordion: Workout History Log */}
      <div className="border border-border-dark bg-dark-panel rounded-none overflow-hidden shadow-md">
        <button 
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          className="w-full flex justify-between items-center p-4 bg-dark-surface hover:bg-dark-surface/85 transition text-left select-none cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-brand" />
            <span className="font-display font-black italic uppercase text-xs text-white tracking-widest">Workout History Log</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isHistoryExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        {isHistoryExpanded && (
          <div className="p-4 md:p-6 border-t border-border-dark bg-dark-surface/5">
            {history.length === 0 ? (
              <div className="text-center py-8 text-[#444] text-[10px] bg-dark-panel border border-border-dark rounded-none">
                Your completed sessions log is empty. Complete a workout to see history statistics!
              </div>
            ) : (
              <div className="space-y-2 max-h-[45vh] overflow-y-auto pr-1">
                {[...history].reverse().map((entry) => (
                  <div 
                    key={entry.id} 
                    onClick={() => onViewHistoryEntry(entry)}
                    className="bg-dark-panel border border-border-dark hover:border-brand/40 p-4 shadow-sm flex items-center justify-between gap-4 transition cursor-pointer select-none group"
                  >
                    <div className="flex-1 min-w-0">
                      {/* Date and Category badges */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-mono text-[#666] font-bold">{entry.date}</span>
                        <span className="bg-dark-surface text-[8px] font-mono font-bold text-zinc-400 px-1.5 py-0.2 border border-border-dark rounded-none uppercase tracking-wider">
                          {entry.muscleGroup}
                        </span>
                        {entry.newPersonalBestsCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 bg-brand/10 border border-brand/20 text-brand font-bold font-mono px-1.5 py-0.2 rounded-none text-[8px] uppercase">
                            <Award className="w-2.5 h-2.5 fill-brand/10" />
                            <span>+{entry.newPersonalBestsCount} PBs</span>
                          </span>
                        )}
                      </div>

                      {/* Workout Name */}
                      <h4 className="text-xs font-display font-black uppercase text-brand hover:text-white transition tracking-wide truncate">
                        {entry.workoutName}
                      </h4>
                    </div>

                    {/* Stats and Action details */}
                    <div className="flex items-center gap-4 text-right flex-shrink-0">
                      <div className="hidden sm:block">
                        <span className="text-[8px] text-[#555] font-mono block uppercase">Duration</span>
                        <span className="text-xs font-mono font-extrabold text-white">
                          {formatTimeMinutes(entry.durationSeconds)}
                        </span>
                      </div>
                      <div className="sm:hidden">
                        <span className="text-xs font-mono font-extrabold text-white">
                          {formatTimeMinutes(entry.durationSeconds)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] text-[#555] font-mono block uppercase">Sets</span>
                        <span className="text-xs font-mono font-bold text-white">
                          {entry.totalSetsCompleted}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-brand transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Accordion A: Workout Achievements */}
      <div className="border border-border-dark bg-dark-panel rounded-none overflow-hidden shadow-md">
        <button 
          onClick={() => setIsAchievementsExpanded(!isAchievementsExpanded)}
          className="w-full flex justify-between items-center p-4 bg-dark-surface hover:bg-dark-surface/85 transition text-left select-none cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-brand" />
            <span className="font-display font-black italic uppercase text-xs text-white tracking-widest">Workout Achievements</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isAchievementsExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        {isAchievementsExpanded && (
          <div className="p-4 md:p-6 border-t border-border-dark bg-dark-surface/5 space-y-6">
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              <div className="bg-dark-panel border border-border-dark p-4 rounded-none flex flex-col justify-between shadow-md">
                <div className="w-8 h-8 rounded-none bg-dark-surface border border-border-dark flex items-center justify-center text-brand mb-4">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#666] block uppercase font-bold leading-none">Completed</span>
                  <span className="text-3xl font-black font-mono text-white block mt-1 tracking-tight leading-none">{totalCompletedWorkouts}</span>
                  <span className="text-[9px] text-[#CCC] uppercase tracking-wider block mt-1">Sessions</span>
                </div>
              </div>

              <div className="bg-dark-panel border border-border-dark p-4 rounded-none flex flex-col justify-between shadow-md">
                <div className="w-8 h-8 rounded-none bg-dark-surface border border-border-dark flex items-center justify-center text-brand mb-4">
                  <Clock className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#666] block uppercase font-bold leading-none">Trained</span>
                  <span className="text-3xl font-black font-mono text-white block mt-1 tracking-tight leading-none">{totalMinutesTrained}</span>
                  <span className="text-[9px] text-[#CCC] uppercase tracking-wider block mt-1 font-sans">Minutes</span>
                </div>
              </div>

              <div className="bg-dark-panel border border-border-dark p-4 rounded-none flex flex-col justify-between shadow-md">
                <div className="w-8 h-8 rounded-none bg-dark-surface border border-border-dark flex items-center justify-center text-brand mb-4">
                  <Trophy className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[#666] block uppercase font-bold leading-none">Records</span>
                  <span className="text-3xl font-black font-mono text-white block mt-1 tracking-tight leading-none">{totalPersonalBestsActive}</span>
                  <span className="text-[9px] text-[#CCC] uppercase tracking-wider block mt-1 font-sans">Broken PBs</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Accordion C: Weight Progression Timeline */}
      <div className="border border-border-dark bg-dark-panel rounded-none overflow-hidden shadow-md">
        <button 
          onClick={() => setIsWeightTimelineExpanded(!isWeightTimelineExpanded)}
          className="w-full flex justify-between items-center p-4 bg-dark-surface hover:bg-dark-surface/85 transition text-left select-none cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-brand" />
            <span className="font-display font-black italic uppercase text-xs text-white tracking-widest">Weight Progression Timeline</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform duration-200 ${isWeightTimelineExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        {isWeightTimelineExpanded && (
          <div className="p-4 md:p-6 border-t border-border-dark bg-dark-surface/5 space-y-6">
            {/* Bento Weight Stats */}
            {weightHistory.length > 0 && (() => {
              const startVal = startingWeight.unit === weightUnit ? startingWeight.weight : (weightUnit === 'kg' ? startingWeight.weight * 0.45359237 : startingWeight.weight / 0.45359237);
              const currentVal = currentWeight.unit === weightUnit ? currentWeight.weight : (weightUnit === 'kg' ? currentWeight.weight * 0.45359237 : currentWeight.weight / 0.45359237);
              const displayWeightChange = currentVal - startVal;
              return (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-dark-panel border border-border-dark p-4 rounded-none flex flex-col justify-between shadow-sm">
                    <div className="text-[10px] font-mono text-[#666] uppercase font-black">Starting Weight</div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black font-mono text-white">{startVal.toFixed(1)}</span>
                      <span className="text-xs font-bold text-[#666] uppercase">{weightUnit}</span>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500 mt-1 uppercase">Logged {startingWeight.date}</div>
                  </div>

                  <div className="bg-dark-panel border border-border-dark p-4 rounded-none flex flex-col justify-between shadow-sm">
                    <div className="text-[10px] font-mono text-[#666] uppercase font-black">Latest Weight</div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-2xl font-black font-mono text-brand">{currentVal.toFixed(1)}</span>
                      <span className="text-xs font-bold text-brand uppercase">{weightUnit}</span>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500 mt-1 uppercase">
                      {getRelativeTimePhrase(currentWeight.date)}
                    </div>
                  </div>

                  <div className="bg-dark-panel border border-border-dark p-4 rounded-none flex flex-col justify-between shadow-sm">
                    <div className="text-[10px] font-mono text-[#666] uppercase font-black">Total Net Variance</div>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className={`text-2xl font-black font-mono ${displayWeightChange < 0 ? 'text-emerald-500' : displayWeightChange > 0 ? 'text-amber-500' : 'text-zinc-500'}`}>
                        {displayWeightChange > 0 ? `+${displayWeightChange.toFixed(1)}` : displayWeightChange.toFixed(1)}
                      </span>
                      <span className="text-xs font-bold text-zinc-500 uppercase">{weightUnit}</span>
                    </div>
                    <div className="text-[9px] font-mono text-zinc-500 mt-1 uppercase">
                      {displayWeightChange < 0 ? 'Deficit / Leaning Out' : displayWeightChange > 0 ? 'Surplus / Muscle Bulk' : 'Maintenance'}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SVG graph */}
            {renderSvgGraph()}

            {/* Timeline List */}
            {weightHistory.length === 0 ? (
              <div className="bg-dark-panel border border-border-dark border-dashed p-12 text-center rounded-none flex flex-col items-center justify-center gap-2">
                <Scale className="w-8 h-8 text-[#333]" />
                <p className="text-[#666] text-xs font-mono uppercase tracking-wider">No weight tracking entries logged yet</p>
                <p className="text-[#444] text-[10px] max-w-xs mt-1">
                  Your body composition history is completely clean. Log your current weight using the form below to start tracking.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {reverseHistory.map((entry) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    key={entry.id}
                    className="bg-dark-panel border border-border-dark flex flex-col justify-between rounded-none hover:border-brand/30 transition shadow-sm relative group overflow-hidden"
                  >
                    <div>
                      {entry.image ? (
                        <div className="relative h-40 w-full bg-dark-surface overflow-hidden border-b border-border-dark">
                          <img 
                            src={entry.image} 
                            alt={`Progress on ${entry.date}`} 
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                          />
                          <button
                            onClick={() => setSelectedFullImage(entry.image || null)}
                            className="absolute bottom-2.5 right-2.5 bg-black/70 hover:bg-brand hover:text-black text-white p-1.5 rounded-none border border-border-dark transition cursor-pointer"
                            title="Enlarge Progress Photo"
                          >
                            <Maximize2 className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <div className="h-20 w-full bg-dark-surface/40 flex flex-col items-center justify-center border-b border-border-dark/60 text-zinc-700">
                          <Camera className="w-5 h-5 opacity-40 mb-1" />
                          <span className="text-[8px] font-mono uppercase tracking-wider font-extrabold opacity-60">No Progress Picture</span>
                        </div>
                      )}

                      <div className="p-4 space-y-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-xl font-black font-mono text-white leading-none">{entry.weight}</span>
                              <span className="text-[10px] font-bold text-[#666] uppercase leading-none">{entry.unit}</span>
                            </div>
                            <div className="inline-flex items-center gap-1 bg-brand/5 border border-brand/10 text-brand text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-none uppercase mt-1.5">
                              <Clock className="w-2.5 h-2.5" />
                              <span>{getRelativeTimePhrase(entry.date)}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] font-mono text-[#666] font-bold block uppercase leading-none">Dated</span>
                            <span className="text-[10px] font-mono text-[#CCC] font-bold block mt-1 leading-none">{entry.date}</span>
                          </div>
                        </div>

                        {entry.notes && (
                          <p className="text-[#999] text-[11px] leading-relaxed italic bg-dark-surface/50 p-2 border border-border-dark border-dotted font-serif">
                            "{entry.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="px-4 py-2 bg-dark-surface border-t border-border-dark flex justify-end">
                      <button
                        onClick={() => {
                          if (confirm(`Remove progress log from ${entry.date} permanently?`)) {
                            onDeleteWeightEntry(entry.id);
                          }
                        }}
                        className="text-zinc-500 hover:text-rose-500 hover:bg-rose-950/20 px-1.5 py-1 text-[10px] font-mono uppercase tracking-wider font-black flex items-center gap-1 transition rounded-none cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Add progress entry log form */}
            <div className="bg-dark-panel border border-border-dark shadow-md">
              <button
                onClick={() => toggleSection('progressLog')}
                className="w-full text-left p-5 md:p-6 cursor-pointer hover:bg-dark-surface/30 transition flex justify-between items-center select-none"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4.5 h-4.5 text-brand" />
                    <h3 className="text-xs uppercase tracking-wider text-brand font-black">Add Progress Log</h3>
                  </div>
                  <p className="text-zinc-500 text-[11px] leading-relaxed max-w-xl">
                    Log your current weight, upload a progress photo, and add training notes.
                  </p>
                </div>
                <ChevronDown 
                  className={`w-5 h-5 text-zinc-500 transition-transform duration-300 ${
                    activeSection === 'progressLog' ? 'rotate-180 text-brand' : ''
                  }`} 
                />
              </button>

              <AnimatePresence initial={false}>
                {activeSection === 'progressLog' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="overflow-hidden border-t border-border-dark/40"
                  >
                    <div className="p-5 md:p-6">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-8 space-y-1.5">
                            <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Current Weight</label>
                            <div className="relative">
                              <input 
                                type="number" 
                                step="0.1"
                                required
                                placeholder="e.g. 185.4"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                className="w-full bg-dark-bg border border-border-dark focus:border-brand px-3 py-2 text-sm font-mono font-bold text-white rounded-none outline-none focus:ring-0 transition"
                              />
                              <div className="absolute right-3 top-2.5 text-zinc-600 font-mono text-xs">
                                {unit}
                              </div>
                            </div>
                          </div>

                          <div className="col-span-4 space-y-1.5">
                            <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Unit</label>
                            <div className="flex border border-border-dark rounded-none overflow-hidden h-[38px]">
                              <button
                                type="button"
                                onClick={() => setUnit('lbs')}
                                className={`flex-1 text-xs font-mono font-bold transition-all ${unit === 'lbs' ? 'bg-brand text-black' : 'bg-dark-surface text-zinc-400 hover:text-white'}`}
                              >
                                LBS
                              </button>
                              <button
                                type="button"
                                onClick={() => setUnit('kg')}
                                className={`flex-1 text-xs font-mono font-bold transition-all ${unit === 'kg' ? 'bg-brand text-black' : 'bg-dark-surface text-zinc-400 hover:text-white'}`}
                              >
                                KG
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Log Date</label>
                          <div className="relative">
                            <input 
                              type="date" 
                              required
                              max={new Date().toISOString().split('T')[0]}
                              value={date}
                              onChange={(e) => setDate(e.target.value)}
                              className="w-full bg-dark-bg border border-border-dark focus:border-brand px-3 py-2 text-sm font-mono font-bold text-white rounded-none outline-none transition"
                            />
                            <Calendar className="absolute right-3 top-2.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Progress Photo</label>
                          
                          {image ? (
                            <div className="relative border border-border-dark p-2 bg-dark-surface group rounded-none">
                              <img 
                                src={image} 
                                alt="Progress upload preview" 
                                className="w-full h-44 object-cover border border-border-dark/60 grayscale hover:grayscale-0 transition duration-300" 
                              />
                              <button
                                type="button"
                                onClick={() => setImage('')}
                                className="absolute top-4 right-4 bg-black/80 hover:bg-rose-950 border border-border-dark hover:border-rose-500 text-rose-500 p-1.5 rounded-none transition"
                                title="Remove Picture"
                              >
                                <X className="w-4 h-4" />
                              </button>
                              <div className="text-[9px] font-mono text-zinc-500 mt-1 text-center uppercase tracking-wider">
                                Picture compressed & formatted successfully
                              </div>
                            </div>
                          ) : (
                            <div
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                              onClick={handleSelectPhoto}
                              className={`border border-dashed p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 rounded-none min-h-[140px] ${
                                isDragging 
                                  ? 'border-brand bg-brand/5' 
                                  : 'border-border-dark hover:border-brand/40 bg-dark-surface hover:bg-dark-panel'
                              }`}
                            >
                              <Camera className="w-6 h-6 text-zinc-500 group-hover:text-brand" />
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-[#CCC]">Drag and drop your progress photo</p>
                                <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-wider">or click to browse</p>
                              </div>
                              <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden" 
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Log Notes (Optional)</label>
                          <div className="relative">
                            <textarea
                              rows={2}
                              placeholder="e.g. Morning weighing, feeling hydrated."
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              className="w-full bg-dark-bg border border-border-dark focus:border-brand px-3 py-2 text-xs text-white rounded-none outline-none resize-none transition"
                            />
                            <FileText className="absolute right-3 bottom-3.5 w-4 h-4 text-zinc-500 pointer-events-none" />
                          </div>
                        </div>

                        {errorMsg && (
                          <div className="text-[10px] font-mono text-rose-500 uppercase tracking-widest font-black animate-pulse">
                            ⚠ {errorMsg}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-brand hover:bg-white text-black font-black uppercase text-xs tracking-widest transition-all cursor-pointer flex items-center justify-center gap-1.5 rounded-none"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>Log Progress Entry</span>
                        </button>
                      </form>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      {/* 5. LIGHTBOX OVERLAY FOR ENLARGING PROGRESS PHOTOS */}
      <AnimatePresence>
        {selectedFullImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.9 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFullImage(null)}
              className="absolute inset-0 bg-black cursor-zoom-out"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative max-w-2xl w-full bg-dark-panel border border-border-dark p-2 rounded-none shadow-2xl z-10"
            >
              <img 
                src={selectedFullImage} 
                alt="Enlarged progress" 
                className="w-full h-auto max-h-[80vh] object-contain" 
              />
              <button
                onClick={() => setSelectedFullImage(null)}
                className="absolute top-4 right-4 bg-black/80 hover:bg-dark-surface border border-border-dark text-white p-2 rounded-none transition"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
