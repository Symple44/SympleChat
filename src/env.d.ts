/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_WS_HOST: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly hot: {
    accept(): void
    dispose(cb: (data: any) => void): void
    decline(): void
    invalidate(): void
    data: any
  }
}