import FlashLeverage from "../../contract-hooks/FlashLeverage";
import InvestmentPlans from "./invetmentPlans";
import LeverageRange from "./leverageRange";
import ProfitChart from "./profitChart";
import ReviewOverlay from "./reviewOverlay";

const Test = ({ flashLeverage }: { flashLeverage: FlashLeverage }) => {
  console.log(flashLeverage);
  return (
    <div className="flex justify-center items-center py-[100px]">
      <ProfitChart />
    </div>
  );
};

export default Test;
