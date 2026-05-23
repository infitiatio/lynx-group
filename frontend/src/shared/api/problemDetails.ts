import type { ProblemDetails } from '../types/api'

export function getProblemDetailsMessage(error: ProblemDetails, fallback: string): string {
  if (typeof error.detail === 'string' && error.detail.trim().length > 0) {
    return error.detail
  }

  if (typeof error.title === 'string' && error.title.trim().length > 0) {
    return error.title
  }

  const validationErrors = error.errors
  if (validationErrors && typeof validationErrors === 'object') {
    for (const value of Object.values(validationErrors as Record<string, unknown>)) {
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === 'string') {
        return value[0]
      }
    }
  }

  return fallback
}