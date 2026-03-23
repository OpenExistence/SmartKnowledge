import { useState } from "react";
import { useParams, Link } from "react-router";
import { Card, CardHeader, CardContent, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { StatusBadge } from "../components/status-badge";
import { ArrowLeft, Play, Pause, Mic, Search, Calendar, User, Tag, Edit2, Save } from "lucide-react";

export function InterviewDetail() {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [transcript, setTranscript] = useState(
    `Speaker 1: Thank you for joining us today. Can you tell us about your experience with cloud architecture at our company?

Speaker 2: Absolutely. I've been working with AWS for the past 8 years, and in my role here, I've led the migration of our monolithic applications to microservices. The biggest challenge was ensuring zero downtime during the transition.

Speaker 1: That sounds complex. What approach did you take?

Speaker 2: We implemented a blue-green deployment strategy with feature flags. This allowed us to gradually shift traffic while monitoring performance metrics in real-time. We also set up comprehensive logging using CloudWatch and developed custom dashboards for the operations team.

Speaker 1: Were there any unexpected issues during the migration?

Speaker 2: Yes, one major issue was database connection pooling. Our existing connection management wasn't designed for distributed systems. We had to implement connection pooling at the application level and use RDS Proxy to manage connections efficiently.

Speaker 1: What advice would you give to someone starting a similar migration?

Speaker 2: First, invest heavily in observability from day one. You can't optimize what you can't measure. Second, automate everything - tests, deployments, rollbacks. And third, communicate constantly with stakeholders about progress and risks.`
  );

  const mockInterview = {
    id,
    title: "Senior Engineer - Cloud Architecture",
    expert: "Sarah Johnson",
    date: "2026-03-22",
    status: "indexed" as const,
    duration: "45:30",
    tags: ["Cloud", "AWS", "Microservices", "Migration"],
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/interviews">
        <Button variant="ghost">
          <ArrowLeft className="w-5 h-5" />
          Back to Interviews
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">{mockInterview.title}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{mockInterview.expert}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{mockInterview.date}</span>
            </div>
            <StatusBadge 
              variant={mockInterview.status} 
              label={mockInterview.status.charAt(0).toUpperCase() + mockInterview.status.slice(1)} 
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">
            <Mic className="w-5 h-5" />
            Transcribe
          </Button>
          <Button variant="primary">
            <Search className="w-5 h-5" />
            Vectorize
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audio Player */}
          <Card>
            <CardHeader>
              <CardTitle>Audio Recording</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  </button>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-2">
                      <span>12:34</span>
                      <span>{mockInterview.duration}</span>
                    </div>
                    <div className="h-2 bg-background rounded-full overflow-hidden">
                      <div className="h-full w-1/3 bg-primary rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Duration: {mockInterview.duration}</span>
                  <span>Format: MP3 • 64 kbps</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transcript */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transcript</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (isEditing) {
                    // Save changes
                    setIsEditing(false);
                  } else {
                    setIsEditing(true);
                  }
                }}
              >
                {isEditing ? (
                  <>
                    <Save className="w-4 h-4" />
                    Save
                  </>
                ) : (
                  <>
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  className="w-full h-96 p-4 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                />
              ) : (
                <div className="prose prose-sm max-w-none">
                  <div className="bg-background rounded-lg p-4 space-y-4">
                    {transcript.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="leading-relaxed">
                        {paragraph.startsWith('Speaker 1:') ? (
                          <span>
                            <strong className="text-primary">Speaker 1:</strong>
                            {paragraph.substring(10)}
                          </span>
                        ) : paragraph.startsWith('Speaker 2:') ? (
                          <span>
                            <strong className="text-secondary">Speaker 2:</strong>
                            {paragraph.substring(10)}
                          </span>
                        ) : (
                          paragraph
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground">Expert</label>
                <p className="font-medium">{mockInterview.expert}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Date</label>
                <p className="font-medium">{mockInterview.date}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Duration</label>
                <p className="font-medium">{mockInterview.duration}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  <Tag className="w-4 h-4 inline mr-1" />
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {mockInterview.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="secondary" className="w-full justify-start">
                <Mic className="w-5 h-5" />
                Re-transcribe
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Search className="w-5 h-5" />
                Re-vectorize
              </Button>
              <Button variant="danger" className="w-full justify-start">
                Delete Interview
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
