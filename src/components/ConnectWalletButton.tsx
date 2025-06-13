import { ConnectButton } from "@rainbow-me/rainbowkit";
import BtnFull from "./low-level/BtnFull";

const ConnectWalletBtn = () => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return <BtnFull onClick={openConnectModal} text={"Connect"} />;
        }

        if (chain.unsupported) {
          return <BtnFull text={"Wrong Network"} onClick={openChainModal} />;
        }

        return <BtnFull text={account.displayName} onClick={openAccountModal} />;
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectWalletBtn;
