import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    // 输出目录路径
    const outputDir = path.join("data/output", taskId);

    // 检查目录是否存在
    if (fs.existsSync(outputDir)) {
      // 删除目录及其内容
      //fs.rmSync(outputDir, { recursive: true, force: true });
      return NextResponse.json({
        message: "Output directory deleted",
        taskId: taskId
      });
    } else {
      return NextResponse.json({
        message: "Output directory not found",
        taskId: taskId
      });
    }
  } catch (error) {
    console.error("Delete output API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete output directory" },
      { status: 500 }
    );
  }
}
