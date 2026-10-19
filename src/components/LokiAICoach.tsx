import React, { useState, useEffect, useRef } from 'react';
import { WorkoutHistoryEntry, PersonalBest, WeightLogEntry, WaterLog, Workout } from '../types';
import { Sparkles, Send, HelpCircle, ArrowRight, User, AlertTriangle, Check, Plus, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ValknutIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    viewBox="0 2 728 678" 
    className={`${className} fill-current`}
  >
    <path d="M19.5029,656.329H569.11L480.396,504.189H399.972L444.412,585.031H145.661L188.856,504.189H105.782ZM19.6543,494.568H195.586L235.73,423.863H143.757L293.602,164.479L340.068,241.734L381.741,169.869L293.602,19.5791ZM159.778,414.447H241.317L293.602,325.824L346.277,414.447H427.501L293.602,183.811ZM162.142,575.714H428.897L388.89,504.189H284.518L335.293,414.447L293.602,344.062ZM300.604,494.568H566.603L433.378,261.951L391.708,332.126L443.005,423.863H340.345ZM345.934,252.893L386.214,322.502L433.378,243.743L583.604,504.189H492.989L534.392,575.714H708.421L433.378,100.098Z"/>
  </svg>
);

interface LokiAICoachProps {
  history: WorkoutHistoryEntry[];
  personalBests: PersonalBest[];
  weightHistory: WeightLogEntry[];
  waterLogs: WaterLog[];
  customWorkouts: Workout[];
  onExecuteLokiAction: (action: {
    routines?: Workout[];
    schedule?: { day: string; routineName: string }[];
    clearPlanner?: boolean;
  }) => void;
  geminiApiKey: string;
  onGoToSettings: () => void;
  todaySteps: number;
  activeCalories?: number;
  totalCalories?: number;
  userNickname: string;
  lokiAiEngine: 'gemini_api' | 'gemini_nano';
  onClose?: () => void;
}

interface Message {
  id: string;
  sender: 'user' | 'loki';
  text: string;
  time: string;
  actionToExecute?: {
    routines?: Workout[];
    schedule?: { day: string; routineName: string }[];
    clearPlanner?: boolean;
  } | null;
}

export default function LokiAICoach({
  history,
  personalBests,
  weightHistory,
  waterLogs,
  customWorkouts,
  onExecuteLokiAction,
  geminiApiKey,
  onGoToSettings,
  todaySteps,
  activeCalories = 0,
  totalCalories = 0,
  onClose,
  userNickname,
  lokiAiEngine
}: LokiAICoachProps) {
  const [viewingRoutineDetails, setViewingRoutineDetails] = useState<Workout | null>(null);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem('loki_ai_messages');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn("Failed to load past messages:", e);
      }
    }
    return [
      {
        id: 'welcome',
        sender: 'loki',
        text: `Greetings, ${userNickname || 'mortal'}. I am the Loki AI Coach.\n\nI have calculated your weekly volume runes, read the trends of your body composition, and mapped your hydration cycles.\n\nSpeak: do you wish to forge a standard warrior training split, or did you indulge in the feasts of Valhalla and need to activate Loki's Penance to burn off the surplus?`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedRoutines, setSavedRoutines] = useState<string[]>([]);
  const [useSimpleFormat, setUseSimpleFormat] = useState(() => {
    return localStorage.getItem('loki_ai_use_simple') !== 'false';
  });
  const chatEndRef = useRef<HTMLDivElement>(null);

  const handleToggleSimple = (checked: boolean) => {
    setUseSimpleFormat(checked);
    localStorage.setItem('loki_ai_use_simple', String(checked));
  };

  // Save messages to local storage
  useEffect(() => {
    localStorage.setItem('loki_ai_messages', JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatContextData = () => {
    // Format training logs (last 5)
    const recentWorkouts = history.slice(0, 5).map(h => ({
      date: h.date,
      name: h.workoutName,
      group: h.muscleGroup,
      sets: h.totalSetsCompleted,
      weight: h.totalWeightMoved || 0
    }));

    // Format weight trends
    const weightLogs = weightHistory.slice(0, 5).map(w => ({
      date: w.date,
      weight: w.weight,
      unit: w.unit
    }));

    // Format hydration logs (last 5)
    const recentWater = waterLogs.slice(0, 5).map(w => ({
      date: w.date,
      amount: w.amount,
      target: w.target
    }));

    // Personal Bests
    const pbs = personalBests.map(p => ({
      name: p.exerciseName,
      weight: p.maxWeight,
      reps: p.maxReps,
      duration: p.maxDuration
    }));

    return {
      recentWorkouts,
      weightLogs,
      recentWater,
      pbs,
      customSplitNames: customWorkouts.map(w => w.name)
    };
  };

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}_user`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const context = formatContextData();
      
      const formatInstruction = `
CRITICAL FORMATTING OVERRIDE:
You MUST summarize your advice and respond in a very simple, brief, and concise format. 
Discard any conversational padding, roleplay prose, fluff, or excessive god-voice monologues. 
Get directly to the point. Provide summaries, short bullet points, and clean lists. If generating a routine, focus strictly on the routine layout. Maximize brevity while maintaining the core coaching advice.`;

      const systemPrompt = `You are "Loki AI Coach", the Norse Trickster God himself, turned modern strength coach. 
Your tone is clever, calculating, prideful, and slightly mischievous, but highly data-driven and focused on forging a legendary vessel. 
Under no circumstances should you use emojis in your responses. Keep formatting clean and text-based.
${useSimpleFormat ? formatInstruction : '\nSpeak with divine authority. Refer to exercises as "feats of strength", weights as "iron runes", and training accomplishments as "legendary conquests". Use Norse phrases like "By the Horns of Odin", "The forge of Nidavellir", and "The loom of the Norns". Avoid modern corporate gym jargon.'}

Here is the user's data context:
- Recent Workout Logs: ${JSON.stringify(context.recentWorkouts)}
- Weight Trend Logs: ${JSON.stringify(context.weightLogs)}
- Hydration Logs: ${JSON.stringify(context.recentWater)}
- Personal Bests Records: ${JSON.stringify(context.pbs)}
- User's Current Custom Workouts: ${JSON.stringify(context.customSplitNames)}
- User's Moniker/Nickname: ${userNickname || 'mortal'}
Always address the user by this moniker ("${userNickname || 'mortal'}") instead of "mortal" or "warrior" where appropriate.
- User's Steps Taken Today: ${todaySteps} / 10000 (Goal: 10000 steps)
- User's Active Calories Burned Today: ${activeCalories} kcal
- User's Total Calories Burned Today (including basals): ${totalCalories} kcal

Special Routines Logic:
- If the user indicates they want a standard or regular workout, design a structured warrior training routine.
- If the user indicates they indulged in Valhalla's feast (unhealthy food / cheat meals) or need Loki's Penance, design an extra-intense, high-density workout. Frame it as "Loki's Penance" designed to purge the gluttony and test their warrior resolve.
- If their step count today is below 4000 steps, mock them slightly in your text response for being lazy or sedentary, demanding they march more on their feet. If they have met or exceeded their 10000 steps goal, praise them as a tireless voyager traversing Midgard.
- If their active calories burned today is low (below 150 kcal), encourage them to burn more fat and expend energy. If it is high (above 500 kcal), praise their divine output.

Capabilities & Actions:
1. You can design custom workout routines.
2. You can schedule routines directly to the user's weekly planner.
3. CRITICAL: If you want to add/save routines OR schedule/modify the weekly planner, you MUST append a JSON action block inside a [LOKI_ACTION_JSON: {...}] wrapper at the very end of your response.
The JSON must strictly conform to:
[LOKI_ACTION_JSON: {
  "routines": [
    {
      "name": "AI Routine Name",
      "muscleGroup": "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core" | "Full Body",
      "exercises": [
        {
          "name": "Exercise Name",
          "muscleGroup": "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core",
          "type": "reps" | "time",
          "defaultDuration": 60,
          "sets": [
            { "setId": 1, "reps": 10, "weight": 100, "isCompleted": false },
            { "setId": 2, "reps": 10, "weight": 100, "isCompleted": false }
          ],
          "restDuration": 90
        }
      ]
    }
  ],
  "schedule": [
    { "day": "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday", "routineName": "AI Routine Name OR an existing routine name" }
  ],
  "clearPlanner": false
}]

Ensure the JSON is completely valid. Choose a muscleGroup that matches the list exactly. You can specify "routines" alone, "schedule" alone, or both. Setting clearPlanner to true will empty the schedule before applying the new layout.
`;

      // Filter out the static welcome message so the history starts with a user message
      const historyMessages = messages.filter(m => m.id !== 'welcome');

      let aiText = "";

      if (lokiAiEngine === 'gemini_nano') {
        const ai = (window as any).ai?.languageModel || (window as any).ai;
        if (!ai) {
          throw new Error("Local model engine (window.ai) is not supported in this WebView. Please verify flags or switch to Gemini API (Cloud) in settings.");
        }

        const capabilities = await ai.capabilities?.();
        if (capabilities && capabilities.available === 'no') {
          throw new Error("window.ai is supported, but the on-device language model has not finished downloading yet.");
        }

        const session = await ai.create({
          systemPrompt: systemPrompt
        });

        const historyText = historyMessages.slice(-6).map(m => `${m.sender === 'user' ? 'User' : 'Loki'}: ${m.text}`).join('\n');
        const finalPrompt = historyText 
          ? `${historyText}\nUser: ${textToSend}\nLoki:`
          : textToSend;

        aiText = await session.prompt(finalPrompt);
        session.destroy();
      } else {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            contents: [
              ...historyMessages.slice(-6).map(m => ({
                role: m.sender === 'user' ? 'user' : 'model',
                parts: [{ text: m.text }]
              })),
              { role: "user", parts: [{ text: textToSend }] }
            ]
          })
        });

        if (!response.ok) {
          let errText = "";
          try {
            const errData = await response.json();
            errText = errData.error?.message || JSON.stringify(errData);
          } catch (_) {
            try {
              errText = await response.text();
            } catch (__) {
              errText = `HTTP status ${response.status}`;
            }
          }
          throw new Error(errText || `Server returned status code ${response.status}`);
        }

        const data = await response.json();
        aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "The Allfather's signals are scrambled. Please try your query again.";
      }

      // Robust parser for Loki Action JSON
      let cleanText = aiText;
      let actionData: any = null;
      
      let tagIndex = aiText.indexOf('[LOKI_ACTION_JSON:');
      let tagLength = '[LOKI_ACTION_JSON:'.length;
      
      if (tagIndex === -1) {
        tagIndex = aiText.indexOf('[ROUTINE_JSON:');
        tagLength = '[ROUTINE_JSON:'.length;
      }

      if (tagIndex !== -1) {
        let braceCount = 0;
        let started = false;
        let endBracketIdx = -1;
        
        for (let i = tagIndex + tagLength; i < aiText.length; i++) {
          const char = aiText[i];
          if (char === '{') {
            braceCount++;
            started = true;
          } else if (char === '}') {
            braceCount--;
          }
          
          if (started && braceCount === 0) {
            const nextBracket = aiText.indexOf(']', i);
            endBracketIdx = nextBracket !== -1 ? nextBracket : i;
            break;
          }
        }
        
        if (endBracketIdx !== -1) {
          const jsonSubstring = aiText.substring(tagIndex, endBracketIdx + 1);
          const firstBrace = jsonSubstring.indexOf('{');
          const lastBrace = jsonSubstring.lastIndexOf('}');
          
          if (firstBrace !== -1 && lastBrace !== -1) {
            const innerJson = jsonSubstring.substring(firstBrace, lastBrace + 1);
            try {
              let parsedData = JSON.parse(innerJson);
              // Normalize old single-routine format to new action schema
              if (parsedData && parsedData.exercises && !parsedData.routines) {
                parsedData = {
                  routines: [parsedData]
                };
              }
              actionData = parsedData;
            } catch (e) {
              console.warn("Failed to parse Loki Action JSON:", e, innerJson);
            }
          }
          
          // Clean up the entire tag region from user view (including any enclosing markdown code blocks!)
          let cleanStart = tagIndex;
          let cleanEnd = endBracketIdx + 1;
          
          // Look backwards for markdown block start
          const beforeStr = aiText.substring(Math.max(0, tagIndex - 15), tagIndex);
          const codeBlockStartMatch = beforeStr.match(/```(json)?\s*$/);
          if (codeBlockStartMatch) {
            cleanStart = tagIndex - codeBlockStartMatch[0].length;
          }
          
          // Look forwards for markdown block end
          const afterStr = aiText.substring(endBracketIdx + 1, Math.min(aiText.length, endBracketIdx + 15));
          const codeBlockEndMatch = afterStr.match(/^\s*```/);
          if (codeBlockEndMatch) {
            cleanEnd = endBracketIdx + 1 + codeBlockEndMatch[0].length;
          }
          
          cleanText = (aiText.substring(0, cleanStart) + aiText.substring(cleanEnd)).trim();
        }
      }

      const lokiMessage: Message = {
        id: `msg_${Date.now()}_loki`,
        sender: 'loki',
        text: cleanText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionToExecute: actionData
      };

      setMessages(prev => [...prev, lokiMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `msg_${Date.now()}_err`,
        sender: 'loki',
        text: `API Connection Failed: ${err?.message || err}. Make sure your device has internet access and your Gemini API Key in Settings is valid.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAction = (action: any, messageId: string) => {
    onExecuteLokiAction(action);
    setSavedRoutines(prev => [...prev, messageId]);
    alert("Loki AI Action Plan applied successfully! Routines added and Weekly Planner updated.");
  };

  const clearChat = () => {
    if (confirm("Clear your Loki AI chat history?")) {
      const reset = [
        {
          id: 'welcome',
          sender: 'loki',
          text: "Greetings, mortal. I am the Loki AI Coach.\n\nI have calculated your weekly volume runes, read the trends of your body composition, and mapped your hydration cycles.\n\nSpeak: do you wish to forge a standard warrior training split, or did you indulge in the feasts of Valhalla and need to activate Loki's Penance to burn off the surplus?",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ];
      setMessages(reset);
    }
  };



  // If API Key is not set, prompt configuration
  if (lokiAiEngine === 'gemini_api' && !geminiApiKey) {
    return (
      <div className="bg-black/15 border border-border-dark p-6 text-center max-w-xl mx-auto rounded-none space-y-5 shadow-lg backdrop-blur-xl relative">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 text-zinc-500 hover:text-white transition font-mono text-xs"
          >
            ✕
          </button>
        )}
        <div className="w-16 h-16 rounded-none bg-dark-surface border border-border-dark flex items-center justify-center text-brand mx-auto animate-pulse">
          <ValknutIcon className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-display font-black italic uppercase text-white tracking-tight leading-none">Loki AI Coach</h2>
          <span className="text-[9px] font-mono text-zinc-500 uppercase block tracking-wider mt-1">Unlock Intelligent Training Analytics</span>
        </div>
        <p className="text-zinc-400 text-xs leading-relaxed">
          Connect your custom Gemini API Key in Settings to enable the Loki AI Personal Coach. Once configured, you can get instant routine generations, volume breakdowns, nutrition guidelines, and form guides trained on your actual lift statistics.
        </p>
        <div className="pt-2">
          <button
            onClick={onGoToSettings}
            className="py-3 px-6 bg-brand hover:bg-white text-black text-xs font-mono font-black uppercase tracking-wider transition rounded-none cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
          >
            <span>Configure Gemini API Key</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/15 border border-border-dark shadow-md flex flex-col h-full w-full relative overflow-hidden font-sans backdrop-blur-xl">
      
      {/* Header bar */}
      <div className="bg-dark-surface/60 border-b border-border-dark/60 p-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-black/60 border border-brand/20 flex items-center justify-center text-brand">
            <ValknutIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black text-white uppercase tracking-widest block leading-none">Loki AI Coach</span>
            <span className="text-[8px] text-emerald-400 font-mono uppercase block mt-1 leading-none">Status: Linked to Gemini API</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={clearChat}
            className="px-2.5 py-1 text-[9px] font-mono font-bold border border-border-dark hover:border-brand/40 text-zinc-500 hover:text-white transition rounded-none cursor-pointer"
          >
            Reset Chat
          </button>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="w-6 h-6 flex items-center justify-center border border-border-dark hover:border-brand/40 text-zinc-500 hover:text-white transition rounded-none cursor-pointer font-bold text-xs"
              title="Close Coach"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Configuration bar */}
      <div className="bg-dark-surface/30 border-b border-border-dark/30 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[9px] font-mono select-none">
        <div className="flex items-center gap-4">
          {/* Simple Format Toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer text-zinc-400 hover:text-white transition">
            <input 
              type="checkbox" 
              checked={useSimpleFormat}
              onChange={(e) => handleToggleSimple(e.target.checked)}
              className="accent-brand rounded-none border-zinc-700 bg-black cursor-pointer"
            />
            <span>Brief / Simple Format</span>
          </label>
        </div>
      </div>

      {/* Message Feed Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scrollbar-thin bg-black/10">
        {messages.map((m) => {
          const isLoki = m.sender === 'loki';
          return (
            <div 
              key={m.id} 
              className={`flex items-start gap-3.5 max-w-[85%] ${isLoki ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-none flex items-center justify-center border flex-shrink-0 text-xs font-mono font-bold select-none ${
                isLoki 
                  ? 'bg-brand/10 border-brand text-brand shadow-[0_0_8px_rgba(255,230,0,0.1)]' 
                  : 'bg-dark-surface border-border-dark text-[#AAA]'
              }`}>
                {isLoki ? 'LK' : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-3 w-full">
                <div className={`p-4 border rounded-none text-xs leading-relaxed relative ${
                  isLoki 
                    ? 'bg-dark-surface/40 border-border-dark/60 text-[#F0F0F0]' 
                    : 'bg-brand/5 border-brand/30 text-brand shadow-[0_0_12px_rgba(255,230,0,0.02)]'
                }`}>
                  {/* Formatted Text rendering */}
                  <div className="whitespace-pre-wrap font-sans">
                    {m.text.split('\n').map((line, lineIdx) => {
                      const parts = line.split(/\*\*([\s\S]*?)\*\*/g);
                      return (
                        <p key={lineIdx} className={lineIdx > 0 ? "mt-2" : ""}>
                          {parts.map((part, partIdx) => 
                            partIdx % 2 === 1 ? <strong key={partIdx} className="text-white font-black">{part}</strong> : part
                          )}
                        </p>
                      );
                    })}
                  </div>

                  <span className="absolute bottom-1 right-2 text-[7.5px] font-mono text-zinc-600 block">
                    {m.time}
                  </span>
                </div>

                {/* Apply Loki Action Card if present */}
                {m.actionToExecute && (
                  <div className="bg-dark-surface border-2 border-brand/20 p-4 rounded-none flex flex-col justify-between gap-3.5 shadow-md">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Sparkles className="w-4 h-4 text-brand fill-brand/20 animate-pulse" />
                        <span className="text-[10px] font-mono font-black text-brand uppercase tracking-widest block leading-none">AI Agentic Integration Plan</span>
                      </div>
                      
                      <div className="space-y-1 mt-2">
                        {m.actionToExecute.routines && m.actionToExecute.routines.length > 0 && (
                          <div className="text-xs text-white space-y-1">
                            <span className="text-brand font-bold font-mono block">Routines:</span>
                            <div className="flex flex-col gap-1 mt-1 pl-1">
                              {m.actionToExecute.routines.map((r, rIdx) => (
                                <div key={r.id || rIdx} className="flex items-center justify-between gap-2 bg-black/40 border border-border-dark/40 py-1 px-2">
                                  <span className="font-mono text-zinc-300">⚔ {r.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => setViewingRoutineDetails(r)}
                                    className="py-0.5 px-1.5 border border-border-dark hover:border-brand/40 text-zinc-500 hover:text-brand transition select-none cursor-pointer flex items-center gap-1 text-[8px] font-mono font-bold uppercase"
                                    title="View Routine Details"
                                  >
                                    <HelpCircle className="w-3 h-3 text-brand" />
                                    <span>Details</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {m.actionToExecute.schedule && m.actionToExecute.schedule.length > 0 && (
                          <div className="text-xs text-white">
                            <span className="text-brand font-bold font-mono mr-1">Planner:</span>
                            Schedule {m.actionToExecute.schedule.map(s => `${s.day} (${s.routineName})`).join(', ')}
                          </div>
                        )}
                        {m.actionToExecute.clearPlanner && (
                          <div className="text-[10px] text-zinc-500 font-mono italic">
                            * This action will clear the existing planner before applying.
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleSaveAction(m.actionToExecute!, m.id)}
                      disabled={savedRoutines.includes(m.id)}
                      className={`py-2 px-3 text-[10px] font-mono font-black uppercase tracking-wider rounded-none transition flex items-center justify-center gap-1.5 cursor-pointer ${
                        savedRoutines.includes(m.id)
                          ? 'bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed'
                          : 'bg-brand hover:bg-white text-black'
                      }`}
                    >
                      {savedRoutines.includes(m.id) ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Applied to Database & Planner</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Apply Action Plan</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* AI Generator Loading Animation */}
        {isLoading && (
          <div className="flex items-start gap-3.5 max-w-[80%] mr-auto">
            <div className="w-8 h-8 rounded-none bg-brand/10 border border-brand text-brand flex items-center justify-center text-xs font-mono font-bold animate-pulse">
              <ValknutIcon className="w-4.5 h-4.5" />
            </div>
            <div className="bg-dark-surface/40 border border-border-dark p-3.5 rounded-none flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-brand rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Loki is calculating...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggestion Chips and Input Bar */}
      <div className="bg-dark-surface/60 border-t border-border-dark/60 p-4 space-y-3.5 z-10">
        


        {/* Input Bar Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex gap-2"
        >
          <input 
            type="text"
            required
            placeholder="Type your fitness query here (e.g. Analyze my stats)..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-black border border-border-dark focus:border-brand focus:outline-none rounded-none py-2.5 px-4 text-xs text-white placeholder-zinc-700 transition"
          />
          
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="w-11 bg-brand hover:bg-white disabled:bg-zinc-800 disabled:text-zinc-600 disabled:border-zinc-750 text-black flex items-center justify-center transition rounded-none cursor-pointer border border-brand"
          >
            <Send className="w-4 h-4 fill-current" />
          </button>
        </form>
      {/* Exercise inspection overlay inside Loki AI Coach */}
      <AnimatePresence>
        {viewingRoutineDetails && (
          <div 
            onClick={() => setViewingRoutineDetails(null)}
            className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col z-[100] p-4 cursor-pointer"
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-brand p-4 w-full h-full flex flex-col space-y-4 cursor-default text-left overflow-y-auto"
            >
              <div className="flex justify-between items-start border-b border-border-dark/60 pb-2">
                <div>
                  <h3 className="text-xs font-mono font-black text-brand uppercase tracking-widest leading-none">
                    {viewingRoutineDetails.name}
                  </h3>
                  <span className="text-[8px] text-zinc-500 font-mono uppercase block mt-1">
                    Target: {viewingRoutineDetails.muscleGroup}
                  </span>
                </div>
                <button 
                  onClick={() => setViewingRoutineDetails(null)}
                  className="w-5 h-5 flex items-center justify-center border border-border-dark hover:border-brand text-zinc-500 hover:text-white text-[10px] font-bold"
                >
                  ✕
                </button>
              </div>

              {viewingRoutineDetails.description && (
                <p className="text-[10px] text-zinc-400 leading-relaxed italic">
                  {viewingRoutineDetails.description}
                </p>
              )}

              <div className="flex-1 space-y-3 overflow-y-auto pr-1">
                {viewingRoutineDetails.exercises.map((ex, idx) => {
                  const numSets = ex.sets.length;
                  const firstSetReps = ex.sets[0]?.reps || 10;
                  return (
                    <div key={ex.id} className="border border-border-dark/40 bg-black/40 p-2.5 space-y-1">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-white font-mono">{idx + 1}. {ex.name}</span>
                        <span className="text-[8px] bg-dark-surface px-1.5 py-0.5 border border-border-dark text-zinc-400 font-mono uppercase">
                          {ex.muscleGroup}
                        </span>
                      </div>
                      <div className="text-[9px] text-zinc-500 font-mono flex items-center gap-3">
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
                onClick={() => setViewingRoutineDetails(null)}
                className="w-full text-center py-2 bg-brand text-black text-[9px] font-mono font-black uppercase tracking-wider cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
      </div>

    </div>
  );
}
