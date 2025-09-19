import { useEffect, useState } from "react";
import all from "../../assets/icons/allRisk.svg";
import high from "../../assets/icons/highRisk.svg";
import medium from "../../assets/icons/mediumRisk.svg";
import low from "../../assets/icons/lowRisk.svg";
import { capitalize } from "../../utils";

const RiskTab = ({ risk }: { risk: string }) => {
  const [apy, setApy] = useState(0);
  const [text, setText] = useState("");

  useEffect(() => {
    if (risk == "all") {
      setApy(25);
      setText("A combined view of all strategies across the risk spectrum");
    } else if (risk == "high") {
      setApy(55);
      setText("Stablecoins that have with higher volatility exposure compared to the rest");
    } else if (risk == "medium") {
      setApy(35);
      setText(
        "Stablecoins backed by DeFi mechanisms like CDPs & funding rate arbitrage"
      );
    } else if (risk == "low") {
      setApy(12);
      setText(
        "Stablecoins backed by highly credible collateral such as T-bills"
      );
    }
  });

  return (
    <div
      className={`flex flex-col border-[1px] max-w-[500px] border-white border-opacity-[6%] p-[12px] gap-[10px] rounded-xl cursor-pointer transition-all duration-300 ${risk}`}
    >
      <div className="flex justify-between items-center text-[#E4E4E4]">
        <div className="flex items-center gap-[8px]">
          <div>
            {(() => {
              switch (risk) {
                case "all":
                  return <img src={all} alt="" />;
                case "high":
                  return <img src={high} alt="" />;
                case "medium":
                  return <img src={medium} alt="" />;
                case "low":
                  return <img src={low} alt="" />;
                default:
                  return <p className="text-[14px] font-semibold">Unknown</p>;
              }
            })()}
          </div>
          <p className="text-[14px] font-normal">{capitalize(risk)}</p>
        </div>
        <div className="text-[12px]">~ {apy}% APY</div>
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
