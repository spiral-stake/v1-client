import ERC20 from "../../contract-hooks/ERC20";
import { Token, Ybt } from "../../types";

const SelectToken = ({
  tokens,
  handleTokenChange,
  selectedToken,
}: {
  tokens: Ybt[] | Token[] | ERC20[];
  handleTokenChange: (tokenSymbol: string) => void;
  selectedToken: Ybt | Token | ERC20;
}) => {
  return (
    <div className="w-fit flex flex-row p-1 text-xs rounded-md gap-3 flex-wrap">
      {tokens.map((token) => (
        <div
          onClick={() => handleTokenChange(token.symbol)}
          key={token.symbol}
          className={`w-fit gap-1 py-2 flex justify-center items-center p-1 px-3 rounded cursor-pointer transition-all ease-out duration-75 ${
            selectedToken.symbol === token.symbol
              ? "outline outline-2 outline-white"
              : "outline outline-2 outline-[#34383E]"
          }`}
        >
          <div
            className={`w-4 h-4 rounded-full bg-white ${
              selectedToken.symbol === token.symbol ? "" : "opacity-10"
            }`}
          ></div>
          <span>{token.symbol}</span>
        </div>
      ))}
    </div>
  );
};

export default SelectToken;
