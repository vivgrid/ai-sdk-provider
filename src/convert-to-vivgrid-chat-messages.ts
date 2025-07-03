import {
  type LanguageModelV1Message,
  type LanguageModelV1Prompt,
  UnsupportedFunctionalityError,
} from '@ai-sdk/provider'

export function convertToVivgridChatMessages(prompt: LanguageModelV1Prompt): VivgridChatMessage[] {
  const messages: VivgridChatMessage[] = []

  for (const { role, content } of prompt) {
    switch (role) {
      case 'system': {
        messages.push({
          role: 'system',
          content: convertToTextContent(content),
        })
        break
      }

      case 'user': {
        messages.push({ role: 'user', content: convertToTextContent(content) })
        break
      }

      case 'assistant': {
        let text = ''
        const toolCalls: Array<{
          id: string
          type: 'function'
          function: { name: string; arguments: string }
        }> = []

        for (const part of content) {
          switch (part.type) {
            case 'text': {
              text += part.text
              break
            }
            case 'tool-call': {
              toolCalls.push({
                id: part.toolCallId,
                type: 'function',
                function: {
                  name: part.toolName,
                  arguments: JSON.stringify(part.args),
                },
              })
              break
            }
            case 'file':
            case 'reasoning':
            case 'redacted-reasoning': {
              throw new UnsupportedFunctionalityError({
                functionality: `assistant message part: ${part.type}`,
              })
            }
            default: {
              const _exhaustiveCheck: never = part
              throw new UnsupportedFunctionalityError({
                functionality: `assistant message part: ${_exhaustiveCheck}`,
              })
            }
          }
        }

        messages.push({
          role: 'assistant',
          content: text,
          ...(toolCalls.length > 0 && { tool_calls: toolCalls }),
        })
        break
      }

      case 'tool': {
        for (const toolResponse of content) {
          messages.push({
            role: 'tool',
            content: JSON.stringify(toolResponse.result),
            tool_call_id: toolResponse.toolCallId,
          })
        }
        break
      }

      default: {
        const _exhaustiveCheck: never = role
        throw new UnsupportedFunctionalityError({
          functionality: `role: ${_exhaustiveCheck}`,
        })
      }
    }
  }

  return messages
}

function convertToTextContent(content: LanguageModelV1Message['content']): string {
  if (typeof content === 'string') {
    return content
  }

  let text = ''

  for (const part of content) {
    switch (part.type) {
      case 'text': {
        text += part.text
        break
      }
      case 'image': {
        throw new UnsupportedFunctionalityError({
          functionality: 'image content',
        })
      }
      case 'file':
      case 'reasoning':
      case 'redacted-reasoning':
      case 'tool-call':
      case 'tool-result': {
        throw new UnsupportedFunctionalityError({
          functionality: `content part: ${part.type}`,
        })
      }
      default: {
        const _exhaustiveCheck: never = part
        throw new UnsupportedFunctionalityError({
          functionality: `content part: ${_exhaustiveCheck}`,
        })
      }
    }
  }

  return text
}

type VivgridChatMessage =
  | {
      role: 'system'
      content: string
    }
  | {
      role: 'user'
      content: string
    }
  | {
      role: 'assistant'
      content: string
      tool_calls?: Array<{
        id: string
        type: 'function'
        function: { name: string; arguments: string }
      }>
    }
  | {
      role: 'tool'
      content: string
      tool_call_id: string
    }
