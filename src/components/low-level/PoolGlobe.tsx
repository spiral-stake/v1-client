import Pool from "../../contract-hooks/Pool";
import { Cycle } from "../../types";
import { formatTime } from "../../utils/time";
import TagSquare from "./TagSquare";

const PoolGlobe = ({
  pool,
  currentCycle,
}: {
  pool: Pool;
  currentCycle: Cycle | undefined;
}) => {
  //cycle divs
  const angleOffset = 20;

  const items = [1, 2, 3, 4, 5, 6, 7, 8];

  //globe div rotation
  const globeRotate = (360/items.length) * 0;

  //individual angle
  const seperationAngle = currentCycle ? 360 / currentCycle?.count : 0;

  return (
    <>
      {/* <div
        className={`absolute left-1/2 -translate-x-1/2 w-[1783px] h-[1783px] bg-[linear-gradient(180deg,#01152a_1.93%,#03050d_28.18%)] rounded-full border-4  border-gray-900  border-l-blue-600 border-b-blue-600 transition-transform duration-1000 rotate-[${globeRotate}deg]  flex justify-around items-start`}
      ></div>
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-[1783px] h-[1783px] bg-transparent rounded-full rotate-[${
          360 + angleOffset
        }deg] flex justify-around items-start`}
      >
        {new Array(pool.totalCycles).map((_, index) => {
          // Adjust the starting angle to compensate for the parent's rotation
          // Since parent is rotated 345deg (or -15deg), we add 15deg to the starting position
          // To counteract the parent's rotation of 345deg (which is -15deg)
          const angle = (index * 360) / pool.totalCycles + angleOffset;
          const radius = "890px";

          return (
            <div
              key={index}
              className="absolute top-1/2 left-1/2 w-15 h-8 mt-5 -ml-8 flex items-center justify-center"
              style={{
                transform: `rotate(${angle}deg) translateY(-${radius}) rotate(-${angle}deg)`,
              }}
            >
              <div className="flex flex-col items-center justify-center w-full h-full  text-white font-bold">
                <div className="w-5 h-5 rounded-full bg-blue-600 bg-opacity-50 p-1 mb-5">
                  <div className="w-3 h-3 rounded-full bg-blue-600"></div>
                </div>
                <span className="w-full text-center">Cycle {currentCycle?.count}</span>
                <TagSquare color="green" text="02:03:14" />
              </div>
            </div>
          );
        })}
      </div> */}

      <div
        className={`absolute left-1/2 -translate-x-1/2 w-[1783px] h-[1783px] bg-[linear-gradient(180deg,#01152a_1.93%,#03050d_28.18%)] rounded-full border-4  border-gray-900  border-l-blue-600 border-b-blue-600 transition-transform duration-1000  rotate-[${globeRotate}deg]  flex justify-around items-start`}
      ></div>
      <div className="absolute left-1/2 -translate-x-1/2 w-[1783px] h-[1783px] bg-transparent rounded-full rotate-[345deg] flex justify-around items-start">
        {items.map((item, index) => {
          // Adjust the starting angle to compensate for the parent's rotation
          // Since parent is rotated 345deg (or -15deg), we add 15deg to the starting position
         // To counteract the parent's rotation of 345deg (which is -15deg)
          const angle = (index * 360) / items.length + angleOffset;
          const radius = "890px";

          return (
            <div
              key={index}
              className="absolute top-1/2 left-1/2 w-8 h-8 -mt-4 -ml-4 flex items-center justify-center"
              style={{
                transform: `rotate(${angle}deg) translateY(-${radius}) rotate(-${
                  angle - angleOffset/2
                }deg)`,
              }}
            >
              <div className="flex items-center justify-center w-full h-full rounded-full bg-blue-500 text-white font-bold">
                {item}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default PoolGlobe;
