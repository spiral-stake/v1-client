import { Link } from "react-router-dom";
import externalLink from "../../assets/icons/externalLink.svg";
import vault from "../../assets/vault.png";
import { LeveragePosition } from "../../types";

const SpiralStakeVaults = () => {
  return (
    <div className="lg:w-[500px] bg-[radial-gradient(circle_400px_at_90%_240%,_rgba(0,0,255,1),_rgba(255,255,255,0.06))]
 flex gap-[8px] items-center p-[20px] rounded-[20px] border-[1px] border-[#B6B8C40F]">
      <div className="flex flex-col gap-[19px]">
        <div className="flex flex-col gap-[8px]">
          <p className="text-[16px] lg:text-[20px] font-[500]">Spiral Pools</p>
          <p className="text-[12px] lg:text-[14px] font-[400] text-[#B3B3B3]">
            Access stable, low-risk yields fueling leverage strategies on spiral stake
          </p>
        </div>
        <Link target="blank" to={"https://lend.spiralstake.xyz/"} className="flex items-center gap-[8px]">
          <p className="text-[12px] lg:text-[16px]">Learn More</p>
          <img src={externalLink} alt="" className="w-[12px] lg:w-[16px]" />
        </Link>
      </div>
      <div className="">
        <img src={vault} alt="" className="w-[100px] lg:w-[130px] lg:h-[130px]" />
      </div>
    </div >
  );
};

export default SpiralStakeVaults;
