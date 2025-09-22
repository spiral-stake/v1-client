import { useEffect, useState } from "react";

const SlippageTab = ({
  slippage,
  setSlippage,
  value,
}: {
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

  return (
    <div
      onClick={() => setSlippage(value)}
      className="w-full cursor-pointer p-[8.5px] text-center rounded-[8px]"
      style={selected ? { background: "rgba(255, 255, 255, 0.1)" } : {}}
    >
      <p className="text-[12px]">{value * 100}%</p>
    </div>
  );
};

export default SlippageTab;
