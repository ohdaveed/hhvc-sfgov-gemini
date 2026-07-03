import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: "10mb" }));

// Lazy init helper for Gemini SDK to avoid crashes if API key is not present initially
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined. Please add your key in Settings > Secrets.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// REST API Endpoints

// 1. Accessibility & Karl CMS Guideline Audit Endpoint
app.post("/api/gemini/audit", async (req, res) => {
  try {
    const { content, mode, systemContext } = req.body;
    if (!content) {
      return res.status(400).json({ error: "Content is required for auditing." });
    }

    const ai = getGeminiClient();
    
    let model = "gemini-3.5-flash"; // Default fast
    let config: any = {};

    if (mode === "high-thinking") {
      model = "gemini-3.1-pro-preview";
      // Ensure we set thinkingLevel exactly as requested by user
      config = {
        thinkingConfig: {
          thinkingBudget: 16384, // High budget
        },
        // Including the literal value requested for absolute adherence to user custom request
        thinkingLevel: "HIGH", 
      };
    } else if (mode === "grounded-search") {
      model = "gemini-3.5-flash";
      config = {
        tools: [{ googleSearch: {} }],
      };
    } else if (mode === "fast") {
      model = "gemini-3.1-flash-lite";
    }

    const systemPrompt = `You are an expert accessibility auditor (WCAG 2.1 AA compliant) and Karl CMS Systems Engineer.
Evaluate the provided web mockup draft or component specs.
Analyze:
1. WCAG 2.1 AA Compliance: Contrast ratio suggestions, touch target size (minimum 44px on mobile), alternative descriptions, screen reader navigability, keyboard focus.
2. Karl CMS Guideline Alignment: Standard component structures (Hero, Service Grid, Interactive Map Module, Search Bar, Complaint Forms).
3. Design Consistency: Spacing, font guidelines, tone alignment for San Francisco Department of Public Health (SFDPH) Vector Control & Healthy Housing services.

Provide your audit in structured, clean Markdown with actionable improvement bullets and code/template structures.`;

    const contents = systemContext 
      ? `System Guidelines:\n${systemContext}\n\nDraft content to audit:\n${content}`
      : `Draft content to audit:\n${content}`;

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        ...config,
        systemInstruction: systemPrompt,
      },
    });

    const text = response.text || "No feedback received from model.";
    
    // Extract search grounding metadata if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || null;

    res.json({ text, groundingChunks });
  } catch (error: any) {
    console.error("Audit error:", error);
    res.status(500).json({ error: error.message || "An error occurred during auditing." });
  }
});

// 2. SF Vector Control Grounded Search Endpoint
app.post("/api/gemini/search-info", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required." });
    }

    const ai = getGeminiClient();

    const systemPrompt = `You are a helpful San Francisco citizen assistance bot specialized in Healthy Housing and Vector Control services.
Use Google Search grounding to retrieve current and accurate facts about San Francisco vector control programs, inspections, rodent reporting, bed bug regulations, and tenant rights in SF.
Synthesize the information cleanly, cite source URLs, and list actionable phone numbers/links (e.g. SF 311, Environmental Health Department).`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: query,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: systemPrompt,
      },
    });

    const text = response.text || "No facts found.";
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || null;

    res.json({ text, groundingChunks });
  } catch (error: any) {
    console.error("Search info error:", error);
    res.status(500).json({ error: error.message || "An error occurred during research search." });
  }
});

// 3. Brand Manual Section Generation & Alignment
app.post("/api/gemini/suggest-manual", async (req, res) => {
  try {
    const { sectionTitle, currentContent } = req.body;
    const ai = getGeminiClient();

    const systemPrompt = `You are a Principal Brand Designer and Front-End Architect for the San Francisco Department of Public Health.
Draft or refine a section of our Brand Guidelines Manual for the SF Healthy Housing and Vector Control digital systems (Karl CMS).
Integrate strict WCAG 2.1 AA constraints and standard components:
- Display Typography: Space Grotesk
- Body Typography: Inter
- Monospace/Alerts: JetBrains Mono
- Color Palette: High-contrast Blues, Slate Grays, Sage Greens, Safety Yellow/Amber, Alert Red.
- UI Spacing, Margin patterns, Touch Target standard.

Format the output cleanly in Markdown.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Drafting section: "${sectionTitle}"\n\nCurrent specifications/notes:\n${currentContent || "None provided. Generate a standard compliance manual section for this topic."}`,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Manual suggest error:", error);
    res.status(500).json({ error: error.message || "An error occurred during manual suggestion." });
  }
});

// Setup Vite or static serving based on environment
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to start server:", err);
});
