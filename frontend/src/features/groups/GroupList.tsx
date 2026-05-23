import { Link } from 'react-router-dom'
import type { GroupDto } from '../../shared/types/groups'

interface GroupListProps {
  groups: GroupDto[]
  isLoading: boolean
  error: string | null
  emptyMessage?: string
  onRetry?: () => void
}

function formatDateTime(value: string): string {
  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsedDate)
}

export function GroupList({ groups, isLoading, error, emptyMessage, onRetry }: GroupListProps) {
  if (isLoading) {
    return (
      <section className="panel" aria-live="polite" aria-busy="true">
        <p>Loading groups...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="panel" role="alert">
        <p>{error}</p>
        {onRetry && (
          <button type="button" className="secondary-button" onClick={onRetry}>
            Try again
          </button>
        )}
      </section>
    )
  }

  if (groups.length === 0) {
    return (
      <section className="panel">
        <p>{emptyMessage ?? 'No groups yet.'}</p>
      </section>
    )
  }

  return (
    <ul className="group-list">
      {groups.map((group) => (
        <li key={group.id} className="group-card panel">
          <div className="group-card-header">
            <div>
              <h3 className="group-card-title">
                <Link to={`/groups/${group.id}`}>{group.title}</Link>
              </h3>
              <p className="group-card-description">{group.description}</p>
            </div>
            <span className={`group-badge ${group.isOwner ? 'group-badge-owner' : ''}`}>
              {group.isOwner ? 'Owned' : 'Shared'}
            </span>
          </div>

          <dl className="group-meta-list">
            <div>
              <dt>Status</dt>
              <dd>{group.isPublished ? 'Published' : 'Draft'}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatDateTime(group.updatedAt)}</dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  )
}