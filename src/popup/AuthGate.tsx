import { usePostAuthConsume } from "@/api/hooks/mutation/usePostAuthConsume";
import { usePostLoginSession } from "@/api/hooks/mutation/usePostLoginSession";
import { usePostAuthLogout } from "@/api/hooks/mutation/usePostLogout";
import { useFetchSessionStatus } from "@/api/hooks/query/useFetchSessionStatus";
import { LoginSessionStatus } from "@/api/requests/Auth";
import { PropsWithChildren, useEffect, useState } from "react";

const AuthGate: React.FC<PropsWithChildren> = ({ children }) => {
  const [sessionId, setSessionId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const loginSession = usePostLoginSession();
  const consume = usePostAuthConsume();
  const logout = usePostAuthLogout();

  const status = useFetchSessionStatus(
    sessionId,
    Boolean(sessionId) && !consume.isSuccess && !accessToken,
  );

  useEffect(() => {
    chrome.storage.local
      .get(["accessToken", "authSessionId"])
      .then((result) => {
        if (result.accessToken) {
          setAccessToken(result.accessToken);
        }

        if (result.authSessionId) {
          setSessionId(result.authSessionId);
        }
      });
  }, []);

  useEffect(() => {
    if (!sessionId) {
      return;
    }

    if (
      status.data?.status === LoginSessionStatus.Expired ||
      status.data?.status === LoginSessionStatus.Consumed
    ) {
      setSessionId("");
      void chrome.storage.local.remove("authSessionId");
      return;
    }

    if (
      status.data?.status !== LoginSessionStatus.Confirmed ||
      consume.isPending ||
      consume.isSuccess
    ) {
      return;
    }

    consume.mutate(sessionId, {
      onSuccess: async (data) => {
        setAccessToken(data.accessToken);

        await chrome.storage.local.set({
          accessToken: data.accessToken,
        });

        await chrome.storage.local.remove("authSessionId");
      },
    });
  }, [consume.isPending, consume.isSuccess, status.data?.status, sessionId]);

  const startAuth = () => {
    setSessionId("");
    consume.reset();
    void chrome.storage.local.remove("authSessionId");

    loginSession.mutate(undefined, {
      onSuccess: async (data) => {
        setSessionId(data.sessionId);

        await chrome.storage.local.set({
          authSessionId: data.sessionId,
        });
        await chrome.tabs.create({ url: data.telegramUrl });
      },
      onError: (error) => {
        console.error("login session error", error);
      },
    });
  };

  const clearAuth = async () => {
    setAccessToken("");
    setSessionId("");

    await chrome.storage.local.remove(["accessToken", "authSessionId"]);
  };

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSettled: () => {
        void clearAuth();
      },
    });
  };

  if (accessToken) {
    return (
      <div className="p-[14px] w-[360px] min-h-[560px]">
        <button onClick={handleLogout} disabled={logout.isPending}>
          Выйти
        </button>

        {children}
      </div>
    );
  }

  return (
    <div className="p-[14px] w-[360px] min-h-[560px]">
      <button onClick={startAuth} disabled={loginSession.isPending}>
        Войти через Telegram
      </button>

      {sessionId && <div>Ожидаем подтверждение в Telegram...</div>}

      {children}
    </div>
  );
};

export default AuthGate;
