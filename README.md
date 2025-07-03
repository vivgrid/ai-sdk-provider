# Vivgrid Vercel AI SDK Provider

The official Vercel AI SDK provider for [Vivgrid](https://www.vivgrid.com/) - a global AI inference infrastructure platform.

## Installation

```bash
npm install @vivgrid/ai-sdk-provider
# or
pnpm add @vivgrid/ai-sdk-provider
# or
yarn add @vivgrid/ai-sdk-provider
```

## Setup

### 1. Obtain Your API Key

Retrieve your API key from the [Vivgrid Console](https://console.vivgrid.com/).

### 2. Set Environment Variable

```bash
export VIVGRID_API_KEY=your-api-key
```

## Usage

### Server-Managed Models and System Prompts

`Model` and `System Prompt` configurations are managed through the Vivgrid web console, eliminating the need to specify them in your code:

```typescript
import { vivgrid } from "@vivgrid/ai-sdk-provider";
import { generateText } from "ai";

const { text } = await generateText({
  // Uses the model configured in the web console
  model: vivgrid(), 
  // System prompt is automatically attached based on console configuration
  prompt: "Write a vegetable lasagna recipe for 4 people",
});

console.log(text);
```

### Streaming Text Generation

```typescript
import { vivgrid } from "@vivgrid/ai-sdk-provider";
import { streamText } from "ai";

const { textStream } = await streamText({
  model: vivgrid(),
  prompt: "Tell me a story about a brave little rabbit",
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

### Serverless LLM Functions with MCP Support

Tools (LLM Function Calling) can be written in TypeScript with strongly-typed language support. They are decoupled from the main codebase and reduce management overhead through a serverless architecture. Additionally, all tools are automatically served as MCP (Model Context Protocol) servers.

Here's how to implement a `get-weather` tool:

```typescript
const description = "Get the current weather for `city_name`";

export type Argument = {
  /**
   * The name of the city to be queried
   */
  city_name: string;
}

export async function handler(args: Argument) {
  const result = await getWeather(args.city_name);
  return result;
}
```

Then [deploy it to Vivgrid](https://docs.vivgrid.com/function-calling), and use it in your code like this:

```typescript
import { vivgrid } from "@vivgrid/ai-sdk-provider";
import { generateText } from "ai";

const { text, toolCalls } = await generateText({
  model: vivgrid(),
  prompt: "What's the weather like in San Francisco?",
  /* No need to define tools locally anymore */
  // tools: {
  //   weather: {
  //     description: "Get weather for a specified location",
  //     parameters: z.object({
  //       location: z.string().describe("City name"),
  //     }),
  //     execute: async ({ location }) => {
  //       // Actual weather API call
  //       return `The weather in ${location} is sunny, 22°C`;
  //     },
  //   },
  // },
});
```

You can explore more [Serverless LLM Function examples](https://github.com/yomorun/llm-function-calling-examples) and deploy them to Vivgrid with one click.

### Object Generation

```typescript
import { vivgrid } from "@vivgrid/ai-sdk-provider";
import { generateObject } from "ai";
import { z } from "zod";

const { object } = await generateObject({
  model: vivgrid(),
  schema: z.object({
    recipe: z.object({
      name: z.string(),
      ingredients: z.array(
        z.object({
          name: z.string(),
          amount: z.string(),
        })
      ),
      steps: z.array(z.string()),
    }),
  }),
  prompt: "Generate a pasta recipe",
});

console.log(object.recipe);
```

## Model Management

All AI model selection and configuration is managed through the [Vivgrid Console](https://www.vivgrid.com/). You can:

- Select and switch between different AI models (OpenAI, Anthropic Claude, etc.)
- Configure model parameters
- Manage usage quotas
- Monitor usage statistics

This approach provides the flexibility to switch and manage models without modifying your codebase.

## Features

- ✅ Server-managed models
- ✅ Server-managed system prompts
- ✅ Build LLM functions with strongly-typed language support
- ✅ Serverless tools / MCP integration
- ✅ Globally deployed models and tools
- ✅ Text generation
- ✅ Streaming text generation
- ✅ Object generation (structured outputs)
- ✅ JSON mode
- ✅ OpenAI API compatible

## Advanced Configuration

### JSON Mode

```typescript
const model = vivgrid({
  jsonMode: true, // Forces the model to output valid JSON
});
```

### Structured Outputs

```typescript
const model = vivgrid({
  structuredOutputs: true, // Enables structured outputs (default: true)
});
```

## Error Handling

```typescript
try {
  const { text } = await generateText({
    model: vivgrid(),
    prompt: "Hello",
  });
} catch (error) {
  if (error instanceof Error) {
    console.error("Error:", error.message);
  }
}
```

## Contributing

We welcome issues and pull requests! Please feel free to contribute to this project.

## License

MIT

## Links

- [Vivgrid Website](https://www.vivgrid.com/)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/)
- [GitHub Repository](https://github.com/vivgrid/vivgrid-ai-provider)
