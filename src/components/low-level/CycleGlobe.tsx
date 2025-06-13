import React from "react";
import Pool from "../../contract-hooks/Pool";
import { Cycle } from "../../types";
import Tag from "./Tag";
import Countdown from "react-countdown";
import { renderCountdownTag } from "../low-level/CountdownRenderer";

// Types
interface CycleGlobeProps {
  currentCycle: Cycle | undefined;
  pool: Pool;
  state: string | undefined;
}

interface CycleMarkerProps {
  cycle: number;
  currentCycle: Cycle | undefined;
  state: string | undefined;
  position: { x: number; y: number };
  cycleLabel: string;
}

interface Position {
  x: number;
  y: number;
  label: string;
}

// Constants for positions and styling
const CYCLE_POSITIONS: Position[] = [
  { x: -542, y: -762, label: "Cycle 1" }, // 10:30 position
  { x: 409, y: -770, label: "Cycle 2" }, // 1:30 position
];

/**
 * CycleMarker component to reduce repetition
 */
const CycleMarker: React.FC<CycleMarkerProps> = ({
  cycle,
  currentCycle,
  state,
  position,
  cycleLabel,
}) => {
  const isActive = state === "LIVE" && currentCycle?.count === cycle;
  const isCurrentCycleType =
    state === "LIVE" &&
    currentCycle &&
    (cycle % 2 === 0
      ? currentCycle.count % 2 === 0
      : currentCycle.count % 2 !== 0);

  return (
    <div
      className="absolute top-1/2 left-1/2 origin-center flex flex-col items-center gap-2"
      style={{
        transform: `translateX(${position.x}px) translateY(${position.y}px)`,
      }}
    >
      <div
        className={`w-6 h-6 p-1 ${
          isCurrentCycleType ? "bg-blue-600" : "bg-gray-600"
        } rounded-full bg-opacity-15`}
      >
        <div
          className={`w-4 h-4 bg-${
            isActive ? "blue" : "gray"
          }-600 rounded-full`}
        />
      </div>
      <div className="w-full text-center">{cycleLabel}</div>
      <div className="min-w-[120px] flex justify-center">
        {isCurrentCycleType && currentCycle ? (
          <Countdown
            date={currentCycle.endTime * 1000}
            renderer={renderCountdownTag}
            onComplete={() => {}} // closeCycleDepositAndBidWindow would be closed by PoolBidTab
          />
        ) : (
          <Tag color="gray" dot={false} text="00:00:00" />
        )}
      </div>
    </div>
  );
};

/**
 * CycleGlobe component that displays cycle markers in a circular layout
 */
const CycleGlobe: React.FC<CycleGlobeProps> = ({
  currentCycle,
  pool,
  state,
}) => {
  if (!pool.totalCycles) {
    return null;
  }

  const getCycleLabel = (position: number): string => {
    if (pool.totalCycles === 2 || !currentCycle) {
      return CYCLE_POSITIONS[position].label;
    }

    const cycleNumber =
      position === 0
        ? Math.min(pool.totalCycles - 1, currentCycle?.count)
        : Math.min(currentCycle?.count + 1, pool.totalCycles);

    return `Cycle ${cycleNumber}`;
  };

  return (
    <div className="absolute left-1/2 -translate-x-1/2 w-[1783px] h-[1783px] rounded-full transition-transform duration-1000 flex justify-around items-start">
      {/* Cycle 1 marker (odd cycles) */}
      <CycleMarker
        cycle={1}
        currentCycle={currentCycle}
        state={state}
        position={CYCLE_POSITIONS[0]}
        cycleLabel={getCycleLabel(0)}
      />

      {/* Cycle 2 marker (even cycles) */}
      <CycleMarker
        cycle={2}
        currentCycle={currentCycle}
        state={state}
        position={CYCLE_POSITIONS[1]}
        cycleLabel={getCycleLabel(1)}
      />
    </div>
  );
};

export default CycleGlobe;
