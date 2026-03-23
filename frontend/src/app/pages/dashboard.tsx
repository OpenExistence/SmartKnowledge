import { Card, CardHeader, CardContent, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { StatusBadge } from "../components/status-badge";
import { Mic, Upload, MessageSquare, TrendingUp, Users, FileText } from "lucide-react";
import { Link } from "react-router";

const kpiData = [
  { label: "Total Interviews", value: "156", icon: Mic, trend: "+12%", color: "text-[#003A8F]" },
  { label: "Transcriptions Completed", value: "142", icon: FileText, trend: "+8%", color: "text-[#00A3E0]" },
  { label: "Indexed Knowledge", value: "128", icon: TrendingUp, trend: "+15%", color: "text-[#06B6D4]" },
  { label: "Active Users", value: "24", icon: Users, trend: "+3", color: "text-[#10B981]" },
];

const recentInterviews = [
  { id: 1, title: "Senior Engineer - Cloud Architecture", date: "2026-03-22", status: "indexed" as const, expert: "Sarah Johnson" },
  { id: 2, title: "Product Manager - AI Strategy", date: "2026-03-21", status: "transcribed" as const, expert: "Michael Chen" },
  { id: 3, title: "Data Scientist - ML Pipeline", date: "2026-03-20", status: "recorded" as const, expert: "Emily Rodriguez" },
  { id: 4, title: "DevOps Lead - Infrastructure", date: "2026-03-19", status: "indexed" as const, expert: "David Kim" },
  { id: 5, title: "UX Designer - Design System", date: "2026-03-18", status: "transcribed" as const, expert: "Lisa Wang" },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your knowledge base.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
                    <p className="text-3xl font-semibold mb-2">{kpi.value}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {kpi.trend} from last month
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 ${kpi.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions & Recent Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/interviews">
              <Button variant="primary" className="w-full justify-start">
                <Mic className="w-5 h-5" />
                New Interview
              </Button>
            </Link>
            <Link to="/interviews">
              <Button variant="secondary" className="w-full justify-start">
                <Upload className="w-5 h-5" />
                Upload Audio
              </Button>
            </Link>
            <Link to="/knowledge">
              <Button variant="ghost" className="w-full justify-start border border-border">
                <MessageSquare className="w-5 h-5" />
                Ask a Question
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Interviews */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Interviews</CardTitle>
            <Link to="/interviews">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInterviews.map((interview) => (
                <Link
                  key={interview.id}
                  to={`/interviews/${interview.id}`}
                  className="block p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{interview.title}</h4>
                      <p className="text-sm text-muted-foreground">Expert: {interview.expert}</p>
                    </div>
                    <StatusBadge 
                      variant={interview.status} 
                      label={interview.status.charAt(0).toUpperCase() + interview.status.slice(1)} 
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{interview.date}</p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
