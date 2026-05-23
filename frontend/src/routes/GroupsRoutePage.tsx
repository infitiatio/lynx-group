import { Link } from 'react-router-dom'
import { GroupList } from '../features/groups/GroupList'
import { useGroups } from '../features/groups/useGroups'

export function GroupsRoutePage() {
  const { groups, isLoading, error, refreshGroups } = useGroups()

  return (
    <section className="page-section" aria-labelledby="groups-title">
      <div className="page-hero">
        <div>
          <h2 id="groups-title">My Groups</h2>
          <p>Manage the groups you own and open any group to view or edit it.</p>
        </div>
        <Link className="primary-link" to="/groups/new">
          Create group
        </Link>
      </div>

      <GroupList
        groups={groups}
        isLoading={isLoading}
        error={error}
        emptyMessage="You have not created any groups yet."
        onRetry={() => {
          void refreshGroups()
        }}
      />
    </section>
  )
}
