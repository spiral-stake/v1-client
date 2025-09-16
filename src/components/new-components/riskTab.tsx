import { useEffect, useState } from "react";
import All from "../../assets/icons/allRisk.svg";
import High from "../../assets/icons/highRisk.svg";
import Medium from "../../assets/icons/mediumRisk.svg";
import Low from "../../assets/icons/lowRisk.svg";

const RiskTab = ({ risk }: { risk: string }) => {
  const [apy, setApy] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    if (risk == "All") {
      setApy(25);
      setText("A combined view of all strategies across the risk spectrum");
    } else if (risk == "High") {
      setApy(55);
      setText("Involves stablecoin’s with higher volatility exposure.");
    } else if (risk == "Medium") {
      setApy(35);
      setText(
        "Stablecoins backed by DeFi mechanisms like CDPs & funding rate arbitrage"
      );
    } else if (risk == "Low") {
      setApy(12);
      setText(
        "Stablecoins backed by highly credible collateral such as T-bills"
      );
    }
  });

  return (
    <div
      className={`border-[1px] max-w-[315px] border-white border-opacity-[6%] p-[12px] gap-[8px] rounded-xl cursor-pointer transition-all duration-300 ${risk}`}
    >
      <div className="flex justify-between items-center text-[#E4E4E4]">
        <div className="flex items-center gap-[2px]">
          {(() => {
            switch (risk) {
              case "All":
                return <img src={All} alt="" />;
              case "High":
                return <img src={High} alt="" />;
              case "Medium":
                return <img src={Medium} alt="" />;
              case "Low":
                return <img src={Low} alt="" />;
              default:
                return <p className="text-[14px] font-semibold">Unknown</p>;
            }
          })()}
          <p className="text-[14px] font-semibold">{risk}</p>
        </div>
        <div className="text-[12px]">~ {apy} APY</div>
      </div>
      <div>
        <div>
          <p className="text-[#C8CBD7] text-[12px]">{text}</p>
        </div>
      </div>
    </div>
  );
};

export default RiskTab;
