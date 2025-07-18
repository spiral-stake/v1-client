import React, { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import ERC20 from "./contract-hooks/ERC20";
import FlashLeverage from "./contract-hooks/FlashLeverage";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import Products from "./pages/Products";
import Leverage from "./pages/Leverage";
import Portfolio from "./pages/Portfolio";
import Overlay from "./components/low-level/Overlay";
import Navbar from "./components/Navbar";
import DropdownMenu from "./components/DropdownMenu";
import OnboardingOverlay from "./components/OnboardingOverlay";
import Loader from "./components/low-level/Loader";
import LeverageWrapper from "./contract-hooks/LeverageWrapper";
import axios from "axios";

function App() {
  const [flashLeverage, setFlashLeverage] = useState<FlashLeverage>();
  const [leverageWrapper, setLeverageWrapper] = useState<LeverageWrapper>()
  const [onboarding, setOnboarding] = useState(false);
  const [dropdown, setDropDown] = useState(false);
  const [overlay, setOverlay] = useState<React.ReactNode>();

  const { address, chainId } = useAccount();
  const appChainId = useChainId();

  useEffect(() => {
    if (!address) return

    // Dashboard Related
    axios.post("https://dapi.spiralstake.xyz/user", {
      address
    })
  }, [address])

  useEffect(() => {
    const onboardUser = async () => {
      if (!address || chainId !== 31337 || chainId !== appChainId || !flashLeverage)
        return setOnboarding(false);

      const collateralToken = new ERC20(flashLeverage.collateralTokens[0]);
      const collateralTokenBalance = await collateralToken.balanceOf(address);

      if (collateralTokenBalance.isZero()) {
        setOnboarding(true);
      } else {
        setOnboarding(false);
      }
    };

    onboardUser();
  }, [address, chainId, appChainId, flashLeverage]);

  useEffect(() => {
    /**
     * @dev on appChainId change, reset the collateralTokens and positionManager according to the chain
     */
    async function handleChainChange() {
      const [_flashLeverage, _leverageWrapper] = await Promise.all([FlashLeverage.createInstance(appChainId), LeverageWrapper.createInstance(appChainId)]);

      setFlashLeverage(_flashLeverage);
      setLeverageWrapper(_leverageWrapper);
    }

    handleChainChange();
  }, [appChainId]);

  const showDropdown = (bool: boolean) => setDropDown(bool);

  return (
    <div className="app font-[Outfit] relative overflow-hidden ">
      <Toaster />
      {!dropdown ? (
        <Navbar showDropdown={showDropdown} />
      ) : (
        <DropdownMenu showDropdown={showDropdown} />
      )}

      {flashLeverage && leverageWrapper ? (
        <main className="px-4 lg:px-16">
          <Routes>
            <Route path="/products" element={<Products flashLeverage={flashLeverage} />} />
            <Route path="/leverage/:address" element={<Leverage flashLeverage={flashLeverage} leverageWrapper={leverageWrapper} />} />
            <Route path="/portfolio" element={<Portfolio flashLeverage={flashLeverage} />} />
            <Route path="*" element={<Navigate to={"/products"} />} />
          </Routes>

          <Overlay overlay={overlay} />
          <OnboardingOverlay onboarding={onboarding} setOnboarding={setOnboarding} />
        </main>
      ) : (
        <div className="mt-10">
          <Loader />
        </div>
      )}
    </div>
  );
}

export default App;
