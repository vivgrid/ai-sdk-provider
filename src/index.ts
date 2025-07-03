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
   * default: 'https://api.vivgrid.com/v1'
   */
  baseURL?: string

  /**
   * default: VIVGRID_API_KEY
   */
  apiKey?: string

  /**
   * default: {}
   */
  headers?: Record<string, string>

  /**
   * default: generateId
   */
  generateId?: () => string
}

/**
 * create Vivgrid provider instance
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
 * default Vivgrid provider instance
 */
export const vivgrid = createVivgrid()
