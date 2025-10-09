import { ConnectButton } from "@rainbow-me/rainbowkit";
import BtnFull from "./low-level/BtnFull";
import ConnectBtnFull from "./low-level/ConnectBtnFull";

const ConnectWalletBtn = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        if (!connected) {
          return <ConnectBtnFull onClick={openConnectModal} text={"Connect"} />;
        }

        if (chain.unsupported) {
          return <ConnectBtnFull text={"Wrong Network"} onClick={openChainModal} />;
        }

        return (
          <ConnectBtnFull text={account.displayName} onClick={openAccountModal} />
        );
      }}
    </ConnectButton.Custom>
  );
};

export default ConnectWalletBtn;
