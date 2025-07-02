# Vivgrid Vercel AI SDK Provider

**[中文文档](README-cn.md) | English**

Vercel AI SDK provider for [vivgrid](https://www.vivgrid.com/) - Global AI Inference Infrastructure platform.

## Installation

```bash
npm install vivgrid-ai-provider
# or
pnpm add vivgrid-ai-provider
# or
yarn add vivgrid-ai-provider
```

## Setup

### 1. Get API Key

Get your API key from the [vivgrid console](https://www.vivgrid.com/).

### 2. Configure Environment Variable

```bash
export VIVGRID_API_KEY=your-api-key
```

## Usage

### Basic Text Generation

All model configurations are managed in the vivgrid web console, no need to specify model ID in code:

```typescript
import { vivgrid } from "vivgrid-ai-provider";
import { generateText } from "ai";

const { text } = await generateText({
  model: vivgrid(), // Use the model configured in the web console
  prompt: "Write a vegetable lasagna recipe for 4 people",
});

console.log(text);
```

### Streaming Text Generation

```typescript
import { vivgrid } from "vivgrid-ai-provider";
import { streamText } from "ai";

const { textStream } = await streamText({
  model: vivgrid(),
  prompt: "Tell me a story about a brave little rabbit",
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

### Custom Configuration

```typescript
import { createVivgrid } from "vivgrid-ai-provider";

const vivgrid = createVivgrid({
  apiKey: "your-api-key", // Optional, defaults to VIVGRID_API_KEY environment variable
  baseURL: "https://api.vivgrid.com/v1", // Optional, custom API endpoint
  headers: {
    // Optional, custom request headers
    "X-Custom-Header": "value",
  },
});

const model = vivgrid();
```

### Object Generation

```typescript
import { vivgrid } from "vivgrid-ai-provider";
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

### Tool Calling

```typescript
import { vivgrid } from "vivgrid-ai-provider";
import { generateText } from "ai";

const { text, toolCalls } = await generateText({
  model: vivgrid(),
  prompt: "What's the weather like in San Francisco?",
  tools: {
    weather: {
      description: "Get weather for a specified location",
      parameters: z.object({
        location: z.string().describe("City name"),
      }),
      execute: async ({ location }) => {
        // Actual weather API call
        return `The weather in ${location} is sunny, 22°C`;
      },
    },
  },
});
```

## Model Management

All AI model selection and configuration is managed in the [vivgrid console](https://www.vivgrid.com/). You can:

- Select and switch between different AI models (OpenAI, Anthropic Claude, etc.)
- Configure model parameters
- Manage usage quotas
- Monitor usage statistics

This approach allows you to flexibly switch and manage models without modifying your code.

## Features

- ✅ Text generation
- ✅ Streaming text generation
- ✅ Object generation (structured outputs)
- ✅ Tool calling
- ✅ JSON mode
- ✅ OpenAI API compatible

## Advanced Configuration

### JSON Mode

```typescript
const model = vivgrid({
  jsonMode: true, // Force model to output valid JSON
});
```

### Structured Outputs

```typescript
const model = vivgrid({
  structuredOutputs: true, // Enable structured outputs (default: true)
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

Issues and pull requests are welcome!

## License

MIT

## Links

- [vivgrid Website](https://www.vivgrid.com/)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/)
- [GitHub Repository](https://github.com/vivgrid/vivgrid-ai-provider)
