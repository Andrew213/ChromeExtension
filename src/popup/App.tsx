import { useEffect, useMemo, useState } from "react";
import Card from "./components/Card";
import Header from "./Header";
import { getActiveTabHost, resolveSite } from "../utils";
import Button from "./components/Button";
import Range from "./components/Range";

export const isExtension =
  typeof chrome !== "undefined" && Boolean(chrome.runtime?.id);

function getAssetUrl(path: string) {
  if (!path) return "";

  if (isExtension) {
    return chrome.runtime.getURL(path);
  }

  return path.startsWith("/") ? path : `/${path}`;
}

const App = () => {
  const [host, setHost] = useState("");

  const site = useMemo(() => resolveSite(host), [host]);

  useEffect(() => {
    getActiveTabHost().then(setHost);
  }, []);

  return (
    <div className="p-[14px] w-[360px] min-h-[560px]">
      <Header site={site} />
      <Card className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-muted mb-1.5 text-[12px]">Текущий сайт</div>
          <div className="text-[18px] font-bold mb-1.5" id="siteName">
            {site.name || "—"}
          </div>
          <div
            className="text-[12px] text-[rgba(234,240,255,0.75)] truncate max-w-50"
            id="hostText"
          >
            {host || "—"}
          </div>
        </div>

        <div>
          <div className="size-21.5 rounded-full border border-stroke ">
            <img
              id="siteImage"
              src={getAssetUrl(site.img)}
              className="size-full object-cover scale-[1.02]"
              alt="site"
            />
          </div>
        </div>
      </Card>
      <Card>
        <div className="mb-4">
          <label
            className="block text-[12px] text-muted mb-1.5"
            htmlFor="speedRange"
          >
            Скорость
          </label>
          <Range id="speedRange" />
        </div>

        <div className="mb-4">
          <label
            className="block text-[12px] text-muted mb-1.5"
            htmlFor="coverLetter"
          >
            Сопроводительное письмо
          </label>
          <textarea
            id="coverLetter"
            className="
    w-full resize-y min-h-[110px] max-h-[220px]
    px-3 py-2.5 rounded-xl
    border border-stroke
    bg-white/5 text-text
    outline-none
    font-inherit text-[13px] leading-[1.35] placeholder:text-muted/65"
            placeholder="Вставь или набросай текст сопроводительного письма…"
            rows={6}
          ></textarea>
          <div className="flex gap-1.5 justify-end mt-1.5">
            <span className="muted]" id="coverLetterCount">
              0
            </span>
            <span className="muted">символов</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="primary" id="startBtn">
            Start
          </Button>
          <Button id="stopBtn">Stop</Button>
          <Button className="ghost" id="testBtn">
            Test step
          </Button>
        </div>
      </Card>

      <footer className="mt-[2px]">
        <span className="muted">MVP: hh.ru + superjob.ru</span>
      </footer>
    </div>
  );
};

export default App;
