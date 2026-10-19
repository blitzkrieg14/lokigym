import React from 'react';
import { WorkoutHistoryEntry } from '../types';
import { TrendingUp } from 'lucide-react';

// Import base Norse character blueprint background
import titanBaseNew from '../assets/images/titan_base_new.jpg';

// Import custom hand-drawn guide images
import titanAbsGuide from '../assets/images/titan_abs_guide.jpg';
import titanBackGuide from '../assets/images/titan_back_guide.jpg';
import titanShouldersGuide from '../assets/images/titan_shoulders_guide.jpg';
import titanLegsGuide from '../assets/images/titan_legs_guide.jpg';
import titanArmsChestGuide from '../assets/images/titan_arms_chest_guide.jpg';
import heatmapLogo from '../assets/images/heatmap_logo.png';

export const HeatmapRuneIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Outer runic circle border */}
    <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="3" strokeDasharray="3 6" />
    <circle cx="50" cy="50" r="36" stroke="currentColor" strokeWidth="1.5" />
    
    {/* Mannaz Rune (The Human Body) */}
    {/* Main vertical posts */}
    <path d="M40 25 L40 75" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
    <path d="M60 25 L60 75" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
    
    {/* Intersecting diagonals representing arms/head */}
    <path d="M40 35 L60 65" stroke="currentColor" strokeWidth="4" />
    <path d="M60 35 L40 65" stroke="currentColor" strokeWidth="4" />
    
    {/* Horizontal connection lines */}
    <path d="M40 25 L60 25" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    <path d="M40 75 L60 75" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    
    {/* Glowing core/fire indicator */}
    <circle cx="50" cy="50" r="5" fill="currentColor" className="animate-pulse" />
  </svg>
);

interface TitanHeatmapProps {
  history: WorkoutHistoryEntry[];
  userNickname?: string;
  onClose?: () => void;
}

export default function TitanHeatmap({ history, userNickname, onClose }: TitanHeatmapProps) {
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

    const dates = matchingLogs.map(log => log.date ? new Date(log.date).getTime() : 0).filter(t => t > 0);
    if (dates.length === 0) return null;
    const mostRecentTime = Math.max(...dates);
    
    const diffTime = Date.now() - mostRecentTime;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getHeatmapColor = (days: number | null) => {
    if (days === null || days >= 6) return 'rgb(63, 63, 70)'; // Grey
    if (days >= 3) return 'rgb(249, 115, 22)'; // Orange
    return 'rgb(239, 68, 68)'; // Red
  };

  const getMusclesWorkedInLast5DaysCount = () => {
    const categories = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];
    const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
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

  const getMusclePercent = (muscleGroup: string) => {
    const days = getDaysSinceLastWorkout(muscleGroup);
    if (days === null || days >= 6) return 0;
    if (days >= 3) return 50;
    return 100;
  };

  const getDaysAgoText = (muscleGroup: string) => {
    const days = getDaysSinceLastWorkout(muscleGroup);
    if (days === null) return 'Never';
    if (days === 1) return '1 Day ago';
    return `${days} Days ago`;
  };

  const colors = {
    Chest: getHeatmapColor(getDaysSinceLastWorkout('Chest')),
    Back: getHeatmapColor(getDaysSinceLastWorkout('Back')),
    Legs: getHeatmapColor(getDaysSinceLastWorkout('Legs')),
    Arms: getHeatmapColor(getDaysSinceLastWorkout('Arms')),
    Shoulders: getHeatmapColor(getDaysSinceLastWorkout('Shoulders')),
    Core: getHeatmapColor(getDaysSinceLastWorkout('Core'))
  };

  const musclesCount = getMusclesWorkedInLast5DaysCount();
  
  const hairStyle = musclesCount >= 6 
    ? 'blue' 
    : musclesCount === 5 
      ? 'red' 
      : musclesCount === 4 
        ? 'gold' 
        : 'base';

  const getTitanFilter = () => {
    if (hairStyle === 'blue') return 'drop-shadow(0 0 16px rgba(14, 165, 233, 0.65)) contrast(1.05)';
    if (hairStyle === 'red') return 'drop-shadow(0 0 12px rgba(239, 68, 68, 0.55)) contrast(1.05)';
    if (hairStyle === 'gold') return 'drop-shadow(0 0 8px rgba(234, 179, 8, 0.45))';
    return 'none';
  };

  // Blackens background charcoal and shifts red channels to match status tints
  const getOverlayFilter = (color: string) => {
    const isOrange = color === 'rgb(249, 115, 22)';
    if (isOrange) {
      return 'contrast(1.6) brightness(0.55) saturate(2.4) hue-rotate(36deg) drop-shadow(0 0 6px rgba(249,115,22,0.7))';
    }
    return 'contrast(1.7) brightness(0.5) saturate(2.5) drop-shadow(0 0 6px rgba(239,68,68,0.7))';
  };

  const isChestActive = colors.Chest !== 'rgb(63, 63, 70)';
  const isBackActive = colors.Back !== 'rgb(63, 63, 70)';
  const isShouldersActive = colors.Shoulders !== 'rgb(63, 63, 70)';
  const isLegsActive = colors.Legs !== 'rgb(63, 63, 70)';
  const isArmsActive = colors.Arms !== 'rgb(63, 63, 70)';
  const isCoreActive = colors.Core !== 'rgb(63, 63, 70)';

  return (
    <div className="bg-black/15 border border-border-dark p-5 md:p-6 shadow-md relative overflow-hidden flex flex-col items-center justify-between min-h-[540px] w-full max-w-md mx-auto backdrop-blur-xl">
      
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-500 hover:text-white transition font-mono text-xs z-30 cursor-pointer"
        >
          ✕
        </button>
      )}
      
      {/* Titan Steam Background Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <svg className="w-full h-full" viewBox="0 0 240 220" fill="none">
          <path d="M 20 220 Q 10 170, 25 120 T 10 50" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" className="animate-pulse" />
          <path d="M 220 220 Q 230 170, 215 120 T 230 50" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" className="animate-pulse" />
          <path d="M 50 220 Q 40 150, 55 90 T 40 20" stroke="rgba(255,255,255,0.3)" strokeWidth="1" className="animate-pulse" />
          <path d="M 190 220 Q 200 150, 185 90 T 200 20" stroke="rgba(255,255,255,0.3)" strokeWidth="1" className="animate-pulse" />
        </svg>
      </div>

      <div className="text-center mb-3 z-10">
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <img src={heatmapLogo} alt="Logo" className="w-4 h-4 rounded-full object-cover animate-pulse mr-0.5" style={{ filter: 'url(#theme-tint)' }} />
          <span className="text-[10px] font-mono font-black text-white uppercase tracking-widest block">
            {userNickname ? `${userNickname} Heatmap` : "Loki Heatmap"}
          </span>
        </div>
        <span className="text-[8px] text-zinc-500 font-mono uppercase block">Recency of Muscle Stimulation</span>
      </div>

      <div className="relative w-64 h-[440px] bg-dark-surface/10 overflow-hidden border border-border-dark/40 z-10 flex items-center justify-center">
        
        {/* Base Character Drawing Background */}
        <img 
          src={titanBaseNew} 
          alt="Loki Titan Heatmap" 
          className="w-full h-full object-cover contrast-105 brightness-95 transition-all duration-300"
          style={{ filter: getTitanFilter() }}
        />

        {/* Abs/Core Highlight Overlay */}
        {isCoreActive && (
          <img 
            src={titanAbsGuide} 
            alt="Core highlight"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-300"
            style={{ mixBlendMode: 'screen', filter: getOverlayFilter(colors.Core) }}
          />
        )}

        {/* Back Highlight Overlay */}
        {isBackActive && (
          <img 
            src={titanBackGuide} 
            alt="Back highlight"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-300"
            style={{ mixBlendMode: 'screen', filter: getOverlayFilter(colors.Back) }}
          />
        )}

        {/* Shoulders Highlight Overlay */}
        {isShouldersActive && (
          <img 
            src={titanShouldersGuide} 
            alt="Shoulders highlight"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-300"
            style={{ mixBlendMode: 'screen', filter: getOverlayFilter(colors.Shoulders) }}
          />
        )}

        {/* Legs Highlight Overlay */}
        {isLegsActive && (
          <img 
            src={titanLegsGuide} 
            alt="Legs highlight"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-300"
            style={{ mixBlendMode: 'screen', filter: getOverlayFilter(colors.Legs) }}
          />
        )}

        {/* Chest Highlight Overlay (Clipped from arms/chest guide) */}
        {isChestActive && (
          <img 
            src={titanArmsChestGuide} 
            alt="Chest highlight"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-300"
            style={{ 
              mixBlendMode: 'screen', 
              filter: getOverlayFilter(colors.Chest),
              clipPath: 'inset(0% 33% 75% 33%)'
            }}
          />
        )}

        {/* Arms Highlight Overlay - Right Arm (Clipped from left third of arms/chest guide) */}
        {isArmsActive && (
          <img 
            src={titanArmsChestGuide} 
            alt="Right arm highlight"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-300"
            style={{ 
              mixBlendMode: 'screen', 
              filter: getOverlayFilter(colors.Arms),
              clipPath: 'inset(0% 67% 0% 0%)'
            }}
          />
        )}

        {/* Arms Highlight Overlay - Left Arm (Clipped from right third of arms/chest guide) */}
        {isArmsActive && (
          <img 
            src={titanArmsChestGuide} 
            alt="Left arm highlight"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-all duration-300"
            style={{ 
              mixBlendMode: 'screen', 
              filter: getOverlayFilter(colors.Arms),
              clipPath: 'inset(0% 0% 0% 67%)'
            }}
          />
        )}
      </div>

      {/* Legend & Stats */}
      <div className="w-full mt-4 bg-black/40 border border-border-dark p-2.5 z-10">
        <div className="flex flex-col gap-1.5 font-mono">
          <div className="flex justify-between items-center text-[8px] text-zinc-500 border-b border-border-dark pb-1 mb-1.5">
            <span className="uppercase font-extrabold text-[#888]">Muscles worked</span>
            <span className="text-brand font-black font-mono text-[9px]">
              {Math.round((musclesCount / 6) * 100)}% ({musclesCount}/6 worked)
            </span>
          </div>
          <div className="text-[7.5px] text-[#888] font-black uppercase tracking-wider font-mono text-left opacity-90 mb-1 mt-0.5">
            Last known workout date
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-1.5 pt-1.5 border-t border-border-dark/40 text-[9px] font-mono text-[#AAA]">
            <div className="flex justify-between border-b border-border-dark/20 pb-0.5"><span>CHEST:</span> <span className={colors.Chest === 'rgb(63,63,70)' ? 'text-zinc-600' : 'text-white font-bold'}>{getDaysAgoText('Chest')}</span></div>
            <div className="flex justify-between border-b border-border-dark/20 pb-0.5"><span>BACK:</span> <span className={colors.Back === 'rgb(63,63,70)' ? 'text-zinc-600' : 'text-white font-bold'}>{getDaysAgoText('Back')}</span></div>
            <div className="flex justify-between border-b border-border-dark/20 pb-0.5"><span>LEGS:</span> <span className={colors.Legs === 'rgb(63,63,70)' ? 'text-zinc-600' : 'text-white font-bold'}>{getDaysAgoText('Legs')}</span></div>
            <div className="flex justify-between border-b border-border-dark/20 pb-0.5"><span>SHOULDERS:</span> <span className={colors.Shoulders === 'rgb(63,63,70)' ? 'text-zinc-600' : 'text-white font-bold'}>{getDaysAgoText('Shoulders')}</span></div>
            <div className="flex justify-between border-b border-border-dark/20 pb-0.5"><span>ARMS:</span> <span className={colors.Arms === 'rgb(63,63,70)' ? 'text-zinc-600' : 'text-white font-bold'}>{getDaysAgoText('Arms')}</span></div>
            <div className="flex justify-between border-b border-border-dark/20 pb-0.5"><span>CORE:</span> <span className={colors.Core === 'rgb(63,63,70)' ? 'text-zinc-600' : 'text-white font-bold'}>{getDaysAgoText('Core')}</span></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[rgb(239,68,68)] border border-black" />
            <span className="text-[8px] font-bold text-[#CCC] uppercase tracking-wider">Primary (0-2 Days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[rgb(249,115,22)] border border-black" />
            <span className="text-[8px] font-bold text-[#CCC] uppercase tracking-wider">Secondary (3-5 Days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[rgb(63,63,70)] border border-black" />
            <span className="text-[8px] font-bold text-[#888] uppercase tracking-wider">Untargeted (6+ Days)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
