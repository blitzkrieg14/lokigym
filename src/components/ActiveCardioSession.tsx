import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Navigation, Award, Map, RefreshCw, Check, Activity } from 'lucide-react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
import { broadcastWorkoutTelemetry } from '../services/broadcastService';

// Voice prompt speaker with browser speech synthesis fallback
const speakText = async (text: string) => {
  try {
    await TextToSpeech.speak({
      text,
      lang: 'en-US',
      rate: 1.0,
      pitch: 1.0,
      volume: 1.0,
      category: 'ambient'
    });
  } catch (error) {
    console.warn("Native TextToSpeech failed, trying browser speech synthesis:", error);
    try {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.error("Browser speech synthesis failed:", e);
    }
  }
};

interface ActiveCardioSessionProps {
  activity: string;
  mode: 'timer' | 'free';
  targetMinutes?: number;
  trackingProfile?: 'Walking' | 'Running' | 'Sprinting' | 'Cycling' | 'Paddleboarding' | 'Hiking';
  distanceUnit?: 'km' | 'mi';
  onFinish: (stats: {
    activity: string;
    durationSeconds: number;
    distanceKm: number;
    elevationMeters: number;
    gpsPoints: { lat: number; lng: number; alt: number | null; timestamp: number }[];
  }) => void;
  onCancel: () => void;
}

// Haversine formula to calculate distance between coordinates in km
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Leaflet route viewer
export function LeafletMap({ points }: { points: { lat: number; lng: number; alt: number | null; timestamp: number }[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const polylineInstance = useRef<any>(null);

  useEffect(() => {
    let checkL: NodeJS.Timeout | null = null;

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      if (!mapInstance.current) {
        mapInstance.current = L.map(mapRef.current, {
          zoomControl: false,
          attributionControl: false
        }).setView([0, 0], 2);

        L.tileLayer('https://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}', {
          maxZoom: 20,
          subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
          attribution: '&copy; Google Maps'
        }).addTo(mapInstance.current);
      }

      const map = mapInstance.current;

      if (points.length > 0) {
        const latlngs = points.map(p => [p.lat, p.lng]);

        if (polylineInstance.current) {
          polylineInstance.current.setLatLngs(latlngs);
        } else {
          polylineInstance.current = L.polyline(latlngs, { 
            color: '#FFE600', 
            weight: 5,
            opacity: 0.85
          }).addTo(map);
        }

        try {
          if (points.length === 1) {
            map.setView(latlngs[0], 16);
          } else {
            map.fitBounds(polylineInstance.current.getBounds(), { padding: [15, 15] });
          }
        } catch (e) {}
      } else {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const currentLatLng: [number, number] = [pos.coords.latitude, pos.coords.longitude];
              map.setView(currentLatLng, 16);
            },
            (err) => {
              console.warn("Map initial geolocation failed:", err);
            },
            { enableHighAccuracy: true, timeout: 5000 }
          );
        }
      }
    };

    const loadLeaflet = () => {
      if ((window as any).L) {
        initMap();
        return;
      }

      // CSS
      const linkId = 'leaflet-css-cardio';
      if (!document.getElementById(linkId)) {
        const link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      // Script
      const scriptId = 'leaflet-js-cardio';
      if (!document.getElementById(scriptId)) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => initMap();
        document.body.appendChild(script);
      } else {
        checkL = setInterval(() => {
          if ((window as any).L) {
            if (checkL) clearInterval(checkL);
            initMap();
          }
        }, 100);
      }
    };

    loadLeaflet();

    return () => {
      if (checkL) clearInterval(checkL);
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
        } catch (e) {}
        mapInstance.current = null;
        polylineInstance.current = null;
      }
    };
  }, [points]);

  return (
    <div 
      ref={mapRef} 
      className="w-full h-full min-h-[180px] bg-zinc-950 border border-border-dark relative z-10"
    />
  );
}

export default function ActiveCardioSession({ activity, mode, targetMinutes, trackingProfile, distanceUnit = 'km', onFinish, onCancel }: ActiveCardioSessionProps) {
  const [seconds, setSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [points, setPoints] = useState<{ lat: number; lng: number; alt: number | null; timestamp: number }[]>([]);
  const [distance, setDistance] = useState(0);
  const [elevation, setElevation] = useState(0);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevPointRef = useRef<{ lat: number; lng: number; alt: number | null; timestamp: number } | null>(null);

  // Voice prompts state/refs
  const lastAnnouncedDistanceRef = useRef<number>(0);

  // Voice prompt distance checker
  useEffect(() => {
    if (distance === 0) return;

    const currentUnitDistance = distanceUnit === 'mi' ? distance * 0.621371 : distance;
    const currentUnitFloor = Math.floor(currentUnitDistance);

    if (currentUnitFloor > lastAnnouncedDistanceRef.current) {
      const numberText = currentUnitFloor === 1 ? "one" : currentUnitFloor.toString();
      const unitText = distanceUnit === 'mi'
        ? (currentUnitFloor === 1 ? "mile" : "miles")
        : (currentUnitFloor === 1 ? "kilometer" : "kilometers");
      
      const prompt = `${numberText} ${unitText}`;
      speakText(prompt);
      
      lastAnnouncedDistanceRef.current = currentUnitFloor;
    }
  }, [distance, distanceUnit]);

  // Synchronize lastAnnouncedDistanceRef to avoid double-speaks on unit changes
  useEffect(() => {
    const currentUnitDistance = distanceUnit === 'mi' ? distance * 0.621371 : distance;
    lastAnnouncedDistanceRef.current = Math.floor(currentUnitDistance);
  }, [distanceUnit]);

  // Notifications helper
  const notifyFinished = async () => {
    try {
      await Haptics.vibrate();
      await LocalNotifications.schedule({
        notifications: [
          {
            title: "Cardio Goal Achieved! 🏆",
            body: `You completed your ${activity} session!`,
            id: 8888,
            sound: 'beep.wav'
          }
        ]
      });
    } catch (e) {
      console.warn("Notification/Haptics failed:", e);
    }
  };

  // Timer interval
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setSeconds(prev => {
          const nextVal = prev + 1;
          if (mode === 'timer' && targetMinutes) {
            const targetSecs = targetMinutes * 60;
            if (nextVal >= targetSecs) {
              notifyFinished();
              setIsPaused(true);
            }
          }
          return nextVal;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, mode, targetMinutes]);

  const isFinishedOrCancelledRef = useRef<boolean>(false);

  // Broadcast cardio session telemetry to Darts Scoreboard
  useEffect(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const formattedDuration = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    const displayDist = distanceUnit === 'mi' ? (distance * 0.621371).toFixed(2) : distance.toFixed(2);
    const unitLabel = distanceUnit === 'mi' ? 'mi' : 'km';

    broadcastWorkoutTelemetry({
      active: true,
      workoutName: `Cardio: ${activity}`,
      durationSeconds: seconds,
      formattedDuration,
      currentExercise: `${trackingProfile || activity} (${displayDist} ${unitLabel})`,
      currentSet: 1,
      totalSetsForExercise: 1,
      totalSetsCompleted: 1,
      totalWeightMoved: 0,
      weightUnit: unitLabel,
      isResting: false,
      restRemaining: 0,
      totalRestDuration: 0
    });
  }, [seconds, activity, distance, distanceUnit, trackingProfile]);

  useEffect(() => {
    return () => {
      if (!isFinishedOrCancelledRef.current) {
        broadcastWorkoutTelemetry({ active: false }, true);
      }
    };
  }, []);

  // Geolocation watch listener
  useEffect(() => {
    if (isPaused) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your device WebView.");
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const alt = pos.coords.altitude;
        const timestamp = pos.timestamp;

        // Skip inaccurate updates
        if (pos.coords.accuracy > 40) return;

        // Clear previous error if we get coordinates
        setGpsError(null);

        setPoints(prev => {
          const newPoints = [...prev, { lat, lng, alt, timestamp }];
          
          if (prevPointRef.current) {
            const deltaDist = calculateDistance(
              prevPointRef.current.lat, 
              prevPointRef.current.lng, 
              lat, 
              lng
            );
            
            // Filter minor GPS drift (must be at least 10 meters)
            if (deltaDist > 0.010) {
              const timeDiffSeconds = (timestamp - prevPointRef.current.timestamp) / 1000;
              
              // Filter speed anomalies (stationary desk drift or teleports)
              if (timeDiffSeconds > 0) {
                const speedKmh = deltaDist / (timeDiffSeconds / 3600);
                if (speedKmh < 1.5 || speedKmh > 95) {
                  return prev;
                }
              }
              
              // Filter using system reported speed if present
              if (pos.coords.speed !== null && pos.coords.speed !== undefined && pos.coords.speed < 0.4) {
                return prev;
              }

              setDistance(d => parseFloat((d + deltaDist).toFixed(3)));
              
              if (prevPointRef.current.alt !== null && alt !== null) {
                const deltaElev = alt - prevPointRef.current.alt;
                if (deltaElev > 0.5) {
                  setElevation(e => Math.round(e + deltaElev));
                }
              }
              
              prevPointRef.current = { lat, lng, alt, timestamp };
            }
          } else {
            prevPointRef.current = { lat, lng, alt, timestamp };
          }

          return newPoints;
        });
      },
      (err) => {
        console.warn("GPS watch position error:", err);
        if (err.code === 1) {
          setGpsError("Location permissions denied. Please enable GPS permissions in settings.");
        } else if (err.code === 2) {
          setGpsError("GPS signal lost. Make sure location services are enabled on your device.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isPaused]);

  // Formatter
  const formatSeconds = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPace = () => {
    if (distance === 0 || seconds === 0) return "--:--";
    const totalMins = seconds / 60;
    const targetDistance = distanceUnit === 'mi' ? distance * 0.621371 : distance;
    const paceMinPerUnit = totalMins / targetDistance;
    const paceMins = Math.floor(paceMinPerUnit);
    const paceSecs = Math.floor((paceMinPerUnit - paceMins) * 60);
    return `${paceMins}:${paceSecs.toString().padStart(2, '0')}`;
  };

  const getPercentage = () => {
    if (mode === 'free' || !targetMinutes) return 100;
    const totalSecs = targetMinutes * 60;
    return Math.min(100, (seconds / totalSecs) * 100);
  };

  const timeRemaining = () => {
    if (mode === 'free' || !targetMinutes) return 0;
    const targetSecs = targetMinutes * 60;
    return Math.max(0, targetSecs - seconds);
  };

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950 flex flex-col font-sans">
      {/* Accent Header Line */}
      <div className="w-full h-1 bg-gradient-to-r from-brand via-yellow-400 to-amber-500" />

      {/* Top Banner */}
      <div className="bg-dark-panel border-b border-border-dark py-4 px-5 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-brand" />
          <div>
            <h2 className="text-sm font-display font-black tracking-wider uppercase text-white leading-none">
              Cardio {activity}
            </h2>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1 block">
              {mode === 'timer' ? `Timer Target: ${targetMinutes}m` : 'Free Style Stopwatch'}
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {gpsError && (
          <div className="bg-red-500/10 border border-red-500/30 p-3 flex items-start gap-2.5 rounded-none animate-pulse">
            <div className="flex-1">
              <h4 className="text-xs font-mono font-bold uppercase text-red-500">Location Access Issue</h4>
              <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed font-mono">{gpsError}</p>
            </div>
          </div>
        )}

        {/* GPS Tracking Status Panel (Replacing live map to prevent intrusive refreshes/re-centering) */}
        <div className="h-[200px] sm:h-[260px] bg-dark-panel border border-border-dark p-6 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner">
          {/* Radial glow background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-brand/5 rounded-full blur-2xl animate-pulse" />
          
          <div className="relative z-10 flex flex-col items-center gap-3.5">
            {/* Pulsing GPS Satellite Radar Ring */}
            <div className="relative flex items-center justify-center">
              <span className="absolute inline-flex h-12 w-12 rounded-none bg-brand/10 border border-brand/20 animate-ping" />
              <div className="relative w-12 h-12 bg-dark-surface border border-border-dark flex items-center justify-center text-brand">
                <Navigation className="w-5 h-5 fill-brand/20 rotate-45 animate-pulse" />
              </div>
            </div>

            <div>
              <span className="text-[9px] font-mono font-black text-brand tracking-widest uppercase block animate-pulse">
                GPS Route Tracking Active
              </span>
              <p className="text-[10px] text-zinc-500 font-mono mt-1 max-w-[280px] mx-auto leading-relaxed">
                Your coordinates are being logged. Map route overview will be generated upon completion.
              </p>
            </div>

            {/* Real-time coordinate feedback */}
            {points.length > 0 ? (
              <div className="flex gap-4 border border-border-dark/60 bg-black/40 py-2 px-3.5 font-mono text-[9px] text-[#CCC] rounded-none">
                <div>
                  <span className="text-zinc-600 block text-[8px] uppercase font-bold">LAT</span>
                  <span className="font-bold">{points[points.length - 1].lat.toFixed(5)}</span>
                </div>
                <div className="w-[1px] bg-border-dark" />
                <div>
                  <span className="text-zinc-600 block text-[8px] uppercase font-bold">LNG</span>
                  <span className="font-bold">{points[points.length - 1].lng.toFixed(5)}</span>
                </div>
              </div>
            ) : (
              <div className="text-[9px] text-zinc-600 font-mono animate-pulse">
                Waiting for initial location lock...
              </div>
            )}
          </div>
        </div>

        {/* Large Stats Display */}
        <div className="grid grid-cols-2 gap-3">
          {/* Distance */}
          <div className="bg-dark-panel border border-border-dark p-4 shadow-sm text-center relative overflow-hidden">
            <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider block">Distance</span>
            <div className="text-2xl font-mono font-black text-brand tracking-tight mt-1">
              {(distanceUnit === 'mi' ? distance * 0.621371 : distance).toFixed(2)}{' '}
              <span className="text-xs text-white">{distanceUnit === 'mi' ? 'mi' : 'km'}</span>
            </div>
          </div>

          {/* Pace */}
          <div className="bg-dark-panel border border-border-dark p-4 shadow-sm text-center relative overflow-hidden">
            <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider block">Avg Pace</span>
            <div className="text-2xl font-mono font-black text-white tracking-tight mt-1">
              {getPace()}{' '}
              <span className="text-xs text-zinc-500">{distanceUnit === 'mi' ? '/mi' : '/km'}</span>
            </div>
          </div>

          {/* Time Counter */}
          <div className="bg-dark-panel border border-border-dark p-4 shadow-sm text-center col-span-2 relative overflow-hidden">
            <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider block">
              {mode === 'timer' ? 'Time Remaining' : 'Elapsed Time'}
            </span>
            <div className="text-4xl font-mono font-black text-white tracking-tight mt-1.5">
              {mode === 'timer' ? formatSeconds(timeRemaining()) : formatSeconds(seconds)}
            </div>

            {/* Circular Progress Ring Indicator */}
            {mode === 'timer' && (
              <div className="w-full bg-zinc-800 h-1 mt-4 relative overflow-hidden">
                <div 
                  className="bg-brand h-full transition-all duration-300 shadow-[0_0_8px_rgba(255,230,0,0.4)]" 
                  style={{ width: `${getPercentage()}%` }}
                />
              </div>
            )}
          </div>

          {/* Elevation Gain */}
          <div className="bg-dark-panel border border-border-dark p-3.5 shadow-sm text-center col-span-2">
            <span className="text-[9px] text-[#666] font-mono font-bold uppercase tracking-wider block">Elevation Gain</span>
            <span className="text-base font-mono font-bold text-white mt-1 block">+{elevation} meters</span>
          </div>
        </div>
      </div>

      {/* Control Buttons Footer */}
      <div className="p-4 bg-dark-panel border-t border-border-dark flex gap-3 shadow-lg">
        {/* Cancel Button */}
        <button
          type="button"
          onClick={() => {
            if (confirm("Are you sure you want to discard this cardio session?")) {
              isFinishedOrCancelledRef.current = true;
              broadcastWorkoutTelemetry({ active: false }, true);
              onCancel();
            }
          }}
          className="flex-1 py-3 border border-border-dark hover:border-zinc-700 text-zinc-400 hover:text-white font-mono text-xs font-bold uppercase tracking-wider transition cursor-pointer"
        >
          Cancel
        </button>

        {/* Pause/Resume Toggle */}
        <button
          type="button"
          onClick={() => setIsPaused(!isPaused)}
          className={`flex-1 py-3 text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 ${
            isPaused
              ? 'bg-brand text-black hover:bg-white'
              : 'border border-border-dark hover:border-zinc-750 text-white'
          }`}
        >
          {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4" />}
          <span>{isPaused ? 'Resume' : 'Pause'}</span>
        </button>

        {/* Finish Button */}
        <button
          type="button"
          onClick={() => {
            isFinishedOrCancelledRef.current = true;
            broadcastWorkoutTelemetry({ active: false }, true);
            onFinish({
              activity,
              durationSeconds: seconds,
              distanceKm: distance,
              elevationMeters: elevation,
              gpsPoints: points
            });
          }}
          className="flex-1 py-3 bg-yellow-500 hover:bg-white text-black font-mono text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(234,179,8,0.2)]"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Finish</span>
        </button>
      </div>
    </div>
  );
}
