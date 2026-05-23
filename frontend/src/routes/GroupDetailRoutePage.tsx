import { Link, useParams } from 'react-router-dom'
import { GroupForm } from '../features/groups/GroupForm'
import { useGroup } from '../features/groups/useGroup'

export function GroupDetailRoutePage() {
  const { groupId } = useParams<{ groupId: string }>()
  const { group, isLoading, error, updateGroup } = useGroup(groupId)

  if (!groupId) {
    return (
      <section className="page-section" aria-labelledby="group-detail-title">
        <h2 id="group-detail-title">Group Detail</h2>
        <p role="alert">Missing group id.</p>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="page-section" aria-labelledby="group-detail-title">
        <h2 id="group-detail-title">Group Detail</h2>
        <p aria-live="polite">Loading group...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="page-section" aria-labelledby="group-detail-title">
        <h2 id="group-detail-title">Group Detail</h2>
        <p role="alert">{error}</p>
      </section>
    )
  }

  if (!group) {
    return (
      <section className="page-section" aria-labelledby="group-detail-title">
        <h2 id="group-detail-title">Group Detail</h2>
        <p role="alert">Group not found.</p>
      </section>
    )
  }

  return (
    <section className="page-section" aria-labelledby="group-detail-title">
      <div className="page-hero">
        <div>
          <h2 id="group-detail-title">{group.title}</h2>
          <p>{group.description}</p>
        </div>
        <Link className="secondary-link" to="/groups">
          Back to groups
        </Link>
      </div>

      <div className="details-grid">
        <article className="panel">
          <h3>Details</h3>
          <dl className="group-meta-list group-meta-list-stacked">
            <div>
              <dt>Owner</dt>
              <dd>{group.ownerUserId}</dd>
            </div>
            <div>
              <dt>Visibility</dt>
              <dd>{group.isPublished ? 'Published' : 'Draft'}</dd>
            </div>
            <div>
              <dt>Share token</dt>
              <dd>{group.shareToken ?? 'Not generated yet'}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{new Date(group.createdAt).toLocaleString()}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{new Date(group.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </article>

        {group.isOwner ? (
          <article className="panel" aria-labelledby="group-edit-title">
            <h3 id="group-edit-title">Edit group</h3>
            <GroupForm
              key={`${group.id}-${group.updatedAt}`}
              initialValues={{
                title: group.title,
                description: group.description,
              }}
              submitLabel="Save changes"
              onSubmit={async (values) => {
                await updateGroup(values)
              }}
            />
          </article>
        ) : (
          <article className="panel">
            <h3>Read only</h3>
            <p>Only the owner can edit this group.</p>
          </article>
        )}
      </div>
    </section>
  )
}
