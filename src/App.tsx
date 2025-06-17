import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
// Components
import Navbar from "./components/Navbar";
import DropdownMenu from "./components/DropdownMenu";
// Pages
import Borrow from "./pages/Borrow";
import Portfolio from "./pages/Portfolio";
import { Token } from "./types";
import { useChainId } from "wagmi";
import { readCollateralTokens } from "./config/contractsData";
import Loop from "./pages/Loop";
import Markets from "./pages/Markets";
import PositionManager from "./contract-hooks/PositionManager";


function App() {
  const [dropdown, setDropDown] = useState(false);
  const [positionManager, setPositionManager] = useState<PositionManager>()

  const appChainId = useChainId();

  useEffect(() => {
    /**
     * @dev on appChainId change, reset the collateralTokens and positionManager according to the chain
     */
    async function handleChainChange() {
      const _positionManager = await PositionManager.createInstance(appChainId);


      setPositionManager(_positionManager);
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
          <Route path="/markets" element={<Markets positionManager={positionManager} />} />
          <Route path="/loop" element={<Loop positionManager={positionManager} />} />
          <Route path="/borrow" element={<Borrow positionManager={positionManager} />} />
          <Route path="/my-positions" element={<Portfolio positionManager={positionManager} />} />
          <Route path="*" element={<Navigate to={"/borrow"} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

