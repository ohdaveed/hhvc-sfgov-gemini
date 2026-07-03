import React, { useState } from "react";
import Markdown from "react-markdown";
import { 
  CheckCircle, 
  AlertTriangle, 
  Sparkles, 
  FileText, 
  ChevronRight, 
  Search, 
  Activity, 
  HelpCircle,
  PlusSquare,
  Compass,
  AlertCircle
} from "lucide-react";

interface AuditPanelProps {
  initialContent: string;
  onAddTaskToRedesign: (taskName: string) => void;
}

export default function AuditPanel({
  initialContent,
  onAddTaskToRedesign
}: AuditPanelProps) {
  const [content, setContent] = useState<string>(initialContent || "");
  const [auditMode, setAuditMode] = useState<"high-thinking" | "grounded-search" | "fast">("high-thinking");
  const [loading, setLoading] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<string>("");
  const [citations, setCitations] = useState<any[]>([]);
  const [preFilled, setPreFilled] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("San Francisco landlord rodent pest control health codes");
  const [searchResult, setSearchResult] = useState<string>("");

  const handleFillFromCanvas = () => {
    setContent(initialContent);
    setPreFilled(true);
  };

  const runAudit = async () => {
    if (!content.trim()) {
      alert("Please enter some mockup specification or content draft to audit.");
      return;
    }

    setLoading(true);
    setAuditResult("");
    setCitations([]);
    
    try {
      const response = await fetch("/api/gemini/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          mode: auditMode,
          systemContext: "Karl CMS v2.1 Guidelines and SF DPH Healthy Housing regulations."
        })
      });

      const data = await response.json();
      if (response.ok) {
        setAuditResult(data.text);
        if (data.groundingChunks) {
          setCitations(data.groundingChunks);
        }
      } else {
        setAuditResult(`**Error during evaluation**: ${data.error || "API failure"}`);
      }
    } catch (err: any) {
      console.error(err);
      setAuditResult(`**API Error**: Failed to establish connection to full-stack Express backend. Make sure the server is booted.`);
    } finally {
      setLoading(false);
    }
  };

  // Run a real Google Search grounded query on SF Codes
  const runSFSearchGrounding = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearchResult("");
    try {
      const response = await fetch("/api/gemini/search-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await response.json();
      if (response.ok) {
        setSearchResult(data.text);
        if (data.groundingChunks) {
          setCitations(data.groundingChunks);
        }
      } else {
        setSearchResult(`Search failed: ${data.error}`);
      }
    } catch (err) {
      setSearchResult("Failed to query grounded search endpoint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm" id="audit-panel-card">
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-400" />
          <div>
            <h2 className="font-sans font-semibold tracking-tight text-base">Gemini WCAG 2.1 & Karl CMS Auditor</h2>
            <p className="text-[10px] text-slate-400 font-mono">AUTOMATED SYSTEM REASONING & RESEARCH GROUNDING</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-blue-300 font-mono border border-slate-700">
            ACTIVE AGENT API
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
        {/* Left Column: Input Panel */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-800">Mockup Specs / Copy Draft to Audit</span>
            <button
              onClick={handleFillFromCanvas}
              className="text-[10px] bg-blue-50 hover:bg-blue-100 text-blue-900 px-2 py-1 rounded font-medium border border-blue-100"
            >
              Fill From Layout Canvas
            </button>
          </div>

          <textarea
            className="w-full h-44 p-3 bg-slate-50 border border-slate-250 text-xs text-slate-800 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-sans leading-relaxed resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste code specifications, component JSONs, or content copy here..."
          />

          {/* Model Options */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Select AI Audit Mode</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setAuditMode("high-thinking")}
                className={`p-2.5 rounded-lg border text-xs font-medium text-left flex flex-col justify-between h-20 transition ${
                  auditMode === "high-thinking"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="font-semibold flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 shrink-0" />
                  Deep Audit
                </span>
                <span className="text-[8px] opacity-80 leading-tight">Gemini 3.1 Pro (Thinking High)</span>
              </button>

              <button
                onClick={() => setAuditMode("grounded-search")}
                className={`p-2.5 rounded-lg border text-xs font-medium text-left flex flex-col justify-between h-20 transition ${
                  auditMode === "grounded-search"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="font-semibold flex items-center gap-1">
                  <Search className="h-3.5 w-3.5 shrink-0" />
                  Grounded Info
                </span>
                <span className="text-[8px] opacity-80 leading-tight">Gemini 3.5 Flash (Grounded Search)</span>
              </button>

              <button
                onClick={() => setAuditMode("fast")}
                className={`p-2.5 rounded-lg border text-xs font-medium text-left flex flex-col justify-between h-20 transition ${
                  auditMode === "fast"
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="font-semibold flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 shrink-0" />
                  Fast Audit
                </span>
                <span className="text-[8px] opacity-80 leading-tight">Gemini 3.1 Flash-Lite (Speedy)</span>
              </button>
            </div>
          </div>

          <button
            onClick={runAudit}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-lg shadow-sm transition cursor-pointer"
          >
            {loading ? "Reasoning & Analyzing Draft..." : "Run AI Compliance Audit"}
          </button>

          {/* Research Box */}
          <div className="pt-3 border-t border-slate-200 space-y-2">
            <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
              <Compass className="h-3.5 w-3.5 text-blue-600" />
              Source of Truth SF Abatement Search
            </span>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query SF health codes..."
                className="bg-slate-50 border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg grow"
              />
              <button
                onClick={runSFSearchGrounding}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg cursor-pointer"
              >
                Search SFDPH
              </button>
            </div>
            {searchResult && (
              <div className="bg-slate-50 border p-3 rounded-lg text-xs leading-relaxed max-h-[140px] overflow-y-auto" id="search-grounding-body">
                <span className="text-[9px] font-mono text-slate-400 block mb-1">Grounded search results:</span>
                <Markdown>{searchResult}</Markdown>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Results Box */}
        <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between min-h-[380px]">
          <div className="space-y-3 grow">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                Audit Evaluation Report
              </span>
              <span className="text-[9px] font-mono uppercase bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                Report v1.0
              </span>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 space-y-3">
                <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-500 font-mono animate-pulse">
                  {auditMode === "high-thinking" 
                    ? "Deep Audit reasoning taking place..." 
                    : "Fetching search sources of truth..."}
                </p>
              </div>
            ) : auditResult ? (
              <div className="prose prose-slate prose-xs max-w-none text-slate-700 leading-relaxed max-h-[320px] overflow-y-auto pr-1" id="audit-report-body">
                <Markdown>{auditResult}</Markdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-slate-400 text-center space-y-1.5">
                <HelpCircle className="h-8 w-8 text-slate-300" />
                <p className="text-xs">No audit run yet. Fill specs and click above to evaluate against WCAG 2.1.</p>
              </div>
            )}
          </div>

          {/* Grounding Citations */}
          {citations && citations.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Grounding Citations / Citations found:</span>
              <div className="flex flex-wrap gap-1.5 max-h-[80px] overflow-y-auto">
                {citations.map((c: any, idx: number) => {
                  const url = c.web?.uri || "#";
                  const title = c.web?.title || `Source [${idx + 1}]`;
                  return (
                    <a
                      key={idx}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded hover:bg-blue-100 transition inline-flex items-center gap-1"
                    >
                      <span>{title}</span>
                      <ChevronRight className="h-3 w-3" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick task exporter */}
          {auditResult && !loading && (
            <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[10px] text-slate-400">Add recommendation as Task?</span>
              <button
                onClick={() => {
                  const r = prompt("Enter specific WCAG improvement to add as Google Task:", "Fix Homepage layout contrast ratio");
                  if (r) {
                    onAddTaskToRedesign(r);
                    alert("Added to redesign checklist task queue!");
                  }
                }}
                className="text-[10px] bg-slate-900 text-white font-semibold px-2.5 py-1.5 rounded hover:bg-slate-800 transition flex items-center gap-1"
              >
                <PlusSquare className="h-3.5 w-3.5" />
                Export Task to Google list
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
