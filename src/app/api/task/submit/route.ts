import { NextRequest, NextResponse } from "next/server";

// API endpoint configuration
const API_BASE_URL = process.env.API_URL || "http://localhost:8001";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Map frontend mode to backend task_type
    const modeToTaskType: Record<string, string> = {
      'clm': 'generate',
      'glm': 'infill',
      'predict': 'scoring'
    };

    // If mode is provided, convert to task_type
    if (body.mode && !body.task_type) {
      body.task_type = modeToTaskType[body.mode];
    }

    // Map rnaTypeId to rna_type
    if (body.rnaTypeId && !body.rna_type) {
      body.rna_type = body.rnaTypeId;
    }

    // Validate required fields
    if (!body.task_type) {
      return NextResponse.json(
        { error: "task_type or mode is required" },
        { status: 400 }
      );
    }

    if (!body.rna_type) {
      return NextResponse.json(
        { error: "rna_type or rnaTypeId is required" },
        { status: 400 }
      );
    }

    // Transform parameters to backend format
    const transformedBody: any = {
      task_type: body.task_type,
      rna_type: body.rna_type,
    };

    // Add sequence if provided
    if (body.sequence) {
      transformedBody.sequence = body.sequence;
    }

    // Convert <mask> tokens to [MASK] for infill tasks (backend expects [MASK])
    if (transformedBody.sequence && transformedBody.task_type === 'infill') {
      transformedBody.sequence = transformedBody.sequence.replace(/<mask>/gi, '[MASK]');
    }

    // Add species if provided
    if (body.species) {
      transformedBody.species = body.species;
    }

    // Transform parameters (convert camelCase to snake_case)
    if (body.temperature !== undefined || body.topK !== undefined || body.maxLength !== undefined) {
      transformedBody.parameters = {
        temperature: body.temperature,
        top_k: body.topK,
        max_length: body.maxLength
      };
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
    console.error("Task submission error:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend API" },
      { status: 500 }
    );
  }
}
