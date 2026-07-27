# TimeToMeal UI/UX Design System & Color Specifications

This document outlines the visual identity, complete styling specs, typography pairing, and dashboard component anatomy of the **TimeToMeal** Campus Cafeteria Pre-ordering System. It is designed to ensure strict cohesive branding across the Student, Staff, and Admin portals.

---

## 🎨 Core Design Concept & Palette

The design prioritizes high contrast, generous whitespace, and premium custom roundings (`rounded-[3rem]`) over generic web card borders. It uses an **Emerald Mint & Deep Graphite** theme to project clean organic food combined with robust modern enterprise authority.

### 1. Main Palette Colors (Tailwind Reference)

| Role | Color Name | HEX Code | Tailwind Equivalent | Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **Accent Primary** | Emerald Mint | `#059669` | `bg-emerald-600` | CTA buttons, active state highlights, primary logos |
| **Accent Soft** | Mint Glow | `#ECFDF5` | `bg-emerald-50` | Highlight cards, successful item add feedback |
| **Dark Base** | Slate Graphite | `#0F172A` | `bg-slate-900` / `bg-gray-950` | Primary display badges, buttons, master console header |
| **Subtle Light** | Off-White Pearl | `#F8FAF9` | `bg-gray-50/50` | Background of all dashboards, subtle page body fill |
| **Highlight Yellow**| Golden Honey | `#FACC15` | `bg-yellow-400` | Stars ratings, slide to checkout handle button |
| **Status Alert** | Amber Warning | `#F59E0B` | `bg-amber-500` | Order "Pending" / "Preparing" state labels |
| **Status Danger** | Crimson Red | `#EF4444` | `bg-red-500` | Item "Deleted", "Cancelled" tickets, logout warnings |

---

## 📐 Layout Geometry & Spacing Rules

1. **Card Rounding**: Cards **MUST** use custom extreme borders: `rounded-[2.5rem]` or `rounded-[3rem]`. Inputs and sub-buttons utilize `rounded-2xl` or `rounded-xl`.
2. **Interactive Motion**: Standard buttons must have small active scaling feedback (`active:scale-95`) and soft hover state changes (`transition-all duration-300`).
3. **Responsive Spacing**: Section paddings are varied to prevent robotic symmetry:
   - Outer container margins: `px-6 md:px-10`
   - Row dividers: `space-y-6 md:space-y-10`
   - Sub-card padding: `p-6` on mobile scale, `p-8` on wide desktop screens.

---

## 🖥️ Dashboard Components Anatomy

### 1. Student Pre-ordering Portal (`StudentView`)
Designed as a sleek mobile-first experience, keeping the main controls easily thumb-accessible:
*   **Header Module**: Displays user initials in an emerald bubble paired with an welcome greeting, dynamic profile completion tag, and a shopping cart button with standard spring bounce notification.
*   **Hero Display Card**: A deep emerald card with golden badge highlighting benefits: *"Preorder Meals, Bypass the Queue"*.
*   **Horizontal Category Bar**: Seamlessly sliding pill buttons to filter categories (Breakfast, Lunch, Snacks, Drinks).
*   **Today's Selection Grid**:
    *   *Image Box*: Rounded crops of dishes with top rating overlays (`Star ★ 4.8`) and bottom-right category tags.
    *   *Footer Pricing*: Highlighting the price in large graphite text with an "Add to Cart" button that changes state to "Added ✓" when selected.
*   **Slide-to-Confirm Drawer**: A secure tactile slider requiring students to slide a golden handle rightward to authorize prepayments, reducing accidental online ordering.

### 2. Staff Operation Hub (`StaffView`)
Optimized for rapid kitchen interaction and high-speed tapping:
*   **Persistent Navigation Rail**: High contrast icons with clear, capitalized labels (Summary, New Bill, Live Queue, Menu Catalog, Financials, Configuration).
*   **Live Queue Ticket list**:
    *   Gigantic Token Numbers: `#T14` to allow quick order shouting.
    *   Color-coded Action Buttons: Orange play icon for **Prepare**, Emerald check icon for **Mark Ready**, Dark Package icon for **Handover/Deliver**.
*   **Walk-in Order Counter**: Designed to act as a point of sale (POS) with instant addition, cash calculation adjustments, and quick bill ticketing.

### 3. Admin Master Console (`AdminView`)
Provides complete site command and financial transparency:
*   **System Authority Top Bar**: Sticky dark gray strip with protective lock icon.
*   **Tickets Queue Manager (`activeTab: orders`)**:
    *   *Filter Control panel*: Search field searching items, students, and codes combined with status pills (All, Pending, Preparing, Ready, Delivered, Cancelled).
    *   *Customer Context Blocks*: Dedicated collapsible panels detailing the student's register number, hostel block, and room number to facilitate safe hosteller delivery.
    *   *Thermal Print Receipt Emulator*: Generates high-fidelity receipts featuring mock paper dashed boundary dividers, transaction metadata, a columned breakdown of prices, and a simulated clean CSS-based barcode. Contains a system printer print trigger.
*   **Financial Reports Panel**: Powered by clean SVG/CSS cards representing live transactions, payment splits (UPI QR, Cash), top-selling SKUs, and export controls.

---

## 🔤 Typography Specification

The system implements strict font hierarchies configured in the global CSS:
```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
}
```

*   **Display Text (Titles & Token Headers)**: `font-sans font-black tracking-tight text-slate-900`
*   **Body & Descriptions**: `font-sans font-bold text-gray-500 leading-relaxed text-sm`
*   **Technical Metrics (Receipts, Numbers, Timestamps)**: `font-mono font-medium text-xs tracking-wider`
