/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  /** Set to `agentOS` to show the AgentOS demo shell badge in the live panel. */
  readonly VITE_MODE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
