import { NextRequest, NextResponse } from "next/server";

// API endpoint configuration - proxy to FastAPI backend
const API_BASE_URL = process.env.API_URL || "http://localhost:8001";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sequence, species, temperature, topK, maxLength, mode, rnaTypeId, taskId } = body;

    // Validate required fields
    if (!rnaTypeId) {
      return NextResponse.json(
        { error: "rnaTypeId is required" },
        { status: 400 }
      );
    }

    // Map mode to task_type
    const modeToTaskType: Record<string, string> = {
      'clm': 'generate',
      'glm': 'infill',
      'clm-generate': 'generate',
      'glm-infill': 'infill',
    };
    const task_type = modeToTaskType[mode || 'clm'] || 'generate';

    // Build parameters
    const params: any = {};
    if (temperature !== undefined) params.temperature = temperature;
    if (topK !== undefined) params.top_k = topK;
    if (maxLength !== undefined) params.max_length = maxLength;

    // Transform to backend format
    const transformedBody: any = {
      task_type,
      rna_type: rnaTypeId,
    };

    if (sequence) {
      // Convert <mask> tokens to [MASK] for infill tasks
      if (task_type === 'infill') {
        transformedBody.sequence = sequence.replace(/<mask>/gi, '[MASK]');
      } else {
        transformedBody.sequence = sequence;
      }
    }

    if (species) {
      transformedBody.species = species;
    }

    if (Object.keys(params).length > 0) {
      transformedBody.parameters = params;
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
    console.error("Generate API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to connect to backend API" },
      { status: 500 }
    );
  }
}
