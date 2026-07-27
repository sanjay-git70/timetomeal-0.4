# Product Requirements Document (PRD) - Staff / Canteen Panel (TimeToMeal)

## 1. Executive Summary
The Staff/Canteen Panel is the operational core of the **TimeToMeal** system. It provides the canteen operators with the tools necessary to manage the live order queue, process walk-in orders quickly via a POS interface, manage the menu catalog, view daily financial reports, and broadcast live order status to an external TV dashboard.

## 2. Goals & Objectives
* Provide a high-speed Point of Sale (POS) interface for counter staff.
* Deliver a real-time, clutter-free kitchen display system (KDS) for managing live order tickets.
* Empower staff to manage menu inventory, availability (stock/out-of-stock), and dietary tags on the fly.
* Track daily sales, popular items, and revenue via integrated reports.

## 3. User Personas
* **Canteen Staff (Counter/Cashier):** Needs to punch in walk-in orders extremely fast. Uses keyboard shortcuts and a streamlined POS interface.
* **Kitchen Staff (Chef/Line Cook):** Needs a clear, live feed of pending tickets to prepare food in order. Needs to quickly mark tickets as "Ready".
* **Canteen Manager:** Oversees daily revenue, updates menu items, and manages the canteen profile settings.

## 4. Information Architecture & Navigation
The application uses a persistent left sidebar on desktop (collapsible on mobile) with the following modules:
* **Dashboard (Summary):** High-level view of today's active tickets, recent walk-ins, and quick actions.
* **Counter Fast Billing (Walk-in POS):** Optimized point-of-sale interface for rapid order entry.
* **Live Queue (Kitchen View):** Kanban-style tracking of active orders (Received, Preparing, Ready, Delivered).
* **Menu Catalog (Inventory):** Manage food items, stock status, pricing, and images.
* **Financial Reports:** Analytics, revenue charts, and exportable data.
* **Canteen Settings:** Profile details, operational status (Taking Orders / Not Taking Orders).
* **TV Dashboard:** A standalone display view designed to be cast to a TV screen for students to track their token status.

## 5. Functional Requirements

### 5.1 Counter Fast Billing (Walk-in POS)
* **Search & Filters:** Quick search by item name, and filters for Veg/Non-Veg and categories.
* **Keyboard Navigation:** Support for fast addition of items using keyboard shortcuts (e.g., Ctrl+1, Ctrl+2).
* **Grid Layout:** Left side displays a dense grid of menu items; right side displays the active counter bill.
* **Cart Management:** Add items, update quantities, calculate subtotal and GST, and clear cart.
* **Payment Processing:** Support for Cash, Online (UPI), and Razorpay tracking. Ability to track cash received and calculate change due.
* **Token Generation:** Instantly generates a token number upon order placement.

### 5.2 Live Queue (Kitchen Display System)
* **Ticket View:** Display orders categorized by status (`received`, `preparing`, `ready`, `delivered`).
* **Real-time Updates:** Highlight new orders dynamically.
* **State Management:** One-click buttons to transition an order through the pipeline (e.g., "Start Prep", "Mark Ready", "Handover").

### 5.3 Menu Catalog Management
* **Inventory Control:** Toggle item availability (In Stock / Out of Stock).
* **Edit Items:** Modify price, name, description, and categories.
* **Dietary Tagging:** Ensure accurate Veg/Non-Veg labeling.

### 5.4 Financial Reports & Summary
* **Metrics:** Track daily, weekly, and monthly revenue.
* **Visualizations:** Charts displaying sales trends and popular items.
* **Data Export:** Capability to review historical order data.

### 5.5 TV Dashboard (Digital Display)
* **Status Columns:** Split screen displaying "Preparing" tokens and "Ready for Pickup" tokens in large, high-contrast typography.
* **Auto-refresh:** Live updates without manual intervention, optimized for distant viewing on a mounted TV.

## 6. UI/UX Guidelines
* **Theme:** Dark Emerald and Slate palette for reduced eye strain in kitchen environments.
* **Responsive:** Sidebar adapts to a mobile drawer. POS view is optimized for tablets and desktop screens.
* **Accessibility:** Large touch targets for fast-paced environments; clear color coding (Green for Ready, Blue for Prep) for quick status recognition.

## 7. Technical Implementation Details
* **State Management:** React `useState` and derived state for filtering active orders.
* **Architecture:** Modular components (`WalkInOrderView`, `TVDashboard`, `MenuCatalogView`, `ReportsAnalysisView`) loaded dynamically based on active tab.
* **Performance:** Memoized calculations for cart totals and filtered order lists to maintain high FPS during rapid POS entry.
