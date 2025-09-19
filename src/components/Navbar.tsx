import { Link } from "react-router-dom";
import { useChainId } from "wagmi";
import { chainConfig } from "../config/chainConfig";
import logo from "../assets/logo.svg";
import menuIcon from "../assets/icons/menu.svg";
import ConnectWalletBtn from "./ConnectWalletBtn";

const Navbar = ({
  showDropdown,
}: {
  showDropdown: (bool: boolean) => void;
}) => {
  const appChainId = useChainId();

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

        <div className="flex w-full justify-between items-center">
          {/* logo part */}
          <div className="flex justify-start items-center gap-3">
            <Link to={"/products"}>
              <div className="cursor-pointer flex items-center justify-center gap-1">
                <img src={logo} alt="" className="h-9 w-9" />
                <span className="hidden md:inline-flex text-xl font-semibold">
                  Spiral Stake
                </span>
              </div>
            </Link>
          </div>

          {/* index */}
          <div className="hidden lg:flex justify-start text-[16px] font-[400] items-center gap-10">
            <Link to={"/products"}>
              <div className="cursor-pointer text-center font-[500]">
                Products
              </div>
            </Link>
            <Link to={"/portfolio"}>
              <div className="cursor-pointer text-center text-[#C3C3C3] hover:text-white hover:font-[500]">
                Portfolio
              </div>
            </Link>
            <Link
              target="blank"
              to="https://spiral-stake.gitbook.io/spiral-stake-docs"
            >
              <div className="cursor-pointer text-center text-[#C3C3C3] hover:text-white hover:font-[500]">
                Learn
              </div>
            </Link>
          </div>

          {/* chain and login */}
          <div className="flex justify-start items-center gap-3">
            <div className="rounded-full flex justify-center items-center gap-2 overflow-hidden">
              <div className="cursor-pointer flex justify-start items-center gap-[4px]">
                <div className=" relative overflow-hidden">
                  <img
                    className="w-[20px] h-[20px] rounded-full"
                    src={chainConfig[appChainId].logo}
                    alt=""
                  />
                </div>
                <span className="hidden md:inline-flex text-[14px] font-[400]">
                  Mainnet
                </span>
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
};

export default Navbar;
<div></div>;
