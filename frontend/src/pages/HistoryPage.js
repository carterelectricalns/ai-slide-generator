import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  FileText,
  Trash2,
  ChevronRight,
  Clock,
  AlertCircle,
  Loader2,
  Presentation,
} from "lucide-react";

export default function HistoryPage() {
  const [presentations, setPresentations] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();

  const fetchHistory = async () => {
    try {
      const { data } = await api.get("/presentations");
      setPresentations(data);
    } catch {
      toast.error("Failed to load history");
      setPresentations([]);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await api.delete(`/presentations/${id}`);
      setPresentations((prev) => prev.filter((p) => p.id !== id));
      toast.success("Presentation deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "completed":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-medium">Completed</span>;
      case "failed":
        return <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium">Failed</span>;
      default:
        return <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-primary font-medium">Processing</span>;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto" data-testid="history-page">
      <div className="mb-8">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-2">
          History
        </h1>
        <p className="text-base text-muted-foreground">
          All your generated presentations in one place.
        </p>
      </div>

      {/* Loading */}
      {presentations === null && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-5 rounded-xl border border-slate-200">
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-3 w-72" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {presentations?.length === 0 && (
        <div className="text-center py-20 animate-fade-in" data-testid="empty-history">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center mx-auto mb-4">
            <Presentation className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-heading text-xl font-semibold text-foreground mb-2">No presentations yet</h3>
          <p className="text-muted-foreground mb-6">Create your first AI-generated presentation</p>
          <Button
            onClick={() => navigate("/")}
            className="bg-primary hover:bg-[#003DCC] text-white"
            data-testid="create-first-button"
          >
            Create Presentation
          </Button>
        </div>
      )}

      {/* List */}
      {presentations?.length > 0 && (
        <div className="space-y-3 animate-fade-in">
          {presentations.map((pres) => (
            <div
              key={pres.id}
              className="group p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
              onClick={() => pres.status === "completed" && navigate(`/presentations/${pres.id}`)}
              data-testid={`history-item-${pres.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center shrink-0 mt-0.5">
                    {pres.status === "failed" ? (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    ) : pres.status === "completed" ? (
                      <FileText className="w-5 h-5 text-primary" />
                    ) : (
                      <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate">
                      {pres.title || pres.prompt?.slice(0, 60) || "Untitled"}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate mt-0.5">{pres.prompt}</p>
                    <div className="flex items-center gap-3 mt-2">
                      {getStatusBadge(pres.status)}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(pres.created_at)}
                      </span>
                      {pres.slides?.length > 0 && (
                        <span className="text-xs text-muted-foreground">{pres.slides.length} slides</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-8 h-8 text-muted-foreground hover:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(pres.id);
                    }}
                    disabled={deleting === pres.id}
                    data-testid={`delete-${pres.id}`}
                  >
                    {deleting === pres.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  </Button>
                  {pres.status === "completed" && (
                    <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
