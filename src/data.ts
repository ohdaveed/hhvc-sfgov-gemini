import { KarlComponent, MockLayout, BrandGuideline, SFIncident } from "./types";

export const SF_NEIGHBORHOODS = [
  "Mission District",
  "Tenderloin",
  "South of Market (SOMA)",
  "Richmond District",
  "Sunset District",
  "Chinatown",
  "Bayview-Hunters Point",
  "Western Addition",
  "North Beach",
  "Excelsior"
];

export const PRESET_COMPONENTS: KarlComponent[] = [
  {
    id: "comp-hero",
    type: "hero",
    title: "Karl CMS Hero Banner",
    description: "Visually striking header with large, clear text and primary action button.",
    properties: {
      heading: "Healthy Housing & Vector Control Services",
      subheading: "Helping San Francisco citizens report pests, mold, and housing code violations.",
      buttonText: "Report a Violation",
      bgColor: "bg-blue-600",
      textColor: "text-white"
    }
  },
  {
    id: "comp-search",
    type: "search-bar",
    title: "Vector Service Search",
    description: "Accessible search bar with autocomplete suggestions for species, regulations, and reports.",
    properties: {
      placeholder: "Search for services, vectors (e.g. rodents, mosquitoes), or rules...",
      buttonText: "Search",
      showFilters: true
    }
  },
  {
    id: "comp-services",
    type: "services-grid",
    title: "Karl Service Grid",
    description: "High-contrast card grid showcasing active services with touch targets above 44px.",
    properties: {
      serviceTypes: ["Rodent Abatement", "Mosquito Prevention", "Bed Bug Support", "Mold Inspections"]
    }
  },
  {
    id: "comp-map",
    type: "interactive-map",
    title: "Interactive Service Map",
    description: "SVG-based interactive map displaying neighborhood vector control incidents.",
    properties: {
      heading: "SF Health & Vector Incident Map",
      subheading: "Click on neighborhoods to inspect active cases or reported issues."
    }
  },
  {
    id: "comp-form",
    type: "complaint-form",
    title: "Incident / Complaint Form",
    description: "WCAG-compliant form with persistent labels and clean error state guidelines.",
    properties: {
      heading: "File a Vector Control Report",
      fields: [
        { name: "reporterName", type: "text", label: "Full Name", required: true },
        { name: "phone", type: "tel", label: "Contact Phone", required: true },
        { name: "location", type: "text", label: "Incident Address", required: true },
        { name: "vectorType", type: "select", label: "Vector Type (Rodent/Mosquito/Bedbug)", required: true },
        { name: "description", type: "textarea", label: "Detailed Description", required: false }
      ]
    }
  },
  {
    id: "comp-faq",
    type: "faq-accordion",
    title: "Accessible FAQ Accordion",
    description: "Keyboard navigable questions and answers on landlord/tenant responsibilities.",
    properties: {
      heading: "Frequently Asked Questions"
    }
  },
  {
    id: "comp-banner",
    type: "info-banner",
    title: "High-Contrast Info Banner",
    description: "Yellow or Red alerts for high-priority health advisories (e.g., standing water warnings).",
    properties: {
      heading: "Alert: Keep SF Mosquito-Free",
      subheading: "Empty standing water around your home immediately to prevent breeding.",
      bgColor: "bg-amber-100 border-l-4 border-amber-500",
      textColor: "text-amber-900"
    }
  },
  {
    id: "comp-image",
    type: "image-card",
    title: "Inspection Image Card",
    description: "AI-generated context-specific visual specimens for housing inspections, complete with compliance descriptions.",
    properties: {
      heading: "Inspection Specimen Image",
      subheading: "Generate high-contrast visual examples for inspectors or citizen manuals.",
      imageUrl: "",
      imagePrompt: "rodent-proof storage examples"
    }
  }
];

export const DEFAULT_MOCK_LAYOUTS: MockLayout[] = [
  {
    id: "layout-1",
    pageName: "Vector Control Homepage",
    taskGoal: "Provide citizens an instant overview of vector services, emergency notifications, and direct access to search.",
    components: [
      {
        id: "hero-1",
        type: "hero",
        title: "Karl CMS Hero Banner",
        description: "Primary entrance banner.",
        properties: {
          heading: "SF Environmental Health & Vector Control",
          subheading: "Dedicated to improving urban health, managing pests, and protecting households across San Francisco.",
          buttonText: "Report a Complaint",
          bgColor: "bg-slate-900",
          textColor: "text-slate-100"
        }
      },
      {
        id: "search-1",
        type: "search-bar",
        title: "Vector Service Search",
        description: "Home search widget.",
        properties: {
          placeholder: "Search for Bed Bugs, Rodents, Raccoons, or Standing Water guidelines...",
          buttonText: "Find Services"
        }
      },
      {
        id: "banner-1",
        type: "info-banner",
        title: "High-Contrast Info Banner",
        description: "Vector advisory alert.",
        properties: {
          heading: "West Nile Virus Prevention Advisory",
          subheading: "SF Department of Public Health is spraying stagnant pools in Bayview. Please report pooling water.",
          bgColor: "bg-red-50 border-l-4 border-red-600",
          textColor: "text-red-950"
        }
      },
      {
        id: "services-1",
        type: "services-grid",
        title: "Karl Service Grid",
        description: "Active services navigation grid.",
        properties: {
          serviceTypes: ["Rodent Control", "Mosquito Abatement", "Bed Bug Inspections", "Lead Safety", "Tenant Mold Inspections"]
        }
      }
    ],
    createdAt: "2026-07-02"
  },
  {
    id: "layout-2",
    pageName: "Report a Vector Incident",
    taskGoal: "Streamline the filing of rodent, pest, or mold complaints with step-by-step guidance and high-contrast fields.",
    components: [
      {
        id: "form-1",
        type: "complaint-form",
        title: "Incident / Complaint Form",
        description: "Form for filing complaints.",
        properties: {
          heading: "SF Healthy Housing Complaint Form",
          fields: [
            { name: "name", type: "text", label: "Full Name", required: true },
            { name: "address", type: "text", label: "Violation Address", required: true },
            { name: "vectorType", type: "select", label: "Type of Hazard (Bedbugs, Rodents, Standing Water, Mold)", required: true },
            { name: "details", type: "textarea", label: "Hazards details & owner contact", required: true }
          ]
        }
      }
    ],
    createdAt: "2026-07-02"
  },
  {
    id: "layout-3",
    pageName: "SF Vector Tracking Map",
    taskGoal: "Deliver interactive spatial visualization of current reported pests and dampness audits in SF neighborhoods.",
    components: [
      {
        id: "map-1",
        type: "interactive-map",
        title: "Interactive Service Map",
        description: "Incident heatmap.",
        properties: {
          heading: "SF Neighborhood Vector Density Map",
          subheading: "Interactive dashboard displaying reported insect and rodent abatements by ZIP Code."
        }
      }
    ],
    createdAt: "2026-07-02"
  }
];

export const DEFAULT_BRAND_GUIDELINES: BrandGuideline[] = [
  {
    id: "bg-typo",
    section: "Typography Stack",
    category: "typography",
    content: `## SF Healthy Housing & Vector Control Typography Stack

To maintain both digital readability and civic brand authority, we use a distinct, strict typography pairing on the **Karl CMS**.

### 1. Display Headers: **Space Grotesk**
*   **Aesthetic Intent**: High-tech, clean geometric curves, and strong structure.
*   **WCAG Requirement**: Minimum font-size for displays should be **24px** with a **tracking-tight** (\`tracking-tight\`) letter spacing and a dark high-contrast weight (\`font-medium\` or \`font-bold\`).
*   **Usage**: All page titles, primary bento cards, and landing hero modules.

### 2. Body Text: **Inter**
*   **Aesthetic Intent**: Premium readability, highly balanced x-heights, neutral sans-serif.
*   **WCAG Requirement**: Standard text must be **16px** (\`text-base\`) minimum for high-density reading. Line-height should be at least \`leading-relaxed\` (1.5) to ensure accessibility for visually impaired citizens.
*   **Usage**: Paragraphs, input labels, support links, list details.

### 3. Telemetry, Code, and System Alerts: **JetBrains Mono**
*   **Aesthetic Intent**: Civic utility, exactness, tabular numbers.
*   **WCAG Requirement**: Contrast of telemetry elements must remain 4.5:1 against status backgrounds.
*   **Usage**: ZIP codes, case numbers, alert timestamps, and Karl CMS component layout JSON specifications.`,
    updatedAt: "2026-07-02"
  },
  {
    id: "bg-colors",
    section: "Color Palette & Contrast",
    category: "colors",
    content: `## Civic High-Contrast Color Palette

All colors are chosen to strictly exceed **WCAG 2.1 AA Contrast Ratios (4.5:1 for normal text, 3:1 for large text)**.

### Primary Identity
*   **Health Blue (\`bg-blue-600\` / \`text-blue-900\`)**: #2563eb. Used for headers, primary action borders. Contrast ratio is **exceeds 4.5:1** on white.
*   **City Sage (\`bg-emerald-800\` / \`text-emerald-950\`)**: #064e3b. Used for active, resolved statuses. Safe green.

### Warning & Severity Alerts
*   **Alert Amber (\`bg-amber-100\`, border \`border-amber-500\`, text \`text-amber-950\`)**: Contrast is guaranteed. Never use pure yellow text on white.
*   **Critical Red (\`bg-red-50\`, border \`border-red-600\`, text \`text-red-950\`)**: Used for vector outbreak alerts (e.g., mosquito-breeding warnings).

### Canvas Base
*   **Aesthetic Intent**: Soft off-white (\`bg-slate-50\` or \`bg-stone-50\`) with deep charcoal text (\`text-slate-900\`) to reduce fatigue while ensuring absolute clarity.`,
    updatedAt: "2026-07-02"
  },
  {
    id: "bg-components",
    section: "Karl CMS Component Specs",
    category: "components",
    content: `## Reusable Component Layout Guidelines

In the Karl CMS, components are structural units. To ensure future scalability, follow these guidelines:

### Component Rules
1.  **Strict Touch Target**: Every link, button, select menu, or filter trigger must have a minimum clickable size of **44x44 pixels** on mobile screens (\`min-h-[44px]\` and \`min-w-[44px]\`).
2.  **Explicit Form Labels**: No floating placeholder-only inputs. All inputs must have a companion \`<label>\` tag with a clear \`htmlFor\` attribute matching the input \`id\`.
3.  **Keyboard Navigation**: Accordions and service grids must be focusable using standard Tab sequences (\`focus:ring-2 focus:ring-blue-500\`).
4.  **No Pure Color Indicators**: Never convey active vector outbreak levels using only Red/Yellow dots. Always pair visual colors with distinct text (e.g., "Critical Level" or "[Severe Alert]").`,
    updatedAt: "2026-07-02"
  },
  {
    id: "bg-blueprints",
    section: "Karl CMS Blueprint Templates",
    category: "components",
    content: `## Karl CMS Component & Page Blueprint Templates

This single-source-of-truth blueprint system provides structured templates for Karl CMS page content types and standard components, facilitating rapid layouts that guarantee brand alignment and manager approval.

---

### Part 1: Page Blueprint Templates (Standard Layout Trees)

To accelerate content creation, use the following standard component hierarchies for our primary civic tasks:

#### 1. Page Content Type: "Citizen Portal Home"
*   **Core Goal**: Educate citizens, publicize critical alerts, and route visitors to self-service portals.
*   **Component Structure Tree**:
    1.  **Hero Banner Component**: Defines high-level civic mission.
    2.  **Search Bar Component**: Allows direct query routing.
    3.  **Info Banner Component** (Optional): Displays active health advisories.
    4.  **Services Grid Component**: Provides clear 44px+ touch-targets for specific pest/housing hazards.
*   **Approval Guideline**: The page must contain exactly ONE primary call to action (CTA) in the hero banner.

#### 2. Page Content Type: "Incident Reporting & Map Portal"
*   **Core Goal**: Empower tenants and citizens to file compliant reports and view active localized abatements.
*   **Component Structure Tree**:
    1.  **Hero Banner Component**: Summarizes reporter rights and tenant protections.
    2.  **Interactive Map Module**: Renders vector/hazard densities across SF neighborhoods.
    3.  **Complaint Form Component**: Collects structured, accessible complaint data.
*   **Approval Guideline**: Form fields must include clear descriptive labels (\`htmlFor\`) to facilitate screen-readers.

#### 3. Page Content Type: "Dynamic Regulation & FAQ Hub"
*   **Core Goal**: Answer legal, pest, and landlord responsibilities dynamically.
*   **Component Structure Tree**:
    1.  **Hero Banner Component**: Standard simple title of regulations.
    2.  **Search Bar Component**: Filters regulations by pest keyword.
    3.  **FAQ Accordion Component**: Expandable legal sections (e.g., SF Health Code Section 581).
*   **Approval Guideline**: Accordions must be fully keyboard focusable using standard Tab sequences.

---

### Part 2: Component Blueprint Specs

Each component in the Karl CMS has strict, immutable properties to ensure visual and functional accessibility:

| Component Type | Permitted Properties | WCAG 2.1 AA Mandates | Brand Alignment Rules |
| :--- | :--- | :--- | :--- |
| **Hero Banner** | \`heading\`, \`subheading\`, \`buttonText\`, \`bgColor\`, \`textColor\` | Contrast >= 4.5:1 on headers | Use \`Space Grotesk\` font for headers, \`Inter\` for subheadings. |
| **Search Bar** | \`placeholder\`, \`buttonText\`, \`showFilters\` | Clear companion labels; Input must be focusable | Search button must use high-contrast \`Health Blue\` theme. |
| **Services Grid** | \`serviceTypes\` (list) | Touch target >= 44x44px; Focus ring visible | Cards must use soft grey margins with explicit labels. |
| **Interactive Map**| \`heading\`, \`subheading\` | No color-only information cues; Screen-reader alt-text | Pins must be paired with distinct status strings. |
| **Complaint Form** | \`heading\`, \`fields\` (label, required, type) | Explicit \`<label htmlFor="...">\`; Clear error boundaries | Require Phone and Address fields; buttons must align to grid. |
| **FAQ Accordion**  | \`heading\` | Fully keyboard navigable; Expanded states announced | Questions in bold \`Inter\`; answers separated by clear margins. |
| **Info Banner** | \`heading\`, \`subheading\`, \`bgColor\`, \`textColor\` | Alert Red contrast ratio is 19:1; Amber contrast is 7:1 | Restricted to standard SFDPH warning colors (Amber or Red). |

---

### Part 3: Manager Approval Checklist

Before submitting a mockup canvas to managers for official publishing:
1.  **Single Task Goal**: Does this layout focus on solving one distinct user task?
2.  **Contrast Audit**: Are all text elements validated at >= 4.5:1 (Normal) and >= 3:1 (Large)?
3.  **No Pure Color Cues**: Are critical alerts paired with descriptive text (e.g., "[Critical Outbreak Warning]")?
4.  **Touch Target Compliance**: Are all interactive elements styled with a minimum target of 44x44px?`,
    updatedAt: "2026-07-02"
  }
];

export const MOCK_INCIDENTS: SFIncident[] = [
  { id: "inc-1", neighborhood: "Mission District", type: "Rodents", status: "Reported", lat: 37.76, lng: -122.42, date: "2026-07-01" },
  { id: "inc-2", neighborhood: "Tenderloin", type: "Bed Bugs", status: "Under Investigation", lat: 37.783, lng: -122.415, date: "2026-06-30" },
  { id: "inc-3", neighborhood: "South of Market (SOMA)", type: "Garbage", status: "Abated", lat: 37.775, lng: -122.41, date: "2026-06-28" },
  { id: "inc-4", neighborhood: "Richmond District", type: "Mosquitoes", status: "Reported", lat: 37.778, lng: -122.48, date: "2026-07-02" },
  { id: "inc-5", neighborhood: "Sunset District", type: "Mold/Lead", status: "Under Investigation", lat: 37.75, lng: -122.49, date: "2026-06-25" },
  { id: "inc-6", neighborhood: "Bayview-Hunters Point", type: "Mosquitoes", status: "Reported", lat: 37.725, lng: -122.385, date: "2026-07-02" },
  { id: "inc-7", neighborhood: "Chinatown", type: "Rodents", status: "Abated", lat: 37.794, lng: -122.408, date: "2026-06-20" }
];
