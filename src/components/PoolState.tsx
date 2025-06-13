import { Cycle } from "../types";
import Tag from "./low-level/Tag";
import TextLoading from "./low-level/TextLoading";

const PoolState = ({
  state,
  currentCycle,
  totalCycles,
  positionsFilled,
  totalPositions,
}: {
  state: string | undefined;
  currentCycle: Cycle | undefined;
  totalCycles: number;
  positionsFilled: number;
  totalPositions: number;
}) => {
  const renderPoolState = () => {
    if (state === "WAITING") {
      return (
        <Tag
          color="yellow"
          text={
            positionsFilled === totalPositions
              ? "Pool is filled"
              : `Waiting ${positionsFilled}/${totalPositions}`
          }
          dot={true}
        />
      );
    } else if (state === "DISCARDED") {
      return <Tag color="red" text={"Pool Discarded"} dot={true} />;
    } else if (state === "LIVE") {
      return (
        <Tag
          color="green"
          text={`Current cycle ${currentCycle?.count}/${totalCycles}`}
          dot={true}
        />
      );
    } else if (state === "ENDED") {
      return <Tag color="gray" text={"Pool is Ended"} dot={true} />;
    }
  };

  return state ? renderPoolState() : <TextLoading width={50} />;
};

export default PoolState;
