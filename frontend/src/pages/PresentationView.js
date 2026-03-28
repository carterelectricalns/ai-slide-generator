import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Download,
  FileText,
  FileImage,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function PresentationView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pres, setPres] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const fetchPres = async () => {
      try {
        const { data } = await api.get(`/presentations/${id}`);
        setPres(data);
      } catch {
        toast.error("Presentation not found");
        navigate("/history");
      } finally {
        setLoading(false);
      }
    };
    fetchPres();
  }, [id, navigate]);

  const handleDownload = async (format) => {
    setDownloading(format);
    try {
      const resp = await api.get(`/presentations/${id}/download/${format}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement("a");
      link.href = url;
      const ext = format === "pptx" ? "pptx" : "pdf";
      const title = pres?.title || "presentation";
      link.setAttribute("download", `${title}.${ext}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`${format.toUpperCase()} downloaded!`);
    } catch {
      toast.error(`Failed to download ${format.toUpperCase()}`);
    } finally {
      setDownloading(null);
    }
  };

  const slides = pres?.slides || [];
  const slide = slides[currentSlide];

  if (loading) {
    return (
      <div className="p-6 lg:p-10 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="w-full aspect-[16/9] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 max-w-5xl mx-auto" data-testid="presentation-view">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/history")}
            className="text-muted-foreground hover:text-foreground"
            data-testid="back-button"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {pres?.title || "Presentation"}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {slides.length} slides
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => handleDownload("pdf")}
            disabled={downloading === "pdf"}
            className="text-sm"
            data-testid="download-pdf-button"
          >
            <FileImage className="w-4 h-4 mr-2" />
            {downloading === "pdf" ? "Downloading..." : "PDF"}
          </Button>
          <Button
            onClick={() => handleDownload("pptx")}
            disabled={downloading === "pptx"}
            className="bg-primary hover:bg-[#003DCC] text-white text-sm"
            data-testid="download-pptx-button"
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading === "pptx" ? "Downloading..." : "PPTX"}
          </Button>
        </div>
      </div>

      {/* Slide Viewer */}
      {slide && (
        <div className="space-y-4 animate-fade-in">
          {/* Slide canvas */}
          <div
            className="relative w-full aspect-[16/10] rounded-xl border border-slate-200 bg-white overflow-hidden"
            data-testid="slide-canvas"
          >
            {slide.layout === "title_centered" ? (
              <div className="flex flex-col items-center justify-center h-full p-8 lg:p-16">
                <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0F172A] text-center mb-4">
                  {slide.title}
                </h2>
                <div className="w-24 h-1 rounded-full bg-primary mb-4" />
                {slide.bullets?.[0] && (
                  <p className="text-base lg:text-lg text-slate-500 text-center max-w-lg">
                    {slide.bullets[0]}
                  </p>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col">
                {/* Blue top bar */}
                <div className="h-1.5 bg-primary w-full shrink-0" />
                <div className="flex-1 p-6 lg:p-10">
                  <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-[#0F172A] mb-6">
                    {slide.title}
                  </h2>
                  <ul className="space-y-3">
                    {slide.bullets?.map((bullet, bi) => (
                      <li key={bi} className="flex items-start gap-3">
                        <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        <span className="text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed">
                          {bullet}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Slide number */}
                <div className="px-6 pb-3 text-right">
                  <span className="text-xs text-slate-400">{currentSlide + 1}</span>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
              disabled={currentSlide === 0}
              data-testid="prev-slide-button"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    idx === currentSlide ? "bg-primary w-6" : "bg-slate-300 hover:bg-slate-400"
                  }`}
                  data-testid={`slide-dot-${idx}`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentSlide((s) => Math.min(slides.length - 1, s + 1))}
              disabled={currentSlide === slides.length - 1}
              data-testid="next-slide-button"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {/* Slide thumbnails */}
          <div className="mt-6">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-3">All Slides</h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {slides.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`aspect-[16/10] rounded-lg border-2 p-2 text-left transition-all duration-200 ${
                    idx === currentSlide
                      ? "border-primary bg-accent"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                  data-testid={`slide-thumb-${idx}`}
                >
                  <p className="text-[8px] sm:text-[10px] font-semibold text-foreground truncate">{s.title}</p>
                  {s.bullets?.slice(0, 2).map((b, bi) => (
                    <p key={bi} className="text-[6px] sm:text-[8px] text-muted-foreground truncate">{b}</p>
                  ))}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
