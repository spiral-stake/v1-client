import { Link, useLocation } from "react-router-dom";
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
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path ? "text-white" : "text-[#C3C3C3]";

  return (
    <>
      <div className="w-full px-4 lg:px-16 py-4 border-b-[0.72px] border-white border-opacity-10 inline-flex justify-start items-center gap-3">
        <div className="inline-flex overflow-hidden lg:hidden">
          <img
            src={menuIcon}
            alt=""
            className="w-[24px] h-[24px] cursor-pointer"
            onClick={() => showDropdown(true)}
          />
        </div>

        <div className="flex w-full justify-between items-center">
          <div className="lg:w-[800px] flex items-center justify-start lg:justify-between">
            {/* logo part */}
            <div className="flex justify-start items-center gap-3">
              <Link to={"/products"}>
                <div className="cursor-pointer flex items-center justify-center gap-1">
                  <img src={logo} alt="" className="h-9 w-9" />
                  <span className="hidden md:inline-flex text-xl font-medium">
                    Spiral Stake
                  </span>
                </div>
              </Link>
            </div>

            {/* index */}
            <div className="hidden lg:flex justify-start text-[16px] items-center gap-10">
              <Link to={"/products"}>
                <div
                  className={`cursor-pointer text-center hover:text-white ${isActive(
                    "/products"
                  )}`}
                >
                  Products
                </div>
              </Link>
              <Link to={"/portfolio"}>
                <div
                  className={`cursor-pointer text-center hover:text-white ${isActive(
                    "/portfolio"
                  )}`}
                >
                  Portfolio
                </div>
              </Link>
              <Link target="blank" to="https://docs.spiralstake.xyz">
                <div className="cursor-pointer text-center text-[#C3C3C3] hover:text-white">
                  Docs
                </div>
              </Link>
            </div>
          </div>

          {/* chain and login */}
          <div className="flex justify-start items-center gap-3">
            <div className="rounded-full flex justify-center items-center gap-2 overflow-hidden">
              <div className="cursor-pointer flex justify-start items-center gap-[4px]">
                <div className=" relative overflow-hidden">
                  <div className="w-[21px] h-[21px]">
                    <img
                      className=""
                      src={chainConfig[appChainId].logo}
                      alt=""
                    />
                  </div>
                </div>
                <span className="hidden md:inline-flex text-[14px] font-[400]">
                  Mainnet
                </span>
              </div>
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
