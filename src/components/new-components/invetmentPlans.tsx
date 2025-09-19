import FlashLeverage from "../../contract-hooks/FlashLeverage";
import BtnFull from "../low-level/BtnFull";

const InvestmentPlans = ({
  flashLeverage,
}: {
  flashLeverage: FlashLeverage;
}) => {
  return (
    <div>
      <div>
        <BtnFull text="investment plans" onClick={() => {}} />
      </div>
      <div></div>
      <div></div>
    </div>
  );
};

export default InvestmentPlans;
