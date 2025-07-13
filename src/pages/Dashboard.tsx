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
} from "lucide-react";

// Mock data per il dashboard
const weeklyData = [
  { week: "W1", distance: 25, time: 180, pace: 4.2 },
  { week: "W2", distance: 32, time: 210, pace: 4.1 },
  { week: "W3", distance: 28, time: 195, pace: 4.3 },
  { week: "W4", distance: 35, time: 230, pace: 4.0 },
  { week: "W5", distance: 40, time: 255, pace: 3.9 },
  { week: "W6", distance: 38, time: 245, pace: 4.0 },
  { week: "W7", distance: 42, time: 270, pace: 3.8 },
  { week: "W8", distance: 45, time: 285, pace: 3.7 },
];

const chartConfig = {
  distance: {
    label: "Distance (km)",
    color: "hsl(var(--primary))",
  },
  time: {
    label: "Time (min)",
    color: "hsl(var(--secondary))",
  },
  pace: {
    label: "Pace (min/km)",
    color: "hsl(var(--accent))",
  },
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Performance Dashboard</h1>
        <p className="text-muted-foreground">
          Your running analytics and performance insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Distance"
          value="285"
          unit="km"
          change={12.5}
          icon={MapPin}
          variant="primary"
        />
        <MetricCard
          title="Total Time"
          value="1,870"
          unit="min"
          change={8.2}
          icon={Clock}
          variant="secondary"
        />
        <MetricCard
          title="Avg Pace"
          value="4:03"
          unit="min/km"
          change={-2.1}
          icon={Activity}
          variant="success"
        />
        <MetricCard
          title="Activities"
          value="24"
          unit="runs"
          change={15.0}
          icon={Zap}
          variant="warning"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <ChartCard 
          title="Weekly Distance Progress" 
          description="Distance covered per week over the last 8 weeks"
        >
          <ChartContainer config={chartConfig} className="h-[200px]">
            <AreaChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
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
          </ChartContainer>
        </ChartCard>

        <ChartCard 
          title="Pace Improvement" 
          description="Average pace per week (lower is better)"
        >
          <ChartContainer config={chartConfig} className="h-[200px]">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="week" 
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                domain={['dataMin - 0.2', 'dataMax + 0.2']}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="pace"
                stroke="hsl(var(--secondary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--secondary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ChartContainer>
        </ChartCard>
      </div>

      {/* Recent Achievements & Goals */}
      <div className="grid gap-6 md:grid-cols-3">
        <ChartCard title="Recent Personal Records" className="md:col-span-2">
          <div className="space-y-4">
            {[
              { distance: "5K", time: "19:45", date: "3 days ago", improvement: "+15s" },
              { distance: "10K", time: "42:30", date: "1 week ago", improvement: "+45s" },
              { distance: "Half Marathon", time: "1:35:20", date: "2 weeks ago", improvement: "+2:15" },
            ].map((pr, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-warning" />
                  <div>
                    <p className="font-medium">{pr.distance} PR</p>
                    <p className="text-sm text-muted-foreground">{pr.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">{pr.time}</p>
                  <p className="text-sm text-success">improved by {pr.improvement}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="This Month's Goals">
          <div className="space-y-4">
            {[
              { goal: "100km", current: 72, icon: Target, color: "text-primary" },
              { goal: "12 runs", current: 8, icon: Calendar, color: "text-secondary" },
              { goal: "Sub-20 5K", current: 85, icon: TrendingUp, color: "text-success" },
            ].map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <goal.icon className={`h-4 w-4 ${goal.color}`} />
                    <span className="text-sm font-medium">{goal.goal}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {typeof goal.current === 'number' && goal.current < 50 ? 
                      `${goal.current}/12` : 
                      `${goal.current}%`
                    }
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      goal.color.includes('primary') ? 'bg-primary' :
                      goal.color.includes('secondary') ? 'bg-secondary' : 'bg-success'
                    }`}
                    style={{ width: `${Math.min(goal.current, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}