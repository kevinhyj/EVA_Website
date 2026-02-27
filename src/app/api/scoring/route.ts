import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

export async function POST(request: NextRequest) {
  let curTaskId = "";
  let outputDir = "";
  let checkPointDir = "";

  try {
    const body = await request.json();
    const { sequence, species, temperature, topK, maxLength, mode, rnaTypeId, taskId } = body;
    //const { sequence, species, rnaTypeId, taskId } = body;
    curTaskId = body.taskId || "";

    if (!sequence) {
      return NextResponse.json(
        { error: "Sequence is required" },
        { status: 400 }
      );
    }

    if (!curTaskId) {
      return NextResponse.json(
        { error: "taskId is required" },
        { status: 400 }
      );
    }

    // 输出目录路径
    outputDir = path.join("data/output", curTaskId);
    checkPointDir = path.join("model", rnaTypeId);

    // 确保输出目录存在
    fs.mkdirSync(outputDir, { recursive: true });

    // 写入 task_state: 1 = running
    fs.writeFileSync(path.join(outputDir, "task_state"), "1");

    // 将 sequence 保存为 fasta 文件
    if (sequence) {
      const fastaContent = `>${curTaskId}\n${sequence}`;
      fs.writeFileSync(path.join(outputDir, "input.fa"), fastaContent);
    }

    // 构建 Python 脚本路径
    //const scriptPath = path.join(process.cwd(), "..", "web", "predict.py");
    //  ../../rna_benchmark/rnaverse_web/tools/
    const scriptPath = path.join(process.cwd(), "/rna-multiverse/rnaverse_web/tools", "predict.py");

    // 构建参数
    const args = [
      scriptPath,
      "--checkpoint", checkPointDir,
      //"--sequence", sequence,
      "--species", species || "",
      "--rna_type", rnaTypeId || "",
      "--output", outputDir,
    ];

    // 当 sequence 不为空时，添加 --input 参数
    if (sequence) {
      args.push("--input", path.join(outputDir, "input.fa"));
    }

    // 等待 Python 脚本执行完成
    await new Promise<void>((resolve) => {
      const pythonProcess = spawn("python", args);

      // 将 Python 控制台输出直接输出到 Nginx 进程控制台
      pythonProcess.stdout.on("data", (data) => {
        process.stdout.write(data.toString());
      });

      pythonProcess.stderr.on("data", (data) => {
        process.stderr.write(data.toString());
      });

      pythonProcess.on("close", () => {
        resolve();
      });

      pythonProcess.on("error", () => {
        resolve();
      });
    });

    // 脚本执行完毕，检查结果文件是否存在
    const resultFile = path.join(outputDir, "result.json");
    if (fs.existsSync(resultFile)) {
      // 写入 task_state: 2 = completed
      fs.writeFileSync(path.join(outputDir, "task_state"), "2");

      // 读取结果
      const resultContent = fs.readFileSync(resultFile, "utf-8");
      try {
        const result = JSON.parse(resultContent);
        return NextResponse.json({
          message: "Task completed",
          taskId: curTaskId,
          status: "completed",
          ...result
        });
      } catch {
        return NextResponse.json({
          message: "Task completed",
          taskId: curTaskId,
          status: "completed",
          result: resultContent
        });
      }
    } else {
      // 结果文件不存在，写入 task_state: 3 = failed
      fs.writeFileSync(path.join(outputDir, "task_state"), "3");
      return NextResponse.json({
        message: "Task completed but no result file",
        taskId: curTaskId,
        status: "completed_no_result"
      });
    }

  } catch (error) {
    console.error("Scoring API error:", error);
    // 写入 task_state: 3 = failed
    if (curTaskId && outputDir) {
      try {
        fs.writeFileSync(path.join(outputDir, "task_state"), "3");
      } catch {
        // 忽略文件写入错误
      }
    }
    // 返回任务完成但不抛出异常
    return NextResponse.json({
      message: "Task completed with error",
      taskId: curTaskId,
      status: "completed_with_error",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
