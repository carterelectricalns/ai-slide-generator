import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  Circle,
  ArrowRight,
  LayoutTemplate,
  FileText,
  Paintbrush,
  Download,
} from "lucide-react";

const STEPS = [
  { key: "orchestrating", label: "Generating Outline", icon: LayoutTemplate, desc: "DeepSeek-V3.1 is structuring your slides" },
  { key: "generating_content", label: "Creating Content", icon: FileText, desc: "GPT-OSS-120B is writing bullet points" },
  { key: "generating_layout", label: "Designing Layout", icon: Paintbrush, desc: "Qwen3-Coder is optimizing positions" },
  { key: "rendering", label: "Rendering Files", icon: Download, desc: "Building PPTX and PDF files" },
  { key: "completed", label: "Done", icon: CheckCircle2, desc: "Your presentation is ready" },
];

const EXAMPLES = [
  "Create a pitch deck for an AI-powered fitness app",
  "Quarterly business review for a SaaS startup",
  "Product launch plan for a sustainable fashion brand",
  "Investor presentation for a food delivery marketplace",
];

export default function NewPresentation() {
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [presId, setPresId] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [presentation, setPresentation] = useState(null);
  const pollRef = useRef(null);
  const navigate = useNavigate();

  // Poll for status
  useEffect(() => {
    if (!presId || !generating) return;
    const poll = async () => {
      try {
        const { data } = await api.get(`/presentations/${presId}`);
        setCurrentStatus(data.status);
        setPresentation(data);
        if (data.status === "completed") {
          setGenerating(false);
          toast.success("Presentation generated successfully!");
          clearInterval(pollRef.current);
        } else if (data.status === "failed") {
          setGenerating(false);
          toast.error(data.error || "Generation failed");
          clearInterval(pollRef.current);
        }
      } catch {
        // keep polling
      }
    };
    pollRef.current = setInterval(poll, 1500);
    poll();
    return () => clearInterval(pollRef.current);
  }, [presId, generating]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setCurrentStatus("orchestrating");
    setPresentation(null);
    try {
      const { data } = await api.post("/presentations/generate", { prompt: prompt.trim() });
      setPresId(data.id);
    } catch (err) {
      setGenerating(false);
      toast.error(err.response?.data?.detail || "Failed to start generation");
    }
  };

  const getStepStatus = (stepKey) => {
    if (!currentStatus) return "pending";
    const stepIdx = STEPS.findIndex((s) => s.key === stepKey);
    const currentIdx = STEPS.findIndex((s) => s.key === currentStatus);
    if (stepIdx < currentIdx) return "done";
    if (stepIdx === currentIdx) return "active";
    return "pending";
  };

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto" data-testid="new-presentation-page">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-2">
          New Presentation
        </h1>
        <p className="text-base text-muted-foreground">
          Describe your presentation and let AI do the rest.
        </p>
      </div>

      {/* Prompt Input */}
      {!generating && !presentation?.status?.includes("completed") && (
        <div className="space-y-6 animate-fade-in">
          <div className="relative">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              placeholder="Describe your presentation... e.g. 'Pitch deck for an AI startup'"
              className="h-14 text-base pl-5 pr-32 rounded-xl border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              disabled={generating}
              data-testid="prompt-input"
            />
            <Button
              onClick={handleGenerate}
              disabled={!prompt.trim() || generating}
              className="absolute right-2 top-2 h-10 px-5 bg-primary hover:bg-[#003DCC] text-white rounded-lg transition-colors"
              data-testid="generate-button"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate
            </Button>
          </div>

          {/* Example prompts */}
          <div className="space-y-3">
            <p className="text-xs tracking-[0.2em] uppercase font-bold text-slate-500">
              Try an example
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setPrompt(ex)}
                  className="px-3 py-1.5 text-sm rounded-full border border-slate-200 text-slate-600 hover:border-primary hover:text-primary hover:bg-accent transition-all duration-200"
                  data-testid="example-prompt"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Generation Progress */}
      {(generating || currentStatus) && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
          {/* Stepper */}
          <div className="space-y-1">
            <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
              Generation Progress
            </h3>
            <div className="space-y-0">
              {STEPS.map((step, idx) => {
                const status = getStepStatus(step.key);
                const Icon = step.icon;
                return (
                  <div key={step.key} className="flex gap-4" data-testid={`step-${step.key}`}>
                    {/* Vertical line + icon */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                          status === "done"
                            ? "bg-primary text-white"
                            : status === "active"
                            ? "bg-primary/10 text-primary ring-2 ring-primary"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {status === "done" ? (
                          <CheckCircle2 className="w-5 h-5" />
                        ) : status === "active" ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </div>
                      {idx < STEPS.length - 1 && (
                        <div
                          className={`w-0.5 h-10 transition-colors duration-300 ${
                            status === "done" ? "bg-primary" : "bg-slate-200"
                          }`}
                        />
                      )}
                    </div>
                    {/* Text */}
                    <div className="pb-6">
                      <p
                        className={`text-sm font-semibold ${
                          status === "active" ? "text-primary" : status === "done" ? "text-foreground" : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Preview / Skeleton */}
          <div>
            <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
              Slide Preview
            </h3>
            {presentation?.slides?.length > 0 ? (
              <div className="space-y-3">
                {presentation.slides.slice(0, 4).map((slide, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:shadow-sm transition-shadow"
                    data-testid={`slide-preview-${idx}`}
                  >
                    <p className="text-sm font-semibold text-foreground">{slide.title}</p>
                    {slide.bullets && (
                      <ul className="mt-2 space-y-1">
                        {slide.bullets.slice(0, 3).map((b, bi) => (
                          <li key={bi} className="text-xs text-muted-foreground flex items-start gap-2">
                            <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                            {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
                {presentation.slides.length > 4 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{presentation.slides.length - 4} more slides
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-slate-200 bg-white">
                    <Skeleton className="h-4 w-32 mb-3" />
                    <Skeleton className="h-3 w-full mb-1.5" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Completed Actions */}
      {presentation?.status === "completed" && (
        <div className="mt-8 animate-fade-in">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate(`/presentations/${presentation.id}`)}
              className="bg-primary hover:bg-[#003DCC] text-white"
              data-testid="view-presentation-button"
            >
              View Presentation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setPresentation(null);
                setCurrentStatus(null);
                setPresId(null);
                setPrompt("");
              }}
              data-testid="create-another-button"
            >
              Create Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
