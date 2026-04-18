export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
  [key: string]: unknown
}

export interface ApiSuccess<T> {
  ok: true
  status: number
  data: T
}

export interface ApiFailure {
  ok: false
  status: number
  error: ProblemDetails
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure
