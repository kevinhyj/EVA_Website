import { NextRequest, NextResponse } from "next/server";

// API endpoint configuration
const API_BASE_URL = process.env.API_URL || "http://localhost:8001";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Map frontend mode to backend task_type
    const modeToTaskType: Record<string, string> = {
      // New composite mode names
      'clm-generate': 'generate',
      'clm-scoring': 'scoring',
      'glm-infill': 'infill',
      // Legacy format for backward compatibility
      'clm': 'generate',
      'glm': 'infill',
      'predict': 'scoring',
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

    // Add taxid if provided (for species-specific generation)
    if (body.taxid) {
      transformedBody.taxid = body.taxid;
    }

    // Build parameters: check top-level camelCase fields OR nested parameters object
    // Frontend sends parameters nested inside a "parameters" object
    const srcParams = body.parameters || {};
    const hasTemp = body.temperature !== undefined || srcParams.temperature !== undefined;
    const hasTopK = body.topK !== undefined || srcParams.top_k !== undefined || srcParams.topK !== undefined;
    const hasMaxLen = body.maxLength !== undefined || srcParams.max_length !== undefined || srcParams.maxLength !== undefined;

    if (hasTemp || hasTopK || hasMaxLen) {
      transformedBody.parameters = {
        temperature: body.temperature ?? srcParams.temperature ?? 0.7,
        top_k: body.topK ?? srcParams.top_k ?? srcParams.topK ?? 50,
        max_length: body.maxLength ?? srcParams.max_length ?? srcParams.maxLength ?? 200,
      };
    } else if (Object.keys(srcParams).length > 0) {
      // Pass through any other parameters as-is
      transformedBody.parameters = { ...srcParams };
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
