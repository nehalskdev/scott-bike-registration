import { NextRequest, NextResponse } from "next/server";

import { BikeModel } from "@/src/app/registration/schemas/types";

const mockData: BikeModel[] = [
  {
    serialNumber: "STM34D30L24110132N",
    modelDescription: "Bike Spark RC World Cup (TW) IGPG/L",
    shopName: "BMN SPORTECH",
  },
  {
    serialNumber: "STR30A20L24110345N",
    modelDescription: "Bike Solace Gravel 10 (EU) eRIDE HMX",
    shopName: "Sports Megève",
  },
  {
    serialNumber: "SCR29A20M24110345N",
    modelDescription: "Bike Foil RC Pro (TW)",
    shopName: "Tri bike Genève",
  },
  {
    serialNumber: "SCR33A20M24110345N",
    modelDescription: "Bike Addict Gravel RC",
    shopName: "C'est gravel ou pas SARL",
  },
  {
    serialNumber: "SGM07F20M24110345N",
    modelDescription: "Bike Gambler RC",
    shopName: "Avalanche Sports",
  },
];

// Helper function to fake delay from loading data from db
const delay = (ms: number): Promise<unknown> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const { serialNumber } = await request.json();

    if (!serialNumber) {
      return new Response(
        JSON.stringify({ error: "serialNumber is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // fake 3-second delay
    await delay(3000);

    const item = mockData.find(
      (item) =>
        item.serialNumber.toLowerCase() === serialNumber.trim().toLowerCase(),
    );

    if (item) {
      return NextResponse.json(
        { data: item, status_code: 200 },
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } else {
      return NextResponse.json(
        {
          error: "Your Serial Number is wrong. Please check and try again.",
          status_code: 404,
        },
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error", status_code: 500 },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
