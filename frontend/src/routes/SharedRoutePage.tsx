import { useParams } from 'react-router-dom'

export function SharedRoutePage() {
  const { shareToken } = useParams<{ shareToken: string }>()

  return (
    <section aria-labelledby="shared-title">
      <h2 id="shared-title">Shared Group</h2>
      <p>shareToken: {shareToken ?? 'unknown'}</p>
    </section>
  )
}
