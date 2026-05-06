import { SiteT } from "../utils";
import Button from "./components/Button";

interface Props {
  site?: SiteT;
}

const Header: React.FC<Props> = ({ site }) => {
  return (
    <header className="flex items-center justify-between mb-3">
      <div className="flex gap-2.5 items-center">
        <img src="32x32.png"></img>
        <div>
          <div className="font-bold">JobAgent</div>
          <div className="text-[12px] text-muted mt-[2px]" id="siteSubtitle">
            {site?.subtitle || "Определяю сайт…"}
          </div>
        </div>
      </div>
      <Button className="ghost tiny" id="refreshBtn">
        Refresh
      </Button>
    </header>
  );
};

export default Header;
