import React, { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import PositionManager from "./contract-hooks/PositionManager";
import ERC20 from "./contract-hooks/ERC20";
import FlashLeverage from "./contract-hooks/FlashLeverage";
import BorrowSwapper from "./contract-hooks/BorrowSwapper";
import LeverageWrapper from "./contract-hooks/LeverageWrapper";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import Products from "./pages/Products";
import Leverage from "./pages/Leverage";
import Borrow from "./pages/Borrow";
import Portfolio from "./pages/Portfolio";
import Overlay from "./components/low-level/Overlay";
import Navbar from "./components/Navbar";
import DropdownMenu from "./components/DropdownMenu";
import OnboardingOverlay from "./components/OnboardingOverlay";

const App = () => {
  const [positionManager, setpositionManager] = useState<PositionManager>();
  const [borrowSwapper, setBorrowSwapper] = useState<BorrowSwapper>();
  const [flashLeverage, setFlashLeverage] = useState<FlashLeverage>();
  const [leverageWrapper, setLeverageWrapper] = useState<LeverageWrapper>();
  const [onboarding, setOnboarding] = useState(false);
  const [dropdown, setDropDown] = useState(false);
  const [overlay, setOverlay] = useState<React.ReactNode>();

  const { address, chainId } = useAccount();
  const appChainId = useChainId();

  useEffect(() => {
    const onboardUser = async () => {
      if (!address || chainId !== appChainId || !positionManager)
        return setOnboarding(false);

      const collateralToken = new ERC20(positionManager.collateralTokens[0]);
      const collateralTokenBalance = await collateralToken.balanceOf(address);

      if (collateralTokenBalance.isZero()) {
        setOnboarding(true);
      } else {
        setOnboarding(false);
      }
    };

    onboardUser();
  }, [address, chainId, appChainId, positionManager]);

  useEffect(() => {
    const handleChainChange = async () => {
      const [
        _positionManager,
        _flashLeverage,
        _borrowSwapper,
        _leverageWrapper,
      ] = await Promise.all([
        PositionManager.createInstance(appChainId),
        FlashLeverage.createInstance(appChainId),
        BorrowSwapper.createInstance(appChainId),
        LeverageWrapper.createInstance(appChainId),
      ]);

      setpositionManager(_positionManager);
      setBorrowSwapper(_borrowSwapper);
      setFlashLeverage(_flashLeverage);
      setLeverageWrapper(_leverageWrapper);
    };

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

      <main className="px-4 lg:px-16">
        <Routes>
          <Route
            path="/products"
            element={<Products positionManager={positionManager} />}
          />
          <Route
            path="/leverage/:address"
            element={
              <Leverage
                leverageWrapper={leverageWrapper}
                positionManager={positionManager}
                flashLeverage={flashLeverage}
              />
            }
          />
          <Route
            path="/borrow"
            element={
              <Borrow
                borrowSwapper={borrowSwapper}
                positionManager={positionManager}
              />
            }
          />
          <Route
            path="/my-positions"
            element={
              <Portfolio
                positionManager={positionManager}
                flashLeverage={flashLeverage}
              />
            }
          />
          <Route path="*" element={<Navigate to={"/products"} />} />
        </Routes>

        <Overlay overlay={overlay} />
        <OnboardingOverlay
          onboarding={onboarding}
          setOnboarding={setOnboarding}
        />
      </main>
    </div>
  );
};

export default App;
