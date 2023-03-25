type StatusCode = 200 | 400 | 500 | 404

interface VercelAPIResponse<T> {
  statusCode: StatusCode
  success: boolean
  result: T
  message?: string
}

export type { VercelAPIResponse, StatusCode }
