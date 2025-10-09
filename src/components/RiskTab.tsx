import React, { useEffect, useState } from "react";
import { capitalize } from "../utils";

const RiskTab = ({
  icon,
  risk,
  text,
  setRisk,
  currentRisk,
  color,
}: {
  icon: string;
  risk: string;
  text: string;
  setRisk: React.Dispatch<React.SetStateAction<string>>;
  currentRisk: string;
  color: string;
}) => {
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    setSelected(currentRisk === risk);
  }, [currentRisk, risk]);

  return (
    <div
      onClick={() => setRisk(risk)}
      style={{
        background: selected
          ? `linear-gradient(90deg, ${color}, rgba(153,153,153,0.1))`
          : "transparent",
        transition: "background 0.3s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = `linear-gradient(90deg, ${color}, rgba(153,153,153,0.1))`)
      }
      onMouseLeave={(e) =>
      (e.currentTarget.style.background = selected
        ? `linear-gradient(90deg, ${color}, rgba(153,153,153,0.1))`
        : "transparent")
      }
      className={`flex flex-col border-[1px] min-w-fit lg:max-w-[500px] h-fit border-white border-opacity-[6%] p-[12px] gap-[10px] rounded-xl cursor-pointer transition-all duration-300 hover:bg-gradient-to-r to-[rgba(153,153,153,0.1)] from-[${color}]`}
    >
      <div className="flex justify-between items-center text-[#E4E4E4]">
        <div className="flex items-center gap-[8px]">
          <div>
            <img src={icon} alt="" />
          </div>
          <p className="text-[14px] font-normal">{`${capitalize(risk)} ${risk !== "all" ? " Risk" : ""}`}</p>
        </div>
      </div>
      <div>
        <p className="text-[#C8CBD7] text-[12px] w-[250px] lg:w-full">{text}</p>
      </div>
    </div>
  );
};

export default RiskTab;
