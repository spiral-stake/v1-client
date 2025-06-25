import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
// Components
import Navbar from "./components/Navbar";
import DropdownMenu from "./components/DropdownMenu";
// Pages
import Borrow from "./pages/Borrow";
import Portfolio from "./pages/Portfolio";
import { useAccount, useChainId } from "wagmi";
import Products from "./pages/Products";
import PositionManager from "./contract-hooks/PositionManager";
import ERC20 from "./contract-hooks/ERC20";
import OnboardingOverlay from "./components/OnboardingOverlay";
import Overlay from "./components/low-level/Overlay";
import FlashLeverage from "./contract-hooks/FlashLeverage";
import BorrowPyUsd from "./contract-hooks/BorrowSwapper";
import LeverageWrapper from "./contract-hooks/LeverageWrapper";
import Leverage from "./pages/Leverage";

function App() {
  const [dropdown, setDropDown] = useState(false);
  const [positionManager, setPositionManager] = useState<PositionManager>();
  const [borrowSwapper, setBorrowSwapper] = useState<BorrowPyUsd>();
  const [flashLeverage, setFlashLeverage] = useState<FlashLeverage>();
  const [leverageWrapper, setLeverageWrapper] = useState<LeverageWrapper>();
  const [onboarding, setOnboarding] = useState(false);
  const [overlay, setOverlay] = useState<React.ReactNode>();

  const { address, chainId } = useAccount();
  const appChainId = useChainId();

  useEffect(() => {
    /**
     * @dev Checks if the user's ybt balance is 0, and airdrop ybt and baseTokens for testnet onboarding
     */
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
    /**
     * @dev on appChainId change, reset the collateralTokens and positionManager according to the chain
     */
    async function handleChainChange() {
      const [_positionManager, _flashLeverage, _borrowSwapper, _leverageWrapper] = await Promise.all([
        PositionManager.createInstance(appChainId),
        FlashLeverage.createInstance(appChainId),
        BorrowPyUsd.createInstance(appChainId),
        LeverageWrapper.createInstance(appChainId)
      ]);


      setPositionManager(_positionManager);
      setFlashLeverage(_flashLeverage);
      setBorrowSwapper(_borrowSwapper);
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
            element={<Borrow borrowSwapper={borrowSwapper} positionManager={positionManager} />}
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
}

export default App;
