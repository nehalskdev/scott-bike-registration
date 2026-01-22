# Styling, Fonts & Design System

## Design System Overview

```
┌─────────────────────────────────────────┐
│    STYLING LAYER ARCHITECTURE           │
├─────────────────────────────────────────┤
│                                         │
│  Global Styles (globals.css)            │
│  ├─ Tailwind directives                │
│  ├─ Custom font variables              │
│  └─ Base typography rules              │
│         ↓                               │
│  Component Styles (Tailwind CSS)       │
│  ├─ Utility classes                    │
│  ├─ Responsive design                  │
│  └─ Dark mode support                  │
│         ↓                               │
│  UI Components (shadcn/Radix)          │
│  ├─ Composed from primitives           │
│  ├─ Pre-styled with Tailwind           │
│  └─ Customizable variants              │
│         ↓                               │
│  Application (Registration Form)       │
│  ├─ Multi-step layout                  │
│  ├─ Responsive on all devices         │
│  └─ Accessible color contrast          │
│                                         │
└─────────────────────────────────────────┘
```

---

## Tailwind CSS Configuration

### Tailwind CSS 4 (Latest)

**File:** `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // Scan these directories for class names
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Add custom colors, spacing, etc.
    },
  },
  plugins: [],
};
```

### PostCSS Configuration

**File:** `postcss.config.mjs`

```javascript
// Processes Tailwind directives
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";

export default {
  plugins: {
    tailwindcss: {}, // Process @tailwind directives
    autoprefixer: {}, // Add vendor prefixes
  },
};
```

### Global Styles

**File:** `src/app/globals.css`

```css
/* Tailwind CSS Core Directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom Font Variables */
@layer base {
  :root {
    /* Open Sans font family at different weights */
    --font-open-sans-light: var(--font-open-sans-light);
    --font-open-sans-regular: var(--font-open-sans-regular);
    --font-open-sans-medium: var(--font-open-sans-medium);
    --font-open-sans-semibold: var(--font-open-sans-semibold);
    --font-open-sans-bold: var(--font-open-sans-bold);
    --font-open-sans-extrabold: var(--font-open-sans-extrabold);
  }
}

/* Base Typography */
@layer base {
  body {
    font-family: var(--font-open-sans-regular);
    font-size: 1rem;
    line-height: 1.5;
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    font-family: var(--font-open-sans-bold);
  }

  h2 {
    font-size: 2rem;
    font-weight: 600;
  }

  p {
    font-size: 1rem;
    font-family: var(--font-open-sans-regular);
  }
}
```

---

## Google Fonts Integration

### Font Setup in Layout

**File:** `src/app/layout.tsx`

```tsx
import { Open_Sans } from "next/font/google";

// Load Open Sans font with specific weights
const openSans = Open_Sans({
  variable: "--font-open-sans", // CSS variable name
  subsets: ["latin"], // Character subsets
  weight: [
    "300", // Light
    "400", // Regular
    "500", // Medium
    "600", // Semi-bold
    "700", // Bold
    "800", // Extra-bold
  ],
  display: "swap", // Font loading strategy
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={openSans.variable}>
      <body>{children}</body>
    </html>
  );
}
```

### Font Weight Usage

```tsx
// Light (300)
<p className="font-light">This is light text</p>

// Regular (400) - default
<p className="font-normal">This is regular text</p>

// Medium (500)
<p className="font-medium">This is medium text</p>

// Semi-bold (600)
<p className="font-semibold">This is semi-bold text</p>

// Bold (700)
<h2 className="font-bold">This is bold text</h2>

// Extra-bold (800)
<h1 className="font-extrabold">This is extra-bold text</h1>
```

---

## Tailwind Utility Classes Used

### Spacing & Layout

```tsx
// Padding
className = "p-4"; // 1rem padding all sides
className = "px-6"; // Horizontal padding
className = "py-2"; // Vertical padding
className = "pt-4 pb-2"; // Top and bottom only

// Margin
className = "mt-4"; // Margin top
className = "mb-6"; // Margin bottom
className = "mx-auto"; // Horizontal center

// Flexbox
className = "flex"; // display: flex
className = "flex-col"; // flex-direction: column
className = "justify-between"; // justify-content: space-between
className = "items-center"; // align-items: center
className = "gap-2"; // gap: 0.5rem

// Grid
className = "grid grid-cols-2"; // 2-column grid
className = "grid-cols-3"; // 3-column grid
```

### Colors & Styling

```tsx
// Text colors
className = "text-blue-600"; // Color from Tailwind palette
className = "text-gray-600"; // Gray variant
className = "text-red-600"; // Error color
className = "text-green-600"; // Success color

// Background colors
className = "bg-blue-600"; // Background color
className = "bg-gray-100"; // Light background
className = "bg-green-100"; // Success background
className = "bg-red-100"; // Error background

// Borders
className = "border"; // 1px border
className = "border-gray-300"; // Border color
className = "rounded"; // border-radius: 0.25rem
className = "rounded-lg"; // Larger border radius

// Shadows
className = "shadow"; // Box shadow
className = "shadow-lg"; // Large shadow
className = "shadow-none"; // No shadow
```

### Responsive Design

```tsx
// Mobile-first approach
className = "text-sm md:text-base lg:text-lg";
// sm: 640px  | md: 768px  | lg: 1024px
// xl: 1280px | 2xl: 1536px

// Examples
className = "w-full md:w-1/2"; // 100% on mobile, 50% on tablet
className = "flex-col lg:flex-row"; // Column on mobile, row on desktop
className = "px-4 md:px-8"; // Less padding on mobile, more on desktop

// Visibility
className = "hidden md:block"; // Hidden on mobile, visible on tablet+
className = "block md:hidden"; // Visible on mobile, hidden on tablet+
```

### Typography

```tsx
// Font sizes
className = "text-xs"; // 0.75rem (12px)
className = "text-sm"; // 0.875rem (14px)
className = "text-base"; // 1rem (16px)
className = "text-lg"; // 1.125rem (18px)
className = "text-xl"; // 1.25rem (20px)
className = "text-2xl"; // 1.5rem (24px)
className = "text-3xl"; // 1.875rem (30px)

// Font weight
className = "font-light"; // 300
className = "font-normal"; // 400
className = "font-semibold"; // 600
className = "font-bold"; // 700
className = "font-extrabold"; // 800

// Text alignment
className = "text-left";
className = "text-center";
className = "text-right";

// Line height & Letter spacing
className = "leading-tight"; // 1.25 line-height
className = "leading-normal"; // 1.5 line-height
className = "leading-loose"; // 1.75 line-height

className = "tracking-tighter"; // -0.05em letter-spacing
className = "tracking-normal"; // 0em letter-spacing
className = "tracking-wide"; // 0.025em letter-spacing
className = "tracking-widest"; // 0.1em letter-spacing (used in UI)
```

---

## Component Styling Examples

### RegistrationForm Component Styling

```tsx
<div className="w-full max-w-4xl mx-auto p-6 md:p-12">
  {/* Container: responsive padding, max width, centered */}

  <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-12">
    {/* Heading: responsive size, bold, centered, bottom margin */}
    BIKE REGISTRATION
  </h1>

  <div className="bg-white rounded-lg shadow-lg p-8">
    {/* Card: white background, rounded corners, shadow, padding */}

    <div className="mb-8">
      {/* Margin bottom for spacing */}
      <StepperIndicators />
    </div>

    <div className="min-h-96">
      {/* Min height for consistent layout */}
      {/* Steps render here */}
    </div>

    <div className="mt-8 flex justify-end gap-2">
      {/* Navigation buttons: top margin, flex row, space-between, gap */}
      <Button variant="ghost">Previous</Button>
      <Button variant="default">Next</Button>
    </div>
  </div>
</div>
```

### Form Field Styling

```tsx
<FormItem>
  <FormLabel className="text-sm font-medium text-gray-700">
    {/* Label: smaller size, medium weight, gray color */}
    First Name
  </FormLabel>

  <FormControl>
    <Input
      placeholder="John"
      className="mt-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      {/* Input: margin, padding, border styling, focus state */}
    />
  </FormControl>

  <FormMessage className="text-xs text-red-600 mt-1" />
  {/* Error: small size, red color, top margin */}
</FormItem>
```

### Button Styling (Variants)

```tsx
// Primary button
<Button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition">
  Submit
</Button>

// Secondary button
<Button variant="outline" className="border border-gray-300 text-gray-700">
  Cancel
</Button>

// Ghost button (text-only)
<Button variant="ghost" className="text-blue-600 hover:text-blue-800">
  Skip
</Button>

// Disabled button
<Button disabled className="opacity-50 cursor-not-allowed">
  Disabled
</Button>
```

---

## Shadcn/Radix UI Component Styling

### How Shadcn/Ui Components Work

**Base Architecture:**

```
Radix UI (unstyled primitives)
    ↓
Shadcn/UI Wrapper (adds Tailwind classes)
    ↓
Our Components (override with custom classes)
```

### Select Component Styling

**File:** `src/components/ui/select.tsx`

```tsx
import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

// Unstyled Radix component
const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500",
      className,
    )}
    {...props}
  >
    <SelectPrimitive.Value />
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
));
```

**Styling Breakdown:**

- `flex h-10 w-full` - Flexbox layout, height, full width
- `rounded-md` - Rounded corners
- `border border-gray-300` - Border styling
- `px-3 py-2` - Padding
- `text-sm` - Font size
- `focus:ring-2 focus:ring-blue-500` - Focus state

### Checkbox Component Styling

```tsx
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 border border-gray-300 rounded-sm bg-white ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
```

### RadioGroup Component Styling

```tsx
<div className="flex items-center space-x-3">
  {/* Container: flex with spacing */}

  <RadioGroupItem value="male" id="male" className="h-4 w-4" />
  {/* Radio button: sized */}

  <Label htmlFor="male" className="text-sm font-medium cursor-pointer">
    {/* Label: sized, bold, pointer cursor */}
    Male
  </Label>
</div>
```

---

## Color Palette

### Tailwind Default Colors Used

```
Primary (Blue)
├─ blue-500: #3b82f6 (Main action color)
├─ blue-600: #2563eb (Hover state)
└─ blue-700: #1d4ed8 (Active state)

Success (Green)
├─ green-100: #dcfce7 (Background)
└─ green-600: #16a34a (Text/Icon)

Error (Red)
├─ red-100: #fee2e2 (Background)
├─ red-600: #dc2626 (Text/Icon)
└─ red-700: #b91c1c (Hover)

Neutral (Gray)
├─ gray-100: #f3f4f6 (Light background)
├─ gray-300: #d1d5db (Borders)
├─ gray-600: #4b5563 (Text)
└─ gray-900: #111827 (Dark text)

White
└─ white: #ffffff (Background, cards)
```

---

## Responsive Design Breakpoints

### Mobile-First Approach

```tsx
// Default: Mobile (< 640px)
<div className="text-sm">
  {/* 14px on mobile */}
</div>

// Tablet (≥ 640px)
<div className="text-sm sm:text-base">
  {/* 14px on mobile, 16px on tablet+ */}
</div>

// Desktop (≥ 768px)
<div className="text-sm md:text-lg">
  {/* 14px on mobile, 18px on desktop+ */}
</div>

// Large Desktop (≥ 1024px)
<div className="text-sm lg:text-xl">
  {/* 14px on mobile, 20px on large desktop+ */}
</div>
```

### Registration Form Responsive Layout

**Mobile (< 768px):**

```
┌──────────────────────────────┐
│   BIKE REGISTRATION          │ (full width)
├──────────────────────────────┤
│ Step Indicators              │ (stacked)
│ ● — — —                      │
├──────────────────────────────┤
│ Serial Number Field          │ (full width)
│                              │
│ Verify                       │
├──────────────────────────────┤
│ Previous    Next             │ (stacked buttons)
└──────────────────────────────┘
```

**Desktop (≥ 768px):**

```
┌────────────────────────────────────────┐
│         BIKE REGISTRATION              │ (centered, max-width)
├────────────────────────────────────────┤
│ Step Indicators                        │ (horizontal)
│ ● — ● — — — —                        │
├────────────────────────────────────────┤
│ Serial Number Field                    │ (more spacious)
│                                        │
│                              Verify    │
├────────────────────────────────────────┤
│              Previous    Next           │ (right aligned)
└────────────────────────────────────────┘
```

---

## Dark Mode Support

### Dark Mode Classes (Built-in Tailwind)

```tsx
// Light mode (default)
<div className="bg-white text-gray-900">
  Light mode colors
</div>

// Dark mode compatible
<div className="bg-white dark:bg-gray-950 text-gray-900 dark:text-white">
  Works in both light and dark modes
</div>

// Common dark mode classes
className="dark:bg-slate-900"     // Background
className="dark:text-white"       // Text
className="dark:border-slate-700" // Borders
className="dark:shadow-none"      // Shadows
```

---

## Shadcn/UI Installation & Setup

### All Components Used

```bash
# Form Management
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label

# Selection
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group

# Dates
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover

# UI
npx shadcn-ui@latest add button
npx shadcn-ui@latest add stepper
```

### Component File Locations

```
src/components/ui/
├── form.tsx              # Form wrapper components
├── input.tsx             # Text input
├── label.tsx             # Form labels
├── button.tsx            # Buttons
├── select.tsx            # Dropdown
├── checkbox.tsx          # Checkboxes
├── radio-group.tsx       # Radio buttons
├── calendar.tsx          # Date picker calendar
├── popover.tsx           # Popover container
└── stepper.tsx           # Custom stepper (not official shadcn)
```

---

## CSS Architecture (BEM-like Pattern)

### Component Class Naming

```tsx
// Component block
<div className="registration-form">
  {/* Block element */}
  <div className="registration-form__header">
    <h1 className="registration-form__title">BIKE REGISTRATION</h1>
  </div>

  {/* Block element */}
  <div className="registration-form__content">
    <div className="registration-form__step">
      {/* Element modifier */}
      <input className="registration-form__input registration-form__input--required" />
    </div>
  </div>

  {/* Block element */}
  <div className="registration-form__footer">
    <button className="registration-form__button registration-form__button--primary">
      Submit
    </button>
  </div>
</div>
```

**Note:** Our project uses Tailwind utilities instead of BEM classes directly, but the same organizational thinking applies.

---

## Animation & Transitions

### Tailwind Animations

```tsx
// Loading spinner
<LoaderCircle className="animate-spin" />
// Rotates continuously

// Fade in
<div className="animate-in fade-in duration-300">
  Content fades in
</div>

// Pulse effect
<div className="animate-pulse bg-gray-300">
  Pulsing background
</div>

// Hover transitions
<Button className="hover:bg-blue-700 transition">
  Smooth color change on hover
</Button>

// Duration modifiers
className="duration-100"  // 100ms
className="duration-300"  // 300ms
className="duration-500"  // 500ms

// Delay modifiers
className="delay-100"     // Start after 100ms
className="delay-300"     // Start after 300ms
```

---

## Static Assets & Fonts

### Public Folder Structure

```
public/
├── assets/          # Images, SVGs, etc.
│  ├── bikes/       # Bike images
│  │  ├── SCOTT001.jpg
│  │  ├── SCOTT002.jpg
│  │  └── ...
│  └── logos/       # Brand logos
├── fonts/          # Local fonts (if any)
└── favicon.ico     # Favicon
```

### Using Images in Components

```tsx
import Image from "next/image";

export function BikeInfoCard() {
  return (
    <Image
      src={`/assets/bikes/${serialNumber}.jpg`}
      alt={`${modelDescription} bike`}
      width={300}
      height={200}
      priority // Load immediately
      className="rounded-lg shadow"
    />
  );
}
```

**Benefits of Next.js Image:**

- Automatic optimization
- Lazy loading
- Responsive images
- WebP format conversion
- CLS (Cumulative Layout Shift) prevention

---

## Print Styles (Future)

### Media Queries for Print

```css
@media print {
  body {
    background: white;
    color: black;
  }

  button {
    display: none;
  }

  .registration-form__confirmation {
    border: 2px solid black;
    padding: 20px;
  }
}
```

---

## Accessibility & Color Contrast

### WCAG AA Compliance

```tsx
// Good contrast (dark text on light background)
<div className="bg-white text-gray-900">
  ✓ Pass: Contrast ratio 16.82:1
</div>

// Good contrast (light text on dark background)
<div className="bg-gray-900 text-white">
  ✓ Pass: Contrast ratio 17.5:1
</div>

// Poor contrast (light gray on white)
<div className="bg-white text-gray-300">
  ✗ Fail: Contrast ratio 2.2:1 (needs 4.5:1)
</div>

// Error messages (always use color + icon)
<span className="text-red-600 flex items-center gap-2">
  <AlertIcon />
  Error message
</span>
// Color alone isn't enough for colorblind users
```

---

## Continue Reading

- [Project Overview](./PROJECT_OVERVIEW.md)
- [Component Architecture](./ARCHITECTURE.md)
