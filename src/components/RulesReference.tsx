import React, { useState } from "react";
import { SF_RULES_REGULATIONS, RuleSection } from "../rulesData";
import Markdown from "react-markdown";
import { 
  BookOpen, 
  Search, 
  ShieldAlert, 
  FileText, 
  CheckCircle, 
  Copy, 
  CornerUpRight, 
  Filter,
  Check
} from "lucide-react";

interface RulesReferenceProps {
  onSendToAuditor: (text: string) => void;
}

export default function RulesReference({ onSendToAuditor }: RulesReferenceProps) {
  const [selectedSectionId, setSelectedSectionId] = useState<string>("rules-intro");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copied, setCopied] = useState<boolean>(false);

  const activeSection = SF_RULES_REGULATIONS.find((s) => s.id === selectedSectionId) || SF_RULES_REGULATIONS[0];

  // Filtering logic
  const filteredSections = SF_RULES_REGULATIONS.filter((sec) => {
    const matchesCategory = selectedCategory === "all" || sec.category === selectedCategory;
    const matchesSearch = 
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(activeSection.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    onSendToAuditor(activeSection.content);
    alert(`Successfully sent "${activeSection.title}" to the WCAG compliance auditor panel!`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm" id="rules-reference-card">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-amber-400" />
          <div>
            <h2 className="font-sans font-semibold tracking-tight text-base">
              Director's Rules & Regulations Reference
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">OFFICIAL SFDPH COMPLIANCE SOURCE OF TRUTH (v3.0)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded text-amber-300 font-mono border border-slate-700">
            HEALTH CODE ARTICLE 11
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 min-h-[480px]">
        {/* Left Side: Filter, Search & Directory */}
        <div className="p-4 border-r border-slate-100 bg-slate-50/50 space-y-4 md:col-span-1">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search health codes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-250 text-xs pl-8 pr-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-sans"
              id="rules-search-input"
            />
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block px-1">
              Filter by Role/Type
            </span>
            <div className="flex flex-wrap gap-1 md:flex-col">
              {[
                { label: "All Regulations", value: "all" },
                { label: "Tenant Responsibilities", value: "tenant" },
                { label: "Owner & Manager Mandates", value: "owner" },
                { label: "Pest Control Operators", value: "pco" },
                { label: "General & Prevention", value: "general" },
                { label: "Appendix & Contact", value: "appendix" }
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`text-left text-xs px-2.5 py-1.5 rounded-lg transition font-medium min-h-[32px] md:min-h-0 ${
                    selectedCategory === cat.value
                      ? "bg-slate-200 text-slate-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Directory List */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block px-1">
              Document Directory
            </span>
            <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
              {filteredSections.length === 0 ? (
                <p className="text-xs text-slate-400 p-2 italic">No sections match your search.</p>
              ) : (
                filteredSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => setSelectedSectionId(sec.id)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-lg transition font-medium truncate flex items-center justify-between min-h-[38px] ${
                      selectedSectionId === sec.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-slate-700 bg-white border border-slate-100 hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Document viewer */}
        <div className="p-5 md:col-span-3 flex flex-col justify-between bg-white">
          <div>
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                Official Document Section
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-250 transition min-h-[36px]"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? "Copied!" : "Copy Section"}</span>
                </button>
                <button
                  onClick={handleSend}
                  className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition min-h-[36px]"
                >
                  <CornerUpRight className="h-3.5 w-3.5" />
                  <span>Send to Compliance Auditor</span>
                </button>
              </div>
            </div>

            {/* Document Text Rendering */}
            <div className="prose prose-slate prose-xs max-w-none text-slate-700 leading-relaxed max-h-[380px] overflow-y-auto pr-2" id="rules-doc-body">
              <Markdown>{activeSection.content}</Markdown>
            </div>
          </div>

          {/* Quick compliance educational tooltip */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
            <span>Source: San Francisco Health Code (Environmental Health Branch)</span>
            <span className="flex items-center gap-1 text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded">
              <CheckCircle className="h-3.5 w-3.5 text-blue-600" />
              Verified Authentic 2025 Regulations
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
