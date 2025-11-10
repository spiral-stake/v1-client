import externalLink from "../../assets/icons/externalLink.svg";
import vault from "../../assets/vault.png";

const SpiralStakeVaults = () => {
  return (
    <div className="w-[455px] bg-[radial-gradient(circle_400px_at_90%_240%,_rgba(0,0,255,1),_rgba(255,255,255,0.06))]
 flex gap-[8px] items-center p-[20px] rounded-[20px] border-[1px] border-[#B6B8C40F]">
      <div className="flex flex-col gap-[19px]">
        <div className="flex flex-col gap-[8px]">
          <p className="text-[20px] font-[500]">Spiral Stake Vaults</p>
          <p className="text-[14px] font-[400] text-[#B3B3B3]">
            Get one-click access to Spiral Stake’s <br/> optimized DeFi yield
            vaults—automated for <br/> peak performance.
          </p>
        </div>
        <div className="flex items-center gap-[8px]">
          <p className="text-[16px]">Learn More</p>
          <img src={externalLink} alt="" className="w-[16px]" />
        </div>
      </div>
      <div className="">
        <img src={vault} alt="" className="w-[130px] h-[130px]" />
      </div>
    </div>
  );
};

export default SpiralStakeVaults;
