import { useAccount, useSwitchChain } from "wagmi";
import { chainConfig } from "../config/chainConfig";
import ConnectWalletBtn from "./ConnectWalletBtn";
import BtnFull from "./low-level/BtnFull";

const ActionBtn = ({
  expectedChainId,
  onClick,
  disabled,
  text,
  btnLoading,
  completed,
}: {
  expectedChainId: number;
  onClick: () => void;
  text: string;
  disabled?: boolean;
  btnLoading?: boolean;
  completed?: boolean;
}) => {
  const { address, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  return address ? (
    chainId === expectedChainId ? (
      <BtnFull
        text={text}
        onClick={onClick}
        disabled={disabled}
        btnLoading={btnLoading}
        completed={completed}
      />
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
