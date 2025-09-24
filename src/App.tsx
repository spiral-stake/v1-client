import React, { useEffect, useState } from "react";
import { useAccount, useChainId } from "wagmi";
import FlashLeverage from "./contract-hooks/FlashLeverage";
import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import Products from "./pages/Products";
import Portfolio from "./pages/Portfolio";
import Overlay from "./components/low-level/Overlay";
import Navbar from "./components/Navbar";
import DropdownMenu from "./components/DropdownMenu";
import Loader from "./components/low-level/Loader";
import axios from "axios";
import Test from "./components/new-components/test";
import ProductPage from "./pages/ProductPage";

function App() {
  const [flashLeverage, setFlashLeverage] = useState<FlashLeverage>();
  const [dropdown, setDropDown] = useState(false);
  const [overlay, setOverlay] = useState<React.ReactNode>();

  const { address, chainId } = useAccount();
  const appChainId = useChainId();

  useEffect(() => {
    if (!address || chainId === 31337) return;

    // Dashboard Related
    axios.post("https://dapi.spiralstake.xyz/user", {
      address: address.toLowerCase(),
    });
  }, [address]);

  useEffect(() => {
    /**
     * @dev on appChainId change, reset the collateralTokens and positionManager according to the chain
     */
    async function handleChainChange() {
      const [_flashLeverage] = await Promise.all([
        FlashLeverage.createInstance(appChainId),
      ]);
      setFlashLeverage(_flashLeverage);
    }

    handleChainChange();
  }, [appChainId]);

  const showDropdown = (bool: boolean) => setDropDown(bool);

  return (
    <div className="app font-[Outfit] font-[340] relative overflow-hidden ">
      <Toaster />
      {!dropdown ? (
        <Navbar showDropdown={showDropdown} />
      ) : (
        <DropdownMenu showDropdown={showDropdown} />
      )}

      {flashLeverage && !dropdown ? (
        <main className="px-4 lg:px-16">
          <Routes>
            <Route
              path="/products"
              element={<Products flashLeverage={flashLeverage} />}
            />
            <Route
              path="/products/:address"
              element={<ProductPage flashLeverage={flashLeverage} />}
            />
            <Route
              path="/portfolio"
              element={<Portfolio flashLeverage={flashLeverage} />}
            />
            <Route path="*" element={<Navigate to={"/products"} />} />
            <Route
              path="/test"
              element={<Test flashLeverage={flashLeverage} />}
            />
          </Routes>

          <Overlay overlay={overlay} />
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
