import { generateId, loadApiKey, withoutTrailingSlash } from '@ai-sdk/provider-utils'
import { VivgridChatLanguageModel } from './vivgrid-chat-language-model'
import { VivgridChatModelId, VivgridChatSettings } from './vivgrid-chat-settings'

export { VivgridChatModelId, VivgridChatSettings }

// Model factory function with additional methods and properties
export interface VivgridProvider {
  (settings?: VivgridChatSettings): VivgridChatLanguageModel

  // Explicit method for chat
  chat(settings?: VivgridChatSettings): VivgridChatLanguageModel
}

// Optional settings for the provider
export interface VivgridProviderSettings {
  /**
   * 使用不同的 API 调用 URL 前缀，例如使用代理服务器。
   * 默认值: 'https://api.vivgrid.com/v1'
   */
  baseURL?: string

  /**
   * API 密钥。
   * 默认使用 VIVGRID_API_KEY 环境变量。
   */
  apiKey?: string

  /**
   * 包含在请求中的自定义标头。
   */
  headers?: Record<string, string>

  /**
   * 用于生成 ID 的自定义函数。
   * 默认使用内置的 generateId 函数。
   */
  generateId?: () => string
}

/**
 * 创建 Vivgrid provider 实例。
 */
export function createVivgrid(options: VivgridProviderSettings = {}): VivgridProvider {
  const createModel = (settings: VivgridChatSettings = {}) =>
    new VivgridChatLanguageModel(undefined, settings, {
      provider: 'vivgrid.chat',
      baseURL: withoutTrailingSlash(options.baseURL) ?? 'https://api.vivgrid.com/v1',
      headers: () => ({
        Authorization: `Bearer ${loadApiKey({
          apiKey: options.apiKey,
          environmentVariableName: 'VIVGRID_API_KEY',
          description: 'Vivgrid',
        })}`,
        'Content-Type': 'application/json',
        ...options.headers,
      }),
      generateId: options.generateId ?? generateId,
    })

  const provider = function (settings?: VivgridChatSettings) {
    if (new.target) {
      throw new Error('The model factory function cannot be called with the new keyword.')
    }

    return createModel(settings)
  }

  provider.chat = createModel

  return provider as VivgridProvider
}

/**
 * 默认 Vivgrid provider 实例。
 */
export const vivgrid = createVivgrid()
