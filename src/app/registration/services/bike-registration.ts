import { type BikeRegistrationFormData } from "@/src/app/registration/schemas/registration-schema";
import { BASE_URL } from "@/src/lib/utils";

export type BikeRegistrationResponse = {
  success: boolean;
  id?: string;
  message: string;
  payload?: unknown;
};

export type BikeRegistrationError = {
  success: boolean;
  message: string;
  errors?: Record<string, unknown>;
};

/**
 * Registers a bike with user information
 * @param data - The complete bike registration form data
 * @returns Promise containing registration response with success status
 * @throws BikeRegistrationError if registration fails
 */
export async function registerBike(
  data: BikeRegistrationFormData,
): Promise<BikeRegistrationResponse> {
  // Convert Date objects to ISO strings for JSON serialization
  const serialized = {
    ...data,
    dateOfPurchase:
      data.dateOfPurchase instanceof Date
        ? data.dateOfPurchase.toISOString()
        : data.dateOfPurchase,
    dateOfBirth:
      data.dateOfBirth instanceof Date
        ? data.dateOfBirth.toISOString()
        : data.dateOfBirth,
  };

  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(serialized),
  });

  const responseData = (await response.json()) as
    | BikeRegistrationResponse
    | BikeRegistrationError;

  if (!response.ok) {
    throw responseData as BikeRegistrationError;
  }

  return responseData as BikeRegistrationResponse;
}
