# Security Specifications & Hardened TDD for Karl CMS

This document specifies the Data Invariants, the "Dirty Dozen" Exploit Payloads, and the verification rules to ensure zero-trust security in our Firestore instance.

## 1. Data Invariants

### A. MockLayout Invariants (`/users/{userId}/layouts/{layoutId}`)
- **Path Isolation**: Users can only read, create, update, or delete layouts inside their own sub-collection (where `{userId}` strictly equals `request.auth.uid`).
- **Identity Integrity**: No user can write a layout into another user's path, or masquerade as another editor.
- **Type Safety**:
  - `id` must be a valid alphanumeric string, maximum length of 128 characters, matching `^[a-zA-Z0-9_\-]+$`.
  - `pageName` must be a string between 1 and 200 characters.
  - `taskGoal` must be a string between 1 and 500 characters.
  - `components` must be a list (array) of objects, size must be less than or equal to 30 elements to prevent Denial of Wallet resource exhaustion.
- **Immutability**:
  - The `createdAt` timestamp/string must be immutable on update.
- **Outbreak/Critical Locking**: Any critical layout state is locked from unauthorized tampering.

### B. BrandGuideline Invariants (`/users/{userId}/guidelines/{guidelineId}`)
- **Path Isolation**: Users can only read, create, update, or delete guidelines under their own `{userId}` path.
- **Schema Safety**:
  - `id` must be valid alphanumeric string (`^[a-zA-Z0-9_\-]+$`), <= 128 characters.
  - `section` must be a string, <= 150 characters.
  - `category` must be strictly restricted to `["typography", "colors", "components", "accessibility", "tone"]`.
  - `content` must be a string, <= 5000 characters.
- **Immutability**:
  - Historical sections cannot be modified without updating `updatedAt`.

---

## 2. The "Dirty Dozen" Exploit Payloads

Here are 12 specific payloads attempting to violate our security rules. Each of these **must** be rejected by Firestore with `PERMISSION_DENIED`.

### Payload 1: ID Poisoning (Path Injection)
Attempting to create a document with a massive 100KB trash string as the document ID to cause storage exhaustion.
- **Target Path**: `/users/user_abc/layouts/` + `"A" * 10000`
- **Result**: `PERMISSION_DENIED` (Handled by `isValidId(layoutId)` size guard)

### Payload 2: Cross-User Read (Identity Spoofing)
User `attacker_123` attempts to fetch a private template layout owned by `victim_456`.
- **Target Path**: `/users/victim_456/layouts/layout_999`
- **Requester**: `request.auth.uid = "attacker_123"`
- **Result**: `PERMISSION_DENIED` (Strictly blocks non-owners)

### Payload 3: Cross-User Write (Identity Spoofing)
User `attacker_123` attempts to write/overwrite a layout into `victim_456`'s collection.
- **Target Path**: `/users/victim_456/layouts/layout_999`
- **Requester**: `request.auth.uid = "attacker_123"`
- **Result**: `PERMISSION_DENIED`

### Payload 4: Shadow Update Attack (Ghost Field Injection)
Attempting to insert a malicious privilege field (e.g., `isAdmin: true` or `role: "admin"`) into a layout document.
- **Payload**: `{ id: "layout_1", pageName: "My Page", taskGoal: "Report Bugs", components: [], createdAt: "2026-07-02T20:00:00Z", isAdmin: true }`
- **Result**: `PERMISSION_DENIED` (Rejected by strict `affectedKeys().hasOnly(...)` gate on update and exact size matching on create)

### Payload 5: Component Array Exhaustion (Denial of Wallet)
Attempting to post a layout containing an array of 5,000 components to blow up reading/parsing costs.
- **Payload**: `{ id: "layout_1", pageName: "Exploit", taskGoal: "Crash", components: [ { ... } ] * 5000, createdAt: "2026-07-02T20:00:00Z" }`
- **Result**: `PERMISSION_DENIED` (Rejected by size limits on array)

### Payload 6: Invalid Enum Value Injection
Attempting to write a brand guideline with an unapproved category (e.g. `category: "malicious_script"`).
- **Payload**: `{ id: "guide_1", section: "Typography", category: "malicious_script", content: "evil code", updatedAt: "2026-07-02T20:00:00Z" }`
- **Result**: `PERMISSION_DENIED` (Strictly rejected by `category in ["typography", "colors", "components", "accessibility", "tone"]` guard)

### Payload 7: Timestamp Fraud / Client Spoofing
Attempting to create a document with an arbitrary past or future date instead of the server time, or attempting to modify a frozen `createdAt` field on update.
- **Payload (Update)**: `{ id: "layout_1", pageName: "Mod", taskGoal: "Change", components: [], createdAt: "1990-01-01T00:00:00Z" }` (Modifying `createdAt`)
- **Result**: `PERMISSION_DENIED` (CreatedAt is immutable)

### Payload 8: Massive Size Payload (PII / Bloat Attack)
Attempting to post a brand guideline with a 10MB text string in the `content` field.
- **Payload**: `{ id: "guide_1", section: "Colors", category: "colors", content: "B" * 10000000, updatedAt: "2026-07-02T20:00:00Z" }`
- **Result**: `PERMISSION_DENIED` (Rejected by `content.size() <= 5000` constraint)

### Payload 9: Unauthenticated Read
An anonymous, unsigned-in browser user tries to crawl the `layouts` of user `user_abc`.
- **Target Path**: `/users/user_abc/layouts/layout_1`
- **Requester**: `request.auth = null`
- **Result**: `PERMISSION_DENIED` (Mandates `request.auth != null`)

### Payload 10: Unverified Email Writer
An authenticated user who has NOT verified their email addresses tries to write into their layout space.
- **Requester**: `request.auth.token.email_verified = false`
- **Result**: `PERMISSION_DENIED` (Mandates `request.auth.token.email_verified == true`)

### Payload 11: Empty/Null Primary Fields (Update Gap)
An update payload that deletes key structural properties by passing them as null, leaving orphaned states.
- **Payload**: `{ id: "layout_1", pageName: null, taskGoal: "Report Bugs", components: [] }`
- **Result**: `PERMISSION_DENIED` (Rejected by `isValidLayout` schema validation helper)

### Payload 12: Invalid Key Structure (Missing ID)
Creating a layout document where the `id` field inside the object doesn't match the actual document path ID.
- **Result**: `PERMISSION_DENIED` (Enforced by `incoming().id == layoutId`)

---

## 3. Test Suite Outline

The `DRAFT_firestore.rules` and final `firestore.rules` will be verified against these Dirty Dozen specifications to ensure full zero-trust, attribute-based access control.
