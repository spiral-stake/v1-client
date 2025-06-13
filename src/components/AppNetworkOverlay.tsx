import { chainConfig } from "../config/chainConfig";
import closeIcon from "../assets/images/close.svg";
import { useChainId, useSwitchChain } from "wagmi";

const AppNetworkOverlay = ({ switchingNetwork, setSwitchingNetwork }: { switchingNetwork: boolean, setSwitchingNetwork: (value: boolean) => void }) => {
    const chains = Object.values(chainConfig);

    const { switchChain } = useSwitchChain();
    const appChainId = useChainId();

    const handleNetworkChange = async (chainId: number) => {
        switchChain({ chainId });
        setSwitchingNetwork(false);
    };

    return (
        switchingNetwork && (
            <>Unused</>
        )
    );
};

export default AppNetworkOverlay;
