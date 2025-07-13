import { MetricCard } from "@/components/MetricCard";
import { ChartCard } from "@/components/ChartCard";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  Area,
  AreaChart,
} from "recharts";
import {
  Activity,
  Clock,
  MapPin,
  Zap,
  Target,
  TrendingUp,
  Calendar,
  Trophy,
  Loader2,
  RefreshCw,
  Plus
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useActivities } from "@/hooks/useActivities";
import { Button } from "@/components/ui/button";
import { formatDistance, formatDuration, formatPace } from "@/lib/utils"
import { format, addMonths, subMonths } from "date-fns";
import { it } from "date-fns/locale";
import React, { useRef } from "react";
import { toast } from "@/hooks/use-toast";
import * as toGeoJSON from "@tmcw/togeojson";

const chartConfig = {
  distance: {
    label: "Distanza",
    color: "hsl(var(--primary))",
  },
  activities: {
    label: "Corse",
    color: "hsl(var(--secondary))",
  },
};

export default function Dashboard() {
  const { user } = useAuth();
  const { 
    activities, 
    statsRun,
    isLoadingStatsRun,
    trendsRun,
    isLoadingTrendsRun,
    syncActivities,
    syncActivitiesSmart,
    syncActivitiesExtend,
    isSyncing
  } = useActivities(user?.id || null, 'year');
  
  const handleSync = async (months: number = 6) => {
    try {
      // Sincronizza le attività degli ultimi X mesi (default 6 mesi)
      const dateFrom = new Date();
      dateFrom.setMonth(dateFrom.getMonth() - months);
      const afterDate = dateFrom.toISOString();
      
      await syncActivities(afterDate);
    } catch (error) {
      console.error('Error syncing activities:', error);
    }
  };

  const handleSyncAll = async () => {
    try {
      // Sincronizza tutte le attività disponibili (senza limite di data)
      await syncActivities();
    } catch (error) {
      console.error('Error syncing all activities:', error);
    }
  };

  // Raggruppa i trends per mese (YYYY-MM)
  const monthlyTrends: Record<string, { distance: number; time: number; activities: number; elevation: number }> = {};

  if (trendsRun?.trends) {
    Object.entries(trendsRun.trends).forEach(([key, value]) => {
      const month = key.slice(0, 7); // Prendi solo YYYY-MM
      if (!monthlyTrends[month]) {
        monthlyTrends[month] = { distance: 0, time: 0, activities: 0, elevation: 0 };
      }
      monthlyTrends[month].distance += value.distance;
      monthlyTrends[month].time += value.time;
      monthlyTrends[month].activities += value.activities;
      monthlyTrends[month].elevation += value.elevation;
    });
  }

  // Ora prendi i 12 mesi più recenti
  let last12MonthsKeys: string[] = Object.keys(monthlyTrends)
    .filter(k => /^\d{4}-\d{2}$/.test(k))
    .sort((a, b) => new Date(a + '-01').getTime() - new Date(b + '-01').getTime())
    .slice(-12);

  // Prepara i dati per i grafici
  const chartData = last12MonthsKeys.map((month) => {
    const data = monthlyTrends[month];
    let d = new Date(month + '-01');
    if (isNaN(d.getTime())) return null;
    return {
      date: month,
      monthLabel: format(d, 'MMM', { locale: it }),
      distance: data ? data.distance / 1000 : 0,
      time: data ? data.time / 60 : 0,
      activities: data ? data.activities : 0,
      elevation: data ? data.elevation : 0,
    };
  }).filter(Boolean);

  // --- RECORD PERSONALI ---
  // Funzione per trovare il miglior tempo su una distanza, considerando anche i lap
  function getBestTimeForDistanceSmart(activities, targetDistance) {
    const margin = targetDistance * 0.02;
    let best = null;
    let fromLap = false;
    activities.filter(a => a.type === "Run").forEach(a => {
      // 1. Prova con i lap, se presenti
      if (a.laps && Array.isArray(a.laps) && a.laps.length > 0) {
        a.laps.forEach(lap => {
          if (
            lap.distance >= targetDistance - margin &&
            lap.distance <= targetDistance + margin &&
            lap.moving_time > 0
          ) {
            if (!best || lap.moving_time < best.moving_time) {
              best = {
                moving_time: lap.moving_time,
                start_date: lap.start_date || a.start_date,
                activity: a,
                fromLap: true
              };
              fromLap = true;
            }
          }
        });
      }
      // 2. Fallback: attività intera
      if (
        a.distance >= targetDistance - margin &&
        a.distance <= targetDistance + margin &&
        a.moving_time > 0 &&
        (!best || a.moving_time < best.moving_time)
      ) {
        best = {
          moving_time: a.moving_time,
          start_date: a.start_date,
          activity: a,
          fromLap: false
        };
      }
    });
    return best;
  }

  // Miglior tempo su distanze classiche
  const prDistances = [
    { label: "1 km", value: 1000 },
    { label: "5 km", value: 5000 },
    { label: "10 km", value: 10000 },
    { label: "21 km", value: 21097 },
    { label: "42 km", value: 42195 },
  ];

  const personalBests = prDistances.map(d => {
    const best = getBestTimeForDistanceSmart(activities, d.value);
    return best
      ? {
          label: d.label,
          time: formatDuration(best.moving_time),
          date: best.start_date ? format(new Date(best.start_date), 'dd/MM/yyyy') : '',
          activity: best,
        }
      : null;
  }).filter(Boolean);

  // Distanza più lunga
  const longestRun = activities.filter(a => a.type === "Run").reduce((max, a) => (a.distance > (max?.distance || 0) ? a : max), null);
  // Maggior dislivello
  const maxElevation = activities.filter(a => a.type === "Run").reduce((max, a) => ((a.total_elevation_gain || 0) > ((max?.total_elevation_gain) || 0) ? a : max), null);

  // --- RECORD PERSONALI ALL TIME ---
  // Distanze standard (metri)
  const allTimeDistances = [
    { label: "400 m", value: 400 },
    { label: "Mezzo miglio", value: 804.67 },
    { label: "1 KM", value: 1000 },
    { label: "1 miglio", value: 1609.34 },
    { label: "2 miglia", value: 3218.68 },
    { label: "5 km", value: 5000 },
    { label: "10 km", value: 10000 },
    { label: "15 KM", value: 15000 },
    { label: "10 miglia", value: 16093.4 },
    { label: "20 KM", value: 20000 },
    { label: "Mezza maratona", value: 21097 },
  ];

  // Funzione per formattare il tempo in stile mm:ss o hh:mm:ss
  function formatRecordTime(seconds) {
    if (!seconds || isNaN(seconds) || !isFinite(seconds)) return "–";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.round(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // Nuova lista record all time con logica "smart"
  const allTimeRecords = allTimeDistances.map(d => {
    const best = getBestTimeForDistanceSmart(activities, d.value);
    return best
      ? {
          label: d.label,
          time: formatRecordTime(best.moving_time),
          date: best.start_date ? format(new Date(best.start_date), 'dd/MM/yyyy') : '',
          activity: best.activity,
          fromLap: best.fromLap
        }
      : { label: d.label, time: "–", date: "", activity: null, fromLap: false };
  });

  // Mostra avviso se almeno un record non è stato calcolato da lap
  const hasApproxRecords = allTimeRecords.some(r => r.time !== "–" && !r.fromLap);

  const fileInputRef = useRef(null);

  // Funzione di utilità per calcolare distanza totale da una traccia GeoJSON
  function getTotalDistance(coords) {
    let dist = 0;
    for (let i = 1; i < coords.length; i++) {
      const [lon1, lat1] = coords[i - 1];
      const [lon2, lat2] = coords[i];
      // Haversine formula
      const R = 6371000;
      const toRad = x => (x * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      dist += R * c;
    }
    return dist;
  }

  // Handler per importazione GPX
  const handleImportGpx = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, "application/xml");
      const geojson = toGeoJSON.gpx(xml);
      if (!geojson.features.length) throw new Error("GPX non valido o senza traccia");
      const track = geojson.features[0];
      const coords = track.geometry.coordinates;
      const totalDistance = getTotalDistance(coords);
      const times = track.properties.coordTimes || [];
      const startDate = times[0] ? new Date(times[0]) : null;
      const endDate = times[times.length - 1] ? new Date(times[times.length - 1]) : null;
      const movingTime = startDate && endDate ? Math.round((endDate.getTime() - startDate.getTime()) / 1000) : null;
      // Matching: cerca attività esistente per data e distanza simile
      const match = activities.find(a => {
        if (!a.start_date) return false;
        const aDate = new Date(a.start_date);
        const sameDay = Math.abs(Number(aDate) - Number(startDate ? startDate : 0)) < 1000 * 60 * 60 * 12; // 12h tolleranza
        const distClose = Math.abs(Number(a.distance || 0) - Number(totalDistance)) < 200; // 200m tolleranza
        return sameDay && distClose;
      });
      if (match) {
        // Se il GPX ha più dati (es. traccia, lap), aggiorna l'attività
        let updated = false;
        if (!match.detailed_data && coords.length > 10) {
          match.detailed_data = geojson;
          updated = true;
        }
        if (!match.moving_time && movingTime) {
          match.moving_time = movingTime;
          updated = true;
        }
        if (updated) {
          toast({ title: "Attività aggiornata", description: "Dati dettagliati aggiunti all'attività esistente." });
        } else {
          toast({ title: "Nessuna modifica", description: "L'attività era già completa o identica." });
        }
      } else {
        // Nuova attività
        const newActivity = {
          id: Date.now(),
          strava_activity_id: null,
          user_id: null,
          name: file.name.replace(/\.gpx$/i, ""),
          distance: totalDistance,
          moving_time: movingTime,
          elapsed_time: movingTime,
          type: "Run",
          start_date: startDate ? startDate.toISOString() : null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          detailed_data: geojson,
        };
        // Aggiorna stato locale (solo esempio, in realtà dovresti salvarla su backend)
        activities.push(newActivity);
        toast({ title: "Nuova attività importata", description: `Attività "${newActivity.name}" aggiunta.` });
      }
    } catch (e) {
      toast({ title: "Errore importazione GPX", description: e.message || "Errore sconosciuto", variant: "destructive" });
    }
    event.target.value = null;
  };

  if (isLoadingStatsRun || isLoadingTrendsRun) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Le tue analisi di corsa e insight sulle performance
          </p>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Le tue analisi di corsa e insight sulle performance
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => handleSync(6)} 
            disabled={isSyncing}
            variant="outline"
            size="sm"
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sincronizzazione...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync 6 mesi
              </>
            )}
          </Button> 
          <Button 
            onClick={syncActivitiesSmart} 
            disabled={isSyncing}
            variant="outline"
            size="sm"
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sincronizzazione...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Smart
              </>
            )}
          </Button>
          <Button 
            onClick={() => syncActivitiesExtend(12)} 
            disabled={isSyncing}
            variant="outline"
            size="sm"
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sincronizzazione...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Estendi 1 anno
              </>
            )}
          </Button>
          <Button 
            onClick={handleSyncAll} 
            disabled={isSyncing}
            variant="outline"
            size="sm"
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sincronizzazione...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync Tutto
              </>
            )}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            Importa GPX
          </Button>
          <input
            type="file"
            accept=".gpx"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImportGpx}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Distanza Totale"
          value={statsRun ? formatDistance(statsRun.total_distance) : "0"}
          unit="km"
          change={12.5}
          icon={MapPin}
          variant="primary"
        />
        <MetricCard
          title="Tempo Totale"
          value={statsRun ? formatDuration(statsRun.total_time) : "0"}
          unit="ore"
          change={8.2}
          icon={Clock}
          variant="secondary"
        />
        <MetricCard
          title="Ritmo Medio"
          value={statsRun ? formatPace(statsRun.average_pace) : "0"}
          unit="min/km"
          change={-2.1}
          icon={Activity}
          variant="success"
        />
        <MetricCard
          title="Attività"
          value={statsRun?.total_activities.toString() || "0"}
          unit="corse"
          change={15.0}
          icon={Zap}
          variant="warning"
        />
      </div>

      {/* Charts Row */}
      {chartData.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          <ChartCard 
            title="Distanza Mensile (solo corse)" 
            description="Distanza percorsa per mese negli ultimi 12 mesi"
          >
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="monthLabel" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    angle={-30}
                    textAnchor="end"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <defs>
                    <linearGradient id="distanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="distance"
                    stroke="hsl(var(--primary))"
                    fillOpacity={1}
                    fill="url(#distanceGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>

          <ChartCard 
            title="Corse mensili" 
            description="Numero di corse per mese (ultimi 12 mesi)"
          >
            <ChartContainer config={chartConfig} className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="monthLabel" 
                    tick={{ fontSize: 14 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    width={35}
                    domain={[0, 30]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="activities"
                    fill="hsl(var(--secondary))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </ChartCard>
        </div>
      ) : (
        <ChartCard title="Grafici" description="I grafici appariranno qui dopo la sincronizzazione">
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nessun dato per i grafici</p>
            <p className="text-sm">Sincronizza con Strava per vedere i tuoi progressi</p>
          </div>
        </ChartCard>
      )}

      {/* Recent Achievements & Goals */}
      <div className="grid gap-6 md:grid-cols-3">
        <ChartCard title="Record Personali Recenti" className="md:col-span-2">
          <div className="space-y-4">
            {statsRun && statsRun.total_activities > 0 ? (
              <div>
                {personalBests.length === 0 && !longestRun && !maxElevation ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nessun record personale trovato</p>
                    <p className="text-sm">Continua a correre per sbloccare i tuoi PR!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {personalBests.map((pr, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-12 text-center font-bold">{pr.label}</span>
                          <div>
                            <p className="font-medium">{pr.time}</p>
                            <p className="text-xs text-muted-foreground">{pr.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {longestRun && (
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-12 text-center font-bold">Lungh.</span>
                          <div>
                            <p className="font-medium">{formatDistance(longestRun.distance)} km</p>
                            <p className="text-xs text-muted-foreground">{longestRun.start_date ? format(new Date(longestRun.start_date), 'dd/MM/yyyy') : ''}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {maxElevation && (
                      <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="w-12 text-center font-bold">Disl.</span>
                          <div>
                            <p className="font-medium">{maxElevation.total_elevation_gain} m</p>
                            <p className="text-xs text-muted-foreground">{maxElevation.start_date ? format(new Date(maxElevation.start_date), 'dd/MM/yyyy') : ''}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nessuna attività ancora</p>
                <p className="text-sm">Sincronizza con Strava per iniziare</p>
              </div>
            )}
          </div>
        </ChartCard>

        <ChartCard title="Migliori Prestazioni (All Time)" className="md:col-span-2">
          <div className="overflow-x-auto">
            {hasApproxRecords && (
              <div className="text-xs text-warning mb-2">Alcuni record sono calcolati in modo approssimativo (attività intera, non split/lap come su Strava).</div>
            )}
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Distanza</th>
                  <th className="text-left py-2 px-2">Tempo</th>
                  <th className="text-left py-2 px-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {allTimeRecords.map((rec, idx) => (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-2 px-2 font-medium">{rec.label}</td>
                    <td className="py-2 px-2">{rec.time}</td>
                    <td className="py-2 px-2 text-muted-foreground">{rec.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}