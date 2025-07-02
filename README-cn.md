# Vivgrid Vercel AI SDK Provider

Vercel AI SDK provider for [vivgrid](https://www.vivgrid.com/) - Global AI Inference Infrastructure platform.

## 安装

```bash
npm install vivgrid-ai-provider
# 或
pnpm add vivgrid-ai-provider
# 或
yarn add vivgrid-ai-provider
```

## 设置

### 1. 获取 API 密钥

从 [vivgrid 控制台](https://www.vivgrid.com/) 获取你的 API 密钥。

### 2. 配置环境变量

```bash
export VIVGRID_API_KEY=your-api-key
```

## 使用

### 基本文本生成

所有模型配置都在 vivgrid 网页控制台中管理，代码中不需要指定模型 ID：

```typescript
import { vivgrid } from "vivgrid-ai-provider";
import { generateText } from "ai";

const { text } = await generateText({
  model: vivgrid(), // 使用网页配置的模型
  prompt: "写一个蔬菜烤宽面条的食谱（4人份）",
});

console.log(text);
```

### 流式文本生成

```typescript
import { vivgrid } from "vivgrid-ai-provider";
import { streamText } from "ai";

const { textStream } = await streamText({
  model: vivgrid(),
  prompt: "给我讲一个关于勇敢小兔子的故事",
});

for await (const textPart of textStream) {
  process.stdout.write(textPart);
}
```

### 自定义配置

```typescript
import { createVivgrid } from "vivgrid-ai-provider";

const vivgrid = createVivgrid({
  apiKey: "your-api-key", // 可选，默认使用 VIVGRID_API_KEY 环境变量
  baseURL: "https://api.vivgrid.com/v1", // 可选，自定义 API 端点
  headers: {
    // 可选，自定义请求头
    "X-Custom-Header": "value",
  },
});

const model = vivgrid();
```

### 对象生成

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
  prompt: "生成一个意大利面食谱",
});

console.log(object.recipe);
```

### 工具调用（Tool Calling）

```typescript
import { vivgrid } from "vivgrid-ai-provider";
import { generateText } from "ai";

const { text, toolCalls } = await generateText({
  model: vivgrid(),
  prompt: "旧金山的天气如何？",
  tools: {
    weather: {
      description: "获取指定地点的天气",
      parameters: z.object({
        location: z.string().describe("城市名称"),
      }),
      execute: async ({ location }) => {
        // 实际的天气 API 调用
        return `${location}的天气是晴天，温度 22°C`;
      },
    },
  },
});
```

## 模型管理

所有 AI 模型的选择和配置都在 [vivgrid 控制台](https://www.vivgrid.com/) 中进行管理。你可以在控制台中：

- 选择和切换不同的 AI 模型（OpenAI、Anthropic Claude 等）
- 配置模型参数
- 管理使用配额
- 监控使用情况

这种方式让你可以在不修改代码的情况下灵活切换和管理模型。

## 特性

- ✅ 文本生成
- ✅ 流式文本生成
- ✅ 对象生成（结构化输出）
- ✅ 工具调用
- ✅ JSON 模式
- ✅ 兼容 OpenAI API 格式

## 高级配置

### JSON 模式

```typescript
const model = vivgrid({
  jsonMode: true, // 强制模型输出有效的 JSON
});
```

### 结构化输出

```typescript
const model = vivgrid({
  structuredOutputs: true, // 启用结构化输出（默认为 true）
});
```

## 错误处理

```typescript
try {
  const { text } = await generateText({
    model: vivgrid(),
    prompt: "Hello",
  });
} catch (error) {
  if (error instanceof Error) {
    console.error("错误:", error.message);
  }
}
```

## 贡献

欢迎提交 issue 和 pull request！

## 许可证

MIT

## 链接

- [vivgrid 官网](https://www.vivgrid.com/)
- [Vercel AI SDK 文档](https://sdk.vercel.ai/)
- [GitHub 仓库](https://github.com/vivgrid/vivgrid-ai-provider)
