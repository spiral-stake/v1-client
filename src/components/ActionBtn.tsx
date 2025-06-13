import { useAccount, useSwitchChain } from "wagmi";
import { chainConfig } from "../config/chainConfig";
import ConnectWalletBtn from "./ConnectWalletButton";
import BtnFull from "./low-level/BtnFull";

const ActionBtn = ({
  expectedChainId,
  onClick,
  disabled,
  text,
}: {
  expectedChainId: number;
  onClick: () => void;
  disabled: boolean;
  text: string;
}) => {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  return address ? (
    chainId === expectedChainId ? (
      <BtnFull text={text} onClick={onClick} disabled={disabled} />
    ) : (
      <BtnFull
        text={`Switch to ${chainConfig[expectedChainId].name}`}
        onClick={() => switchChain({ chainId: expectedChainId })}
        disabled={false}
      />
    )
  ) : (
    <ConnectWalletBtn />
  );
};

export default ActionBtn;
