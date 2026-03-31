import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_URL || "http://localhost:8001";

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;

  try {
    const response = await fetch(`${API_BASE_URL}/api/task/${taskId}/progress`, {
      headers: { "Content-Type": "application/json" },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Progress fetch error:", error);
    return NextResponse.json(
      { progress: null, nucleotides: null, max_length: null, step: null, message: "Failed to fetch progress" },
      { status: 500 }
    );
  }
}
