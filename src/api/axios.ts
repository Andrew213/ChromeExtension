import type { AxiosRequestConfig } from "axios";

type BackgroundResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: { message: string; status?: number } };

function sendMessageToBackground<T>(message: unknown): Promise<T> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const error = chrome.runtime.lastError;

      if (error) {
        reject(new Error(error.message));
        return;
      }

      resolve(response as T);
    });
  });
}

export const request = async <T = unknown>(
  options: AxiosRequestConfig & { skipAuth?: boolean },
): Promise<T> => {
  const response = await sendMessageToBackground<BackgroundResponse<T>>({
    type: "API_REQUEST",
    payload: {
      method: options.method ?? "GET",
      url: options.url,
      body: options.data,
      skipAuth: options.skipAuth,
    },
  });

  if (!response.ok) {
    throw new Error(response.error.message);
  }

  return response.data;
};
