import CopyText from "./CopyText";
import groupIcon from "../../assets/icons/Group.svg";
import { Token } from "../../types";
import ERC20 from "../../contract-hooks/ERC20";
import truncateStr from "../../utils/truncateStr";

const TokenData = ({ token }: { token: ERC20 }) => {
  return (
    <div className="inline-flex justify-end items-center gap-3">
      <img src={groupIcon} alt="" />
      <div className="inline-flex flex-col justify-start items-start gap-1">
        <div className="justify-center text-neutral-200 text-xl font-medium font-['Outfit']">
          {token.symbol}
        </div>
        <CopyText text={truncateStr(token.address, 15)} />
      </div>
    </div>
  );
};

export default TokenData;
