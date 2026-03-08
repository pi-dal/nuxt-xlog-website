import type { Component } from 'vue'

export interface DemoItem {
  comp: Component
  date: string
  video?: boolean
}

// Placeholder dataset to keep the archived demo component type-safe
// until its source content is restored in this repository.
export const demoItems: DemoItem[] = []
