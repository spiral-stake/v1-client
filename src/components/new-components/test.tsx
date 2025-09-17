import FlashLeverage from "../../contract-hooks/FlashLeverage";
import LeverageRange from "./leverageRange";
import ReviewOverlay from "./reviewOverlay";

const Test = ({ flashLeverage }: { flashLeverage: FlashLeverage }) => {
  console.log(flashLeverage);
  return (
    <div className="flex justify-center items-center py-[100px]">
      <ReviewOverlay/>
    </div>
  );
};

export default Test;
