import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  Download,
  Eye,
  Heart,
  Zap,
} from "lucide-react";

// Mock data per le attività
const mockActivities = [
  {
    id: 1,
    name: "Morning Run",
    date: "2024-01-15",
    type: "Run",
    distance: 8.5,
    time: "35:20",
    pace: "4:09",
    elevation: 120,
    hr: 165,
    calories: 420,
  },
  {
    id: 2,
    name: "Interval Training",
    date: "2024-01-13",
    type: "Workout",
    distance: 6.0,
    time: "28:45",
    pace: "4:47",
    elevation: 45,
    hr: 178,
    calories: 350,
  },
  {
    id: 3,
    name: "Long Weekend Run",
    date: "2024-01-12",
    type: "Long Run",
    distance: 15.2,
    time: "1:08:30",
    pace: "4:30",
    elevation: 200,
    hr: 155,
    calories: 720,
  },
  {
    id: 4,
    name: "Recovery Jog",
    date: "2024-01-10",
    type: "Recovery",
    distance: 5.0,
    time: "25:00",
    pace: "5:00",
    elevation: 30,
    hr: 145,
    calories: 280,
  },
  {
    id: 5,
    name: "Track Session",
    date: "2024-01-08",
    type: "Speed Work",
    distance: 7.0,
    time: "32:15",
    pace: "4:36",
    elevation: 15,
    hr: 172,
    calories: 380,
  },
];

export default function Activities() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredActivities = mockActivities.filter((activity) => {
    const matchesSearch = activity.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || activity.type.toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "run": return "bg-primary text-primary-foreground";
      case "workout": return "bg-warning text-warning-foreground";
      case "long run": return "bg-secondary text-secondary-foreground";
      case "recovery": return "bg-success text-success-foreground";
      case "speed work": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-foreground">Activities</h1>
          <p className="text-muted-foreground">
            All your running activities and workout sessions
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Activity className="h-8 w-8 text-primary" />
              <div className="text-right">
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">Total Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <MapPin className="h-8 w-8 text-secondary" />
              <div className="text-right">
                <p className="text-2xl font-bold">285</p>
                <p className="text-sm text-muted-foreground">Total Distance (km)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Clock className="h-8 w-8 text-success" />
              <div className="text-right">
                <p className="text-2xl font-bold">31h</p>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Zap className="h-8 w-8 text-warning" />
              <div className="text-right">
                <p className="text-2xl font-bold">4:03</p>
                <p className="text-sm text-muted-foreground">Avg Pace</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="run">Run</SelectItem>
                <SelectItem value="workout">Workout</SelectItem>
                <SelectItem value="long run">Long Run</SelectItem>
                <SelectItem value="recovery">Recovery</SelectItem>
                <SelectItem value="speed work">Speed Work</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activities Table */}
      <Card className="bg-gradient-card">
        <CardHeader>
          <CardTitle>Recent Activities ({filteredActivities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Pace</TableHead>
                  <TableHead>Elevation</TableHead>
                  <TableHead>HR</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{activity.name}</TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(activity.type)}>
                        {activity.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(activity.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {activity.distance} km
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {activity.time}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        {activity.pace} /km
                      </div>
                    </TableCell>
                    <TableCell>{activity.elevation}m</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-red-500" />
                        {activity.hr} bpm
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}