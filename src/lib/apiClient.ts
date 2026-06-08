/**
 * 사용자 프론트(dimo_front) 백엔드 API 클라이언트.
 *
 * 환경:
 *   - NEXT_PUBLIC_API_BASE_URL (기본 http://localhost:8080)
 *
 * 인증:
 *   - localStorage 의 user_access_token 을 Authorization 헤더로 자동 첨부
 *   - 비로그인 페이지에서도 동작 (토큰 없으면 헤더 미첨부)
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

interface FetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  skipAuth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { body, headers, skipAuth, ...rest } = options;

  const authHeaders: Record<string, string> = {};
  if (!skipAuth && typeof window !== "undefined") {
    const token = window.localStorage.getItem("user_access_token");
    if (token) authHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders,
      ...(headers ?? {}),
    },
    body: body != null ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    let payload: { code?: string; message?: string } = {};
    try {
      payload = await res.json();
    } catch {
      /* JSON 아닌 응답은 무시 */
    }
    throw new ApiError(
      res.status,
      payload.code ?? "HTTP_ERROR",
      payload.message ?? res.statusText,
      payload
    );
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
