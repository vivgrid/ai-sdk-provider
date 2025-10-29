import type { LanguageModelV1FinishReason, LanguageModelV1StreamPart } from '@ai-sdk/provider'

interface VivgridStreamState {
  finishReason: LanguageModelV1FinishReason
  usage: { promptTokens: number; completionTokens: number }
  toolCalls: Array<{
    toolCallId: string
    toolName: string
    args: string
  }>
}

export function createVivgridStreamParser(
  responseBody: ReadableStream<Uint8Array>,
): ReadableStream<LanguageModelV1StreamPart> {
  const reader = responseBody.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  const state: VivgridStreamState = {
    finishReason: 'other',
    usage: {
      promptTokens: Number.NaN,
      completionTokens: Number.NaN,
    },
    toolCalls: [],
  }

  return new ReadableStream<LanguageModelV1StreamPart>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            if (buffer.trim()) {
              processLine(buffer.trim(), controller, state)
            }

            controller.enqueue({
              type: 'finish',
              finishReason: state.finishReason,
              usage: state.usage,
            })
            controller.close()
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.trim()) {
              processLine(line.trim(), controller, state)
            }
          }
        }
      } catch (error) {
        controller.error(error)
      }
    },
  })
}

function processLine(
  line: string,
  controller: ReadableStreamDefaultController<LanguageModelV1StreamPart>,
  state: VivgridStreamState,
) {
  const match = line.match(/^([a-z]):\s*(.+)$/)
  if (!match) return
  const [, prefix, jsonStr] = match
  console.log(jsonStr)
  try {
    switch (prefix) {
      case 'f': {
        const parsed = JSON.parse(jsonStr)
        const index = state.toolCalls.length
        state.toolCalls[index] = {
          toolCallId: parsed.tool_call_id,
          toolName: parsed.name,
          args: parsed.arguments,
        }
        controller.enqueue({
          type: 'tool-call-delta',
          toolCallType: 'function',
          toolCallId: state.toolCalls[index].toolCallId,
          toolName: state.toolCalls[index].toolName,
          argsTextDelta: state.toolCalls[index].args,
        })
        controller.enqueue({
          type: 'tool-call',
          toolCallType: 'function',
          toolCallId: state.toolCalls[index].toolCallId,
          toolName: state.toolCalls[index].toolName,
          args: state.toolCalls[index].args,
        })
        break
      }
      case 'g': {
        const parsed = JSON.parse(jsonStr)
        if (parsed) {
          controller.enqueue({
            type: 'reasoning',
            textDelta: parsed,
          })
        }
        break
      }
      case 'c': {
        const parsed = JSON.parse(jsonStr)
        if (parsed) {
          controller.enqueue({
            type: 'text-delta',
            textDelta: parsed,
          })
        }
        break
      }
      case 'u': {
        const parsed = JSON.parse(jsonStr)
        state.usage = {
          promptTokens: parsed.prompt_tokens || 0,
          completionTokens: parsed.completion_tokens || 0,
        }
        break
      }
      case 'p': {
        state.finishReason = 'stop'
        break
      }
    }
  } catch (error) {
    console.error('[Vivgrid] Failed to parse JSON:', jsonStr, error)
    controller.enqueue({
      type: 'error',
      error: error instanceof Error ? error : new Error(String(error)),
    })
  }
}
