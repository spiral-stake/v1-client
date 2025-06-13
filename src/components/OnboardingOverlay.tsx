import { useState } from "react";
import { useAccount } from "wagmi";
import { onboard } from "../utils/onboard";
import { handleAsync } from "../utils/handleAsyncFunction";
import "../Overlay.css";
import BtnFull from "./low-level/BtnFull";
import Loading from "./low-level/Loading";

function OnboardingOverlay({
  onboarding,
  setOnboarding,
}: {
  onboarding: boolean;
  setOnboarding: (value: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);

  const { address, chainId } = useAccount();

  const handleOnboarding = async () => {
    if (!chainId || !address) return;

    await onboard(chainId, address);
    setOnboarding(false);
  };

  return (
    onboarding && (
      <section className="z-10 fixed top-0 left-0 bg-neutral-700 bg-opacity-50 flex justify-center items-end lg:items-center w-[100vw] h-[100vh]">
        <div className="w-[500px] px-5 py-5 bg-gradient-to-b from-slate-900 to-gray-950 rounded-xl lg:rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-800 inline-flex flex-col justify-start items-center gap-6">
          <h2>Beta Users</h2>
          {!loading ? (
            <>
              <BtnFull
                text={"Claim Faucet & Test tokens"}
                onClick={handleAsync(handleOnboarding, setLoading)}
                disabled={loading}
              />
            </>
          ) : (
            <Loading loadingText="Sending faucet" />
          )}
        </div>
      </section>
    )
  );
}

export default OnboardingOverlay;
