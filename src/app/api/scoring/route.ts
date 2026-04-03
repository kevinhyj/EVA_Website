import { NextRequest, NextResponse } from "next/server";

// API endpoint configuration - proxy to FastAPI backend
const API_BASE_URL = process.env.API_URL || "http://localhost:8001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sequence, species, rnaTypeId } = body;

    // Validate required fields
    if (!sequence) {
      return NextResponse.json(
        { error: "Sequence is required" },
        { status: 400 }
      );
    }

    if (!rnaTypeId) {
      return NextResponse.json(
        { error: "rnaTypeId is required" },
        { status: 400 }
      );
    }

    // Transform to backend format
    const transformedBody: any = {
      task_type: 'scoring',
      rna_type: rnaTypeId,
      sequence,
    };

    if (species) {
      transformedBody.species = species;
    }

    // Forward request to backend API
    const response = await fetch(`${API_BASE_URL}/api/task/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transformedBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to submit task" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Scoring API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to connect to backend API" },
      { status: 500 }
    );
  }
}
