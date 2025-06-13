import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
// Components
import Navbar from "./components/Navbar";
import DropdownMenu from "./components/DropdownMenu";
// Pages
import Borrow from "./pages/Borrow";
import MyPositions from "./pages/MyPosition";
import { Token } from "./types";
import { useChainId } from "wagmi";
import { readCollateralTokens } from "./config/contractsData";


function App() {
  const [dropdown, setDropDown] = useState(false);
  const [collateralTokens, setCollateralTokens] = useState<Token[]>([]);

  const appChainId = useChainId();

  useEffect(() => {
    /**
     * @dev on appChainId change, reset the collateralTokens and positionManager according to the chain
     */
    async function handleChainChange() {
      console.log("hey")
      const [_collateralTokens] = await Promise.all([readCollateralTokens(appChainId)]);

      setCollateralTokens(_collateralTokens);
    }

    handleChainChange();
  }, [appChainId]);

  console.log(collateralTokens);

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
          <Route path="/borrow" element={<Borrow collateralTokens={collateralTokens} />} />
          <Route path="/my-positions" element={<MyPositions collateralTokens={collateralTokens} />} />
          <Route path="*" element={<Navigate to={"/borrow"} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

