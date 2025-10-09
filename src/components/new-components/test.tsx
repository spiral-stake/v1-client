import FlashLeverage from "../../contract-hooks/FlashLeverage";
import InvestmentPlans from "./investmentPlans";
import LeverageRange from "./leverageRange";
import ProfitChart from "./profitChart";
import ReviewOverlay from "./DepositReviewOverlay";

const Test = ({ flashLeverage }: { flashLeverage: FlashLeverage }) => {
  return (
    <div className="flex justify-center items-center py-[100px]">
      <ProfitChart />
    </div>
  );
};

export default Test;
