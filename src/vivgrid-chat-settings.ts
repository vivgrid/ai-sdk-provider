// 模型ID现在完全由网页配置管理，不需要在代码中指定
export type VivgridChatModelId = undefined

export interface VivgridChatSettings {
  /**
   * 是否启用 JSON 模式。
   *
   * 当启用时，模型会被指示生成有效的 JSON。
   *
   * 默认值: 无
   */
  jsonMode?: boolean

  /**
   * 是否启用结构化输出。
   *
   * 默认值: 无
   */
  structuredOutputs?: boolean
}
