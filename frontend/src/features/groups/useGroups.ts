import { useCallback, useEffect, useState } from 'react'
import { httpClient } from '../../shared/api'
import { getProblemDetailsMessage } from '../../shared/api/problemDetails'
import type { GroupDto, GroupFormValues } from '../../shared/types/groups'

interface UseGroupsOptions {
  loadOnMount?: boolean
}

interface UseGroupsResult {
  groups: GroupDto[]
  isLoading: boolean
  error: string | null
  refreshGroups: () => Promise<void>
  createGroup: (values: GroupFormValues) => Promise<GroupDto>
}

export function useGroups(options: UseGroupsOptions = {}): UseGroupsResult {
  const { loadOnMount = true } = options
  const [groups, setGroups] = useState<GroupDto[]>([])
  const [isLoading, setIsLoading] = useState(loadOnMount)
  const [error, setError] = useState<string | null>(null)

  const refreshGroups = useCallback(async (): Promise<void> => {
    setIsLoading(true)
    setError(null)

    const result = await httpClient.getAsync<GroupDto[]>('/api/groups')
    if (!result.ok) {
      setGroups([])
      setError(getProblemDetailsMessage(result.error, 'Unable to load groups.'))
      setIsLoading(false)
      return
    }

    setGroups(result.data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!loadOnMount) {
      return
    }

    let isCancelled = false

    queueMicrotask(() => {
      if (!isCancelled) {
        void refreshGroups()
      }
    })

    return () => {
      isCancelled = true
    }
  }, [loadOnMount, refreshGroups])

  const createGroup = useCallback(async (values: GroupFormValues): Promise<GroupDto> => {
    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
    }

    const result = await httpClient.postAsync<GroupDto>('/api/groups', payload)
    if (!result.ok) {
      throw new Error(getProblemDetailsMessage(result.error, 'Unable to create group.'))
    }

    setGroups((currentGroups) => [result.data, ...currentGroups])
    return result.data
  }, [])

  return {
    groups,
    isLoading,
    error,
    refreshGroups,
    createGroup,
  }
}