/// <reference types="vite/client" />

import 'axios'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** When true, the response error interceptor skips generic ElMessage.error (401/403 unchanged). */
    skipErrorMessage?: boolean
  }
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, unknown>
  export default component
}
