/**
 * Fetch wrapper that includes credentials by default
 * Use this for all client-side API calls to ensure cookies are sent
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    credentials: "include",
    ...options,
  });
}
