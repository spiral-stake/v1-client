import { useEffect, useState } from "react";
import { getSlippage } from "../../utils/getSlippage";

const SlippageTab = ({
  amountCollateral,
  autoMode,
  setAutoMode,
  auto,
  slippage,
  setSlippage,
  value,
}: {
  amountCollateral: string;
  autoMode: boolean;
  setAutoMode: React.Dispatch<React.SetStateAction<boolean>>;
  auto?: boolean;
  slippage: number;
  setSlippage: React.Dispatch<React.SetStateAction<number>>;
  value: number;
}) => {
  const [selected, setSelected] = useState(false);

  useEffect(() => {
    if (slippage === value) {
      setSelected(true);
    } else {
      setSelected(false);
    }
  }, [slippage]);

  const handleSlippage = (value: number, isAuto?: boolean) => {
    if (isAuto) {
      setAutoMode(true);
      setSlippage(getSlippage(Number(amountCollateral)));
    } else {
      setAutoMode(false);
      setSlippage(value);
    }
  };

  return (
    <div
      onClick={() => handleSlippage(value, auto)}
      className="w-full cursor-pointer p-[8.5px] text-center rounded-[8px]"
      style={
        selected
          ? autoMode
            ? { background: "#446cb2ff" }
            : { background: "rgba(255, 255, 255, 0.1)" }
          : {}
      }
    >
      <p className="text-[12px]">{auto ? "Auto" : `${value * 100}%`}</p>
    </div>
  );
};

export default SlippageTab;
