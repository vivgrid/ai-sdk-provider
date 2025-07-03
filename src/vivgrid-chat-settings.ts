export type VivgridChatModelId = undefined

export interface VivgridChatSettings {
  /**
   * When enabled, the model will be instructed to generate valid JSON.
   *
   * Default: false
   */
  jsonMode?: boolean

  /**
   * When enabled, the model will be instructed to generate structured outputs.
   *
   * Default: false
   */
  structuredOutputs?: boolean
}
