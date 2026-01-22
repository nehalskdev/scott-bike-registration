# Component Architecture & Data Flow

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (Client-Side)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │         registration/page.tsx (Entry Point)            │  │
│  │  • Metadata (SEO)                                      │  │
│  │  • StepperProvider (wraps entire form)                 │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│  ┌────────────────────▼─────────────────────────────────┐  │
│  │       RegistrationForm (Form Orchestrator)           │  │
│  │  • useForm (react-hook-form)                         │  │
│  │  • useStepper (custom context)                       │  │
│  │  • State: currentStep, confirmation, isLoading       │  │
│  │  • Renders StepperIndicators                         │  │
│  │  • Maps over 4 step components                       │  │
│  └────────────────────┬─────────────────────────────────┘  │
│                       │                                      │
│       ┌───────────────┼───────────────┬──────────────────┐  │
│       │               │               │                  │  │
│  ┌────▼──────┐  ┌────▼──────┐  ┌────▼──────┐  ┌────▼────┐ │
│  │   STEP 1  │  │   STEP 2  │  │   STEP 3  │  │ STEP 4  │ │
│  │  Serial # │  │ Bike Info │  │ Personal  │  │ Confirm │ │
│  └────┬──────┘  └────┬──────┘  └────┬──────┘  └────┬────┘ │
│       │              │              │              │     │
│  ┌────▼────────┐ ┌──▼────────┐ ┌───▼────────┐ ┌───▼──┐   │
│  │  API Call   │ │Bike Data  │ │Form Fields │ │Result│   │
│  │ Verify S/N  │ │ Display   │ │Collection │ │Show  │   │
│  └─────────────┘ └───────────┘ └────────────┘ └──────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
   ┌────▼──────────┐  ┌────▼──────────┐  ┌───▼───────────┐
   │ API Routes    │  │ Validation    │  │ Styling       │
   │ (Mock)        │  │ (Zod Schema)  │  │ (Tailwind)    │
   └────────────────┘  └────────────────┘  └───────────────┘
```

---

## Component Hierarchy (Detailed)

### Level 1: Page Entry

```
registration/page.tsx
├── metadata (SEO title, description)
├── StepperProvider (context provider)
│   └── RegistrationForm (form orchestrator)
└── Page title & styling
```

### Level 2: Form Orchestrator

```
RegistrationForm
├── useForm() hook (react-hook-form)
│   └── Resolver: zodResolver(bikeRegistrationSchema)
├── useStepper() hook (custom context)
│   ├── currentStep (0-3)
│   ├── nextStep()
│   ├── prevStep()
│   └── goToStep()
├── State Management
│   ├── confirmation: { success, message }
│   ├── isLoading: boolean
│   └── Form context spreading
├── StepperIndicators (visual progress)
└── Conditional Rendering
    ├── Step 1: <SerialNumberStep />
    ├── Step 2: <BikeInformationStep />
    ├── Step 3: <PersonalInformationStep />
    └── Step 4: <ConfirmationStep />
```

### Level 3: Individual Steps

#### Step 1: Serial Number Verification

```
SerialNumberStep
├── Input: serialNumber (text field)
├── Button: "Verify" (triggers API call)
├── Features:
│   ├── Loading state (spinner during API call)
│   ├── Error display
│   ├── API call: verifySerialNumber()
│   │   └── POST /api/verify-serial-number
│   └── Auto-fill form on success:
│       └── form.reset({ ...data, ...bikeData })
└── Submission: Sets form context for step 2
```

**Data Flow in Step 1:**

```
User Input (serialNumber)
    ↓
Verify Button Click
    ↓
API Call: verifySerialNumber(serialNumber)
    ↓
API Response: { serialNumber, modelDescription, shopName }
    ↓
form.reset() → Auto-populate form
    ↓
Form context updated with bike data
    ↓
User clicks "Next" → Step 2
```

---

#### Step 2: Bike Information Display

```
BikeInformationStep
├── Display Section (Read-only)
│   ├── Serial Number (disabled input)
│   ├── BikeInfoCard (image + description)
│   ├── Model Description (disabled)
│   └── Shop Name (disabled)
├── Input Section
│   └── Date of Purchase (date picker)
│       ├── Radix UI Popover (calendar trigger)
│       ├── react-day-picker (calendar component)
│       ├── Format: PPP (January 21, 2026)
│       └── Validation: Required field
├── Navigation Buttons
│   ├── "This is not my bike" (goToStep(0))
│   └── "Next" (nextStep())
└── Data Binding: useFormContext()
```

**Data Flow in Step 2:**

```
User sees bike info (from Step 1 API response)
    ↓
User selects Date of Purchase via date picker
    ↓
Form context updated with dateOfPurchase
    ↓
User clicks "Next" → Step 3
```

---

#### Step 3: Personal Information Collection

```
PersonalInformationStep
├── Text Fields (3 inputs)
│   ├── firstName (required)
│   ├── lastName (required)
│   └── email (required, email format)
├── Select Dropdowns (1 select)
│   └── country (5 options from COUNTRIES)
├── Radio Groups (2 groups)
│   ├── preferredLanguage (5 languages)
│   └── gender (3 options)
├── Date Picker
│   └── dateOfBirth (required)
│       └── Disables future dates & dates before 1900
├── Checkboxes (2 inputs)
│   ├── newsOptIn (optional)
│   └── consent (required)
└── Form Sub-Components (memoized for performance)
    ├── TextField (text input wrapper)
    ├── SelectField (select wrapper)
    ├── RadioGroupField (radio wrapper)
    └── CheckboxField (checkbox wrapper)
```

**Memoized Sub-Components Pattern:**

```tsx
const TextField = React.memo(({ name, label }) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
));
```

**Benefits:**

- Prevents re-renders when other fields change
- Each field manages its own controller instance
- Performance optimization for multi-field forms

---

#### Step 4: Confirmation Display

```
ConfirmationStep
├── Success State
│   ├── Icon: CircleCheckBigIcon (green)
│   ├── Background: bg-green-100
│   ├── Message: "Registration successful! Bike ID: {id}"
│   └── Status: ✓ Success
├── Failure State
│   ├── Icon: BanIcon (red)
│   ├── Background: bg-red-100
│   ├── Message: Error message from API
│   └── Status: ✗ Failed
└── Props from Parent
    ├── success: boolean
    └── message: string
```

---

### Level 4: Shared UI Components (Shadcn/Radix UI)

```
UI Component Library (src/components/ui/)
├── form.tsx
│   ├── <Form> → FormProvider wrapper
│   ├── <FormField> → Controller wrapper
│   ├── <FormItem> → Container
│   ├── <FormLabel> → Label component
│   ├── <FormControl> → Slots for inputs
│   └── <FormMessage> → Error display
├── button.tsx → Tailwind styled button
├── input.tsx → Text input wrapper
├── checkbox.tsx → Radix UI checkbox
├── radio-group.tsx → Radix UI radio
├── select.tsx → Radix UI dropdown
├── label.tsx → Radix UI label
├── calendar.tsx → react-day-picker
├── popover.tsx → Radix UI popover
└── stepper.tsx → Custom context provider
```

---

## Data Flow Diagram (Complete Registration Journey)

```
Step 1: Serial Number
┌─────────────────────────────────────┐
│ User enters serial number           │
│ Clicks "Verify"                     │
│                                     │
│ API Call ──────────────────────┐   │
│                                 │   │
└────────────────────────┬────────┼───┘
                         │        │
                    Success   Failure
                         │        │
         ┌───────────────▼─┐    │
         │ API Response:   │    │
         │ • serialNumber  │    │
         │ • modelDesc     │    │
         │ • shopName      │    │
         └────────┬────────┘    │
                  │              │
                  ▼              │
         Form auto-fills    Error shows
              (Step 1 data)       │
                  │               ▼
                  │          User retries
                  ▼
         User sees bike info & clicks Next

┌──────────────────────────────────────┐
│ Step 2: Bike Information             │
│ • Displays bike from Step 1 API      │
│ • User selects "Date of Purchase"   │
│ • Date picker shows calendar        │
│ • User selects date                 │
│ • Clicks "Next"                     │
└────────────┬───────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Step 3: Personal Information         │
│ • firstName, lastName, email         │
│ • country (dropdown)                │
│ • preferredLanguage (radio)         │
│ • gender (radio)                    │
│ • dateOfBirth (date picker)         │
│ • newsOptIn, consent (checkboxes)  │
│                                      │
│ User fills all fields               │
│ Form validates in real-time (Zod)   │
│ User clicks "Submit"                │
│                                      │
│ API Call ──────────────────────┐    │
│                                 │    │
└────────────────────────┬────────┼───┘
                         │        │
                    Success   Failure
                         │        │
         ┌───────────────▼─┐    │
         │ API Response:   │    │
         │ • success: true │    │
         │ • id: 12345     │    │
         │ • message       │    │
         └────────┬────────┘    │
                  │              │
         ┌────────▼───────────┐  │
         │ Step 4:            │  │
         │ Confirmation       │  │
         │ • Green success    │  │
         │ • Show bike ID     │  │
         │ • Completion       │  │
         └────────────────────┘  │
                                 │
                         ┌───────▼──┐
                         │ Step 4:  │
                         │ Failure  │
                         │ • Red    │
                         │ • Error  │
                         │ • Message│
                         └──────────┘
```

---

## State Management Architecture

### 1. React Hook Form (Form State)

```tsx
// Manages all form field values
const form = useForm<BikeRegistrationFormData>({
  resolver: zodResolver(bikeRegistrationSchema), // Zod validation
  defaultValues: bikeRegistrationInitialData, // Initial empty values
  mode: "onChange", // Validate on every change
});

// Fields tracked automatically:
// - serialNumber
// - modelDescription
// - shopName
// - firstName
// - lastName
// - email
// - country
// - dateOfPurchase
// - preferredLanguage
// - gender
// - dateOfBirth
// - newsOptIn
// - consent
```

### 2. Stepper Context (Navigation State)

```tsx
// Custom context provider (from stepper.tsx)
interface StepperContextType {
  currentStep: number;
  completedSteps: boolean[];
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  setStepCompleted: (step: number, completed: boolean) => void;
}

// Usage in RegistrationForm:
const { currentStep, nextStep, setStepCompleted } = useStepper();
```

### 3. Local Component State (UI State)

```tsx
// Registration Form component:
const [confirmation, setConfirmation] = useState<{
  success: boolean;
  message: string;
}>({ success: false, message: "" });

const [isLoading, setIsLoading] = useState(false);

// Serial Number Step:
const [isLoading, setIsLoading] = useState(false);

// Each step manages its own loading/error states
```

### 4. Global Context Chain

```
StepperProvider (registration/page.tsx)
    ↓
StepperContext (stepper.tsx)
    ↓
RegistrationForm (useContext + useForm)
    ↓
Individual Step Components (useFormContext + useStepper)
```

---

## Form Validation Flow

### Zod Schema Definition

```tsx
// registration-schema.ts
const bikeRegistrationSchema = z.object({
  serialNumber: z.string().min(1, { message: "Serial number is required" }),
  modelDescription: z.string().min(1, { message: "Model is required" }),
  shopName: z.string().min(1, { message: "Shop name is required" }),

  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),

  country: z.string().min(1, { message: "Country is required" }),
  dateOfPurchase: dateValidation("Date of purchase is required"),

  preferredLanguage: z.string().min(1, { message: "Language is required" }),
  gender: z.string().min(1, { message: "Gender is required" }),
  dateOfBirth: dateValidation("Date of birth is required"),

  newsOptIn: z.boolean().default(false),
  consent: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

// Custom date validation function
function dateValidation(message: string) {
  return z
    .date()
    .nullable()
    .transform((val) => val || null)
    .refine((val) => val !== null && val !== undefined, { message });
}
```

### Validation Execution Timeline

```
User Input → Component Re-render → RHF detects change
    ↓
mode: "onChange" triggers validation
    ↓
RHF passes data to Zod resolver
    ↓
Zod validates entire schema
    ↓
Errors object updated
    ↓
FormMessage component displays error
    ↓
Submit button enables/disables based on isValid
```

---

## Continue Reading

- [API Integration Guide](./API_INTEGRATION.md)
- [Error Handling Patterns](./ERROR_HANDLING.md)
- [Styling & Fonts Guide](./STYLING_FONTS.md)
