import { useState, useRef, useEffect } from "react";
import { Card } from "../components/card";
import { Button } from "../components/button";
import { StatusBadge } from "../components/status-badge";
import { Modal } from "../components/modal";
import { Link } from "react-router";
import { Plus, Filter, Mic, Search, Trash2, Upload, FileText, X, Loader2 } from "lucide-react";
import { api } from "../services/api";

type InterviewStatus = 'recorded' | 'transcribed' | 'indexed';

interface Interview {
  id: number;
  expert_nom: string;
  expert_fonction?: string;
  domaine?: string;
  statut: string;
  created_at: string;
}

export function Interviews() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<InterviewStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [expertNom, setExpertNom] = useState("");
  const [expertFonction, setExpertFonction] = useState("");
  const [domaine, setDomaine] = useState("");
  const [sensibilite, setSensibilite] = useState("public");
  const [uploadType, setUploadType] = useState<"audio" | "text">("text");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      const data = await api.getEntretiens();
      setInterviews(data);
    } catch (err) {
      console.error("Failed to load interviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter(interview => {
    const matchesSearch = 
      interview.expert_nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.expert_fonction?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.domaine?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || interview.statut === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this interview?")) {
      try {
        await api.deleteEntretien(id);
        setInterviews(interviews.filter(i => i.id !== id));
      } catch (err) {
        setError("Failed to delete interview");
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split('.').pop()?.toLowerCase();
      const allowedTextExts = ['txt', 'md', 'pdf', 'docx'];
      const allowedAudioExts = ['mp3', 'wav', 'm4a', 'ogg', 'flac', 'webm'];
      
      if (uploadType === "text" && ext && allowedTextExts.includes(ext)) {
        setSelectedFile(file);
        setError("");
      } else if (uploadType === "audio" && ext && allowedAudioExts.includes(ext)) {
        setSelectedFile(file);
        setError("");
      } else {
        setError(uploadType === "text" 
          ? "Please select a .txt, .md, .pdf, or .docx file"
          : "Please select an audio file (mp3, wav, m4a, ogg, flac, webm)");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expertNom) {
      setError("Expert name is required");
      return;
    }
    if (uploadType === "text" && !selectedFile && !transcription) {
      setError("Please select a file or enter transcription text");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("expert_nom", expertNom);
      if (expertFonction) formData.append("expert_fonction", expertFonction);
      if (domaine) formData.append("domaine", domaine);
      formData.append("sensibilite", sensibilite);

      if (selectedFile) {
        formData.append("fichier", selectedFile);
      } else if (transcription) {
        formData.append("transcription", transcription);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/entretiens`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create interview");
      }

      // Reset form and reload
      setExpertNom("");
      setExpertFonction("");
      setDomaine("");
      setTranscription("");
      setSelectedFile(null);
      setIsNewModalOpen(false);
      loadInterviews();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create interview");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusVariant = (statut: string): InterviewStatus => {
    switch (statut) {
      case 'indexed': return 'indexed';
      case 'transcribed': 
      case 'transcrit': return 'transcribed';
      default: return 'recorded';
    }
  };

  const getStatusLabel = (statut: string): string => {
    switch (statut) {
      case 'indexed': return 'Indexed';
      case 'transcribed': 
      case 'transcrit': return 'Transcribed';
      case 'en_attente': return 'Pending';
      default: return 'Recorded';
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
          {loading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">Loading interviews...</p>
            </div>
          ) : filteredInterviews.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">No interviews found</p>
              <Button onClick={() => setIsNewModalOpen(true)} className="mt-4">
                <Plus className="w-5 h-5" />
                Create your first interview
              </Button>
            </div>
          ) : (
            <table className="w-full">
              <thead className="border-b border-border">
                <tr className="text-left">
                  <th className="p-4 font-medium text-muted-foreground">Expert</th>
                  <th className="p-4 font-medium text-muted-foreground">Function</th>
                  <th className="p-4 font-medium text-muted-foreground">Domain</th>
                  <th className="p-4 font-medium text-muted-foreground">Date</th>
                  <th className="p-4 font-medium text-muted-foreground">Status</th>
                  <th className="p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInterviews.map((interview) => (
                  <tr key={interview.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                    <td className="p-4">
                      <Link to={`/interviews/${interview.id}`} className="font-medium hover:text-primary">
                        {interview.expert_nom}
                      </Link>
                    </td>
                    <td className="p-4 text-muted-foreground">{interview.expert_fonction || '-'}</td>
                    <td className="p-4 text-muted-foreground">{interview.domaine || '-'}</td>
                    <td className="p-4 text-muted-foreground">{new Date(interview.created_at).toLocaleDateString()}</td>
                    <td className="p-4">
                      <StatusBadge 
                        variant={getStatusVariant(interview.statut)} 
                        label={getStatusLabel(interview.statut)} 
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
          )}
        </div>
      </Card>

      {/* New Interview Modal */}
      <Modal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        title="Create New Interview"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm mb-2">Expert Name *</label>
            <input
              type="text"
              value={expertNom}
              onChange={(e) => setExpertNom(e.target.value)}
              placeholder="e.g., John Doe"
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Function / Role</label>
            <input
              type="text"
              value={expertFonction}
              onChange={(e) => setExpertFonction(e.target.value)}
              placeholder="e.g., Senior Engineer"
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Domain</label>
            <input
              type="text"
              value={domaine}
              onChange={(e) => setDomaine(e.target.value)}
              placeholder="e.g., Cloud Architecture"
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-2">Sensitivity</label>
            <select
              value={sensibilite}
              onChange={(e) => setSensibilite(e.target.value)}
              className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="public">Public</option>
              <option value="confidentiel">Confidential</option>
              <option value="tres_secret">Top Secret</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-2">Upload Type</label>
            <div className="flex gap-2">
              <Button 
                type="button"
                variant={uploadType === "text" ? "primary" : "ghost"} 
                onClick={() => { setUploadType("text"); setSelectedFile(null); }}
                className="flex-1"
              >
                <FileText className="w-5 h-5" />
                Text File
              </Button>
              <Button 
                type="button"
                variant={uploadType === "audio" ? "primary" : "ghost"} 
                onClick={() => { setUploadType("audio"); setSelectedFile(null); }}
                className="flex-1"
              >
                <Mic className="w-5 h-5" />
                Audio
              </Button>
            </div>
          </div>
          
          {uploadType === "text" ? (
            <>
              <div>
                <label className="block text-sm mb-2">
                  Upload File (.txt, .md, .pdf, .docx)
                </label>
                <div 
                  className="border-2 border-dashed border-input rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.pdf,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      <span className="text-sm">{selectedFile.name}</span>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                        className="p-1 hover:bg-accent rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to select a file
                      </p>
                    </>
                  )}
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                — OR —
              </div>
              
              <div>
                <label className="block text-sm mb-2">Paste Transcription Text</label>
                <textarea
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)}
                  placeholder="Paste your transcription here..."
                  rows={4}
                  className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  disabled={!!selectedFile}
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block text-sm mb-2">
                Upload Audio File (.mp3, .wav, .m4a, .ogg, .flac, .webm)
              </label>
              <div 
                className="border-2 border-dashed border-input rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.wav,.m4a,.ogg,.flac,.webm"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2">
                    <Mic className="w-5 h-5 text-primary" />
                    <span className="text-sm">{selectedFile.name}</span>
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="p-1 hover:bg-accent rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Mic className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Click to select an audio file
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setIsNewModalOpen(false)} 
              className="flex-1"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}