import {
  type LanguageModelV1,
  type LanguageModelV1CallWarning,
  type LanguageModelV1FinishReason,
  type LanguageModelV1StreamPart,
  UnsupportedFunctionalityError,
} from '@ai-sdk/provider'
import {
  createEventSourceResponseHandler,
  createJsonResponseHandler,
  type ParseResult,
  postJsonToApi,
} from '@ai-sdk/provider-utils'
import { z } from 'zod'
import { convertToVivgridChatMessages } from './convert-to-vivgrid-chat-messages'
import { mapOpenAIFinishReason } from './map-openai-finish-reason'
import type { VivgridChatModelId, VivgridChatSettings } from './vivgrid-chat-settings'

type VivgridChatConfig = {
  provider: string
  baseURL: string
  headers: () => Record<string, string | undefined>
  generateId: () => string
}

export class VivgridChatLanguageModel implements LanguageModelV1 {
  readonly specificationVersion = 'v1'
  readonly defaultObjectGenerationMode = 'json'

  readonly modelId: string
  readonly settings: VivgridChatSettings

  private readonly config: VivgridChatConfig

  constructor(
    _modelId: VivgridChatModelId,
    settings: VivgridChatSettings,
    config: VivgridChatConfig,
  ) {
    this.modelId = 'vivgrid-model'
    this.settings = settings
    this.config = config
  }

  get provider(): string {
    return this.config.provider
  }

  private getArgs({
    mode,
    prompt,
    maxTokens,
    temperature,
    topP,
    topK,
    frequencyPenalty,
    presencePenalty,
    stopSequences,
    responseFormat,
    seed,
  }: Parameters<LanguageModelV1['doGenerate']>[0]) {
    const type = mode.type

    const warnings: LanguageModelV1CallWarning[] = []

    if (topK != null) {
      warnings.push({
        type: 'unsupported-setting',
        setting: 'topK',
      })
    }

    if (responseFormat != null && responseFormat.type === 'json' && responseFormat.schema != null) {
      warnings.push({
        type: 'unsupported-setting',
        setting: 'responseFormat',
        details: 'JSON response format schema is not supported',
      })
    }

    const baseArgs = {
      // 不包含 model 字段，使用网页配置的模型
      // 映射为 OpenAI 兼容的格式
      messages: convertToVivgridChatMessages(prompt),
      temperature,
      top_p: topP,
      frequency_penalty: frequencyPenalty,
      presence_penalty: presencePenalty,
      max_tokens: maxTokens,
      seed,
      stop: stopSequences,
    }

    switch (type) {
      case 'regular': {
        // 处理 JSON 模式
        if (this.settings.jsonMode || responseFormat?.type === 'json') {
          return {
            args: {
              ...baseArgs,
              response_format: { type: 'json_object' },
            },
            warnings,
          }
        }

        return {
          args: baseArgs,
          warnings,
        }
      }

      case 'object-json': {
        return {
          args: {
            ...baseArgs,
            response_format: { type: 'json_object' },
          },
          warnings,
        }
      }

      case 'object-tool': {
        if (this.settings.structuredOutputs === false) {
          throw new UnsupportedFunctionalityError({
            functionality: 'structuredOutputs = false',
          })
        }

        return {
          args: {
            ...baseArgs,
            tool_choice: 'required',
            tools: [
              {
                type: 'function',
                function: {
                  name: mode.tool.name,
                  description: mode.tool.description,
                  parameters: mode.tool.parameters,
                },
              },
            ],
          },
          warnings,
        }
      }

      default: {
        const _exhaustiveCheck: never = type
        throw new Error(`Unsupported type: ${_exhaustiveCheck}`)
      }
    }
  }

  async doGenerate(
    options: Parameters<LanguageModelV1['doGenerate']>[0],
  ): Promise<Awaited<ReturnType<LanguageModelV1['doGenerate']>>> {
    const { args, warnings } = this.getArgs(options)

    const { value: response } = await postJsonToApi({
      url: `${this.config.baseURL}/chat/completions`,
      headers: this.config.headers(),
      body: args,
      failedResponseHandler: createJsonResponseHandler(vivgridErrorDataSchema) as any,
      successfulResponseHandler: createJsonResponseHandler(vivgridChatResponseSchema),
      abortSignal: options.abortSignal,
    })

    const choice = response.choices[0]

    return {
      text: choice.message.content ?? undefined,
      toolCalls:
        choice.message.tool_calls?.map((toolCall) => ({
          toolCallType: 'function',
          toolCallId: toolCall.id,
          toolName: toolCall.function.name,
          args: JSON.stringify(toolCall.function.arguments),
        })) ?? [],
      finishReason: mapOpenAIFinishReason(choice.finish_reason),
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
      },
      rawCall: { rawPrompt: args, rawSettings: {} },
      warnings,
    }
  }

  async doStream(
    options: Parameters<LanguageModelV1['doStream']>[0],
  ): Promise<Awaited<ReturnType<LanguageModelV1['doStream']>>> {
    const { args, warnings } = this.getArgs(options)

    const { value: response } = await postJsonToApi({
      url: `${this.config.baseURL}/chat/completions`,
      headers: this.config.headers(),
      body: {
        ...args,
        stream: true,
        stream_options: {
          include_usage: true,
        },
      },
      failedResponseHandler: createJsonResponseHandler(vivgridErrorDataSchema) as any,
      successfulResponseHandler: createEventSourceResponseHandler(vivgridChatStreamChunkSchema),
      abortSignal: options.abortSignal,
    })

    let finishReason: LanguageModelV1FinishReason = 'other'
    let usage: { promptTokens: number; completionTokens: number } = {
      promptTokens: Number.NaN,
      completionTokens: Number.NaN,
    }

    const toolCalls: Array<{
      toolCallId: string
      toolName: string
      args: string
    }> = []

    return {
      stream: response.pipeThrough(
        new TransformStream<
          ParseResult<z.infer<typeof vivgridChatStreamChunkSchema>>,
          LanguageModelV1StreamPart
        >({
          transform(chunk, controller) {
            if (!chunk.success) {
              controller.enqueue({ type: 'error', error: chunk.error })
              return
            }

            const value = chunk.value

            if (value.choices?.length > 0) {
              const choice = value.choices[0]

              if (choice.finish_reason != null) {
                finishReason = mapOpenAIFinishReason(choice.finish_reason)
              }

              if (choice.delta?.content != null) {
                controller.enqueue({
                  type: 'text-delta',
                  textDelta: choice.delta.content,
                })
              }

              if (choice.delta?.tool_calls != null) {
                for (const toolCallDelta of choice.delta.tool_calls) {
                  const index = toolCallDelta.index

                  if (toolCalls[index] == null) {
                    if (toolCallDelta.type !== 'function') {
                      throw new UnsupportedFunctionalityError({
                        functionality: `Tool call type: ${toolCallDelta.type}`,
                      })
                    }

                    toolCalls[index] = {
                      toolCallId: toolCallDelta.id!,
                      toolName: toolCallDelta.function!.name!,
                      args: toolCallDelta.function!.arguments!,
                    }

                    controller.enqueue({
                      type: 'tool-call-delta',
                      toolCallType: 'function',
                      toolCallId: toolCalls[index].toolCallId,
                      toolName: toolCalls[index].toolName,
                      argsTextDelta: toolCalls[index].args,
                    })
                  } else {
                    toolCalls[index].args += toolCallDelta.function!.arguments!

                    controller.enqueue({
                      type: 'tool-call-delta',
                      toolCallType: 'function',
                      toolCallId: toolCalls[index].toolCallId,
                      toolName: toolCalls[index].toolName,
                      argsTextDelta: toolCallDelta.function!.arguments!,
                    })
                  }
                }
              }
            }

            if (value.usage != null) {
              usage = {
                promptTokens: value.usage.prompt_tokens || 0,
                completionTokens: value.usage.completion_tokens || 0,
              }
            }
          },

          flush(controller) {
            controller.enqueue({
              type: 'finish',
              finishReason,
              usage,
            })
          },
        }),
      ),
      rawCall: { rawPrompt: args, rawSettings: {} },
      warnings,
    }
  }
}

// Schema definitions
const vivgridErrorDataSchema = z.object({
  error: z.object({
    message: z.string(),
    type: z.string(),
    code: z.string().optional(),
  }),
})

const vivgridChatResponseSchema = z.object({
  id: z.string(),
  object: z.literal('chat.completion'),
  created: z.number(),
  model: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: z.object({
        role: z.literal('assistant'),
        content: z.string().nullable(),
        tool_calls: z
          .array(
            z.object({
              id: z.string(),
              type: z.literal('function'),
              function: z.object({
                name: z.string(),
                arguments: z.string(),
              }),
            }),
          )
          .optional(),
      }),
      finish_reason: z.string(),
    }),
  ),
  usage: z
    .object({
      prompt_tokens: z.number(),
      completion_tokens: z.number(),
      total_tokens: z.number(),
    })
    .optional(),
})

const vivgridChatStreamChunkSchema = z.discriminatedUnion('object', [
  z.object({
    object: z.literal('chat.completion.chunk'),
    choices: z.array(
      z.object({
        index: z.number(),
        delta: z.object({
          role: z.enum(['assistant']).optional(),
          content: z.string().nullable().optional(),
          tool_calls: z
            .array(
              z.object({
                index: z.number(),
                id: z.string().optional(),
                type: z.literal('function').optional(),
                function: z
                  .object({
                    name: z.string().optional(),
                    arguments: z.string().optional(),
                  })
                  .optional(),
              }),
            )
            .optional(),
        }),
        finish_reason: z.string().nullable().optional(),
      }),
    ),
    usage: z
      .object({
        prompt_tokens: z.number(),
        completion_tokens: z.number(),
        total_tokens: z.number(),
      })
      .optional(),
  }),
])
