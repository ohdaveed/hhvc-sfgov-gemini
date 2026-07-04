export interface RuleSection {
  id: string;
  title: string;
  category: "tenant" | "owner" | "pco" | "general" | "appendix";
  content: string;
}

export const SF_RULES_REGULATIONS: RuleSection[] = [
  {
    id: "rules-intro",
    title: "Introduction & Authority",
    category: "general",
    content: `# Director’s Rules and Regulations

**San Francisco Department of Public Health • Environmental Health Branch**

Pursuant to Article 11, Sections 581–596 of the San Francisco Health Code. 
*Version 3.0 • Revised 2025*

These Rules and Regulations establish uniform requirements for the prevention and control of rodents and other vectors in the City and County of San Francisco. The purpose is to protect public health, prevent the spread of disease, and promote healthy, safe housing.`
  },
  {
    id: "rules-sec-4",
    title: "Section IV: Responsibilities of Tenants",
    category: "tenant",
    content: `## Section IV — Responsibilities of Tenants

To maintain healthy, vector-free housing, tenants are legally required to comply with the following preventive measures:

### 1. Proper Waste Disposal
*   All food waste, organic materials, and garbage must be deposited inside tight-fitting, rodent-resistant refuse containers.
*   **DO NOT** leave food waste or open trash bags on balconies, fire escapes, in hallways, or lightwells.

### 2. Food Storage Rules
*   All stored dry foods, grain-based pet foods, and seeds must be sealed inside sturdy plastic, glass, or metal containers with tight-fitting lids.
*   Pet food bowls must not be left outdoors overnight. Empty any excess water or uneaten pet food immediately after feeding.

### 3. Immediate Reporting
*   Tenants must notify the landlord or property manager in writing within **24 hours** of discovering any signs of rodent activity (e.g., droppings, gnaw marks, or physical sightings).`
  },
  {
    id: "rules-sec-5",
    title: "Section V: Responsibilities of Owners and Managers",
    category: "owner",
    content: `## Section V — Responsibilities of Owners and Managers

Property owners and managers are held strictly accountable for maintaining the structural integrity and sanitation of their premises:

### 1. Vector Proofing (Exclusion)
*   All building exteriors must be maintained free from openings greater than **1/4 inch** to prevent rodent entry.
*   Install durable metal mesh (minimum 19-gauge galvanized wire cloth) over foundation vents, lightwells, and sewer vent lines.
*   Ensure all doors leading to the exterior have weather-stripping or sweeps that leave a gap of less than **1/4 inch** at the threshold.

### 2. Garbage Facilities
*   Owners must provide an adequate number of rodent-resistant garbage, recycling, and compost bins equipped with tight-fitting lids.
*   Bin storage areas must be maintained in a clean, sanitary condition, with concrete floors washed regularly to remove food residue.

### 3. Rapid Remediation Response
*   Upon receiving written or verbal notification of pest activity, the owner must initiate professional abatement within **48 hours** using a licensed Pest Control Operator (PCO).`
  },
  {
    id: "rules-sec-6",
    title: "Section VI: Licensed Pest Control Operator (PCO) Mandates",
    category: "pco",
    content: `## Section VI — Licensed Pest Control Operator (PCO) Mandates

Professional vector eradication must be conducted under strict safety and compliance parameters:

### 1. Integrated Pest Management (IPM)
*   PCOs must prioritize non-chemical, structural, and mechanical exclusions (e.g., caulking, sealing, snap traps) over chemical rodenticides.
*   Outdoor bait stations must be securely locked, tamper-resistant, anchored to the ground or wall, and clearly labeled with the operator's contact details and toxicant info.

### 2. Written Eradication Log
*   All abatement efforts must be fully documented in an ongoing log.
*   The log must record: inspection dates, specific species identified, precise locations of traps/bait, chemical ingredients used, and structural gaps sealed.`
  },
  {
    id: "rules-sec-7",
    title: "Section VII: Vector Prevention and Abatement",
    category: "general",
    content: `## Section VII — Vector Prevention and Abatement

General rules for control of standing water, insects, and other biological threats:

### 1. Standing Water Elimination
*   Standing water pooling on roofs, in gutters, lightwells, or plant saucers must be drained within **48 hours** to prevent mosquito breeding.
*   Stagnant swimming pools and decorative ponds must be maintained with continuous biological filtration or treated with approved larvicides (e.g., Bti).

### 2. Dense Vegetation & Harborages
*   Ivy, thick groundcover, and untrimmed shrubbery must be cleared back at least **18 inches** from building foundations to eliminate rodent nesting sites and concealment pathways.`
  },
  {
    id: "rules-sec-9",
    title: "Section IX: Signs of Rodent Activity",
    category: "tenant",
    content: `## Section IX — Signs of Rodent Activity

Inspectors, landlords, and tenants should check for these diagnostic symptoms of active infestations:

### Primary Signs
*   **Fecal Droppings**: Fresh droppings are soft, dark, and shiny, whereas old droppings are dry, dull, and greyish.
*   **Gnaw Marks**: Fresh gnawing on wood or plastic is clean and light-colored.
*   **Rub Marks**: Dark grease smears left by rodent fur along baseboards, pipes, and wall crossings.
*   **Burrows**: Freshly excavated dirt entryways near foundations, fences, or woodpiles.`
  },
  {
    id: "rules-appendix-a",
    title: "Appendix A: Relevant Contacts & SF 311 Services",
    category: "appendix",
    content: `## Appendix A — Relevant Contacts & SF 311 Services

To file a formal report or seek assistance regarding healthy housing violations:

*   **San Francisco 311**: Dial **311** (or visit SF311.org) to file an Environmental Health complaint immediately.
*   **SF Environmental Health Branch**: 49 South Van Ness Avenue, Suite 600, San Francisco, CA 94103. Phone: **415-252-3800**.
*   **Tenant Rights Counseling**: Contact the San Francisco Tenants Union or Housing Rights Committee for free mediation resources.`
  }
];
