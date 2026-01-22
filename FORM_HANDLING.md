# Form Handling & Validation Guide

## Form Management with React Hook Form

### Why React Hook Form?

**Traditional React Form (with useState):**

```tsx
// ❌ Problem: Every input change causes re-render
const [firstName, setFirstName] = useState("");
const [email, setEmail] = useState("");
const [country, setCountry] = useState("");
// ... more state
// Entire component re-renders for each keystroke
```

**React Hook Form Approach:**

```tsx
// ✓ Solution: Form manages its own state, component doesn't re-render
const form = useForm();
// Changes in form fields don't trigger component re-render
// Only validation errors and submission trigger updates
```

**Benefits:**

- No re-renders on field changes (performance ⚡)
- Minimal bundle size
- Simpler code
- Built-in validation support
- Integrates perfectly with Zod

---

## Form Initialization

### Setup in RegistrationForm Component

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  bikeRegistrationSchema,
  bikeRegistrationInitialData,
} from "../schemas/registration-schema";

const RegistrationForm = () => {
  const form = useForm<BikeRegistrationFormData>({
    // 1. Schema Resolver: Connect Zod schema for validation
    resolver: zodResolver(bikeRegistrationSchema),

    // 2. Default Values: Initial form state
    defaultValues: bikeRegistrationInitialData,

    // 3. Validation Mode: When to validate
    mode: "onChange", // Validate on every keystroke

    // 4. Revalidate Mode: When to re-validate on blur/submit
    reValidateMode: "onSubmit",

    // 5. Should Focus: Focus on first error field
    shouldFocusError: true,
  });

  return <Form {...form}>{/* Form children */}</Form>;
};
```

### Initial Data Object

```tsx
// registration-schema.ts
export const bikeRegistrationInitialData: BikeRegistrationFormData = {
  // Step 1: Serial Number
  serialNumber: "",

  // Step 2: Bike Information
  modelDescription: "",
  shopName: "",
  dateOfPurchase: null,

  // Step 3: Personal Information
  firstName: "",
  lastName: "",
  email: "",
  country: "",
  preferredLanguage: "",
  gender: "",
  dateOfBirth: null,
  newsOptIn: false,
  consent: false,
};
```

**Why structured this way:**

- All fields start empty/false
- Matches form schema exactly
- Easy to reset or pre-populate

---

## Validation Schema (Zod)

### Complete Schema Definition

```typescript
// registration-schema.ts
import { z } from "zod";

// Step 1: Helper function for date validation
function dateValidation(message: string) {
  return z
    .date()
    .nullable() // Allow null values
    .transform((val) => val || null) // Convert to null if undefined
    .refine((val) => val !== null && val !== undefined, { message }); // Custom error
}

// Main schema
export const bikeRegistrationSchema = z.object({
  // ───────── STEP 1: SERIAL NUMBER ─────────
  serialNumber: z.string().min(1, { message: "Serial number is required" }),

  // ───────── STEP 2: BIKE INFORMATION ─────────
  modelDescription: z
    .string()
    .min(1, { message: "Model description is required" }),

  shopName: z.string().min(1, { message: "Shop name is required" }),

  dateOfPurchase: dateValidation("Date of purchase is required"),

  // ───────── STEP 3: PERSONAL INFORMATION ─────────
  firstName: z
    .string()
    .min(1, { message: "First name is required" })
    .max(50, { message: "First name too long" }),

  lastName: z
    .string()
    .min(1, { message: "Last name is required" })
    .max(50, { message: "Last name too long" }),

  email: z.string().email({ message: "Invalid email address" }),

  country: z.string().min(1, { message: "Country is required" }),

  preferredLanguage: z
    .string()
    .min(1, { message: "Preferred language is required" }),

  gender: z.string().min(1, { message: "Gender is required" }),

  dateOfBirth: dateValidation("Date of birth is required"),

  // ───────── CHECKBOXES ─────────
  newsOptIn: z.boolean().default(false),

  consent: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

// Infer TypeScript type
export type BikeRegistrationFormData = z.infer<typeof bikeRegistrationSchema>;
```

### Validation Rules Breakdown

| Field        | Type    | Rules           | Error                       |
| ------------ | ------- | --------------- | --------------------------- |
| serialNumber | string  | min 1 char      | "Serial number is required" |
| firstName    | string  | min 1, max 50   | "First name is required"    |
| email        | string  | email format    | "Invalid email address"     |
| consent      | boolean | must be true    | "You must accept terms"     |
| dateOfBirth  | date    | not null, ≥1900 | "Date of birth is required" |
| country      | string  | required        | "Country is required"       |

---

## Real-Time Validation

### How Validation Flows

```
User Types in Input Field
    ↓
onChange event fires
    ↓
RHF detects change (mode: "onChange")
    ↓
RHF calls Zod resolver with updated data
    ↓
Zod validates the entire schema
    ↓
Zod returns errors object if validation fails
    ↓
RHF updates form.formState.errors
    ↓
FormMessage component re-renders with error
    ↓
User sees error message instantly
```

### Example: Email Validation

```tsx
// User types: "john"
// Zod validation: ✓ string exists (pass)

// User types: "john@"
// Zod validation: ✗ not email format (fail)
// Error shown: "Invalid email address"

// User types: "john@example.com"
// Zod validation: ✓ valid email format (pass)
// Error removed
```

---

## Form Component Implementation

### Creating Controlled Inputs

**Using FormField + Controller Pattern:**

```tsx
<FormField
  control={form.control}
  name="firstName" // Must match schema key
  render={({ field }) => (
    <FormItem>
      <FormLabel>First Name *</FormLabel>
      <FormControl>
        <Input
          placeholder="John"
          {...field} // Spreads onChange, onBlur, value, etc.
        />
      </FormControl>
      <FormMessage /> {/* Shows validation error */}
    </FormItem>
  )}
/>
```

**What `{...field}` includes:**

```tsx
{
  name: "firstName",              // Field name
  value: form.getValues("firstName"), // Current value
  onChange: (e) => { /* updates form state */ },
  onBlur: () => { /* marks as touched */ },
  ref: /* focus reference */,
}
```

---

## Advanced Field Components

### TextField (Text Inputs)

```tsx
const TextField = React.memo(
  ({
    name,
    label,
    placeholder,
  }: {
    name: keyof BikeRegistrationFormData;
    label: string;
    placeholder?: string;
  }) => {
    const form = useFormContext<BikeRegistrationFormData>();

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label} *</FormLabel>
            <FormControl>
              <Input placeholder={placeholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  },
);

// Usage:
<TextField name="firstName" label="First Name" placeholder="John" />;
```

### SelectField (Dropdowns)

```tsx
const SelectField = React.memo(
  ({
    name,
    label,
    options,
  }: {
    name: keyof BikeRegistrationFormData;
    label: string;
    options: { value: string; label: string }[];
  }) => {
    const form = useFormContext<BikeRegistrationFormData>();

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label} *</FormLabel>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {options.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  },
);

// Usage:
<SelectField name="country" label="Country" options={COUNTRIES} />;
```

### RadioGroupField (Radio Buttons)

```tsx
const RadioGroupField = React.memo(
  ({
    name,
    label,
    options,
  }: {
    name: keyof BikeRegistrationFormData;
    label: string;
    options: { value: string; label: string }[];
  }) => {
    const form = useFormContext<BikeRegistrationFormData>();

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label} *</FormLabel>
            <RadioGroup onValueChange={field.onChange} value={field.value}>
              {options.map((opt) => (
                <div key={opt.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.value} id={opt.value} />
                  <Label htmlFor={opt.value}>{opt.label}</Label>
                </div>
              ))}
            </RadioGroup>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  },
);

// Usage:
<RadioGroupField name="gender" label="Gender" options={GENDERS} />;
```

### CheckboxField (Checkboxes)

```tsx
const CheckboxField = React.memo(
  ({
    name,
    label,
  }: {
    name: keyof BikeRegistrationFormData;
    label: string;
  }) => {
    const form = useFormContext<BikeRegistrationFormData>();

    return (
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                id={name}
              />
            </FormControl>
            <FormLabel htmlFor={name}>{label}</FormLabel>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  },
);

// Usage:
<CheckboxField name="consent" label="I accept terms and conditions *" />;
```

---

## Form Submission Flow

### Handle Submit Function

```tsx
const handleSubmit = useCallback<SubmitHandler<BikeRegistrationFormData>>(
  async (data) => {
    try {
      // 1. Set loading state
      setIsLoading(true);

      // 2. Validate data one more time (client-side check)
      const validationResult = bikeRegistrationSchema.safeParse(data);
      if (!validationResult.success) {
        // Validation failed - RHF should have already prevented this
        return;
      }

      // 3. Call API service
      const response = await registerBike(data);

      // 4. Store confirmation state
      setConfirmation({
        success: response.success,
        message: response.message,
      });
    } catch (error) {
      // 5. Handle errors
      const errorMessage =
        error instanceof Object && "message" in error
          ? (error as BikeRegistrationError).message
          : "Registration failed. Please try again.";

      setConfirmation({
        success: false,
        message: errorMessage,
      });
    } finally {
      // 6. Update form state
      setIsLoading(false);
      setStepCompleted(2, true);
      nextStep(); // Move to Step 4 (confirmation)
    }
  },
  [setStepCompleted, nextStep],
);

// Attach to form submission
<form onSubmit={form.handleSubmit(handleSubmit)}>{/* Form fields */}</form>;
```

### Form Submission Flow Diagram

```
User Fills Form (Step 3)
    ↓
User Clicks "Submit" Button
    ↓
form.handleSubmit() called
    ↓
RHF validates using Zod resolver
    ↓
┌─────────────────────────┐
│ Validation Result?      │
└──────┬──────────────┬───┘
       │              │
     FAIL           PASS
       │              │
       ▼              ▼
    Errors         handleSubmit()
    Shown          Function Called
       │              │
       │          setIsLoading(true)
       │              │
       │          registerBike(data)
       │              │
       │          API Call
       │          (POST /api/register)
       │              │
       │          Response
       │          Received
       │              │
       ▼              ▼
    Stop        setConfirmation()
                     │
                 setIsLoading(false)
                     │
                 nextStep()
                     │
                    ▼
              Step 4 Shows
              Success/Failure
```

---

## Auto-Population Pattern (Step 1 → Step 2)

### How Step 1 Populates Form

**In SerialNumberStep Component:**

```tsx
const handleVerify = async () => {
  try {
    setIsLoading(true);
    const serialNum = watch("serialNumber");

    // 1. Call API to get bike data
    const bikeData = await verifySerialNumber(serialNum);

    // 2. Get current form values
    const currentValues = form.getValues();

    // 3. Reset form with existing + new data
    form.reset({
      ...currentValues, // Keep existing values
      ...bikeData, // Override with API response
    });

    // 4. Form is now auto-populated for Step 2
  } catch (error) {
    form.setError("serialNumber", {
      message: "Serial number not found",
    });
  }
};
```

**What Happens:**

```
Step 1 Form:
{
  serialNumber: "SCOTT001",
  modelDescription: "", ← Empty
  shopName: "", ← Empty
  ...rest: null/empty
}
    ↓
API returns bikeData:
{
  serialNumber: "SCOTT001",
  modelDescription: "Scott Scale 960",
  shopName: "Bike Shop Vienna"
}
    ↓
form.reset() merges them:
{
  serialNumber: "SCOTT001",
  modelDescription: "Scott Scale 960", ← Now filled!
  shopName: "Bike Shop Vienna", ← Now filled!
  ...rest: null/empty
}
    ↓
Step 2 displays auto-filled values
```

---

## Form State Management Methods

### Reading Form Values

```tsx
// Get single field value
const serialNumber = form.watch("serialNumber");

// Get all form values
const allValues = form.getValues();

// Get specific fields
const { firstName, lastName } = form.getValues(["firstName", "lastName"]);

// Watch multiple fields (re-renders when change)
const { firstName, email } = form.watch(["firstName", "email"]);
```

### Setting Form Values

```tsx
// Set single field
form.setValue("firstName", "John");

// Set multiple fields
form.setValue("firstName", "John");
form.setValue("lastName", "Doe");

// Reset entire form to initial state
form.reset();

// Reset with custom values
form.reset({
  firstName: "John",
  lastName: "Doe",
  ...
});
```

### Checking Form State

```tsx
// Check if form is valid
if (form.formState.isValid) {
  // All fields pass validation
}

// Check if form is dirty (has changes)
if (form.formState.isDirty) {
  // User has modified fields
}

// Check if form is submitting
if (form.formState.isSubmitting) {
  // Submission in progress
}

// Get all validation errors
const errors = form.formState.errors;
// errors.firstName?.message = "First name is required"

// Check if specific field has error
if (form.formState.errors.email) {
  // Show error
}
```

---

## Performance Optimization

### Memoization of Field Components

```tsx
// ❌ Without memo: Re-renders every keystroke
const TextField = ({ name, label }) => {
  return <FormField ... />;
};

// ✓ With memo: Only re-renders if props change
const TextField = React.memo(({ name, label }) => {
  return <FormField ... />;
});

// Usage:
<TextField name="firstName" label="First Name" />
// Component memoized, won't re-render if parent updates
```

### Benefits:

- Personal information step has 7 fields
- Each keystroke would cause all 7 fields to re-render without memo
- With memo: only the changed field re-renders
- Significant performance improvement on large forms

---

## Form Validation Modes

### Available Modes

| Mode        | When Validates                  | Use Case                       |
| ----------- | ------------------------------- | ------------------------------ |
| `onSubmit`  | Only on form submission         | Validation after user finished |
| `onChange`  | After every field change        | Real-time feedback (used here) |
| `onBlur`    | When field loses focus          | When user leaves field         |
| `onTouched` | After first blur, then onChange | Progressive validation         |
| `all`       | Both onChange and onBlur        | Strict validation              |

**Why `onChange` is Used:**

```tsx
mode: "onChange";
// Pro: Real-time feedback, better UX
// Con: Validation runs frequently (minimal impact)
```

---

## Error Message Display

### FormMessage Component

```tsx
// In form.tsx (shadcn/ui)
<FormMessage /> {/* Automatically shows errors */}

// Displays error from form.formState.errors
// Only appears if field has validation error
// Uses aria-live region for accessibility
```

### Custom Error Messages

```tsx
// Zod allows custom messages
const schema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address" })
    .min(1, { message: "Email is required" }),
});

// User sees: "Please enter a valid email address"
```

---

## Continue Reading

- [Styling & Fonts Guide](./STYLING_FONTS.md)
- [API Integration Guide](./API_INTEGRATION.md)
