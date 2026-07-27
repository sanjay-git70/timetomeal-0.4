# Product Requirements Document (PRD) - Admin Panel (TimeToMeal)

## 1. Executive Summary
The Admin Panel is the centralized command center for the **TimeToMeal** platform. It is designed for system administrators and university management to oversee the entire platform's operations, monitor all canteen activities, manage users (students and staff), and access system-wide financial and operational analytics. 

## 2. Goals & Objectives
* Provide a "God-mode" view of all transactions and orders across the system.
* Enable user administration, including student account management and password resets.
* Deliver high-level financial reporting and platform usage metrics.
* Ensure data integrity and system security through administrative override capabilities.

## 3. User Personas
* **System Administrator:** IT personnel or university management responsible for the smooth operation of the digital dining platform. They need broad oversight, troubleshooting tools, and reporting capabilities.

## 4. Information Architecture & Navigation
The Admin Panel utilizes a professional, data-dense sidebar navigation with the following tabs:
* **Dashboard (Summary):** High-level platform metrics, total revenue, active users, and system health.
* **Ticket Management (Orders):** A global ledger of all orders placed across the system.
* **Financial Reports (Reports):** Detailed analytics, revenue breakdowns, and exportable financial data.
* **User Management (Users):** Directory of registered students and staff, with tools for password resets and profile edits.
* **Admin Settings (Profile):** System configurations and admin profile management.

## 5. Functional Requirements

### 5.1 Global Ticket Management (Orders Tab)
* **Master Ledger:** View every order ever placed within the system.
* **Advanced Filtering & Sorting:** 
  * Filter by order status (`received`, `preparing`, `ready`, `delivered`, `cancelled`).
  * Search by Order Token, Student Name, Register Number, or Item Name.
  * Sort by Newest, Oldest, Highest Value, Lowest Value.
* **Administrative Overrides:** Ability to manually update an order's status or permanently delete a corrupted/test ticket record from the database.
* **Detailed Receipts:** View the complete breakdown of any transaction, including items, timestamps, and customer details.

### 5.2 User Administration & Security (Users Tab)
* **User Directory:** Browse all registered students and staff accounts.
* **Password Management:** Search for a student by their Roll Number / Register Number and forcefully reset their password if they lose access.
* **Account Status:** Monitor user activity and role assignments.

### 5.3 System-Wide Financial Reports
* **Aggregated Analytics:** View revenue data aggregated across all time or filtered by specific periods.
* **Component Reusability:** Leverages the `ReportsAnalysisView` component to provide consistent charting and data visualization identical to the canteen reports but with a broader scope.

### 5.4 Dashboard & System Health
* **Quick Stats:** Instantly view Total Orders, Total Revenue, and Active Users.
* **Recent Activity Feed:** Monitor the latest transactions as they occur in real-time.

## 6. UI/UX Guidelines
* **Theme:** Professional, high-contrast Admin interface (Slate and Emerald). Distinct from the consumer app to prevent context confusion.
* **Layout:** Desktop-optimized data tables, wide charts, and dense information display. Uses a `max-w-screen-2xl` container for maximum screen utilization.
* **Security Feedback:** Clear warning colors (Reds/Oranges) for destructive actions like deleting tickets or resetting passwords.

## 7. Technical Implementation Details
* **Data Handling:** `useMemo` hooks heavily utilized to handle sorting and filtering of potentially massive global order arrays efficiently on the client side.
* **State Management:** Secure state handling for password reset forms (`showPasswordForm`, `rollNumberInput`, `newPassword`) with validation logic.
* **Component Architecture:** The Admin Panel shares certain visualization components (`ReportsAnalysisView`, `SummaryDashboard`) with the Staff panel to maintain UI consistency and reduce code duplication, while feeding them broader datasets.
