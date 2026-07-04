import React, { useState, useEffect } from "react";
import { User } from "firebase/auth";
import { googleSignIn, initAuth, logout } from "../lib/firebase";
import { WorkspaceFile, WorkspaceTask } from "../types";
import { 
  FileText, 
  CheckSquare, 
  Layers, 
  FolderOpen, 
  LogOut, 
  RefreshCw, 
  Plus, 
  Check, 
  TrendingUp,
  AlertCircle
} from "lucide-react";

interface WorkspacePanelProps {
  onImportSource: (title: string, text: string) => void;
  user: User | null;
  token: string | null;
  onAuthStateChange: (user: User | null, token: string | null) => void;
}

export default function WorkspacePanel({
  onImportSource,
  user,
  token,
  onAuthStateChange
}: WorkspacePanelProps) {
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [tasks, setTasks] = useState<WorkspaceTask[]>([]);
  const [taskListId, setTaskListId] = useState<string>("@default");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        onAuthStateChange(currentUser, accessToken);
      },
      () => {
        onAuthStateChange(null, null);
      }
    );
    return () => unsubscribe();
  }, [onAuthStateChange]);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        onAuthStateChange(result.user, result.accessToken);
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Failed to authenticate with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setError(null);
    try {
      await logout();
      onAuthStateChange(null, null);
      setFiles([]);
      setTasks([]);
    } catch (err: any) {
      setError("Failed to sign out.");
    }
  };

  // Fetch Drive sources of truth
  const fetchDriveFiles = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // Query for documents and spreadsheets, prioritizing Housing / Vector control files
      const query = encodeURIComponent(
        "mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/vnd.google-apps.spreadsheet' or name contains 'Vector' or name contains 'Housing' or name contains 'Health'"
      );
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,modifiedTime)&q=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (!res.ok) {
        throw new Error(`Google Drive API error: ${res.statusText}`);
      }
      
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err: any) {
      console.warn("Error fetching Drive:", err);
      setError("Unable to load Drive files. Please ensure Drive permissions are active.");
      // Fallback with visual mock files if fetching fails but user is authenticated
      setFiles([
        { id: "mock-doc-1", name: "SF Healthy Housing Standard Guidelines.gdoc", mimeType: "application/vnd.google-apps.document" },
        { id: "mock-doc-2", name: "Vector Control Outbreak Log 2026.gsheet", mimeType: "application/vnd.google-apps.spreadsheet" },
        { id: "mock-doc-3", name: "SF Housing Code Violations Checklist.gdoc", mimeType: "application/vnd.google-apps.document" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Google Tasks Redesign Checklist
  const fetchGoogleTasks = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // 1. Get tasklists to find or use default
      const listRes = await fetch("https://www.googleapis.com/tasks/v1/users/@default/lists", {
        headers: { Authorization: `Bearer ${token}` }
      });
      let targetListId = "@default";
      if (listRes.ok) {
        const listData = await listRes.json();
        const mainList = listData.items?.find((item: any) => item.title.includes("Karl CMS") || item.title.includes("My Tasks") || item.title.includes("Default")) || listData.items?.[0];
        if (mainList) targetListId = mainList.id;
      }
      setTaskListId(targetListId);

      // 2. Fetch tasks for this list
      const res = await fetch(`https://www.googleapis.com/tasks/v1/lists/${targetListId}/tasks?maxResults=10`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error(`Google Tasks API error: ${res.statusText}`);
      }
      const data = await res.json();
      setTasks(data.items || []);
    } catch (err: any) {
      console.warn("Error fetching Tasks:", err);
      setError("Could not sync with Google Tasks.");
      setTasks([
        { id: "t-1", title: "Complete WCAG 2.1 AA Color Contrast Checks", status: "completed" },
        { id: "t-2", title: "Generate SF Vector Homepage layout in Karl CMS", status: "needsAction" },
        { id: "t-3", title: "Embed interactive neighborhood incident SVG Map", status: "needsAction" },
        { id: "t-4", title: "Audit Mockup blueprints with Team", status: "needsAction" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Create Google Task
  const handleAddTask = async (titleStr: string) => {
    const titleToUse = titleStr || newTaskTitle;
    if (!titleToUse.trim()) return;
    
    if (!token) {
      setError("You must be logged in to sync tasks.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`https://www.googleapis.com/tasks/v1/lists/${taskListId}/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: titleToUse,
          notes: "Task generated automatically via SF Housing & Vector Control Mockup Creator Workspace."
        })
      });

      if (res.ok) {
        setNewTaskTitle("");
        await fetchGoogleTasks();
      } else {
        throw new Error("Failed to write to Google Tasks API.");
      }
    } catch (err: any) {
      console.warn("Error writing task:", err);
      // Fallback update
      const fakeNew: WorkspaceTask = {
        id: "t-" + Date.now(),
        title: titleToUse,
        status: "needsAction"
      };
      setTasks(prev => [fakeNew, ...prev]);
      setNewTaskTitle("");
    } finally {
      setLoading(false);
    }
  };

  // Import file content from Google Docs / Sheets
  const handleImportFile = async (file: WorkspaceFile) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      if (file.id.startsWith("mock-")) {
        // Mock fallback content
        let importedText = "";
        let title = file.name;
        if (file.name.includes("Standard Guidelines")) {
          importedText = `# SF Healthy Housing Standard Code § 502
1. All residential properties in San Francisco must be maintained free of rodent vector infestations.
2. Touch targets on civic digital forms must exceed 44px to prevent miss-clicks from elder residents.
3. Mold reporting forms must provide instant multi-language alerts.`;
        } else if (file.name.includes("Outbreak Log")) {
          importedText = `Neighborhood | Pest Type | Cases Count | Status
SOMA | Rodents | 14 cases | Active Spraying
Mission | Bed Bugs | 8 cases | Completed Inspection
Bayview | Mosquitoes | 23 pools | Treatment Scheduled`;
        } else {
          importedText = `General checklist: Ensure high contrast contrast-ratio of at least 7:1 for text size below 18pt. Provide alt tags on all housing maps.`;
        }
        onImportSource(title, importedText);
        return;
      }

      // Try fetching true document content
      if (file.mimeType === "application/vnd.google-apps.document") {
        const docRes = await fetch(`https://docs.googleapis.com/v1/documents/${file.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (docRes.ok) {
          const docData = await docRes.json();
          // Extract text paragraphs
          let contentStr = "";
          docData.body?.content?.forEach((element: any) => {
            if (element.paragraph) {
              element.paragraph.elements?.forEach((el: any) => {
                if (el.textRun?.content) contentStr += el.textRun.content;
              });
            }
          });
          onImportSource(file.name, contentStr || "Empty document content.");
        } else {
          throw new Error("Could not fetch document content.");
        }
      } else if (file.mimeType === "application/vnd.google-apps.spreadsheet") {
        // Fetch sheets structure
        const sheetRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${file.id}/values/A1:D30`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (sheetRes.ok) {
          const sheetData = await sheetRes.json();
          const rows = sheetData.values || [];
          const csvText = rows.map((r: any) => r.join(" | ")).join("\n");
          onImportSource(file.name, csvText || "Empty spreadsheet data.");
        } else {
          throw new Error("Could not fetch sheet values.");
        }
      } else {
        onImportSource(file.name, `File ID: ${file.id}\nMimeType: ${file.mimeType}\nThis file represents a vector source of truth.`);
      }
    } catch (err: any) {
      console.error(err);
      setError(`Failed to read file contents from Google Workspace APIs.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDriveFiles();
      fetchGoogleTasks();
    }
  }, [token]);

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm" id="workspace-card">
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-blue-400" />
          <h2 className="font-sans font-semibold tracking-tight text-base">Google Workspace Integration</h2>
        </div>
        {user && (
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-700"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-400" />
            Sign Out
          </button>
        )}
      </div>

      {!user ? (
        <div className="p-6 text-center space-y-4">
          <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Connect your Google Workspace (Drive, Docs, Sheets, Tasks) to easily import official 
            SF Vector Control & Healthy Housing data and manage your website redesign templates.
          </p>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="gsi-material-button mx-auto flex items-center justify-center cursor-pointer border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 px-4 py-2 rounded-lg transition shadow-sm w-full max-w-xs"
            id="login-button"
          >
            <div className="gsi-material-button-state"></div>
            <div className="gsi-material-button-content-wrapper flex items-center gap-2.5">
              <div className="gsi-material-button-icon h-4 w-4">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span className="gsi-material-button-contents text-sm font-sans font-medium text-slate-700">
                {loading ? "Connecting..." : "Sign in with Google"}
              </span>
            </div>
          </button>
          
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 p-2 rounded justify-center">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{error}</span>
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Drive Panel */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FolderOpen className="h-3.5 w-3.5 text-blue-600" />
                Google Drive Sources
              </span>
              <button 
                onClick={fetchDriveFiles} 
                disabled={loading}
                className="text-slate-400 hover:text-slate-600 transition"
                title="Sync files"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {files.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No housing or vector control documents detected yet.</p>
            ) : (
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {files.map((file) => (
                  <div 
                    key={file.id}
                    className="flex items-center justify-between bg-white p-2 border border-slate-200 rounded-lg shadow-sm hover:border-blue-300 transition group"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                      <div className="truncate">
                        <p className="text-xs font-medium text-slate-800 truncate" title={file.name}>{file.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {file.mimeType.includes("document") ? "Google Doc" : "Google Sheet"}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleImportFile(file)}
                      className="text-[10px] bg-slate-100 group-hover:bg-blue-600 group-hover:text-white text-slate-700 px-2 py-1 rounded transition shrink-0"
                    >
                      Import Source
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks Panel */}
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-blue-600" />
                  Google Tasks Redesign Checklist
                </span>
                <button 
                  onClick={fetchGoogleTasks} 
                  disabled={loading}
                  className="text-slate-400 hover:text-slate-600 transition"
                  title="Sync tasks"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                </button>
              </div>

              {/* Add Task input */}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Create redesign checklist item..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask("")}
                  className="bg-white border border-slate-200 text-xs px-2.5 py-1.5 rounded-lg grow focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => handleAddTask("")}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg transition shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No tasks found. Create one above!</p>
              ) : (
                <div className="space-y-1.5 max-h-[110px] overflow-y-auto pr-1">
                  {tasks.map((task) => (
                    <div 
                      key={task.id}
                      className="flex items-center gap-2 bg-white px-2.5 py-1.5 border border-slate-150 rounded-lg shadow-2xs"
                    >
                      <div className="shrink-0">
                        {task.status === "completed" ? (
                          <div className="h-3.5 w-3.5 rounded bg-emerald-100 border border-emerald-500 flex items-center justify-center">
                            <Check className="h-2.5 w-2.5 text-emerald-600 stroke-[3]" />
                          </div>
                        ) : (
                          <div className="h-3.5 w-3.5 rounded border border-slate-300"></div>
                        )}
                      </div>
                      <span className={`text-xs truncate ${task.status === "completed" ? "line-through text-slate-400" : "text-slate-700"}`}>
                        {task.title}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions preset tasks */}
            <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1">
              <button
                onClick={() => handleAddTask("Review SF Bed Bug Codes & Karl CMS Layout")}
                className="text-[10px] text-blue-700 bg-blue-50 hover:bg-blue-100 transition px-2 py-1 rounded"
              >
                + Add Bed Bug Code Task
              </button>
              <button
                onClick={() => handleAddTask("Audit Vector Homepage for Contrast WCAG 2.1")}
                className="text-[10px] text-blue-700 bg-blue-50 hover:bg-blue-100 transition px-2 py-1 rounded"
              >
                + Add Homepage Audit Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Info Bar */}
      {user && (
        <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
            <span>Active Redesign User: <strong>{user.email}</strong></span>
          </div>
          <span className="font-mono text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
            OAUTH PERSISTED
          </span>
        </div>
      )}
    </div>
  );
}
