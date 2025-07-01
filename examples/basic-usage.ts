import { generateObject, generateText, streamText } from "ai";
import { z } from "zod";
import { vivgrid } from "../dist/index.js";

async function main() {
  // Set API key (can also be set via environment variable VIVGRID_API_KEY)
  // const vivgridCustom = createVivgrid({ apiKey: 'your-api-key' });

  console.log("=== Basic Text Generation Example ===");
  try {
    const { text } = await generateText({
      model: vivgrid(), // Use the model configured in the web console
      prompt: "Explain what artificial intelligence is in simple terms.",
    });
    console.log("Generated text:", text);
  } catch (error) {
    console.error("Text generation error:", error);
  }

  console.log("\n=== Streaming Text Generation Example ===");
  try {
    const { textStream } = await streamText({
      model: vivgrid(),
      prompt:
        "Write a short story about a brave little cat (around 100 words).",
    });

    process.stdout.write("Streaming output: ");
    for await (const textPart of textStream) {
      process.stdout.write(textPart);
    }
    console.log("\n");
  } catch (error) {
    console.error("Streaming generation error:", error);
  }

  console.log("\n=== Object Generation Example ===");
  try {
    const { object } = await generateObject({
      model: vivgrid(),
      schema: z.object({
        name: z.string().describe("dish name"),
        ingredients: z.array(z.string()).describe("required ingredients"),
        difficulty: z
          .enum(["easy", "medium", "hard"])
          .describe("difficulty level"),
        cookingTime: z.number().describe("cooking time in minutes"),
      }),
      prompt: "Generate recipe information for a home-style dish",
    });
    console.log("Generated object:", JSON.stringify(object, null, 2));
  } catch (error) {
    console.error("Object generation error:", error);
  }

  console.log("\n=== Tool Calling Example ===");
  try {
    const { text, toolCalls, toolResults } = await generateText({
      model: vivgrid(),
      prompt: "Help me calculate the result of 123 + 456",
      tools: {
        calculate: {
          description: "Perform mathematical calculations",
          parameters: z.object({
            expression: z.string().describe("mathematical expression"),
          }),
          execute: async ({ expression }) => {
            // Simple calculation implementation - only supports basic arithmetic
            try {
              // Remove all spaces and check if it only contains numbers and operators
              const cleanExpr = expression.replace(/\s/g, "");
              if (!/^[\d+\-*/().]+$/.test(cleanExpr)) {
                return "Calculation error: Only basic mathematical operations are supported";
              }

              // Use Function constructor as a safer alternative
              const result = new Function(`return ${cleanExpr}`)();
              return `Calculation result: ${expression} = ${result}`;
            } catch {
              return "Calculation error: Invalid expression";
            }
          },
        },
      },
    });

    console.log("AI response:", text);
    if (toolCalls && toolCalls.length > 0) {
      console.log("Tools called:", toolCalls);
    }
    if (toolResults && toolResults.length > 0) {
      console.log("Tool results:", toolResults);
    }
  } catch (error) {
    console.error("Tool calling error:", error);
  }
}

// Run examples
main().catch(console.error);
