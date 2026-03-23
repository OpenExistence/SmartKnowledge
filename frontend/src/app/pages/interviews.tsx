import { useState } from "react";
import { Card } from "../components/card";
import { Button } from "../components/button";
import { StatusBadge } from "../components/status-badge";
import { Modal } from "../components/modal";
import { Link } from "react-router";
import { Plus, Filter, Mic, Search, Trash2, Upload } from "lucide-react";

type InterviewStatus = 'recorded' | 'transcribed' | 'indexed';

interface Interview {
  id: number;
  title: string;
  expert: string;
  date: string;
  status: InterviewStatus;
  duration: string;
}

const mockInterviews: Interview[] = [
  { id: 1, title: "Senior Engineer - Cloud Architecture", expert: "Sarah Johnson", date: "2026-03-22", status: "indexed", duration: "45:30" },
  { id: 2, title: "Product Manager - AI Strategy", expert: "Michael Chen", date: "2026-03-21", status: "transcribed", duration: "38:15" },
  { id: 3, title: "Data Scientist - ML Pipeline", expert: "Emily Rodriguez", date: "2026-03-20", status: "recorded", duration: "52:40" },
  { id: 4, title: "DevOps Lead - Infrastructure", expert: "David Kim", date: "2026-03-19", status: "indexed", duration: "41:20" },
  { id: 5, title: "UX Designer - Design System", expert: "Lisa Wang", date: "2026-03-18", status: "transcribed", duration: "35:50" },
  { id: 6, title: "Security Architect - Zero Trust", expert: "James Wilson", date: "2026-03-17", status: "indexed", duration: "48:25" },
  { id: 7, title: "Frontend Lead - React Best Practices", expert: "Anna Martinez", date: "2026-03-16", status: "transcribed", duration: "42:10" },
  { id: 8, title: "Backend Engineer - Microservices", expert: "Robert Taylor", date: "2026-03-15", status: "recorded", duration: "50:35" },
];

export function Interviews() {
  const [interviews, setInterviews] = useState<Interview[]>(mockInterviews);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<InterviewStatus | 'all'>('all');

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = interview.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          interview.expert.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || interview.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this interview?")) {
      setInterviews(interviews.filter(i => i.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Interviews Management</h1>
          <p className="text-muted-foreground">Manage and process your knowledge capture sessions</p>
        </div>
        <Button onClick={() => setIsNewModalOpen(true)}>
          <Plus className="w-5 h-5" />
          New Interview
        </Button>
      </div>

      {/* Filters & Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search interviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as InterviewStatus | 'all')}
              className="px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="all">All Status</option>
              <option value="recorded">Recorded</option>
              <option value="transcribed">Transcribed</option>
              <option value="indexed">Indexed</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Interviews Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border">
              <tr className="text-left">
                <th className="p-4 font-medium text-muted-foreground">Title</th>
                <th className="p-4 font-medium text-muted-foreground">Expert</th>
                <th className="p-4 font-medium text-muted-foreground">Date</th>
                <th className="p-4 font-medium text-muted-foreground">Duration</th>
                <th className="p-4 font-medium text-muted-foreground">Status</th>
                <th className="p-4 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInterviews.map((interview) => (
                <tr key={interview.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                  <td className="p-4">
                    <Link to={`/interviews/${interview.id}`} className="font-medium hover:text-primary">
                      {interview.title}
                    </Link>
                  </td>
                  <td className="p-4 text-muted-foreground">{interview.expert}</td>
                  <td className="p-4 text-muted-foreground">{interview.date}</td>
                  <td className="p-4 text-muted-foreground">{interview.duration}</td>
                  <td className="p-4">
                    <StatusBadge 
                      variant={interview.status} 
                      label={interview.status.charAt(0).toUpperCase() + interview.status.slice(1)} 
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link to={`/interviews/${interview.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(interview.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* New Interview Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create New Interview"
      >
        <form className="space-y-4">
          <div>
            <label className="block text-sm mb-2">Interview Title</label>
            <input
              type="text"
              placeholder="e.g., Senior Engineer - Cloud Architecture"
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Expert Name</label>
            <input
              type="text"
              placeholder="e.g., John Doe"
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Upload Method</label>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start">
                <Mic className="w-5 h-5" />
                Record Now
              </Button>
              <Button variant="ghost" className="w-full justify-start border border-border">
                <Upload className="w-5 h-5" />
                Upload Audio File
              </Button>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={() => setIsNewModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
