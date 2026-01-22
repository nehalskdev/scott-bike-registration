# 🚴 Bike Registration Project - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [Dependencies & Packages](#dependencies--packages)
3. [Project Architecture](#project-architecture)
4. [Component Structure](#component-structure)
5. [Data Flow](#data-flow)
6. [State Management](#state-management)
7. [Form Handling](#form-handling)
8. [Styling & Fonts](#styling--fonts)
9. [API Integration](#api-integration)
10. [Error Handling](#error-handling)
11. [Multi-Step Flow](#multi-step-flow)

---

## Project Overview

**Bike Registration** is a modern Next.js web application that allows users to register their SCOTT bikes to extend warranty coverage. The application uses a multi-step form process (4 steps) with real-time validation and API integration.

### Key Features

- ✅ Multi-step registration process (Serial Number → Bike Info → Personal Info → Confirmation)
- ✅ Real-time form validation
- ✅ Automatic bike data population after serial number verification
- ✅ Type-safe API calls (Native Fetch)
- ✅ Responsive design with Tailwind CSS
- ✅ Accessible UI components (Shadcn/Radix UI)
- ✅ Dark mode ready

### Tech Stack Summary

| Layer             | Technology             |
| ----------------- | ---------------------- |
| **Framework**     | Next.js 16.1.4         |
| **React Version** | 19.2.3                 |
| **Language**      | TypeScript 5           |
| **Styling**       | Tailwind CSS 4         |
| **UI Components** | Shadcn/UI + Radix UI   |
| **Form Library**  | React Hook Form 7.71.1 |
| **Validation**    | Zod 4.3.5              |
| **Date Handling** | date-fns 4.1.0         |
| **Icons**         | Lucide React 0.562.0   |

---

## Dependencies & Packages

### Production Dependencies (13 packages)

#### 1. **Core Framework**

```json
{
  "next": "16.1.4",
  "react": "19.2.3",
  "react-dom": "19.2.3"
}
```

**Usage**: Server-side rendering, client-side rendering, page routing

---

#### 2. **Form Management & Validation**

```json
{
  "react-hook-form": "^7.71.1",
  "@hookform/resolvers": "^5.2.2",
  "zod": "^4.3.5"
}
```

**React Hook Form (RHF)**

- Purpose: Form state management
- Usage:
  ```tsx
  const form = useForm<BikeRegistrationFormData>({
    resolver: zodResolver(bikeRegistrationSchema),
    defaultValues: bikeRegistrationInitialData,
    mode: "onChange", // Real-time validation
  });
  ```
- Benefits:
  - Minimalist form library
  - No re-renders unless field changes
  - Built-in HTML5 validation
  - Easy integration with validation schemas

**Zod**

- Purpose: Schema validation and TypeScript type generation
- Usage:

  ```tsx
  const bikeRegistrationSchema = z.object({
    serialNumber: z.string().min(1, { message: "Required" }),
    email: z.email({ message: "Invalid email" }),
    dateOfBirth: dateValidation("Date of birth is required"),
  });

  type BikeRegistrationFormData = z.infer<typeof bikeRegistrationSchema>;
  ```

- Benefits:
  - Type-safe validation at runtime
  - Automatic TypeScript type inference
  - Nested object validation
  - Custom validation rules
  - Error messages management

**@hookform/resolvers**

- Purpose: Bridge between React Hook Form and Zod
- Usage: Connects Zod schema to RHF validation

---

#### 3. **UI Component Library (Radix UI)**

```json
{
  "@radix-ui/react-checkbox": "^1.3.3",
  "@radix-ui/react-label": "^2.1.8",
  "@radix-ui/react-popover": "^1.1.15",
  "@radix-ui/react-radio-group": "^1.3.8",
  "@radix-ui/react-select": "^2.2.6",
  "@radix-ui/react-slot": "^1.2.4"
}
```

**Purpose**: Unstyled, accessible UI components

**Components Used in Project**:

| Radix Component     | Shadcn Wrapper | Usage                       |
| ------------------- | -------------- | --------------------------- |
| `react-select`      | `<Select>`     | Country dropdown            |
| `react-radio-group` | `<RadioGroup>` | Gender & Language selection |
| `react-checkbox`    | `<Checkbox>`   | News opt-in & Consent       |
| `react-popover`     | `<Popover>`    | Date picker calendar        |
| `react-label`       | `<Label>`      | Form labels                 |
| `react-slot`        | Internal       | Component composition       |

**Benefits**:

- Full keyboard navigation
- ARIA attributes pre-configured
- Unstyled (we add Tailwind CSS)
- Composable component API

---

#### 4. **Styling**

```json
{
  "tailwindcss": "^4",
  "@tailwindcss/postcss": "^4",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^3.4.0"
}
```

**Tailwind CSS 4**

- Utility-first CSS framework
- Usage in components:
  ```tsx
  <div className="mt-4 flex justify-end gap-2">
    <Button className="text-blue-600 text-sm uppercase">Previous</Button>
    <Button className="tracking-wider min-w-40">Submit</Button>
  </div>
  ```

**class-variance-authority (CVA)**

- Purpose: Type-safe variant management for components
- Example:
  ```tsx
  const button = cva("px-4 py-2", {
    variants: {
      variant: { default: "bg-blue-600", link: "text-blue-600" },
      size: { lg: "text-lg", sm: "text-sm" },
    },
  });
  ```

**clsx & tailwind-merge**

- Purpose: Conditional class merging
- Usage: Combine base classes with conditional classes and merge Tailwind conflicts
  ```tsx
  const className = cn("p-4", isActive && "bg-blue-600");
  ```

---

#### 5. **Date & Time Handling**

```json
{
  "date-fns": "^4.1.0",
  "react-day-picker": "^9.13.0"
}
```

**date-fns**

- Purpose: Lightweight date utility library
- Usage in date-picker component:
  ```tsx
  import { format } from "date-fns";
  format(new Date(field.value), "PPP"); // "January 21, 2026"
  ```

**react-day-picker**

- Purpose: Calendar component for date selection
- Features: Keyboard navigation, range selection, localization

---

#### 6. **Icons**

```json
{
  "lucide-react": "^0.562.0"
}
```

**Lucide React**

- Purpose: Beautiful SVG icons as React components
- Usage in project:

  ```tsx
  import { LoaderCircle, CircleCheck, BanIcon } from "lucide-react";

  <LoaderCircle className="animate-spin size-6" /> // Loading spinner
  <CircleCheck className="text-green-600" /> // Success check
  <BanIcon className="text-red-600" /> // Error indicator
  ```

---

### Development Dependencies (7 packages)

```json
{
  "typescript": "^5",
  "eslint": "^9",
  "eslint-config-next": "16.1.4",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "@types/node": "^20",
  "tw-animate-css": "^1.4.0"
}
```

- **TypeScript**: Type checking
- **ESLint**: Code linting
- **Type Definitions**: For React, Node, DOM
- **tw-animate-css**: Animation utilities (inherited from Tailwind)

---

## Package Usage Breakdown by Component

### Registration Form Component

```tsx
import React from "react"; // React core
import { useForm, SubmitHandler } from "react-hook-form"; // RHF
import { zodResolver } from "@hookform/resolvers/zod"; // Zod integration
import { LoaderCircle } from "lucide-react"; // Icons
import { useStepper } from "@/src/components/ui/stepper"; // Stepper logic
import { Button } from "@/src/components/ui/button"; // UI component
import { cn } from "@/src/lib/utils"; // Tailwind merge
```

### Serial Number Step

```tsx
import { useFormContext } from "react-hook-form"; // Form context
import { Button } from "@/src/components/ui/button"; // UI
import { Input } from "@/src/components/ui/input"; // Shadcn input
import { verifySerialNumber } from "../services/..."; // API call
```

### Personal Information Step

```tsx
import { Select, SelectContent } from "@/src/components/ui/select"; // Radix select
import { RadioGroup, RadioGroupItem } from "@radix-ui/react-radio-group"; // Radix radio
import { Checkbox } from "@/src/components/ui/checkbox"; // Radix checkbox
import { COUNTRIES, LANGUAGES } from "../constants/..."; // Constants
```

### Date Picker Component

```tsx
import { format } from "date-fns"; // Date formatting
import { Calendar } from "@/src/components/ui/calendar"; // react-day-picker
import { Popover } from "@/src/components/ui/popover"; // Radix popover
```

---

## Summary Table: Package Purpose & Usage

| Package         | Version | Purpose               | Used In                      |
| --------------- | ------- | --------------------- | ---------------------------- |
| next            | 16.1.4  | Framework & routing   | All pages/components         |
| react           | 19.2.3  | UI library            | All components               |
| react-hook-form | 7.71.1  | Form state management | Registration form, all steps |
| zod             | 4.3.5   | Schema validation     | Schemas, form submission     |
| tailwindcss     | 4       | Styling               | All components               |
| lucide-react    | 0.562.0 | Icons                 | Buttons, loaders, status     |
| date-fns        | 4.1.0   | Date utilities        | Date picker, formatting      |
| @radix-ui/\*    | Latest  | UI primitives         | Form fields, popover, radio  |
| typescript      | 5       | Type checking         | All files                    |
| eslint          | 9       | Code quality          | Development                  |

---

## Next Steps

See the [Architecture Document](./ARCHITECTURE.md) for detailed component structure and data flow.
