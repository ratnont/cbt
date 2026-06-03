import type { Emotion } from '../types'

interface Props {
  emotion: Emotion
}

export function EmotionBadge({ emotion }: Props) {
  let cls = 'px-2 py-0.5 rounded-full text-xs font-medium border '
  if (emotion.score <= 3) cls += 'bg-teal-50 text-teal-700 border-teal-200'
  else if (emotion.score <= 6) cls += 'bg-amber-50 text-amber-700 border-amber-200'
  else cls += 'bg-rose-50 text-rose-700 border-rose-200'
  return <span className={cls}>{emotion.name} {emotion.score}/10</span>
}
