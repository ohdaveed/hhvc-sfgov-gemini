import React, { useState } from "react";
import { MockLayout, KarlComponent, SFIncident } from "../types";
import { PRESET_COMPONENTS, SF_NEIGHBORHOODS, MOCK_INCIDENTS } from "../data";
import { saveMockLayout, deleteMockLayout } from "../lib/db";
import { User } from "firebase/auth";
import { 
  Palette, 
  MapPin, 
  Plus, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Code, 
  Save, 
  GitBranch, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Map,
  Layers,
  ChevronRight,
  Sparkles,
  Volume2
} from "lucide-react";

interface MockupCanvasProps {
  user: User | null;
  layouts: MockLayout[];
  activeLayoutId: string;
  onSelectLayout: (id: string) => void;
  onUpdateLayouts: (updated: MockLayout[]) => void;
  incidents: SFIncident[];
  onAddIncident: (inc: SFIncident) => void;
  onTriggerAudit: (layoutText: string) => void;
}

export default function MockupCanvas({
  user,
  layouts,
  activeLayoutId,
  onSelectLayout,
  onUpdateLayouts,
  incidents,
  onAddIncident,
  onTriggerAudit
}: MockupCanvasProps) {
  const [activeLayout, setActiveLayout] = useState<MockLayout | null>(null);
  const [addingComp, setAddingComp] = useState<boolean>(false);
  const [gitPushing, setGitPushing] = useState<boolean>(false);
  const [gitLogs, setGitLogs] = useState<string[]>([]);
  const [gitSuccess, setGitSuccess] = useState<boolean>(false);
  const [editingCompId, setEditingCompId] = useState<string | null>(null);
  const [newLayoutName, setNewLayoutName] = useState("");
  const [newLayoutGoal, setNewLayoutGoal] = useState("");
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>("Mission District");
  const [selectedVector, setSelectedVector] = useState<"Rodents" | "Mosquitoes" | "Bed Bugs" | "Mold/Lead" | "Garbage">("Rodents");

  const layout = layouts.find((l) => l.id === activeLayoutId) || layouts[0];

  const handleUpdateLayout = async (updated: MockLayout) => {
    const nextList = layouts.map((l) => (l.id === updated.id ? updated : l));
    onUpdateLayouts(nextList);
    
    if (user) {
      try {
        await saveMockLayout(user.uid, updated);
      } catch (err) {
        console.error("Firestore layout save error:", err);
      }
    }
  };

  // 1. Component operations
  const handleAddComponent = (preset: KarlComponent) => {
    const newComp: KarlComponent = {
      ...preset,
      id: "comp-" + Date.now(), // Generate unique instance ID
      properties: { ...preset.properties }
    };
    const updated: MockLayout = {
      ...layout,
      components: [...layout.components, newComp]
    };
    handleUpdateLayout(updated);
    setAddingComp(false);
  };

  const handleDeleteComponent = (compId: string) => {
    const updated: MockLayout = {
      ...layout,
      components: layout.components.filter((c) => c.id !== compId)
    };
    handleUpdateLayout(updated);
    if (editingCompId === compId) setEditingCompId(null);
  };

  const handleMoveComponent = (index: number, direction: "up" | "down") => {
    const comps = [...layout.components];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= comps.length) return;

    // Swap
    const temp = comps[index];
    comps[index] = comps[targetIndex];
    comps[targetIndex] = temp;

    const updated: MockLayout = {
      ...layout,
      components: comps
    };
    handleUpdateLayout(updated);
  };

  const handleEditProperty = (compId: string, key: string, val: any) => {
    const comps = layout.components.map((c) => {
      if (c.id === compId) {
        return {
          ...c,
          properties: {
            ...c.properties,
            [key]: val
          }
        };
      }
      return c;
    });

    const updated: MockLayout = {
      ...layout,
      components: comps
    };
    handleUpdateLayout(updated);
  };

  // 2. Add New Page / Layout
  const handleCreateLayout = () => {
    if (!newLayoutName.trim()) return;
    const newL: MockLayout = {
      id: "layout-" + Date.now(),
      pageName: newLayoutName,
      taskGoal: newLayoutGoal || "Help citizens accomplish a single vector or housing management service.",
      components: [
        {
          id: "comp-h-" + Date.now(),
          type: "hero",
          title: "Karl CMS Hero Banner",
          description: "A standard header banner",
          properties: {
            heading: `SF Health services: ${newLayoutName}`,
            subheading: "Approved single-task layout built under strict WCAG and Karl guidelines.",
            buttonText: "Get Help",
            bgColor: "bg-indigo-900",
            textColor: "text-white"
          }
        }
      ],
      createdAt: new Date().toISOString().split("T")[0]
    };

    const nextList = [...layouts, newL];
    onUpdateLayouts(nextList);
    onSelectLayout(newL.id);
    setNewLayoutName("");
    setNewLayoutGoal("");

    if (user) {
      saveMockLayout(user.uid, newL);
    }
  };

  const handleDeleteLayout = async (id: string) => {
    if (layouts.length <= 1) return;
    const confirmed = window.confirm("Are you sure you want to delete this design layout blueprint?");
    if (!confirmed) return;

    const nextList = layouts.filter((l) => l.id !== id);
    onUpdateLayouts(nextList);
    onSelectLayout(nextList[0].id);

    if (user) {
      try {
        await deleteMockLayout(user.uid, id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // 3. Automated Git Push to Staging branch Simulator
  const handleGitDeploy = () => {
    setGitPushing(true);
    setGitSuccess(false);
    setGitLogs([
      "🔍 Initiating Karl CMS Automated Deploy pipeline...",
      "🛡️ Running WCAG 2.1 AA Pre-audit validation...",
      "✓ Font compliance checks passed: Space Grotesk used for Displays.",
      "✓ Touch target validation passed: All active component buttons > 44px.",
      "✓ Label mapping validated: Form labels match input elements.",
      "💾 Aligning layout contents against single-source-of-truth guidelines...",
      `📦 Compiling blueprints for "${layout.pageName}"...`,
      "⚡ Local git status: staging branch clean.",
      "🚀 Executing git actions:",
      "   git checkout staging",
      `   git add templates/karl-${layout.id}.json`,
      `   git commit -m "Deploy: Redesigned ${layout.pageName} and standard layout schemas"`,
      "   git push origin staging"
    ]);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      if (count === 1) {
        setGitLogs(p => [...p, "🌐 Resolving staging repository 'origin'...", "📡 Connected to deployment sandbox..."]);
      } else if (count === 2) {
        setGitLogs(p => [...p, "📤 Sending object chunks: 100% (4/4), done.", "🔄 Server running post-push rebuild script..."]);
      } else if (count === 3) {
        setGitLogs(p => [...p, "✨ SUCCESS: Staging branch deployed. Preview available in dev server sandbox.", "✓ Site content and manual guidelines aligned successfully."]);
        setGitSuccess(true);
        clearInterval(interval);
      }
    }, 1000);
  };

  // 4. Incident Map Placer
  const handleMapClick = (districtName: string) => {
    setSelectedNeighborhood(districtName);
  };

  const handlePlaceIncidentOnMap = () => {
    const coordinatesMap: Record<string, { lat: number, lng: number }> = {
      "Mission District": { lat: 37.76, lng: -122.42 },
      "Tenderloin": { lat: 37.783, lng: -122.415 },
      "South of Market (SOMA)": { lat: 37.775, lng: -122.41 },
      "Richmond District": { lat: 37.778, lng: -122.48 },
      "Sunset District": { lat: 37.75, lng: -122.49 },
      "Chinatown": { lat: 37.794, lng: -122.408 },
      "Bayview-Hunters Point": { lat: 37.725, lng: -122.385 },
      "Western Addition": { lat: 37.78, lng: -122.43 },
      "North Beach": { lat: 37.80, lng: -122.41 },
      "Excelsior": { lat: 37.72, lng: -122.43 }
    };

    const coords = coordinatesMap[selectedNeighborhood] || { lat: 37.75, lng: -122.42 };

    const newInc: SFIncident = {
      id: "inc-" + Date.now(),
      neighborhood: selectedNeighborhood,
      type: selectedVector,
      status: "Reported",
      lat: coords.lat + (Math.random() - 0.5) * 0.005, // Subtle variance so pins don't overlap exactly
      lng: coords.lng + (Math.random() - 0.5) * 0.005,
      date: new Date().toISOString().split("T")[0]
    };

    onAddIncident(newInc);
  };

  const handleSendToAudit = () => {
    // Generate text structure of layout components to audit
    let structText = `Page name: ${layout.pageName}\nTask Goal: ${layout.taskGoal}\nComponents structure:\n`;
    layout.components.forEach((c, index) => {
      structText += `\n[Component #${index + 1}] Type: ${c.type}\nTitle: ${c.title}\nDescription: ${c.description}\n`;
      Object.entries(c.properties).forEach(([k, v]) => {
        structText += `- ${k}: ${JSON.stringify(v)}\n`;
      });
    });
    onTriggerAudit(structText);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="mockup-canvas-container">
      {/* Sidebar: Page Blueprints Management */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm h-fit space-y-4 lg:col-span-1">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Layers className="h-4 w-4 text-blue-600" />
            Page Blueprints
          </span>
          <span className="text-[10px] bg-slate-100 px-2 py-0.5 text-slate-600 rounded-full font-mono">
            {layouts.length} templates
          </span>
        </div>

        {/* List of Layouts */}
        <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
          {layouts.map((l) => (
            <div
              key={l.id}
              className={`group flex items-center justify-between p-2.5 rounded-lg border transition text-xs cursor-pointer ${
                activeLayoutId === l.id
                  ? "bg-blue-50/70 border-blue-300 text-blue-950 font-medium"
                  : "bg-white border-slate-200 hover:bg-slate-50 text-slate-600"
              }`}
              onClick={() => onSelectLayout(l.id)}
            >
              <div className="truncate pr-2">
                <p className="truncate text-slate-900 font-semibold">{l.pageName}</p>
                <p className="text-[10px] text-slate-400 truncate italic mt-0.5">{l.taskGoal}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteLayout(l.id);
                }}
                disabled={layouts.length <= 1}
                className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition duration-150 p-1 rounded disabled:opacity-0"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Add New Layout Form */}
        <div className="pt-3 border-t border-slate-150 space-y-2.5">
          <p className="text-[10px] font-mono uppercase text-slate-400">Add Custom Site Template</p>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="e.g. Bed Bug Guide, Lead Inspector"
              value={newLayoutName}
              onChange={(e) => setNewLayoutName(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Single page task/goal..."
              value={newLayoutGoal}
              onChange={(e) => setNewLayoutGoal(e.target.value)}
              className="w-full bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleCreateLayout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Template Page
            </button>
          </div>
        </div>

        {/* Push to Staging Branch Simulator Card */}
        <div className="pt-4 border-t border-slate-150 space-y-3">
          <div className="flex items-center gap-1.5 text-xs text-blue-950 font-bold">
            <GitBranch className="h-4 w-4 text-emerald-600" />
            <span>Karl CMS Automated deploy</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-normal">
            Commit your layouts and templates and automatically push to the staging branch. Run pre-checks first!
          </p>
          <button
            onClick={handleGitDeploy}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
          >
            <GitBranch className="h-4 w-4" />
            Git Push to Staging Branch
          </button>
        </div>

        {gitPushing && (
          <div className="bg-slate-950 text-slate-200 font-mono text-[10px] p-3 rounded-lg space-y-1.5 max-h-[150px] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5 text-slate-400">
              <span>Terminal: git staging deploy</span>
              <span className={`h-2 w-2 rounded-full ${gitSuccess ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`}></span>
            </div>
            {gitLogs.map((log, i) => (
              <div key={i} className="leading-relaxed">{log}</div>
            ))}
          </div>
        )}
      </div>

      {/* Main Designer Canvas: Components Editing */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm lg:col-span-2 space-y-5">
        {/* Canvas Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-1.5">
              <Palette className="h-5 w-5 text-blue-600" />
              <h2 className="font-sans font-bold text-slate-900 text-lg tracking-tight">
                {layout.pageName} Layout Canvas
              </h2>
            </div>
            <p className="text-xs text-blue-900 font-medium bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md mt-1 leading-normal">
              <strong>Core Page Goal (One Clear Task)</strong>: {layout.taskGoal}
            </p>
          </div>
          
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleSendToAudit}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-sm"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              Analyze Accessibility & Specs
            </button>
          </div>
        </div>

        {/* Karl CMS Component Stack */}
        <div className="space-y-3.5 min-h-[180px]">
          {layout.components.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 space-y-2">
              <p className="text-xs">Your layout canvas is empty. Drag or insert Karl CMS components below.</p>
              <button 
                onClick={() => setAddingComp(true)}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                + Add First Component
              </button>
            </div>
          ) : (
            layout.components.map((comp, idx) => {
              const isEditing = editingCompId === comp.id;
              return (
                <div 
                  key={comp.id}
                  className={`border rounded-xl shadow-xs overflow-hidden transition ${
                    isEditing ? "border-blue-400 ring-2 ring-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  {/* Component Handle & Control Bar */}
                  <div className="bg-slate-50/80 px-3.5 py-2 border-b border-slate-150 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded uppercase font-semibold">
                        {comp.type}
                      </span>
                      <strong className="text-slate-800 font-medium">{comp.title}</strong>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Movement */}
                      <button 
                        disabled={idx === 0}
                        onClick={() => handleMoveComponent(idx, "up")}
                        className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </button>
                      <button 
                        disabled={idx === layout.components.length - 1}
                        onClick={() => handleMoveComponent(idx, "down")}
                        className="p-1 hover:bg-slate-200 text-slate-500 rounded disabled:opacity-30"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </button>
                      {/* Edit properties */}
                      <button 
                        onClick={() => setEditingCompId(isEditing ? null : comp.id)}
                        className={`px-2 py-1 rounded text-[10px] transition font-medium ${isEditing ? "bg-blue-600 text-white" : "bg-white border border-slate-250 text-slate-700 hover:bg-slate-100"}`}
                      >
                        {isEditing ? "Close Specs" : "Edit Specs"}
                      </button>
                      {/* Delete */}
                      <button 
                        onClick={() => handleDeleteComponent(comp.id)}
                        className="p-1 hover:bg-red-50 text-red-500 rounded transition"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Component Render Spec Preview */}
                  <div className="p-4 bg-slate-50/20">
                    {comp.type === "hero" && (
                      <div className={`p-5 rounded-lg ${comp.properties.bgColor || "bg-blue-600"} ${comp.properties.textColor || "text-white"} text-center space-y-2`}>
                        <h1 className="text-xl font-sans font-bold tracking-tight">{comp.properties.heading || "Title"}</h1>
                        <p className="text-xs opacity-90 max-w-md mx-auto leading-relaxed">{comp.properties.subheading || "Subheading description."}</p>
                        <button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition pointer-events-none mt-2">
                          {comp.properties.buttonText || "Button Action"}
                        </button>
                      </div>
                    )}

                    {comp.type === "search-bar" && (
                      <div className="border border-slate-200 p-4 rounded-lg bg-white flex flex-col gap-2.5">
                        <label className="text-xs font-semibold text-slate-800">Vector Service Lookup</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            disabled 
                            placeholder={comp.properties.placeholder || "Search services..."}
                            className="bg-slate-50 border border-slate-200 text-xs px-3 py-2 rounded-lg grow" 
                          />
                          <button className="bg-blue-600 text-white text-xs px-4 py-2 rounded-lg font-semibold pointer-events-none shrink-0">
                            {comp.properties.buttonText || "Search"}
                          </button>
                        </div>
                      </div>
                    )}

                    {comp.type === "services-grid" && (
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Standard Service Grid Cards</span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {(comp.properties.serviceTypes || []).map((t, i) => (
                            <div key={i} className="p-3 border border-slate-200 bg-white rounded-lg shadow-sm hover:border-blue-300 transition h-20 flex flex-col justify-between">
                              <span className="text-xs font-semibold text-slate-800">{t}</span>
                              <span className="text-[9px] text-blue-700 font-medium">Touch Area Checked</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {comp.type === "info-banner" && (
                      <div className={`p-3.5 rounded-lg border-l-4 border shadow-2xs ${comp.properties.bgColor || "bg-amber-50 border-amber-500"} ${comp.properties.textColor || "text-amber-950"} space-y-1`}>
                        <h4 className="text-xs font-bold flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {comp.properties.heading}
                        </h4>
                        <p className="text-[11px] leading-relaxed">{comp.properties.subheading}</p>
                      </div>
                    )}

                    {comp.type === "interactive-map" && (
                      <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-3">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{comp.properties.heading || "Incident Density map"}</h4>
                            <p className="text-[10px] text-slate-400">{comp.properties.subheading || "Active vectors"}</p>
                          </div>
                          <span className="text-[9px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded uppercase">Interactive SVG Stage</span>
                        </div>

                        {/* Interactive SF Map Simulator */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Left: Neighborhood List */}
                          <div className="col-span-1 space-y-1 max-h-[140px] overflow-y-auto pr-1 text-[11px]">
                            {SF_NEIGHBORHOODS.map((name) => (
                              <button
                                key={name}
                                onClick={() => handleMapClick(name)}
                                className={`w-full text-left px-2 py-1 rounded transition truncate ${
                                  selectedNeighborhood === name ? "bg-blue-50 text-blue-900 font-semibold" : "hover:bg-slate-100 text-slate-600"
                                }`}
                              >
                                {name}
                              </button>
                            ))}
                          </div>

                          {/* Center: Simplified visual SVG map representation of San Francisco */}
                          <div className="col-span-1 bg-blue-50/30 rounded-lg p-2 border border-slate-150 h-[140px] flex items-center justify-center relative overflow-hidden">
                            <Map className="h-10 w-10 text-blue-200 absolute" />
                            {/* Neighborhood nodes */}
                            <div className="absolute inset-0">
                              <div className="absolute top-4 left-6 h-3 w-3 rounded-full bg-slate-300 border border-slate-400 flex items-center justify-center cursor-pointer" title="Richmond" onClick={() => handleMapClick("Richmond District")}></div>
                              <div className="absolute top-10 left-12 h-3 w-3 rounded-full bg-slate-300 border border-slate-400 flex items-center justify-center cursor-pointer" title="Sunset" onClick={() => handleMapClick("Sunset District")}></div>
                              <div className="absolute top-2 right-12 h-3 w-3 rounded-full bg-slate-300 border border-slate-400 flex items-center justify-center cursor-pointer" title="Chinatown" onClick={() => handleMapClick("Chinatown")}></div>
                              <div className="absolute top-6 right-8 h-3 w-3 rounded-full bg-slate-300 border border-slate-400 flex items-center justify-center cursor-pointer" title="SOMA" onClick={() => handleMapClick("South of Market (SOMA)")}></div>
                              <div className="absolute top-6 right-16 h-3 w-3 rounded-full bg-slate-300 border border-slate-400 flex items-center justify-center cursor-pointer" title="Tenderloin" onClick={() => handleMapClick("Tenderloin")}></div>
                              <div className="absolute top-12 right-14 h-3 w-3 rounded-full bg-slate-300 border border-slate-400 flex items-center justify-center cursor-pointer" title="Mission" onClick={() => handleMapClick("Mission District")}></div>
                              <div className="absolute bottom-4 right-4 h-3 w-3 rounded-full bg-slate-300 border border-slate-400 flex items-center justify-center cursor-pointer" title="Bayview" onClick={() => handleMapClick("Bayview-Hunters Point")}></div>
                            </div>

                            {/* Red pins representation of reported vectors */}
                            {incidents.slice(0, 8).map((inc) => {
                              // Rough mapping coordinates
                              const nMap: Record<string, { t: string, l: string }> = {
                                "Mission District": { t: "top-[50%]", l: "left-[55%]" },
                                "Tenderloin": { t: "top-[25%]", l: "left-[45%]" },
                                "South of Market (SOMA)": { t: "top-[35%]", l: "left-[65%]" },
                                "Richmond District": { t: "top-[15%]", l: "left-[20%]" },
                                "Sunset District": { t: "top-[45%]", l: "left-[30%]" },
                                "Chinatown": { t: "top-[10%]", l: "left-[60%]" },
                                "Bayview-Hunters Point": { t: "top-[75%]", l: "left-[75%]" }
                              };
                              const pos = nMap[inc.neighborhood] || { t: "top-[50%]", l: "left-[50%]" };
                              return (
                                <div 
                                  key={inc.id} 
                                  className={`absolute ${pos.t} ${pos.l} h-2.5 w-2.5 rounded-full bg-red-600 border border-white animate-pulse shadow`}
                                  title={`${inc.neighborhood}: ${inc.type} (${inc.status})`}
                                ></div>
                              );
                            })}

                            <span className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-400">Interactive Map Preview</span>
                          </div>

                          {/* Right: Placer panel */}
                          <div className="col-span-1 border border-slate-100 rounded-lg p-2 bg-slate-50 space-y-2 text-[11px]">
                            <p className="font-semibold text-slate-700">Simulator Incident Placer</p>
                            <div>
                              <p className="text-[9px] text-slate-400 uppercase">Target District</p>
                              <strong className="text-blue-900 block truncate">{selectedNeighborhood}</strong>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              <div>
                                <p className="text-[9px] text-slate-400 uppercase">Vector type</p>
                                <select 
                                  value={selectedVector}
                                  onChange={(e: any) => setSelectedVector(e.target.value)}
                                  className="w-full text-[10px] bg-white border rounded px-1 py-0.5"
                                >
                                  <option value="Rodents">Rodents</option>
                                  <option value="Mosquitoes">Mosquitoes</option>
                                  <option value="Bed Bugs">Bed Bugs</option>
                                  <option value="Mold/Lead">Mold/Lead</option>
                                </select>
                              </div>
                              <button 
                                onClick={handlePlaceIncidentOnMap}
                                className="bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] px-1 font-bold mt-3 h-6"
                              >
                                Place Pin
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Recent Incidents status feed */}
                        <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[9px] font-mono text-slate-400">Recent:</span>
                          {incidents.slice(0, 3).map((inc) => (
                            <span key={inc.id} className="text-[9px] bg-red-50 border border-red-200 text-red-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <MapPin className="h-2 w-2 text-red-600" />
                              {inc.neighborhood}: {inc.type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {comp.type === "complaint-form" && (
                      <div className="border border-slate-200 bg-white rounded-lg p-4 space-y-3">
                        <h4 className="text-xs font-bold text-slate-800 border-b pb-1.5">{comp.properties.heading || "Form Heading"}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(comp.properties.fields || []).map((field, i) => (
                            <div key={i} className="flex flex-col gap-1 text-xs">
                              <label className="font-semibold text-slate-700 flex items-center gap-0.5">
                                {field.label}
                                {field.required && <span className="text-red-600">*</span>}
                              </label>
                              {field.type === "textarea" ? (
                                <textarea disabled className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-xs" rows={2} placeholder={`Enter ${field.label}...`} />
                              ) : (
                                <input disabled type="text" className="bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg text-xs" placeholder={`Enter ${field.label}...`} />
                              )}
                            </div>
                          ))}
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 px-4 rounded-lg transition pointer-events-none w-full">
                          Submit Report
                        </button>
                      </div>
                    )}

                    {comp.type === "faq-accordion" && (
                      <div className="border border-slate-200 bg-white rounded-lg p-4 space-y-2">
                        <h4 className="text-xs font-bold text-slate-800 mb-2">{comp.properties.heading || "FAQs"}</h4>
                        <div className="border-b border-slate-100 pb-2">
                          <p className="text-xs font-semibold text-slate-800 flex justify-between items-center cursor-pointer">
                            <span>Q: Who is responsible for bed bug treatment, tenant or owner?</span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400 rotate-90" />
                          </p>
                          <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                            In San Francisco, landlords are legally responsible for extermination and keeping the rental unit free from pests under Section 581 of the Health Code.
                          </p>
                        </div>
                        <div className="border-b border-slate-100 pb-1">
                          <p className="text-xs font-semibold text-slate-800 flex justify-between items-center cursor-pointer">
                            <span>Q: How do I report standing pool water?</span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Property Specifications Editor */}
                  {isEditing && (
                    <div className="p-4 bg-slate-900 text-slate-100 border-t border-blue-200/20 font-sans text-xs space-y-3">
                      <p className="font-mono text-[10px] text-blue-400 uppercase tracking-widest font-bold">
                        Karl CMS Component Specifications ({comp.type})
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {comp.type === "hero" && (
                          <>
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-400">Heading Text</label>
                              <input 
                                type="text" 
                                value={comp.properties.heading || ""} 
                                onChange={(e) => handleEditProperty(comp.id, "heading", e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2 rounded" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-400">Subheading Description</label>
                              <input 
                                type="text" 
                                value={comp.properties.subheading || ""} 
                                onChange={(e) => handleEditProperty(comp.id, "subheading", e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2 rounded" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-400">Button Text</label>
                              <input 
                                type="text" 
                                value={comp.properties.buttonText || ""} 
                                onChange={(e) => handleEditProperty(comp.id, "buttonText", e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2 rounded" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-400">Background Preset</label>
                              <select 
                                value={comp.properties.bgColor || "bg-blue-600"} 
                                onChange={(e) => handleEditProperty(comp.id, "bgColor", e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2 rounded"
                              >
                                <option value="bg-blue-600">Health Blue (#2563EB)</option>
                                <option value="bg-slate-900">Slate Charcoal (#0F172A)</option>
                                <option value="bg-emerald-950">City Sage Green (#022C22)</option>
                              </select>
                            </div>
                          </>
                        )}

                        {comp.type === "search-bar" && (
                          <>
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-400">Search Placeholder</label>
                              <input 
                                type="text" 
                                value={comp.properties.placeholder || ""} 
                                onChange={(e) => handleEditProperty(comp.id, "placeholder", e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2 rounded" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-400">Button Text</label>
                              <input 
                                type="text" 
                                value={comp.properties.buttonText || ""} 
                                onChange={(e) => handleEditProperty(comp.id, "buttonText", e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2 rounded" 
                              />
                            </div>
                          </>
                        )}

                        {comp.type === "info-banner" && (
                          <>
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-400">Banner Heading</label>
                              <input 
                                type="text" 
                                value={comp.properties.heading || ""} 
                                onChange={(e) => handleEditProperty(comp.id, "heading", e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2 rounded" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-400">Banner Alert Message</label>
                              <input 
                                type="text" 
                                value={comp.properties.subheading || ""} 
                                onChange={(e) => handleEditProperty(comp.id, "subheading", e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2 rounded" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-400">Alert Color Theme</label>
                              <select 
                                value={comp.properties.bgColor || "bg-amber-100 border-amber-500"} 
                                onChange={(e) => {
                                  const val = e.target.value;
                                  let txtColor = "text-amber-950";
                                  if (val.includes("red")) txtColor = "text-red-950";
                                  if (val.includes("blue")) txtColor = "text-blue-950";
                                  handleEditProperty(comp.id, "bgColor", val);
                                  handleEditProperty(comp.id, "textColor", txtColor);
                                }}
                                className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2 rounded"
                              >
                                <option value="bg-amber-50 border-amber-500 text-amber-950">Warning Amber Alert</option>
                                <option value="bg-red-50 border-red-600 text-red-950">Critical Red Alert</option>
                                <option value="bg-blue-50 border-blue-500 text-blue-950">General Blue Info</option>
                              </select>
                            </div>
                          </>
                        )}

                        {comp.type === "complaint-form" && (
                          <div className="space-y-1 col-span-2">
                            <label className="block text-[10px] text-slate-400">Form Title</label>
                            <input 
                              type="text" 
                              value={comp.properties.heading || ""} 
                              onChange={(e) => handleEditProperty(comp.id, "heading", e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2 rounded" 
                            />
                          </div>
                        )}

                        {comp.type === "interactive-map" && (
                          <>
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-400">Map Title</label>
                              <input 
                                type="text" 
                                value={comp.properties.heading || ""} 
                                onChange={(e) => handleEditProperty(comp.id, "heading", e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2 rounded" 
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="block text-[10px] text-slate-400">Map Subheading</label>
                              <input 
                                type="text" 
                                value={comp.properties.subheading || ""} 
                                onChange={(e) => handleEditProperty(comp.id, "subheading", e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 text-xs text-white p-2 rounded" 
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Components insertion selector drawer */}
        <div className="border border-slate-150 rounded-xl p-4 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">Add Standard Karl CMS Component Pattern</span>
            <span className="text-[10px] text-slate-400 italic">Guarantees brand alignment</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {PRESET_COMPONENTS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleAddComponent(p)}
                className="flex flex-col items-start text-left bg-white border border-slate-200 p-2.5 rounded-lg hover:border-blue-500 hover:ring-1 hover:ring-blue-50 hover:bg-blue-50/5 transition cursor-pointer"
              >
                <span className="text-xs font-semibold text-slate-800 truncate w-full">{p.title}</span>
                <span className="text-[9px] text-slate-400 leading-relaxed mt-1 line-clamp-2">{p.description}</span>
                <span className="text-[9px] text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded font-mono uppercase tracking-tight mt-2 self-start font-medium">
                  + Add Item
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
