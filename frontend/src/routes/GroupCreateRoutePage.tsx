import { useNavigate } from 'react-router-dom'
import { GroupForm } from '../features/groups/GroupForm'
import { useGroups } from '../features/groups/useGroups'

export function GroupCreateRoutePage() {
  const navigate = useNavigate()
  const { createGroup } = useGroups({ loadOnMount: false })

  return (
    <section className="page-section" aria-labelledby="group-create-title">
      <div className="page-hero">
        <div>
          <h2 id="group-create-title">Create Group</h2>
          <p>Start a new group with a title and description.</p>
        </div>
      </div>

      <GroupForm
        submitLabel="Create group"
        onSubmit={async (values) => {
          const createdGroup = await createGroup(values)
          navigate(`/groups/${createdGroup.id}`)
        }}
      />
    </section>
  )
}