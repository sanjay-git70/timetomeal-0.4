# Product Requirements Document (PRD) - Student Panel (TimeToMeal)

## 1. Executive Summary
The Student Panel is the consumer-facing application for the **TimeToMeal** campus dining system. It allows students to browse the canteen menu, place orders for walk-in collection, manage their cart, track active tickets in real-time, and view their order history. The panel is designed with a mobile-first, app-like interface for quick and seamless food ordering.

## 2. Goals & Objectives
* Provide a seamless, mobile-optimized food ordering experience.
* Reduce wait times at the physical canteen counter by allowing pre-orders.
* Offer flexible payment options (Full upfront, 50% reservation deposit, Cash on Delivery).
* Provide real-time visibility into order preparation status.

## 3. User Personas
* **The Student:** Wants to quickly grab food between classes without waiting in long queues. Needs real-time updates on when the food is ready for pickup.

## 4. Information Architecture & Navigation
The application uses a persistent bottom navigation bar (Zomato/Swiggy style) with the following tabs:
* **Home:** Main menu catalog, quick categories, popular items.
* **Search:** Dedicated search interface with dietary filters.
* **Orders:** Live tracking of active orders.
* **History:** Past orders with quick re-order functionality.
* **Profile:** User account settings and details.
* **Cart (Floating/Contextual):** Accessible when items are added to the basket.

## 5. Functional Requirements

### 5.1 Menu & Browsing (Home & Search)
* **Menu Catalog:** Display food items with images, names, prices, and dietary tags (Veg/Non-Veg).
* **Categories:** Filter items by categories (Breakfast, Lunch, Snacks, Beverages, etc.).
* **Search:** Real-time text search for food items.
* **Dietary Filter:** Toggle between 'All', 'Veg', and 'Non-Veg'.
* **Item Details:** Tapping an item opens a detailed view with a larger image, description, preparation time, and quantity selector.

### 5.2 Cart & Checkout
* **Cart Management:** Add items, increase/decrease quantities, and remove items.
* **Order Summary:** Real-time calculation of totals and taxes.
* **Payment Ratios:** 
  * **Full Payment (100%):** Pay the entire amount upfront.
  * **Reservation Deposit (50%):** Pay half upfront, pay the balance at the counter.
* **Payment Methods:**
  * Razorpay Gateway integration.
  * UPI (Manual QR Scan).
  * Cash on Delivery (Pay at counter).

### 5.3 Order Tracking (Active Tickets)
* **Live Pipeline:** Visual stepper showing order progress (Received → Preparing → Ready → Delivered).
* **Token System:** Generate a unique Order Token (e.g., #1024) for counter pickup.
* **Cancellation:** Ability to cancel an order before it enters the 'Preparing' state, with a countdown timer.

### 5.4 Order History
* **Past Orders:** List previously completed or cancelled orders.
* **Reorder:** One-click functionality to add items from a past order directly to the current cart.
* **Digital Receipts:** View detailed breakdown of past transactions.

## 6. UI/UX Guidelines
* **Theme:** Clean, modern aesthetic with a primary Emerald Green color palette.
* **Typography:** Bold, legible sans-serif fonts (using Tailwind's `font-black` and `font-extrabold` for headings).
* **Responsive:** Strictly mobile-first. Must feel like a native mobile app when used on a smartphone (100dvh boundaries, bottom navigation, slide-up modals).
* **Feedback:** Haptic-style visual feedback (button scaling on active states), toast notifications for actions, and smooth transitions between tabs.

## 7. Technical Implementation Details
* **State Management:** React `useState` and `useCallback` for cart and tab state.
* **Persistence:** `localStorage` for maintaining cart state, dietary preferences, and user session.
* **Scroll Handling:** Cart page uses `flex-1 flex flex-col min-h-0` and `overflow-y-auto` to ensure inner scrollability within fixed viewport heights.
