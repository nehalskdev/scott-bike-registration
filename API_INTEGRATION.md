# API Integration & Error Handling Guide

## API Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Step 1                         Step 3                           │
│  ┌──────────────────┐          ┌──────────────────┐             │
│  │ SerialNumberStep │          │PersonalInfoStep  │             │
│  │                  │          │                  │             │
│  │ Verify Button    │          │ Submit Button    │             │
│  └────────┬─────────┘          └────────┬─────────┘             │
│           │                             │                       │
│  ┌────────▼────────────────┐   ┌────────▼──────────────┐        │
│  │verifySerialNumber()    │   │registerBike()         │        │
│  │Native Fetch            │   │Native Fetch           │        │
│  │Type-safe wrapper       │   │Type-safe wrapper      │        │
│  └────────┬────────────────┘   └────────┬──────────────┘        │
│           │                             │                       │
└───────────┼─────────────────────────────┼───────────────────────┘
            │                             │
            │ POST (JSON)                 │ POST (JSON)
            │ /api/verify-serial-number   │ /api/register
            │                             │
┌───────────▼─────────────────────────────▼───────────────────────┐
│                    SERVER (Next.js API Routes)                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────────────┐  ┌──────────────────────────┐     │
│  │verify-serial-number/     │  │register/                 │     │
│  │route.ts                  │  │route.ts                  │     │
│  │                          │  │                          │     │
│  │1. Parse request JSON     │  │1. Parse request JSON     │     │
│  │2. Look up in mock DB     │  │2. Validate with Zod      │     │
│  │3. Return bike data       │  │3. Check 20% failure rate │     │
│  │4. Simulate 3s delay      │  │4. Generate registration  │     │
│  │                          │  │5. Simulate 20s delay     │     │
│  └──────────┬───────────────┘  └──────────┬───────────────┘     │
│             │                             │                     │
│  ┌──────────▼────────────────────────────▼───────┐             │
│  │       Mock Database (in-memory)                │             │
│  │  - 5 pre-defined bikes with serial numbers    │             │
│  │  - Validates registration requests with Zod   │             │
│  └────────────────────────────────────────────────┘             │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
            │                             │
            │ Response (JSON)             │ Response (JSON)
            │ 200 OK                      │ 200 OK or 400 Bad Request
            │                             │
┌───────────▼─────────────────────────────▼───────────────────────┐
│                    CLIENT (Browser)                              │
├─────────────────────────────────────────────────────────────────┤
│  form.reset(bikeData)          setConfirmation(response)        │
│  Auto-populate Step 2          Show Step 4 result               │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Service Layer (Type-Safe Fetch Wrappers)

### Service 1: Serial Number Verification

**File:** [src/app/registration/services/bike-serial-verification.ts](src/app/registration/services/bike-serial-verification.ts)

```typescript
// Type Definitions
interface SerialNumberRequest {
  serialNumber: string;
}

interface SerialNumberResponse {
  serialNumber: string;
  modelDescription: string;
  shopName: string;
}

interface SerialNumberError {
  status: number;
  message: string;
}

// Main API Function
export const verifySerialNumber = async (
  serialNumber: string,
): Promise<SerialNumberResponse> => {
  try {
    const response = await fetch("/api/verify-serial-number", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serialNumber } as SerialNumberRequest),
    });

    if (!response.ok) {
      const error: SerialNumberError = {
        status: response.status,
        message: `Error: ${response.status}`,
      };
      throw error;
    }

    const data = await response.json();
    return data as SerialNumberResponse;
  } catch (error) {
    if (error instanceof Object && "message" in error) {
      throw error;
    }
    throw {
      status: 500,
      message: "Failed to verify serial number",
    } as SerialNumberError;
  }
};
```

**Usage in SerialNumberStep:**

```tsx
const handleVerify = async () => {
  try {
    setIsLoading(true);
    const serialNum = watch("serialNumber");

    // Call API service
    const bikeData = await verifySerialNumber(serialNum);

    // Auto-populate form with response
    form.reset({
      ...form.getValues(),
      ...bikeData,
    });
  } catch (error) {
    const errorMsg =
      error instanceof Object && "message" in error
        ? (error as SerialNumberError).message
        : "Verification failed";

    form.setError("serialNumber", {
      message: errorMsg,
    });
  } finally {
    setIsLoading(false);
  }
};
```

---

### Service 2: Bike Registration

**File:** [src/app/registration/services/bike-registration.ts](src/app/registration/services/bike-registration.ts)

```typescript
// Type Definitions
interface BikeRegistrationResponse {
  success: boolean;
  id: string;
  message: string;
  payload?: object;
}

interface BikeRegistrationError {
  status: number;
  message: string;
}

// Main API Function
export const registerBike = async (
  data: BikeRegistrationFormData,
): Promise<BikeRegistrationResponse> => {
  try {
    // Convert Date objects to ISO strings
    const serializedData = {
      ...data,
      dateOfPurchase: data.dateOfPurchase
        ? new Date(data.dateOfPurchase).toISOString()
        : null,
      dateOfBirth: data.dateOfBirth
        ? new Date(data.dateOfBirth).toISOString()
        : null,
    };

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(serializedData),
    });

    const data = await response.json();

    if (!response.ok) {
      const error: BikeRegistrationError = {
        status: response.status,
        message: data.message || "Registration failed",
      };
      throw error;
    }

    return data as BikeRegistrationResponse;
  } catch (error) {
    if (error instanceof Object && "message" in error) {
      throw error;
    }
    throw {
      status: 500,
      message: "Registration request failed",
    } as BikeRegistrationError;
  }
};
```

**Key Feature: Date Serialization**

```tsx
// Dates are objects in form but need ISO strings for JSON
const serializedData = {
  ...data,
  dateOfPurchase: data.dateOfPurchase
    ? new Date(data.dateOfPurchase).toISOString() // "2026-01-21T00:00:00.000Z"
    : null,
  dateOfBirth: data.dateOfBirth
    ? new Date(data.dateOfBirth).toISOString()
    : null,
};
```

---

## API Route Handlers (Server-Side)

### Route 1: Serial Number Verification

**File:** [src/app/api/verify-serial-number/route.ts](src/app/api/verify-serial-number/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server";

// Mock database of bikes
const MOCK_BIKES = [
  {
    serialNumber: "SCOTT001",
    modelDescription: "Scott Scale 960",
    shopName: "Bike Shop Vienna",
  },
  {
    serialNumber: "SCOTT002",
    modelDescription: "Scott Spark 970",
    shopName: "Bike Hub Berlin",
  },
  // ... more bikes
];

export async function POST(request: NextRequest) {
  try {
    // Parse request JSON
    const { serialNumber } = await request.json();

    // Simulate database lookup delay (3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Find bike in mock database
    const bike = MOCK_BIKES.find((b) => b.serialNumber === serialNumber);

    if (!bike) {
      return NextResponse.json({ error: "Bike not found" }, { status: 404 });
    }

    // Return bike data
    return NextResponse.json({
      status_code: 200,
      data: bike,
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

**Mock Data Available for Testing:**

```
SCOTT001 → Scott Scale 960, Bike Shop Vienna
SCOTT002 → Scott Spark 970, Bike Hub Berlin
SCOTT003 → Scott Genius 900, Alpine Cycles Zurich
SCOTT004 → Scott Ransom 940, City Bikes Prague
SCOTT005 → Scott Aspect 750, Sport Shop Budapest
```

---

### Route 2: Bike Registration

**File:** [src/app/api/register/route.ts](src/app/api/register/route.ts)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { bikeRegistrationSchema } from "@/src/app/registration/schemas/registration-schema";

export async function POST(request: NextRequest) {
  try {
    // Parse request JSON
    const body = await request.json();

    // Validate with Zod schema
    const validation = bikeRegistrationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation error",
          errors: validation.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Simulate 20% failure rate
    if (Math.random() < 0.2) {
      return NextResponse.json(
        {
          success: false,
          message: "Registration failed due to system error",
        },
        { status: 500 },
      );
    }

    // Simulate 20 second processing delay
    await new Promise((resolve) => setTimeout(resolve, 20000));

    // Generate registration ID
    const registrationId = `REG-${Date.now()}`;

    // Return success response
    return NextResponse.json({
      success: true,
      id: registrationId,
      message: `Registration successful! Your registration ID is ${registrationId}`,
      payload: validation.data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Server error occurred",
      },
      { status: 500 },
    );
  }
}
```

---

## Complete Form Submission Flow

### Step-by-Step Breakdown

```
1. USER FILLS FORM (Step 3)
   ├─ firstName: "John"
   ├─ lastName: "Doe"
   ├─ email: "john@example.com"
   ├─ country: "AT"
   ├─ dateOfPurchase: 2026-01-15
   ├─ preferredLanguage: "en"
   ├─ gender: "male"
   ├─ dateOfBirth: 1990-05-20
   ├─ newsOptIn: true
   └─ consent: true

2. USER CLICKS "SUBMIT"
   └─ RegistrationForm.handleSubmit() called

3. REACT HOOK FORM VALIDATION
   ├─ Runs Zod resolver on form data
   ├─ Checks all required fields
   ├─ Validates email format
   ├─ Validates dates
   └─ Returns validation result

4. IF VALIDATION FAILS
   ├─ FormMessage shows field errors
   └─ Form does NOT submit

5. IF VALIDATION PASSES
   ├─ setIsLoading(true)
   ├─ setStepCompleted(2, true) → Step 3 marked complete
   └─ Calls registerBike(data)

6. SERIALIZE DATA FOR JSON
   ├─ Convert dateOfPurchase to ISO string
   ├─ Convert dateOfBirth to ISO string
   ├─ Create JSON request body
   └─ Send to /api/register

7. API ROUTE PROCESSING
   ├─ Parse JSON
   ├─ Validate with Zod again (server-side safety)
   ├─ Simulate 20s delay
   ├─ Simulate 20% failure rate
   ├─ Generate registration ID
   └─ Return response

8. HANDLE RESPONSE
   ├─ IF success:
   │  ├─ setConfirmation({ success: true, message: "..." })
   │  └─ nextStep() → Move to Step 4
   └─ IF error:
      ├─ setConfirmation({ success: false, message: "..." })
      └─ nextStep() → Move to Step 4 (error shown)

9. STEP 4: CONFIRMATION
   ├─ IF success: Green checkmark + success message
   └─ IF failure: Red X + error message
```

---

## Error Handling Strategy

### Error Types & Handling

```typescript
// 1. Network Errors (no internet, server down)
try {
  const response = await fetch("/api/register");
} catch (error) {
  // Error object with error.message = "Failed to fetch"
  → Show: "Network error. Check your internet connection."
}

// 2. Validation Errors (400)
if (!response.ok) {
  const data = await response.json();
  // data.message = "Validation error"
  → Show field-specific errors from validation.error.flatten()
}

// 3. Server Errors (500)
if (response.status === 500) {
  // Likely a registration failure (simulated)
  → Show: "Registration failed due to system error"
}

// 4. Business Logic Errors (custom messages)
if (!data.success) {
  // data.message = "Bike serial not found"
  → Show: "Bike serial not found"
}
```

### Error Display Locations

```tsx
// Step 1: Serial Number
form.setError("serialNumber", {
  message: "Serial number not found",
  type: "manual",
});
// Displays below serial number input

// Step 3: During submission
const errorMessage =
  error instanceof Object && "message" in error
    ? (error as BikeRegistrationError).message
    : "Registration failed";
// Displays in confirmation modal or Step 4

// Form-level field errors
<FormMessage />; // Shows Zod validation errors
```

---

## Request/Response Format

### Verify Serial Number Request/Response

**Request:**

```json
POST /api/verify-serial-number
Content-Type: application/json

{
  "serialNumber": "SCOTT001"
}
```

**Response (Success - 200):**

```json
{
  "status_code": 200,
  "data": {
    "serialNumber": "SCOTT001",
    "modelDescription": "Scott Scale 960",
    "shopName": "Bike Shop Vienna"
  }
}
```

**Response (Error - 404):**

```json
{
  "error": "Bike not found"
}
```

---

### Register Bike Request/Response

**Request:**

```json
POST /api/register
Content-Type: application/json

{
  "serialNumber": "SCOTT001",
  "modelDescription": "Scott Scale 960",
  "shopName": "Bike Shop Vienna",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "country": "AT",
  "dateOfPurchase": "2026-01-21T00:00:00.000Z",
  "preferredLanguage": "en",
  "gender": "male",
  "dateOfBirth": "1990-05-20T00:00:00.000Z",
  "newsOptIn": true,
  "consent": true
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "id": "REG-1705858745123",
  "message": "Registration successful! Your registration ID is REG-1705858745123",
  "payload": {
    "serialNumber": "SCOTT001",
    ...
  }
}
```

**Response (Validation Error - 400):**

```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "fieldErrors": {
      "email": ["Invalid email address"],
      "consent": ["You must accept the terms"]
    }
  }
}
```

**Response (Server Error - 500):**

```json
{
  "success": false,
  "message": "Registration failed due to system error"
}
```

---

## Type Safety Implementation

### TypeScript Types Flow

```
User Input (Form)
    ↓
Zod Schema Validation
    ↓
BikeRegistrationFormData Type (inferred from Zod)
    ↓
registerBike() receives typed data
    ↓
Serialization to JSON
    ↓
API Route receives body
    ↓
Server-side Zod validation
    ↓
BikeRegistrationResponse Type (from API)
    ↓
Client receives typed response
```

### Type Inference Example

```tsx
// 1. Define Zod schema
const bikeRegistrationSchema = z.object({
  serialNumber: z.string(),
  email: z.string().email(),
  dateOfBirth: z.date().nullable(),
});

// 2. Infer TypeScript type from schema
type BikeRegistrationFormData = z.infer<typeof bikeRegistrationSchema>;

// Result:
// {
//   serialNumber: string;
//   email: string;
//   dateOfBirth: Date | null;
// }

// 3. Function is fully typed
function registerBike(data: BikeRegistrationFormData) {
  // data.serialNumber is string ✓
  // data.dateOfBirth is Date | null ✓
  // data.invalidField would be TypeScript error ✗
}
```

---

## Testing API Endpoints

### Using cURL to Test Serial Verification

```bash
curl -X POST http://localhost:3000/api/verify-serial-number \
  -H "Content-Type: application/json" \
  -d '{"serialNumber":"SCOTT001"}'

# Response:
# {
#   "status_code": 200,
#   "data": {
#     "serialNumber": "SCOTT001",
#     "modelDescription": "Scott Scale 960",
#     "shopName": "Bike Shop Vienna"
#   }
# }
```

### Using cURL to Test Registration

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "serialNumber": "SCOTT001",
    "modelDescription": "Scott Scale 960",
    "shopName": "Bike Shop Vienna",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "country": "AT",
    "dateOfPurchase": "2026-01-21T00:00:00.000Z",
    "preferredLanguage": "en",
    "gender": "male",
    "dateOfBirth": "1990-05-20T00:00:00.000Z",
    "newsOptIn": true,
    "consent": true
  }'
```

---

## Continue Reading

- [Form Handling & Validation](./FORM_HANDLING.md)
- [Styling & Fonts Guide](./STYLING_FONTS.md)
