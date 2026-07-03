import React, { useState } from "react";
import { BrandGuideline } from "../types";
import { DEFAULT_BRAND_GUIDELINES } from "../data";
import { saveCustomGuideline } from "../lib/db";
import { User } from "firebase/auth";
import Markdown from "react-markdown";
import { 
  BookOpen, 
  Edit3, 
  Check, 
  Sparkles, 
  Layers, 
  Eye, 
  Lock, 
  Activity,
  Maximize2
} from "lucide-react";

interface BrandManualProps {
  user: User | null;
  guidelines: BrandGuideline[];
  onUpdateGuideline: (updated: BrandGuideline) => void;
}

export default function BrandManual({
  user,
  guidelines,
  onUpdateGuideline
}: BrandManualProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>("bg-typo");
  const [editing, setEditing] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>("");
  const [suggesting, setSuggesting] = useState<boolean>(false);

  const activeGuideline = guidelines.find((g) => g.id === activeSectionId) || guidelines[0];

  const handleStartEdit = () => {
    setEditContent(activeGuideline.content);
    setEditing(true);
  };

  const handleSave = async () => {
    const updated: BrandGuideline = {
      ...activeGuideline,
      content: editContent,
      updatedAt: new Date().toISOString()
    };
    onUpdateGuideline(updated);
    setEditing(false);

    if (user) {
      try {
        await saveCustomGuideline(user.uid, updated);
      } catch (err) {
        console.error("Failed to save guideline persistently:", err);
      }
    }
  };

  // Generate guidelines section suggestions using Gemini
  const handleAISuggest = async () => {
    setSuggesting(true);
    try {
      const response = await fetch("/api/gemini/suggest-manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionTitle: activeGuideline.section,
          currentContent: editContent || activeGuideline.content
        })
      });

      const data = await response.json();
      if (data.text) {
        setEditContent(data.text);
        if (!editing) {
          setEditing(true);
        }
      }
    } catch (err) {
      console.error("AI manual error:", err);
      alert("Failed to get suggestions. Please verify your server connection and Gemini API Key.");
    } finally {
      setSuggesting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm" id="brand-manual-card">
      {/* Card Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-blue-400" />
          <div>
            <h2 className="font-sans font-semibold tracking-tight text-base">
              SF Healthy Housing & Vector Control Brand Manual
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">SINGLE SOURCE OF TRUTH (SST) & GUIDELINES</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!user && (
            <span className="flex items-center gap-1 text-[10px] bg-slate-800 px-2 py-1 rounded-md text-slate-300 border border-slate-700">
              <Lock className="h-3 w-3 text-slate-400" />
              Preview Mode (Login to Edit)
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 min-h-[450px]">
        {/* Left Navigation bar */}
        <div className="p-3 border-r border-slate-100 bg-slate-50/50 space-y-1 md:col-span-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block px-2 mb-2">
            Manual Chapters
          </span>
          {guidelines.map((g) => (
            <button
              key={g.id}
              onClick={() => {
                setActiveSectionId(g.id);
                setEditing(false);
              }}
              className={`w-full text-left text-xs px-3 py-2.5 rounded-lg transition font-medium flex items-center justify-between ${
                activeSectionId === g.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <span>{g.section}</span>
              {g.category === "accessibility" && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded-sm ${activeSectionId === g.id ? "bg-slate-800 text-slate-200" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
                  AA
                </span>
              )}
            </button>
          ))}

          {/* Quick Info Box */}
          <div className="mt-6 p-3 bg-slate-55 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[10px] font-mono text-blue-700 uppercase tracking-widest font-semibold flex items-center gap-1">
              <Activity className="h-3 w-3 text-blue-600" />
              Redesign Standards
            </span>
            <ul className="text-[10px] text-slate-600 space-y-1 list-disc list-inside leading-relaxed">
              <li>WCAG 2.1 AA Compliant</li>
              <li>Karl CMS Grid Architecture</li>
              <li>Display: Space Grotesk</li>
              <li>Body: Inter (16px Min)</li>
              <li>Min Touch Target: 44px</li>
            </ul>
          </div>
        </div>

        {/* Right Content/Preview Panel */}
        <div className="p-5 md:col-span-3 flex flex-col justify-between">
          <div>
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-sans font-semibold text-lg text-slate-800 flex items-center gap-1.5">
                {activeGuideline.section}
              </h3>
              
              <div className="flex items-center gap-1.5">
                {editing ? (
                  <>
                    <button
                      onClick={handleAISuggest}
                      disabled={suggesting}
                      className="flex items-center gap-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-900 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                    >
                      <Sparkles className={`h-3.5 w-3.5 text-blue-600 ${suggesting ? "animate-spin" : ""}`} />
                      {suggesting ? "Enhancing..." : "AI Improve"}
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition font-medium"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Save Draft
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1.5"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleAISuggest}
                      disabled={suggesting}
                      className="flex items-center gap-1 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-blue-500" />
                      Suggest Section
                    </button>
                    <button
                      onClick={handleStartEdit}
                      className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      Edit Specifications
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Editing / Preview State */}
            {editing ? (
              <div className="space-y-3">
                <textarea
                  className="w-full h-80 p-3.5 text-xs font-mono bg-slate-900 text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none leading-relaxed"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder="Enter Karl CMS Brand Guidelines specifications in Markdown format..."
                />
                <p className="text-[10px] text-slate-400 italic">
                  Tip: Use Markdown headers, tables, and lists to design highly structured manual entries for your designers.
                </p>
              </div>
            ) : (
              <div className="prose prose-slate prose-xs max-w-none text-slate-700 leading-relaxed max-h-80 overflow-y-auto pr-2" id="manual-markdown-body">
                <Markdown>{activeGuideline.content}</Markdown>
              </div>
            )}
          </div>

          {/* Visual Palette Preview Helper on certain sections */}
          {activeGuideline.id === "bg-colors" && !editing && (
            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-lg flex flex-col justify-between h-16 shadow-sm">
                <span className="text-[10px] font-mono">Health Blue</span>
                <span className="text-[9px] font-mono uppercase bg-blue-800 px-1 py-0.5 rounded self-start mt-1">#2563EB</span>
              </div>
              <div className="p-2.5 bg-emerald-800 text-white rounded-lg flex flex-col justify-between h-16 shadow-2xs">
                <span className="text-[10px] font-mono">City Sage Green</span>
                <span className="text-[9px] font-mono uppercase bg-emerald-950 px-1 py-0.5 rounded self-start mt-1">#064E3B</span>
              </div>
              <div className="p-2.5 bg-amber-500 text-slate-950 rounded-lg flex flex-col justify-between h-16 shadow-2xs">
                <span className="text-[10px] font-mono font-medium">Alert Amber</span>
                <span className="text-[9px] font-mono uppercase bg-amber-600/30 px-1 py-0.5 rounded self-start mt-1">#F59E0B</span>
              </div>
              <div className="p-2.5 bg-red-600 text-white rounded-lg flex flex-col justify-between h-16 shadow-2xs">
                <span className="text-[10px] font-mono">Critical Red</span>
                <span className="text-[9px] font-mono uppercase bg-red-700 px-1 py-0.5 rounded self-start mt-1">#DC2626</span>
              </div>
            </div>
          )}

          {activeGuideline.id === "bg-typo" && !editing && (
            <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50 p-3 rounded-lg flex flex-col gap-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Interactive Typographic Sample</span>
              <div className="space-y-1">
                <h1 className="text-xl font-sans font-bold text-slate-900 tracking-tight leading-none" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                  Space Grotesk Display Title
                </h1>
                <p className="text-xs text-slate-600 font-sans" style={{ fontFamily: "Inter, sans-serif" }}>
                  Inter body font: readable, pleasant, optimized for standard 1.5 spacing.
                </p>
                <p className="text-[10px] text-slate-500 font-mono" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                  JetBrains Mono for systems data, codes (e.g. ZIP 94110), & telemetry.
                </p>
              </div>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>Last Saved: {new Date(activeGuideline.updatedAt).toLocaleDateString()}</span>
            <span>AA Compliance Checked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
