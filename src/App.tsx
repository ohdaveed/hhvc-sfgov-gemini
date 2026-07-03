import React, { useState, useEffect, useCallback } from "react";
import { User } from "firebase/auth";
import { 
  getMockLayouts, 
  saveMockLayout, 
  getCustomGuidelines, 
  saveCustomGuideline 
} from "./lib/db";
import { 
  DEFAULT_MOCK_LAYOUTS, 
  DEFAULT_BRAND_GUIDELINES, 
  MOCK_INCIDENTS 
} from "./data";
import { MockLayout, BrandGuideline, SFIncident } from "./types";
import WorkspacePanel from "./components/WorkspacePanel";
import BrandManual from "./components/BrandManual";
import MockupCanvas from "./components/MockupCanvas";
import AuditPanel from "./components/AuditPanel";
import { 
  Layout, 
  BookOpen, 
  CheckCircle, 
  Sparkles, 
  Compass, 
  Info, 
  FileText, 
  X,
  Plus,
  ShieldCheck,
  Award
} from "lucide-react";

export default function App() {
  // Global States
  const [activeTab, setActiveTab] = useState<"canvas" | "manual" | "auditor">("canvas");
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [layouts, setLayouts] = useState<MockLayout[]>(DEFAULT_MOCK_LAYOUTS);
  const [activeLayoutId, setActiveLayoutId] = useState<string>("layout-1");
  const [guidelines, setGuidelines] = useState<BrandGuideline[]>(DEFAULT_BRAND_GUIDELINES);
  const [incidents, setIncidents] = useState<SFIncident[]>(MOCK_INCIDENTS);
  
  // Workspace Imported Source Text File
  const [importedSource, setImportedSource] = useState<{ title: string; content: string } | null>(null);
  const [auditInitialContent, setAuditInitialContent] = useState<string>("");

  // Keep token and user synchronized
  const handleAuthStateChange = useCallback((currentUser: User | null, accessToken: string | null) => {
    setUser(currentUser);
    setToken(accessToken);
  }, []);

  // Fetch from Firestore on sign-in
  useEffect(() => {
    async function loadUserData() {
      if (user) {
        const customLayouts = await getMockLayouts(user.uid);
        if (customLayouts.length > 0) {
          setLayouts(customLayouts);
          setActiveLayoutId(customLayouts[0].id);
        }

        const customGuidelines = await getCustomGuidelines(user.uid);
        if (customGuidelines.length > 0) {
          setGuidelines(customGuidelines);
        }
      } else {
        // Reset to presets on sign-out
        setLayouts(DEFAULT_MOCK_LAYOUTS);
        setActiveLayoutId(DEFAULT_MOCK_LAYOUTS[0].id);
        setGuidelines(DEFAULT_BRAND_GUIDELINES);
      }
    }
    loadUserData();
  }, [user]);

  // Handle imported document/sheet contents from Workspace Panel
  const handleImportSource = (title: string, content: string) => {
    setImportedSource({ title, content });
    // Auto-prefill into the Audit panel if they want
    setAuditInitialContent(content);
  };

  // Add a task from the audit exporter
  const handleAddTaskToRedesign = async (taskName: string) => {
    // We can simulate updating a redesign checklist or calling Google Tasks if the panel has a list reference
    // Since Google Workspace panel maintains its own state and can write directly, we can notify the user
    console.log("Task exported to workspace queue:", taskName);
  };

  const handleUpdateGuideline = (updated: BrandGuideline) => {
    setGuidelines((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  // Compile active layouts code string for the audit panel
  const handleTriggerAuditFromCanvas = (layoutText: string) => {
    setAuditInitialContent(layoutText);
    setActiveTab("auditor");
  };

  const handleAddIncident = (newInc: SFIncident) => {
    setIncidents((prev) => [newInc, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans leading-relaxed selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Notification Header Bar */}
      <div className="bg-slate-900 text-slate-250 text-center py-1.5 px-4 text-xs font-mono tracking-wide flex items-center justify-between border-b border-slate-800">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
          COLLABORATIVE REDESIGN SYSTEM STABLE
        </span>
        <span className="hidden sm:inline">SF Department of Public Health (DPH) Portal Integration</span>
        <span className="font-mono text-[10px] bg-slate-800 px-2.5 py-0.5 rounded text-slate-300">Karl CMS v2.1</span>
      </div>

      {/* Main Masthead Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-sm shrink-0">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-sans font-bold text-slate-900 text-xl tracking-tight leading-tight flex items-center gap-2">
                SF Vector & Housing Blueprint Workspace
                <span className="text-[10px] bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                  Pro Redesign
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Standardizing Karl CMS components, WCAG 2.1 auditing, and Workspace sources of truth for citizens of San Francisco.
              </p>
            </div>
          </div>

          {/* User Sign In and Connection badge */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <ShieldCheck className="h-4 w-4 text-green-600 shrink-0" />
                <span className="text-slate-700">
                  Logged in as <strong>{user.displayName || user.email?.split("@")[0]}</strong>
                </span>
              </div>
            ) : (
              <div className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl leading-normal max-w-xs">
                <strong>💡 Preview Mode</strong>: Sign in to persist custom layouts and manual edits to Firestore.
              </div>
            )}
          </div>
        </div>

        {/* Global Tab Navigation */}
        <div className="bg-slate-50/50 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <nav className="flex gap-1.5 py-2">
              <button
                onClick={() => setActiveTab("canvas")}
                className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === "canvas"
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Layout className="h-4 w-4 text-blue-600" />
                Layout Blueprint Canvas
              </button>

              <button
                onClick={() => setActiveTab("manual")}
                className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === "manual"
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <BookOpen className="h-4 w-4 text-blue-600" />
                SF Brand Guidelines Manual
              </button>

              <button
                onClick={() => setActiveTab("auditor")}
                className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === "auditor"
                    ? "bg-white text-blue-600 shadow-sm border border-slate-200"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <CheckCircle className="h-4 w-4 text-blue-600" />
                WCAG & Karl CMS Auditor
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        
        {/* Workspace Panel at the top of active designing area for easy access */}
        <WorkspacePanel 
          onImportSource={handleImportSource}
          user={user}
          token={token}
          onAuthStateChange={handleAuthStateChange}
        />

        {/* Imported Source Content Drawer */}
        {importedSource && (
          <div className="bg-blue-50/40 border border-blue-200 rounded-xl p-4 space-y-2 relative" id="imported-source-box">
            <button 
              onClick={() => setImportedSource(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-blue-950">
              <FileText className="h-4 w-4 text-blue-600" />
              <span>Imported Workspace Source of Truth: <strong>{importedSource.title}</strong></span>
            </div>
            <pre className="text-[11px] font-mono bg-white p-3 border border-blue-150 rounded-lg max-h-[120px] overflow-y-auto whitespace-pre-wrap leading-relaxed text-slate-700">
              {importedSource.content}
            </pre>
            <p className="text-[10px] text-slate-500 italic">
              This content has been pre-filled into the Audit panel input to let you verify guidelines or layouts instantly.
            </p>
          </div>
        )}

        {/* Active View Router */}
        <div>
          {activeTab === "canvas" && (
            <MockupCanvas 
              user={user}
              layouts={layouts}
              activeLayoutId={activeLayoutId}
              onSelectLayout={setActiveLayoutId}
              onUpdateLayouts={setLayouts}
              incidents={incidents}
              onAddIncident={handleAddIncident}
              onTriggerAudit={handleTriggerAuditFromCanvas}
            />
          )}

          {activeTab === "manual" && (
            <BrandManual 
              user={user}
              guidelines={guidelines}
              onUpdateGuideline={handleUpdateGuideline}
            />
          )}

          {activeTab === "auditor" && (
            <AuditPanel 
              initialContent={auditInitialContent}
              onAddTaskToRedesign={handleAddTaskToRedesign}
            />
          )}
        </div>

        {/* Bottom Educational / Informative Panel about SF Vector & Karl CMS */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <h3 className="font-sans font-bold text-sm text-slate-800 flex items-center gap-1.5">
            <Info className="h-4 w-4 text-blue-600" />
            Redesign Methodology & Standards
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            The **Karl CMS** is the primary Content Management System for San Francisco Department of Public Health (SFDPH) 
            digital platforms. To maintain brand consistency and alignment, this mockup creator standardizes the components 
            and implements **WCAG 2.1 AA** pre-audit rules directly on the design canvas. Each page is engineered with a 
            singular user task in mind—such as reporting standing water or searching for bedbug regulations—eliminating unnecessary 
            clutter and improving cognitive accessibility for all citizens of San Francisco.
          </p>
          <div className="flex flex-wrap gap-4 text-[11px] text-slate-500 pt-1">
            <span className="flex items-center gap-1">
              <Award className="h-3.5 w-3.5 text-blue-600" />
              WCAG 2.1 AA Minimum contrast of 4.5:1
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
              Minimum touch target 44px for high accuracy
            </span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-center text-xs text-slate-400 font-mono">
        <p>© 2026 San Francisco Environmental Health Department. Built on Karl CMS Framework.</p>
      </footer>
    </div>
  );
}
