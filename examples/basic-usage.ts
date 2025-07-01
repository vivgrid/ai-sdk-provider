import { generateObject, generateText, streamText } from "ai";
import { z } from "zod";
import { vivgrid } from "../dist/index.js";

async function main() {
  // 设置 API 密钥（也可以通过环境变量 VIVGRID_API_KEY 设置）
  // const vivgridCustom = createVivgrid({ apiKey: 'your-api-key' });

  console.log("=== 基本文本生成示例 ===");
  try {
    const { text } = await generateText({
      model: vivgrid(), // 使用网页配置的模型
      prompt: "用简洁的语言解释什么是人工智能。",
    });
    console.log("生成的文本:", text);
  } catch (error) {
    console.error("文本生成错误:", error);
  }

  console.log("\n=== 流式文本生成示例 ===");
  try {
    const { textStream } = await streamText({
      model: vivgrid(),
      prompt: "写一个关于勇敢的小猫的短故事（100字左右）。",
    });

    process.stdout.write("流式输出: ");
    for await (const textPart of textStream) {
      process.stdout.write(textPart);
    }
    console.log("\n");
  } catch (error) {
    console.error("流式生成错误:", error);
  }

  console.log("\n=== 对象生成示例 ===");
  try {
    const { object } = await generateObject({
      model: vivgrid(),
      schema: z.object({
        name: z.string().describe("菜品名称"),
        ingredients: z.array(z.string()).describe("所需食材"),
        difficulty: z.enum(["简单", "中等", "困难"]).describe("难度等级"),
        cookingTime: z.number().describe("烹饪时间（分钟）"),
      }),
      prompt: "生成一个中式家常菜的食谱信息",
    });
    console.log("生成的对象:", JSON.stringify(object, null, 2));
  } catch (error) {
    console.error("对象生成错误:", error);
  }

  console.log("\n=== 工具调用示例 ===");
  try {
    const { text, toolCalls, toolResults } = await generateText({
      model: vivgrid(),
      prompt: "帮我计算 123 + 456 的结果",
      tools: {
        calculate: {
          description: "执行数学计算",
          parameters: z.object({
            expression: z.string().describe("数学表达式"),
          }),
          execute: async ({ expression }) => {
            // 简单的计算实现 - 仅支持基本的加减乘除
            try {
              // 移除所有空格并检查是否只包含数字和运算符
              const cleanExpr = expression.replace(/\s/g, "");
              if (!/^[\d+\-*/().]+$/.test(cleanExpr)) {
                return "计算错误：只支持基本的数学运算";
              }

              // 使用 Function 构造函数作为更安全的替代
              const result = new Function(`return ${cleanExpr}`)();
              return `计算结果: ${expression} = ${result}`;
            } catch {
              return "计算错误：无效的表达式";
            }
          },
        },
      },
    });

    console.log("AI 回复:", text);
    if (toolCalls && toolCalls.length > 0) {
      console.log("调用的工具:", toolCalls);
    }
    if (toolResults && toolResults.length > 0) {
      console.log("工具结果:", toolResults);
    }
  } catch (error) {
    console.error("工具调用错误:", error);
  }
}

// 运行示例
main().catch(console.error);
