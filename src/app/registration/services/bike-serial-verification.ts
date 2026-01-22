import { BikeModel } from "@/src/app/registration/schemas/types";
import { BASE_URL } from "@/src/lib/utils";

export type SerialNumberRequest = { serialNumber: string };
export type SerialNumberResponse = {
  data: BikeModel;
  status_code: number;
};

export type SerialNumberError = {
  error: string;
  status_code: number;
};

/**
 * Verifies bike serial number by calling the backend API
 * @param serialNumber - The bike serial number to verify
 * @returns Promise containing bike details or error
 * @throws Error if the serial number is invalid
 */
export async function verifySerialNumber(
  serialNumber: string,
): Promise<SerialNumberResponse> {
  const request: SerialNumberRequest = { serialNumber };

  const response = await fetch(`${BASE_URL}/verify-serial-number`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = (await response.json()) as SerialNumberError;
    throw new Error(errorData.error || "Failed to verify serial number");
  }

  const data = (await response.json()) as SerialNumberResponse;
  return data;
}
