import logo from "../assets/logo.svg";
import fraxIcon from "../assets/icons/frax.svg";
import bell from "../assets/bell.svg";
import menuIcon from "../assets/icons/menu.svg";
import { Link } from "react-router-dom";
import ConnectWalletBtn from "./ConnectWalletButton";

function Navbar({ showDropdown }: { showDropdown: (bool: boolean) => void }) {
  return (
    <>
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
            <Link to={"/pools"}>
              <div className="cursor-pointer flex items-center justify-center gap-1">
                <img src={logo} alt="" className="h-9 w-9" />
                <span className="hidden md:inline-flex text-xl font-semibold">Spiral Stake</span>
              </div>
            </Link>

            <div className="hidden lg:flex justify-start items-center ml-24 gap-10">
              <Link target="blank" to="https://spiral-stake.gitbook.io/spiral-stake-docs">
                <div className="cursor-pointer text-center ">Learn</div>
              </Link>
              <Link to={"/markets"}>
                <div className="cursor-pointer text-center ">Markets</div>
              </Link>
              <Link to={"/borrow"}>
                <div className="cursor-pointer text-center ">Borrow</div>
              </Link>
              <Link to={"/loop"}>
                <div className="cursor-pointer text-center ">Loop</div>
              </Link>
              <Link to={"/my-positions"}>
                <div className="cursor-pointer text-center ">Portfolio</div>
              </Link>
            </div>
          </div>

          <div className="flex justify-start items-center gap-3">
            <div className="rounded-full flex justify-center items-center gap-2 overflow-hidden">
              <div className="cursor-pointer flex justify-start items-center gap-1">
                <div className=" relative overflow-hidden">
                  <img src={fraxIcon} alt="" className="w-5 h-5" />
                </div>
                <span className="hidden md:inline-flex font-semibold text-sm">Fraxtal</span>
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
    </>
  );
}

export default Navbar;
