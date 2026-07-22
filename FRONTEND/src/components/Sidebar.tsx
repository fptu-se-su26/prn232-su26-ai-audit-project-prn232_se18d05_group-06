/**
 * Sidebar.tsx — Warehouse sidebar
 *
 * Re-exports AdminSidebar so that all pages (admin + warehouse) share
 * the same 2-layer global navigation. This eliminates the inconsistency
 * where navigating from Admin → Warehouse caused the sidebar to visually change.
 */
export { default } from './AdminSidebar';
