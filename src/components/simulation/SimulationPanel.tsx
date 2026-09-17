'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '@/context/simulation-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FlaskConical, X, Cloud, Users, Car } from 'lucide-react';
import { WeatherCondition, CrowdLevel, TrafficLevel } from '@/lib/types';
import { WEATHER_IMPACT, CROWD_IMPACT, TRAFFIC_IMPACT } from '@/lib/constants';

export function SimulationPanel() {
  const { state, setWeather, setCrowd, setTraffic, isActive, toggleActive } = useSimulation();

  return (
    <>
      {/* Toggle button */}
      <motion.button
        onClick={toggleActive}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full gradient-sky flex items-center justify-center shadow-lg shadow-sky-500/20 hover:scale-110 transition-transform"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FlaskConical className="w-5 h-5 text-white" />
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed top-4 right-4 bottom-20 z-50 w-80"
          >
            <Card className="h-full glass-strong border-sky-500/20 overflow-auto">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-sky-400" />
                    <CardTitle className="text-base">Demo Intelligence</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" onClick={toggleActive}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Badge variant="outline" className="text-[10px] border-sky-500/30 text-sky-400 w-fit">
                  🧪 DEMO INTELLIGENCE MODE
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  Adjust conditions to see how the AI dynamically optimizes recommendations.
                </p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Weather */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-sky-400" />
                    <span className="text-sm font-medium">Weather</span>
                    <Badge variant="outline" className="text-[10px] ml-auto">
                      {WEATHER_IMPACT[state.weather].label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['normal', 'rain', 'heavy_rain'] as WeatherCondition[]).map(w => (
                      <button
                        key={w}
                        onClick={() => setWeather(w)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          state.weather === w
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent'
                        }`}
                      >
                        {w === 'normal' ? '☀️ Normal' : w === 'rain' ? '🌧️ Rain' : '⛈️ Heavy'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Crowd */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium">Crowd Level</span>
                    <Badge variant="outline" className="text-[10px] ml-auto">
                      {CROWD_IMPACT[state.crowd].label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['LOW', 'MEDIUM', 'HIGH'] as CrowdLevel[]).map(c => (
                      <button
                        key={c}
                        onClick={() => setCrowd(c)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          state.crowd === c
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent'
                        }`}
                      >
                        {c === 'LOW' ? '🟢 Low' : c === 'MEDIUM' ? '🟡 Medium' : '🔴 High'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Traffic */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Car className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-medium">Traffic</span>
                    <Badge variant="outline" className="text-[10px] ml-auto">
                      {TRAFFIC_IMPACT[state.traffic].label}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as TrafficLevel[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setTraffic(t)}
                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                          state.traffic === t
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-muted/30 text-muted-foreground hover:bg-muted/50 border border-transparent'
                        }`}
                      >
                        {t === 'low' ? '🟢 Low' : t === 'medium' ? '🟡 Medium' : '🔴 High'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Impact summary */}
                <div className="rounded-xl bg-muted/30 p-4 space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Current Impact on Recommendations:</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>Outdoor Activity Score</span>
                      <span className="font-medium">
                        ×{WEATHER_IMPACT[state.weather].outdoor.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Indoor Activity Score</span>
                      <span className="font-medium">
                        ×{WEATHER_IMPACT[state.weather].indoor.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Crowd Modifier</span>
                      <span className="font-medium">
                        ×{CROWD_IMPACT[state.crowd].score_modifier.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span>Travel Time Multiplier</span>
                      <span className="font-medium">
                        ×{TRAFFIC_IMPACT[state.traffic].time_multiplier.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
