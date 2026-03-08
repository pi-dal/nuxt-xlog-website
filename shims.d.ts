import 'vue-router'

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<Record<string, never>, Record<string, never>, any>
  export default component
}

declare module 'vue-router' {
  interface RouteMeta {
    frontmatter: any
  }
}
