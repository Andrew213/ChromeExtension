console.log("   BACKGROUND");

const API_URL = import.meta.env.VITE_API_HOST;

type ApiRequestMessage = {
  type: "API_REQUEST";
  payload: {
    method: string;
    url: string;
    body?: unknown;
    skipAuth?: boolean;
  };
};

chrome.runtime.onMessage.addListener(
  (message: ApiRequestMessage, _, sendResponse) => {
    if (message.type !== "API_REQUEST") return;
    handleApiRequest(message.payload)
      .then((data) => sendResponse({ ok: true, data }))
      .catch((error) =>
        sendResponse({
          ok: false,
          error: {
            message: error.message ?? "Request failed",
            status: error.status,
          },
        }),
      );

    return true;
  },
);

async function handleApiRequest(payload: ApiRequestMessage["payload"]) {
  const { accessToken } = await chrome.storage.local.get("accessToken");

  const response = await fetch(`${API_URL}${payload.url}`, {
    method: payload.method,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(accessToken && !payload.skipAuth
        ? { Authorization: `Bearer ${accessToken}` }
        : {}),
    },
    body: payload.body ? JSON.stringify(payload.body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    await chrome.storage.local.remove(["accessToken", "user"]);
  }

  if (!response.ok) {
    const error = new Error(
      data?.error?.message ?? `Request failed with status ${response.status}`,
    );
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  if (
    payload.url.includes("/auth/login-session/") &&
    payload.url.endsWith("/consume")
  ) {
    if (data?.accessToken) {
      // сохраняю токен
      await chrome.storage.local.set({
        accessToken: data.accessToken,
        user: data.user,
      });
    }
  }

  return data;
}
