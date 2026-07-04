export interface KarlComponent {
  id: string;
  type: "hero" | "services-grid" | "interactive-map" | "search-bar" | "complaint-form" | "info-banner" | "faq-accordion" | "image-card";
  title: string;
  description: string;
  properties: {
    heading?: string;
    subheading?: string;
    placeholder?: string;
    buttonText?: string;
    bgColor?: string;
    textColor?: string;
    showFilters?: boolean;
    showSearch?: boolean;
    serviceTypes?: string[];
    fields?: { name: string; type: string; label: string; required: boolean }[];
    imageUrl?: string;
    imagePrompt?: string;
  };
}

export interface MockLayout {
  id: string;
  pageName: string;
  taskGoal: string; // One clear task per page requirement
  components: KarlComponent[];
  createdAt: string;
}

export interface BrandGuideline {
  id: string;
  section: string;
  category: "typography" | "colors" | "components" | "accessibility" | "tone";
  content: string;
  updatedAt: string;
}

export interface SFIncident {
  id: string;
  neighborhood: string;
  type: "Rodents" | "Mosquitoes" | "Bed Bugs" | "Mold/Lead" | "Garbage";
  status: "Reported" | "Under Investigation" | "Abated";
  lat: number;
  lng: number;
  date: string;
}

export interface WorkspaceFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
}

export interface WorkspaceTask {
  id: string;
  title: string;
  notes?: string;
  status: "needsAction" | "completed";
  due?: string;
}
