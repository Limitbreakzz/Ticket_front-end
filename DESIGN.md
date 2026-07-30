---
name: Ticket Hub
description: IT Helpdesk Ticket System Design System
colors:
  primary: "#3b82f6"
  primary-light: "#60a5fa"
  primary-lighter: "#93c5fd"
  primary-pale: "#eff6ff"
  primary-bg: "#f8fafc"
  secondary: "#06b6d4"
  secondary-light: "#22d3ee"
  secondary-pale: "#ecfeff"
  accent: "#6366f1"
  accent-pale: "#eef2ff"
  success: "#10b981"
  success-pale: "#ecfdf5"
  warning: "#f59e0b"
  warning-pale: "#fffbeb"
  danger: "#ef4444"
  danger-pale: "#fef2f2"
  critical: "#8b5cf6"
  critical-pale: "#f5f3ff"
  text-primary: "#0f172a"
  text-secondary: "#334155"
  text-muted: "#64748b"
  text-white: "#ffffff"
  bg-main: "#f1f5f9"
  bg-card: "#f8fafc"
  bg-sidebar: "#0f172a"
  bg-sidebar-hover: "#1e293b"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, IBM Plex Sans Thai, sans-serif"
    fontSize: "24px"
    fontWeight: 800
    lineHeight: 1.2
  headline:
    fontFamily: "Plus Jakarta Sans, IBM Plex Sans Thai, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Plus Jakarta Sans, IBM Plex Sans Thai, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Plus Jakarta Sans, IBM Plex Sans Thai, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Plus Jakarta Sans, IBM Plex Sans Thai, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.text-white}"
    rounded: "{rounded.md}"
    padding: "9px 18px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "9px 18px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.text-secondary}"
    rounded: "{rounded.md}"
    padding: "9px 18px"
---

# Design System: Ticket Hub

## 1. Overview

**Creative North Star: "The Operational Workbench"**

The design system of Ticket Hub is modeled after high-productivity developer tools like Linear and GitLab, adapted for professional IT management in Thailand. It rejects the overly bright, colored graphics, and card-heavy layouts typical of generic admin dashboards, opting instead for a restrained, slate-heavy workspace where status indicator colors stand out with extreme clarity. 

Spacing is clean and rhythmic, typography is optimized for both Thai script readability and English code/ID display, and operations are designed to be fast and keyboard-friendly.

**Key Characteristics:**
- **Restrained Slate Aesthetic**: Surfaces utilize soft slate tones rather than pure white, ensuring comfortable long-term usage.
- **Color-Coded Status Priority**: Vibrant colors are reserved strictly for system signals, priorities, and status badges, keeping the background clean.
- **Thai-First Readability**: Proportional line-heights and font families that support legible Thai display.

## 2. Colors

The color palette features muted, slate-based neutral colors that keep the screen quiet, allowing priority color signals to shine.

### Primary
- **Sleek Indigo Blue** (#3b82f6 / oklch(62% 0.2 245)): The core brand identifier. Used for major actions, active navigation states, and focus rings.

### Secondary
- **Soft Cyan Accent** (#06b6d4): Used as a complementary color accent for minor tags and status tags.

### Accent
- **Premium Purple Accent** (#6366f1): Highlight color reserved for critical-tier actions or escalated tickets.

### Neutral
- **Slate 900 Background Ink** (#0f172a): Used for dark layouts like the main sidebar.
- **Slate 100 Main Backdrop** (#f1f5f9): Primary light backdrop for the main application area.
- **Slate 50 Card Surface** (#f8fafc): Surface color for panels, cards, and modal forms.

### Named Rules
**The Rarity of Signal Rule.** Accent colors and status indicators must consume ≤5% of the total page surface. Color is a critical operational signal; if it is everywhere, it carries no value.

## 3. Typography

**Display Font:** Plus Jakarta Sans (with fallback system-ui, sans-serif)
**Body Font:** IBM Plex Sans Thai (with fallback system-ui, sans-serif)

**Character:** A modern pairing combining the geometric, clean look of Plus Jakarta Sans for titles and figures with the exceptional legibility of IBM Plex Sans Thai for dense Thai body text.

### Hierarchy
- **Display** (800, 24px, 1.2): Main header titles. Used in dashboard metrics and page titles.
- **Headline** (700, 18px, 1.3): Sub-view headers and modal titles.
- **Title** (700, 15px, 1.4): Sidebar labels and table section headers.
- **Body** (400, 14px, 1.6): Default reading size for description fields, chat boxes, and user inputs. Maximum line length capped at (75ch) for readability.
- **Label** (600, 11px, 1): Small metadata fields, timestamps, and badges.

### Named Rules
**The Line-Height Rule.** Thai characters require an additional 0.15–0.25 line-height ratio compared to English equivalents to prevent vertical overlap of loops and accents.

## 4. Elevation

The elevation philosophy is flat-by-default, emphasizing clear visual boundaries (borders) over heavy shadows to maintain a clean workspace layout.

### Shadow Vocabulary
- **Ambient Low** (`box-shadow: 0 1px 2px 0 rgba(15, 23, 42, 0.03)`): Applied to cards and standard list panels at rest.
- **Ambient Medium** (`box-shadow: 0 4px 12px -3px rgba(15, 23, 42, 0.04)`): Interactive card hovers and tooltips.
- **Overlay Drop** (`box-shadow: 0 20px 40px -8px rgba(15, 23, 42, 0.08)`): Popovers, dropdown menus, and main dialog modals.

### Named Rules
**The Border-First Boundary Rule.** Separate panels and rows using translucent borders (`rgba(15, 23, 42, 0.08)`) instead of drop shadows to preserve flat-by-default visual cleanliness.

## 5. Components

### Buttons
- **Shape:** Rounded corners (8px).
- **Primary:** Linear gradient (`linear-gradient(135deg, var(--primary), var(--primary-light))`) with white text and a soft blue shadow.
- **Outline:** Transparent background with border (`1.5px solid var(--border-strong)`) and blue text.
- **Hover / Focus:** Hover adds scale/translate offset (`translateY(-1px)`) and boosts shadow density. Focus adds a clear blue outline (`box-shadow: 0 0 0 3px rgba(37,99,235,0.12)`).

### Cards / Containers
- **Corner Style:** Rounded corners (12px for standard cards, 16px for overlay modals).
- **Background:** Slate 50 (#f8fafc) against main layout background.
- **Internal Padding:** Rhythmic steps (16px to 24px).

### Inputs / Fields
- **Style:** Light gray backdrop (#f1f5f9) with border (`1.5px solid var(--border-light)`) and rounded corner (8px).
- **Focus:** Highlighted border (`border-color: var(--primary)`) and outline ring (`box-shadow: 0 0 0 3px rgba(37,99,235,0.12)`).

### Navigation
- **Sidebar**: High-contrast dark Slate 900 background. Active items get a solid primary blue background with a white indicator bar on the left edge.
- **Bottom Navigation**: Sticky responsive navigation layout for mobile breakpoints.

## 6. Do's and Don'ts

### Do:
- **Do** use precise Thai line-height offsets to prevent character accents from clipping.
- **Do** format ticket reference IDs in mono font tags (e.g. `TIC-123`).
- **Do** verify keyboard focus indicators on all inputs and interactive buttons.

### Don't:
- **Don't** use border-left / border-right greater than 1px as a colored stripe on cards or panels.
- **Don't** use gradient text under any circumstances.
- **Don't** apply blur or glassmorphism as a default card background decoration.
- **Don't** overuse nested cards; separate nested views using borders and spacing instead.
- **Don't** animate image elements on hover.
