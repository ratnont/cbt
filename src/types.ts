export interface Emotion {
  name: string
  score: number // 0–10
}

export interface Entry {
  id: string
  createdAt: string  // ISO string
  updatedAt: string  // ISO string
  datetime: string   // ISO string, user-editable
  situation: string
  thoughts: string
  emotions: Emotion[]
  physical: string
  behaviors: string
}
