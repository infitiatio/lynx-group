import { useParams } from 'react-router-dom'

export function GroupDetailRoutePage() {
  const { groupId } = useParams<{ groupId: string }>()

  return (
    <section aria-labelledby="group-detail-title">
      <h2 id="group-detail-title">Group Detail</h2>
      <p>groupId: {groupId ?? 'unknown'}</p>
    </section>
  )
}
