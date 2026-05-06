import { useEffect, useMemo, useState } from "react";
import { resolveSite } from "../utils";
import Button from "./components/Button";
import Card from "./components/Card";
import Range from "./components/Range";
import Header from "./Header";
import {
  getActiveTabHost,
  getRuntimeUrl,
  getStoredCoverLetter,
  sendMessageToActiveTab,
  setStoredCoverLetter,
} from "./platform";

const App = () => {
  const [host, setHost] = useState("");
  const [speed, setSpeed] = useState(3);
  const [coverLetter, setCoverLetter] = useState("");
  const [isCoverLoaded, setIsCoverLoaded] = useState(false);

  const site = useMemo(() => resolveSite(host), [host]);
  const settings = useMemo(
    () => ({ speed, responseLetter: coverLetter }),
    [speed, coverLetter],
  );

  const refreshSite = async () => {
    const nextHost = await getActiveTabHost();
    setHost(nextHost);
  };

  const startHH = async () => {
    if (site.id === "unknown") return;

    await sendMessageToActiveTab({
      type: "START_HH",
      settings,
    });
  };

  const stopHH = async () => {
    await sendMessageToActiveTab({ type: "STOP_HH" });
  };

  const testStep = async () => {
    await sendMessageToActiveTab({
      type: "TEST_STEP",
      settings,
    });
  };

  useEffect(() => {
    refreshSite();
    getStoredCoverLetter()
      .then(setCoverLetter)
      .finally(() => setIsCoverLoaded(true));
  }, []);

  useEffect(() => {
    if (!isCoverLoaded) return;

    const timer = window.setTimeout(() => {
      setStoredCoverLetter(coverLetter);
    }, 200);

    return () => window.clearTimeout(timer);
  }, [coverLetter, isCoverLoaded]);

  return (
    <div className="p-[14px] w-[360px] min-h-[560px]">
      <Header site={site} onRefresh={refreshSite} />
      <Card className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-muted mb-1.5 text-[12px]">Текущий сайт</div>
          <div className="text-[18px] font-bold mb-1.5">
            {site.name || "-"}
          </div>
          <div className="text-[12px] text-[rgba(234,240,255,0.75)] truncate max-w-50">
            {host || "-"}
          </div>
        </div>

        <div>
          <div className="size-21.5 rounded-full border border-stroke">
            <img
              src={getRuntimeUrl(site.img)}
              className="size-full object-cover scale-[1.02]"
              alt={site.name}
              title={site.id}
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
          <Range
            id="speedRange"
            value={speed}
            onChange={(event) => setSpeed(Number(event.currentTarget.value))}
          />
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
            className="w-full resize-y min-h-[110px] max-h-[220px] px-3 py-2.5 rounded-xl border border-stroke bg-white/5 text-text outline-none font-[inherit] text-[13px] leading-[1.35] placeholder:text-muted/65"
            placeholder="Вставь или набросай текст сопроводительного письма..."
            rows={6}
            value={coverLetter}
            onChange={(event) => setCoverLetter(event.currentTarget.value)}
          />
          <div className="flex gap-1.5 justify-end mt-1.5">
            <span className="muted">{coverLetter.length}</span>
            <span className="muted">символов</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="primary" onClick={startHH}>
            Start
          </Button>
          <Button onClick={stopHH}>Stop</Button>
          <Button className="ghost" onClick={testStep}>
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
