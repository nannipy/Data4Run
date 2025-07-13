import { useState } from "react";
import { MetricCard } from "@/components/MetricCard";
import { ChartCard } from "@/components/ChartCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Trophy,
  Target,
  Zap,
  Heart,
  Activity,
  Clock,
  TrendingUp,
  Award,
  Timer,
  Gauge,
  Brain,
  Flame,
} from "lucide-react";

// Mock data per analisi performance
const performanceZones = [
  { zone: "Zone 1", label: "Recovery", percentage: 45, color: "#22c55e", bpm: "< 142" },
  { zone: "Zone 2", label: "Aerobic", percentage: 30, color: "#3b82f6", bpm: "142-162" },
  { zone: "Zone 3", label: "Tempo", percentage: 15, color: "#f59e0b", bpm: "162-174" },
  { zone: "Zone 4", label: "Threshold", percentage: 8, color: "#f97316", bpm: "174-184" },
  { zone: "Zone 5", label: "VO2 Max", percentage: 2, color: "#ef4444", bpm: "> 184" },
];

const paceZones = [
  { zone: "Easy", percentage: 60, color: "#22c55e", pace: "5:00-5:30" },
  { zone: "Moderate", percentage: 25, color: "#f59e0b", pace: "4:30-5:00" },
  { zone: "Tempo", percentage: 10, color: "#f97316", pace: "4:00-4:30" },
  { zone: "Hard", percentage: 5, color: "#ef4444", pace: "< 4:00" },
];

const weeklyLoad = [
  { week: "W1", load: 320, fatigue: 280, fitness: 45, form: -15 },
  { week: "W2", load: 380, fatigue: 320, fitness: 52, form: -8 },
  { week: "W3", load: 420, fatigue: 360, fitness: 58, form: -2 },
  { week: "W4", load: 450, fatigue: 380, fitness: 65, form: 5 },
  { week: "W5", load: 480, fatigue: 400, fitness: 72, form: 12 },
  { week: "W6", load: 460, fatigue: 390, fitness: 75, form: 15 },
];

const radarData = [
  { metric: "Endurance", value: 85, max: 100 },
  { metric: "Speed", value: 72, max: 100 },
  { metric: "VO2 Max", value: 78, max: 100 },
  { metric: "Recovery", value: 68, max: 100 },
  { metric: "Consistency", value: 92, max: 100 },
  { metric: "Efficiency", value: 76, max: 100 },
];

const chartConfig = {
  load: { label: "Training Load", color: "hsl(var(--primary))" },
  fatigue: { label: "Fatigue", color: "hsl(var(--destructive))" },
  fitness: { label: "Fitness", color: "hsl(var(--success))" },
  form: { label: "Form", color: "hsl(var(--secondary))" },
};

export default function Performance() {
  const [timeRange, setTimeRange] = useState("4weeks");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Performance Analysis</h1>
          <p className="text-muted-foreground">
            Deep insights into your training zones, load, and athletic performance
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4weeks">4 Weeks</SelectItem>
              <SelectItem value="8weeks">8 Weeks</SelectItem>
              <SelectItem value="12weeks">12 Weeks</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Generate Report</Button>
        </div>
      </div>

      {/* Key Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="VO2 Max"
          value="58.2"
          unit="ml/kg/min"
          change={3.2}
          icon={Gauge}
          variant="primary"
        />
        <MetricCard
          title="Training Load"
          value="1,847"
          unit="TSS"
          change={12.8}
          icon={Zap}
          variant="secondary"
        />
        <MetricCard
          title="Performance Index"
          value="142"
          unit="points"
          change={8.4}
          icon={Trophy}
          variant="success"
        />
        <MetricCard
          title="Recovery Score"
          value="78%"
          change={-2.1}
          icon={Heart}
          variant="warning"
        />
      </div>

      {/* Training Load Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard title="Training Load & Fitness" description="Training stress balance over time">
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyLoad} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="week" 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line
                  type="monotone"
                  dataKey="fitness"
                  stroke="hsl(var(--success))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="fatigue"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="form"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>

        <ChartCard title="Performance Radar" description="Multi-dimensional performance analysis">
          <ChartContainer config={chartConfig} className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fontSize: 11 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name="Performance"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </ChartCard>
      </div>

      {/* Zone Analysis */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Heart Rate Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceZones.map((zone, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: zone.color }}
                      />
                      <span className="font-medium">{zone.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {zone.bpm}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{zone.percentage}%</span>
                  </div>
                  <Progress 
                    value={zone.percentage} 
                    className="h-2"
                    style={{ 
                      background: `linear-gradient(to right, ${zone.color} 0%, ${zone.color} ${zone.percentage}%, hsl(var(--muted)) ${zone.percentage}%)`
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Pace Zones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paceZones.map((zone, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: zone.color }}
                      />
                      <span className="font-medium">{zone.zone}</span>
                      <Badge variant="outline" className="text-xs">
                        {zone.pace}
                      </Badge>
                    </div>
                    <span className="text-sm font-medium">{zone.percentage}%</span>
                  </div>
                  <Progress 
                    value={zone.percentage} 
                    className="h-2"
                    style={{ 
                      background: `linear-gradient(to right, ${zone.color} 0%, ${zone.color} ${zone.percentage}%, hsl(var(--muted)) ${zone.percentage}%)`
                    }}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Training Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-success/10 border border-success/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="h-4 w-4 text-success" />
                  <span className="font-medium text-success">Strength</span>
                </div>
                <p className="text-sm">Excellent aerobic base development. Zone 2 training is well-balanced.</p>
              </div>
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-4 w-4 text-warning" />
                  <span className="font-medium text-warning">Focus Area</span>
                </div>
                <p className="text-sm">Increase high-intensity training for speed development.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Recovery Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Resting HR</span>
                <Badge variant="success">42 bpm</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>HRV</span>
                <Badge variant="success">52 ms</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Sleep Quality</span>
                <Badge variant="warning">78%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Stress Level</span>
                <Badge variant="success">Low</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5" />
              Weekly Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">142</div>
                <div className="text-sm text-muted-foreground">Performance Index</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-semibold">28.5h</div>
                  <div className="text-xs text-muted-foreground">Total Time</div>
                </div>
                <div>
                  <div className="text-lg font-semibold">245km</div>
                  <div className="text-xs text-muted-foreground">Distance</div>
                </div>
              </div>
              <div className="text-center">
                <Badge variant="success" className="w-full justify-center">
                  Peak Fitness Achieved
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}