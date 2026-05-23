import { useCallback, useEffect, useState } from 'react'
import { httpClient } from '../../shared/api'
import { getProblemDetailsMessage } from '../../shared/api/problemDetails'
import type { GroupDto, GroupFormValues } from '../../shared/types/groups'

interface UseGroupResult {
  group: GroupDto | null
  isLoading: boolean
  error: string | null
  refreshGroup: () => Promise<void>
  updateGroup: (values: GroupFormValues) => Promise<GroupDto>
}

export function useGroup(groupId: string | undefined): UseGroupResult {
  const [group, setGroup] = useState<GroupDto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshGroup = useCallback(async (): Promise<void> => {
    if (!groupId) {
      setGroup(null)
      setError('Missing group id.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const result = await httpClient.getAsync<GroupDto>(`/api/groups/${groupId}`)
    if (!result.ok) {
      setGroup(null)
      setError(getProblemDetailsMessage(result.error, 'Unable to load group.'))
      setIsLoading(false)
      return
    }

    setGroup(result.data)
    setIsLoading(false)
  }, [groupId])

  useEffect(() => {
    let isCancelled = false

    queueMicrotask(() => {
      if (!isCancelled) {
        void refreshGroup()
      }
    })

    return () => {
      isCancelled = true
    }
  }, [refreshGroup])

  const updateGroup = useCallback(
    async (values: GroupFormValues): Promise<GroupDto> => {
      if (!groupId) {
        throw new Error('Missing group id.')
      }

      if (!group) {
        throw new Error('Group data is not loaded yet.')
      }

      const updatedGroup: GroupDto = {
        ...group,
        title: values.title.trim(),
        description: values.description.trim(),
      }

      const result = await httpClient.putAsync<GroupDto>(`/api/groups/${groupId}`, updatedGroup)
      if (!result.ok) {
        throw new Error(getProblemDetailsMessage(result.error, 'Unable to save group.'))
      }

      setGroup(result.data)
      return result.data
    },
    [group, groupId],
  )

  return {
    group,
    isLoading,
    error,
    refreshGroup,
    updateGroup,
  }
}