// Media consumption data types
export interface MediaItem {
  name: string
  creator: string
  date: string
  note?: string
  lang?: string
  state?: string
}

export type MediaType = 'book' | 'movie' | 'anime' | 'game'

export interface MediaData {
  [key: string]: MediaItem[]
}

// 空的media数据 - 已迁移到xLog
export const media: MediaData = {
  book: [],
  movie: [],
  anime: [],
  game: []
} 