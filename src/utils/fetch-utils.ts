/**
 *
 * @param url: String
 * @param options: fetch options
 * @param timeout: number
 * @returns Promise<Response>
 * This method will abort the fetch call if it is taking more time to complete than the provided timeout.
 */
export const fetchWithTimeout = async (
  url: string,
  options?: {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    headers?: {
      "Content-Type": "application/json";
      email?: string;
    };
    body: string;
  },
  timeout: number = 10000
) => {
  const controller = new AbortController();
  const signal = controller.signal;

  // Set a timeout to abort the request
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { ...options, signal }).finally(() =>
    clearTimeout(timeoutId)
  ); // Clear timeout once fetch completes
};
