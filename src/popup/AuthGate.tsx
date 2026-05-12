import { usePostAuthConsume } from "@/api/hooks/mutation/usePostAuthConsume";
import { usePostLoginSession } from "@/api/hooks/mutation/usePostLoginSession";
import { usePostAuthLogout } from "@/api/hooks/mutation/usePostLogout";
import { useFetchSessionStatus } from "@/api/hooks/query/useFetchSessionStatus";
import { useGetMe } from "@/api/hooks/query/useGetMe";
import { LoginSessionStatus } from "@/api/requests/Auth";
import type { UserT } from "@/api/types/UserType";
import Button from "@/popup/components/Button";
import { getRuntimeUrl } from "@/popup/platform";
import { PropsWithChildren, useEffect, useState } from "react";

function getTelegramName(user?: UserT) {
  if (!user) return "Telegram";
  if (user.telegramUsername) return `@${user.telegramUsername}`;

  const fullName = [user.telegramFirstName, user.telegramLastName]
    .filter(Boolean)
    .join(" ");

  return fullName || `ID ${user.telegramUserId}`;
}

const AuthGate: React.FC<PropsWithChildren> = ({ children }) => {
  const [sessionId, setSessionId] = useState("");
  const [accessToken, setAccessToken] = useState("");

  const loginSession = usePostLoginSession();
  const consume = usePostAuthConsume();
  const logout = usePostAuthLogout();
  const me = useGetMe(Boolean(accessToken));

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
    if (me.isError) {
      void clearAuth();
    }
  }, [me.isError]);

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

    await chrome.storage.local.remove(["accessToken", "authSessionId", "user"]);
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
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] text-muted">Telegram</div>
            <div className="truncate text-[13px] font-[700] text-text">
              {me.isLoading ? "Загружаем..." : getTelegramName(me.data)}
            </div>
          </div>

          <Button
            className="tiny shrink-0"
            onClick={handleLogout}
            disabled={logout.isPending}
          >
            Выйти
          </Button>
        </div>

        {children}
      </div>
    );
  }

  return (
    <div className="p-[14px] w-[360px] min-h-[560px]">
      <Button
        className="primary flex w-full items-center justify-center mb-4 gap-2.5 px-4 py-3 text-[14px] shadow-card disabled:cursor-not-allowed disabled:opacity-60"
        onClick={startAuth}
        disabled={loginSession.isPending}
      >
        <img
          alt=""
          aria-hidden="true"
          className="size-5 shrink-0"
          src={getRuntimeUrl("telegram.svg")}
        />
        <span>
          {loginSession.isPending
            ? "Открываем Telegram..."
            : "Войти через Telegram"}
        </span>
      </Button>

      {sessionId && (
        <div className="mt-3 rounded-lg border border-stroke bg-white/5 px-3 py-2 text-[12px] text-muted">
          Ожидаем подтверждение в Telegram...
        </div>
      )}

      {children}
    </div>
  );
};

export default AuthGate;
