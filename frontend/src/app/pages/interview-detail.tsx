import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { Card, CardHeader, CardContent, CardTitle } from "../components/card";
import { Button } from "../components/button";
import { StatusBadge } from "../components/status-badge";
import { ArrowLeft, Play, Pause, Mic, Search, Calendar, User, Tag, Edit2, Save, Loader2, Trash2 } from "lucide-react";
import { api } from "../services/api";

interface Interview {
  id: number;
  expert_nom: string;
  expert_fonction?: string;
  domaine?: string;
  date_entretien?: string;
  created_at: string;
  type_fichier?: string;
  chemin_fichier?: string;
  contenu_texte?: string;
  statut_audio: number;
  statut_transcription: number;
  statut_vectorisation: number;
  statut: string;
  sensibilite?: string;
}

export function InterviewDetail() {
  const { id } = useParams<{ id: string }>();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [processing, setProcessing] = useState<"transcribing" | "vectorizing" | null>(null);

  useEffect(() => {
    if (id) {
      loadInterview(parseInt(id));
    }
  }, [id]);

  const loadInterview = async (interviewId: number) => {
    try {
      setLoading(true);
      const data = await api.getEntretien(interviewId);
      setInterview(data);
      
      // Load transcript - prefer DB content, fallback to file path display
      if (data.contenu_texte) {
        setTranscript(data.contenu_texte);
      } else if (data.chemin_fichier && data.type_fichier === "transcription") {
        setTranscript(`Transcription file: ${data.chemin_fichier}`);
      } else {
        setTranscript("");
      }
    } catch (err) {
      console.error("Failed to load interview:", err);
      setError("Failed to load interview");
    } finally {
      setLoading(false);
    }
  };

  const handleTranscribe = async () => {
    if (!id) return;
    try {
      setProcessing("transcribing");
      await api.transcrireEntretien(parseInt(id));
      // Reload to get updated status
      await loadInterview(parseInt(id));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transcription failed");
    } finally {
      setProcessing(null);
    }
  };

  const handleVectorize = async () => {
    if (!id) return;
    try {
      setProcessing("vectorizing");
      await api.vectoriserEntretien(parseInt(id));
      // Reload to get updated status
      await loadInterview(parseInt(id));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vectorization failed");
    } finally {
      setProcessing(null);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (confirm("Êtes-vous sûr de vouloir supprimer cet entretien ?")) {
      try {
        await api.deleteEntretien(parseInt(id));
        window.location.href = "/interviews";
      } catch (err) {
        setError(err instanceof Error ? err.message : "Delete failed");
      }
    }
  };

  const getStatusVariant = (statut: string) => {
    switch (statut) {
      case 'vectorisé':
      case 'indexed':
        return 'indexed';
      case 'transcrit':
      case 'transcribed':
        return 'transcribed';
      default:
        return 'recorded';
    }
  };

  const getStatusLabel = (statut: string) => {
    switch (statut) {
      case 'vectorisé':
      case 'indexed':
        return 'Indexed';
      case 'transcrit':
      case 'transcribed':
        return 'Transcribed';
      case 'en_attente':
        return 'Pending';
      default:
        return 'Recorded';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="space-y-4">
        <Link to="/interviews">
          <Button variant="ghost">
            <ArrowLeft className="w-5 h-5" />
            Back to Interviews
          </Button>
        </Link>
        <p className="text-destructive">Interview not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/interviews">
        <Button variant="ghost">
          <ArrowLeft className="w-5 h-5" />
          Back to Interviews
        </Button>
      </Link>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold mb-2">{interview.expert_nom}</h1>
          <div className="flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{interview.expert_fonction || "Expert"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(interview.created_at).toLocaleDateString()}</span>
            </div>
            <StatusBadge 
              variant={getStatusVariant(interview.statut)} 
              label={getStatusLabel(interview.statut)} 
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={handleTranscribe}
            disabled={processing !== null || interview.statut_transcription === 1 || interview.type_fichier !== "audio"}
          >
            {processing === "transcribing" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            Transcription
          </Button>
          <Button 
            variant="primary" 
            onClick={handleVectorize}
            disabled={processing !== null || interview.statut_vectorisation === 1 || interview.statut_transcription !== 1}
          >
            {processing === "vectorizing" ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            Vectorisation
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Audio Player (if audio exists) */}
          {interview.type_fichier === "audio" && (
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
                      <div className="h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full w-1/3 bg-primary rounded-full"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>File: {interview.chemin_fichier?.split('/').pop()}</span>
                    <span>{interview.statut_transcription === 1 ? "Transcribed" : "Not transcribed"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transcript */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Transcript</CardTitle>
              {interview.statut_transcription === 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (isEditing) {
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
              )}
            </CardHeader>
            <CardContent>
              {interview.statut_transcription === 1 ? (
                isEditing ? (
                  <textarea
                    value={transcript}
                    onChange={(e) => setTranscript(e.target.value)}
                    className="w-full h-96 p-4 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring font-mono text-sm"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <div className="bg-background rounded-lg p-4">
                      <p className="text-muted-foreground">
                        {transcript || "Transcription content will appear here..."}
                      </p>
                    </div>
                  </div>
                )
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Mic className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No transcription available</p>
                  {interview.type_fichier === "audio" && (
                    <Button 
                      variant="primary" 
                      className="mt-4" 
                      onClick={handleTranscribe}
                      disabled={processing !== null}
                    >
                      <Mic className="w-5 h-5" />
                      Launch Transcription
                    </Button>
                  )}
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
                <p className="font-medium">{interview.expert_nom}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Function</label>
                <p className="font-medium">{interview.expert_fonction || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Domain</label>
                <p className="font-medium">{interview.domaine || "-"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Date</label>
                <p className="font-medium">{new Date(interview.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Sensitivity</label>
                <p className="font-medium">{interview.sensibilite || "public"}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">File Type</label>
                <p className="font-medium">{interview.type_fichier || "-"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="secondary" 
                className="w-full justify-start"
                onClick={handleTranscribe}
                disabled={processing !== null || interview.statut_transcription === 1 || interview.type_fichier !== "audio"}
              >
                <Mic className="w-5 h-5" />
                Re-transcribe
              </Button>
              <Button 
                variant="secondary" 
                className="w-full justify-start"
                onClick={handleVectorize}
                disabled={processing !== null || interview.statut_vectorisation === 1 || interview.statut_transcription !== 1}
              >
                <Search className="w-5 h-5" />
                Re-vectorize
              </Button>
              <Button 
                variant="danger" 
                className="w-full justify-start"
                onClick={handleDelete}
              >
                <Trash2 className="w-5 h-5" />
                Delete Interview
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}