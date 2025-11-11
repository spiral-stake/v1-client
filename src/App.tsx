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
import ProductPage from "./pages/ProductPage";
import { LeveragePosition, Metrics, ServerLeveragePosition } from "./types";
import { updatePositionsData } from "./utils/updatePositionsData";

const devTeamWallet =
  "0x386fB147faDb206fb7Af36438E6ae1f8583f99dd".toLowerCase();

function App() {
  const [flashLeverage, setFlashLeverage] = useState<FlashLeverage>();
  const [dropdown, setDropDown] = useState(false);
  const [overlay, setOverlay] = useState<React.ReactNode>();
  const [showHelpTabs, setShowHelpTabs] = useState(false);
  const [metrics, setMetrics] = useState<Metrics[]>([]);
  const [allLeveragePositions, setAllLeveragePositions] = useState<
    LeveragePosition[]
  >([]);

  const { address, chainId } = useAccount();
  const appChainId = useChainId();

  useEffect(() => {
    if (!address) return;

    // Dashboard Related
    const baseUrl =
      chainId !== 31337
        ? "https://api.spiralstake.xyz"
        : "http://localhost:5000";

    axios.post(`${baseUrl}/user`, {
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

  useEffect(() => {
    if (!flashLeverage) return;

    const fetchData = async () => {
      try {
        const { serverLeveragePositions, metrics } = await fetchServerData();
        setMetrics(metrics);

        // derive user addresses
        const userAddresses = getUniqueUsers(serverLeveragePositions);

        // batch fetch all users' leverage data in parallel
        const leverageResults = await Promise.all(
          userAddresses.map(async (address) => {
            try {
              const userPositions =
                await flashLeverage.getUserLeveragePositions(address);
              return updatePositionsData(
                serverLeveragePositions,
                address,
                userPositions
              );
            } catch (err) {
              console.warn(`Failed fetching positions for ${address}:`, err);
              return [];
            }
          })
        );

        // flatten once
        const merged = leverageResults.flat();
        setAllLeveragePositions(merged);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    // small debounce (prevents multiple trigger loops)
    const timeout = setTimeout(fetchData, 200);
    return () => clearTimeout(timeout);
  }, [flashLeverage]);

  //helpers//

  const fetchServerData = async () => {
    const baseUrl =
      import.meta.env.VITE_ENV === "prod"
        ? "https://api.spiralstake.xyz"
        : "http://localhost:5000";

    const [levRes, metricsRes] = await Promise.all([
      axios.get(`${baseUrl}/leveragePositions`),
      axios.get(`${baseUrl}/metrics`),
    ]);

    return {
      serverLeveragePositions: levRes.data as ServerLeveragePosition[],
      metrics: metricsRes.data as Metrics[],
    };
  };

  const getUniqueUsers = (positions: any[]): string[] => {
    const addresses: Record<string, boolean> = {};
    for (const p of positions) {
      const addr = p.positionId.slice(0, 42).toLowerCase();
      if (addr === devTeamWallet) continue;
      addresses[addr] = true;
    }
    return Object.keys(addresses);
  };

  return (
    <div
      onClick={() => {
        setShowHelpTabs(false);
      }}
      className="app font-[Outfit] font-[340] relative overflow-hidden "
    >
      {/* <div onClick={(e) => e.stopPropagation()}>
        <NewHelp setShowHelpTabs={setShowHelpTabs} showHelpTabs={showHelpTabs} />
      </div> */}
      <Toaster />
      {!dropdown ? (
        <Navbar showDropdown={showDropdown} />
      ) : (
        <DropdownMenu showDropdown={showDropdown} />
      )}

      {flashLeverage && !dropdown && allLeveragePositions.length ? (
        <main className="px-4 lg:px-16">
          <Routes>
            <Route
              path="/products"
              element={
                <Products
                  flashLeverage={flashLeverage}
                  allLeveragePositions={allLeveragePositions}
                  metrics={metrics}
                />
              }
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
            {/* <Route
              path="/test"
              element={<Test flashLeverage={flashLeverage} />}
            /> */}
          </Routes>

          <Overlay overlay={overlay} />
        </main>
      ) : (
        <div className={`mt-10 ${dropdown ? "hidden" : ""}`}>
          <Loader />
        </div>
      )}

      {/* {showFeedback && (
        <Overlay overlay={<Feedback setShowFeedback={setShowFeedback} />} />
      )} */}
    </div>
  );
}

export default App;
