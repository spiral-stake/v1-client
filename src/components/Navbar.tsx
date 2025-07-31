import { Link } from "react-router-dom";
import { useChainId } from "wagmi";
import { chainConfig } from "../config/chainConfig";
import logo from "../assets/logo.svg"
import menuIcon from "../assets/icons/menu.svg"
import ConnectWalletBtn from "./ConnectWalletBtn";
import PositionManager from "../contract-hooks/PositionManager";

const Navbar = ({ showDropdown, positionManager }: { showDropdown: (bool: boolean) => void, positionManager?: PositionManager }) => {

  const appChainId = useChainId();

  return (<>
    <div className="w-full px-4 lg:px-16 py-4 border-b-[0.72px] border-white border-opacity-10 inline-flex justify-start items-center gap-3">
      <div className="w-6 h-6 relative overflow-hidden lg:hidden">
        <img
          src={menuIcon}
          alt=""
          className=" cursor-pointer"
          onClick={() => showDropdown(true)}
        />
      </div>

      <div className="flex-1 flex justify-between items-center">
        <div className="flex-1 flex justify-start items-center gap-3">
          <Link to={"/products"}>
            <div className="cursor-pointer flex items-center justify-center gap-1">
              <img src={logo} alt="" className="h-9 w-9" />
              <span className="hidden md:inline-flex text-xl font-semibold">Spiral Stake</span>
            </div>
          </Link>

          <div className="hidden lg:flex justify-start items-center ml-24 gap-10">
            <Link to={"/products"}>
              <div className="cursor-pointer text-center ">Products</div>
            </Link>
            {positionManager && <Link to={"/borrow"}>
              <div className="cursor-pointer text-center ">Borrow</div>
            </Link>}
            <Link to={"/portfolio"}>
              <div className="cursor-pointer text-center ">Portfolio</div>
            </Link>
            <Link target="blank" to="https://spiral-stake.gitbook.io/spiral-stake-docs">
              <div className="cursor-pointer text-center ">Learn</div>
            </Link>
          </div>
        </div>

        <div className="flex justify-start items-center gap-3">
          <div className="rounded-full flex justify-center items-center gap-2 overflow-hidden">
            <div className="cursor-pointer flex justify-start items-center gap-1">
              <div className=" relative overflow-hidden">
                <img className="w-8 h-8 rounded-full" src={chainConfig[appChainId].logo} alt="" />
              </div>
              <span className="hidden md:inline-flex font-semibold text-sm">Mainnet</span>
              {/* <div>
                  <img src={dropdown} alt="" className="h-3 w-3" /> 
                </div> */}
            </div>
          </div>
          <div
            data-property-1="Default"
            className="h-8 p-2 rounded-full flex justify-start items-center gap-1.5 overflow-hidden"
          >
            {/* <div className="cursor-pointer inline-flex mr-3 flex-col justify-start items-start overflow-hidden">
                <img src={bell} alt="" />
              </div> Needs to be uncommented */}
          </div>
          <div>
            <ConnectWalletBtn />
          </div>
        </div>
      </div>
    </div>
  </>);
}

export default Navbar; <div>
</div>