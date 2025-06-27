import { aiService } from "@/lib/ai";
import { NextResponse } from "next/server";
import { getCarById } from "@/lib/actions/cars-action";

export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
  try {
    const { query } = await request.json();
    const result = await aiService.searchAgent(query);

    // If result is a string, try to split it into multiple IDs
    if (typeof result === "string") {
      // Remove newlines and trim
      const trimmed = result.trim();
      // Split by comma, space, or newline to get multiple IDs
      const ids = trimmed.split(/[\s,]+/).filter(id => id.length > 0);
      // Fetch all cars by ID
      const cars = await Promise.all(
        ids.map(async (id) => {
          const car = await getCarById(id.trim());
          return car;
        })
      );
      // Filter out nulls (cars not found)
      const validCars = cars.filter(car => car !== null);
      if (validCars.length > 0) return NextResponse.json(validCars);
      return NextResponse.json({ error: "No cars found" }, { status: 404 });
    }

    // If result is already an array of cars, return it
    if (Array.isArray(result)) {
      return NextResponse.json(result);
    }

    // If result is a single car, wrap it in an array
    if (result && typeof result === "object" && "id" in result) {
      return NextResponse.json([result]);
    }

    // If no cars found, return an error
    return NextResponse.json({ error: "No cars found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 404 }
    );
  }
}
