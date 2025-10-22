import morpho from "../../assets/icons/morpho.svg";
import externalLink from "../../assets/icons/externalLink.svg";
import { Link } from "react-router-dom";

const MorphoLink = ({ link }: { link: string }) => {
  return (
    <Link target="blank" to={link} className="flex items-center h-full gap-[4px] px-[14px] py-[10px] rounded-[999px] bg-white bg-opacity-[12%]">
      <img src={morpho} alt="" className="w-[12.8px] h-[12px]" />
      <img src={externalLink} alt="" className="w-[12px] h-[12px]" />
    </Link>
  );
};

export default MorphoLink;
