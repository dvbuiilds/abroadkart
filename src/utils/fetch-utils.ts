import { ResponseType } from "@app/types/api-types";

/**
 *
 * @param url: String
 * @param options: fetch options
 * @param timeout: number
 * @returns Promise<ResponseType<any>>
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
): Promise<ResponseType<any>> => {
  const controller = new AbortController();
  const signal = controller.signal;

  let response = null;
  try {
    // Set a timeout to abort the request
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    response = await fetch(url, { ...options, signal });
    // Clear timeout once fetch completes
    clearTimeout(timeoutId);
    if (!response.ok || response.status !== 200) {
      return {
        success: false,
        error: { message: "Response Fetch Failed.", status: response.status },
      };
    }
  } catch (error) {
    console.log("@@ timeout error in fetch request: ", error);
    return {
      success: false,
      error: { message: `API Fetch Timeout - ${error}`, status: 408 },
    };
  }

  let jsonResponse = null;
  try {
    jsonResponse = await response.json();
  } catch (error) {
    console.error("@@ parsing error in response.");
    return {
      success: false,
      error: {
        message: "Parsing Error in Response.",
        status: 400,
      },
    };
  }
  return {
    success: true,
    data: jsonResponse,
  };
};
