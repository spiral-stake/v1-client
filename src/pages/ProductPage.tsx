import { useEffect, useState } from "react";
import PageTitle from "../components/low-level/PageTitle";
import LTVSlider from "../components/LTVSlider";
import BigNumber from "bignumber.js";
import { CollateralToken, InternalSwapData, Token } from "../types";
import { useAccount, useChainId } from "wagmi";
import { calcLeverageApy, calcMaxLeverage } from "../utils";
import ActionBtn from "../components/ActionBtn";
import ERC20 from "../contract-hooks/ERC20";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import TokenAmount from "../components/TokenAmount";
import APYInfo from "../components/InfoSection";
import LeverageBreakdown from "../components/LeverageBreakdown";
import Action from "../components/Action";
import { Link, useNavigate, useParams } from "react-router-dom";
import SectionOverlay from "../components/low-level/SectionOverlay";
import lockIcon from "../assets/icons/lock-svgrepo-com.svg";
import closeIcon from "../assets/icons/close.svg";
import {
  getExternalSwapData,
  getInternalSwapData,
} from "../api-services/swapAggregator";
import axios from "axios";
import arrowBack from "../assets/icons/arrowBack.svg";
import ProductTitle from "../components/new-components/productTitle";
import chart from "../assets/Chart.svg";
import pencil from "../assets/icons/pencil.svg";
import infoIcon from "../assets/icons/infoIcon.svg";
import wallet from "../assets/icons/wallet.svg";
import arrowDown from "../assets/icons/arrowDown.svg";

const ProductPage = ({ flashLeverage }: { flashLeverage: FlashLeverage }) => {
  const [collateralToken, setCollateralToken] = useState<CollateralToken>();
  const [fromToken, setFromToken] = useState<Token>();
  const [amountCollateral, setAmountCollateral] = useState("");
  const [desiredLtv, setDesiredLtv] = useState("");
  const [maxLeverage, setMaxLeverage] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [userFromTokenBalance, setUserFromTokenBalance] = useState<BigNumber>(
    BigNumber(0)
  );
  const [userFromTokenAllowance, setUserFromTokenAllowance] =
    useState<BigNumber>(BigNumber(0));
  const [actionBtn, setActionBtn] = useState({
    text: "Leverage",
    onClick: () => {
      setShowSummary(true);
    },
    disabled: false,
    error: "",
  });
  const [externalSwapData, setExternalSwapData] = useState<InternalSwapData>(); // Only used by leverageWrapper
  const [internalSwapData, setSwapData] = useState<InternalSwapData>();

  const { address: collateralTokenAddress } = useParams();

  const appChainId = useChainId();
  const { chainId, address } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    async function initialize() {
      const collateralToken = flashLeverage.collateralTokens.find(
        (collateralToken) => collateralToken.address === collateralTokenAddress
      ) as CollateralToken;

      setCollateralToken({ ...collateralToken });
      setFromToken({ ...flashLeverage.usdc });
      setDesiredLtv(collateralToken.safeLtv);
    }

    initialize();
  }, []);

  useEffect(() => {
    if (!fromToken || !address) return;

    const getFromTokenBalance = async () => {
      const _userFromTokenBalance = await new ERC20(fromToken).balanceOf(
        address
      );

      setUserFromTokenBalance(_userFromTokenBalance);
    };
    getFromTokenBalance();
  }, [fromToken, address]);

  useEffect(() => {
    setMaxLeverage(calcMaxLeverage(desiredLtv));
  }, [desiredLtv]);

  useEffect(() => {
    updateUserCollateralBalance();
    updateUserCollateralAllowance();
  }, [address, fromToken]);

  useEffect(() => {
    const updateActionBtn = async () => {
      if (amountCollateral == "" || BigNumber(amountCollateral).isZero()) {
        return setActionBtn((prev) => ({
          ...prev,
          disabled: true,
          error: "",
        }));
      } else if (
        BigNumber(amountCollateral).isGreaterThan(userFromTokenBalance)
      ) {
        return setActionBtn((prev) => ({
          ...prev,
          disabled: true,
          error: "Amount exceeds your available balance",
        }));
        // } else if (BigNumber(amountCollateral).isGreaterThan(100)) {
        //   return setActionBtn((prev) => ({
        //     ...prev,
        //     disabled: true,
        //     error: `Deposit amount is capped at ${displayTokenAmount(
        //       BigNumber(100),
        //       collateralToken
        //     )}`,
        //   }));
      } else {
        return setActionBtn((prev) => ({
          ...prev,
          text: "Leverage",
          disabled: false,
          error: "",
        }));
      }
    };

    updateActionBtn();
  }, [amountCollateral, userFromTokenBalance]);

  useEffect(() => {
    if (!collateralToken || !fromToken) return;

    const fetchSwapData = async () => {
      if (showSummary) {
        if (collateralToken.address === fromToken.address) {
          setSwapData(
            await getInternalSwapData(
              appChainId,
              flashLeverage,
              collateralToken,
              desiredLtv,
              amountCollateral
            )
          );
        } else {
          const _externalSwapData = await getExternalSwapData(
            appChainId,
            flashLeverage.address,
            fromToken,
            amountCollateral,
            collateralToken
          );
          setSwapData(
            await getInternalSwapData(
              appChainId,
              flashLeverage,
              collateralToken,
              desiredLtv,
              _externalSwapData.minPtOut
            )
          );
          setExternalSwapData(_externalSwapData);
        }
      } else {
        setSwapData(undefined);
      }
    };

    fetchSwapData();
  }, [showSummary]);

  const updateUserCollateralBalance = async () => {
    if (!address || !fromToken) return;
    const balance = await new ERC20(fromToken).balanceOf(address);
    setUserFromTokenBalance(balance);
  };

  const updateUserCollateralAllowance = async () => {
    if (!address || !collateralToken || !fromToken) return;

    let allowance = await new ERC20(fromToken).allowance(
      address,
      flashLeverage.address
    );

    setUserFromTokenAllowance(allowance);
  };

  const handleFromTokenChange = (token: Token) => {
    setFromToken(token);
    setAmountCollateral("");
  };

  const handleLtvSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDesiredLtv(BigNumber(e.target.value).toFixed(2));
  };

  async function handleApprove() {
    if (!address || !collateralToken || !fromToken) return;

    await new ERC20(fromToken).approve(flashLeverage.address, amountCollateral);

    setUserFromTokenAllowance(BigNumber(amountCollateral));
  }

  async function handleLeverage() {
    if (
      !flashLeverage ||
      !fromToken ||
      !address ||
      !collateralToken ||
      !internalSwapData
    )
      return;

    let positionId;

    try {
      if (collateralToken.address == fromToken.address) {
        positionId = await flashLeverage.leverage(
          address,
          desiredLtv,
          fromToken as CollateralToken,
          amountCollateral,
          internalSwapData
        );
      } else {
        if (!externalSwapData) return;

        positionId = await flashLeverage.swapAndLeverage(
          address,
          desiredLtv,
          fromToken,
          amountCollateral,
          externalSwapData,
          collateralToken,
          internalSwapData
        );
      }
    } catch (e) {
      setShowSummary(false);
      throw e;
    }

    // Dashboard Related
    if (chainId !== 31337) {
      axios.post("https://dapi.spiralstake.xyz/leverage/open", {
        user: address.toLowerCase(),
        positionId,
        amountCollateralInUsd: BigNumber(amountCollateral).multipliedBy(
          collateralToken.valueInUsd
        ),
      });
    }

    navigate("/portfolio");
  }

  const setAmountToMax = () => {
    const truncated = (
      Math.floor(userFromTokenBalance.toNumber() * 100) / 100
    ).toFixed(2);
    setAmountCollateral(truncated);
  };

  return (
    collateralToken &&
    fromToken && (
      <div className="flex gap-[32px] pb-16 pt-[48px]">
        <div className="flex flex-col w-full gap-[32px]">
          <Link to={"/test"}>
            <div className="flex gap-[4px]">
              <img src={arrowBack} alt="" />
              <p>back</p>
            </div>
          </Link>
          <div className="">
            <ProductTitle
              icon={`/tokens/${collateralToken.symbol}.svg`}
              title={`${collateralToken.symbol.split("-")[0]}-${
                collateralToken.symbol.split("-")[1]
              } `}
              subheading={`Deposit your stablecoins and automatically create a leveraged looping position with ${
                collateralToken.symbol.split("-")[0]
              }-${
                collateralToken.symbol.split("-")[1]
              } for maximized returns on your idle holdings.`}
            />
          </div>
          <div className="flex gap-[13px] items-center">
            <div className="pr-[60px]">
              <p className="text-[20px] text-[#E4E4E4]">
                {collateralToken.impliedApy}%
              </p>
              <p className="text-[14px] text-[#8E8E8E]">Max APY</p>
            </div>
            <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%]"></div>
            <div className="pr-[60px]">
              <p className="text-[20px] text-[#E4E4E4]">
                {collateralToken.safeLtv}
              </p>
              <p className="text-[14px] text-[#8E8E8E]">Safe LTV</p>
            </div>
            <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%]"></div>
            <div>
              <p className="text-[20px] text-[#E4E4E4]">
                {collateralToken.liqLtv}
              </p>
              <p className="text-[14px] text-[#8E8E8E]">Liquidation LTV</p>
            </div>
          </div>
          <div>
            <img src={chart} alt="" />
          </div>
        </div>
        {/* deposit part */}
        <div className="bg-white flex flex-col w-full h-fit items-center gap-[24px] bg-opacity-[2%] rounded-xl p-[32px]">
          <div className="flex w-full justify-between items-center">
            <div className="flex flex-col gap-[4px]">
              <p className="text-[24px] text-[#E4E4E4] font-semibold">
                Deposit
              </p>
              <p className="text-[16px] text-[#8B8B8B]">
                Deposit assets, earn max yield
              </p>
            </div>
            <div className="flex flex-col gap-[4px] items-end">
              <div className="flex items-center gap-[8px]">
                <p className="text-[24px] text-[#E4E4E4] font-semibold">7.4x</p>
                <img src={pencil} alt="" className="w-[36px]"/>
              </div>
              <div className="flex items-center gap-[8px] text-[#8B8B8B]">
                <p className="text-[16px] ">Leverage</p>
                <img src={infoIcon} alt="" className="w-[13.3px]"/>
              </div>
            </div>
          </div>
          <div className="flex flex-col w-full bg-white border-[1px] border-white border-opacity-[14%] bg-opacity-[4%] rounded-xl p-[16px]">
            <div className="flex items-center justify-between gap-4 text-[16px]">
              <div className="">
                <input type="text" className="outline-none bg-transparent" />
              </div>
              <div className="flex gap-[2px] items-center border-white border-[1px] rounded-xl p-[11px] border-opacity-[10%]">
                <img src={`/tokens/${collateralToken.symbol}.svg`} alt="" className="w-[20px]"/>
                <p>{flashLeverage.usdc.symbol}</p>
                <img src={arrowDown} alt="" className="w-[20px]"/>
              </div>
            </div>
            <div className="text-[14px] text-[#8E8E8E] font-semibold">$0.00</div>
          </div>
          <div className="flex w-full justify-between items-center text-[14px]">
            <div className="flex items-center gap-[6px]">
              <img src={wallet} alt="" />
              <p className="text-[#8E8E8E]">12000 USDC</p>
            </div>
            <div>
              <p>MAX</p>
            </div>
          </div>
          <div className="flex justify-center items-center rounded-xl w-full bg-white bg-opacity-[8%] p-[10px]">
            <p className="text-[14px]">Deposit USDC</p>
          </div>
          <div className="flex text-[16px] w-full justify-between text-[#8E8E8E]">
            <div className="flex items-center gap-[8px] w-fit">
              <p>Deposit amount</p>
              <img src={infoIcon} alt="" className="w-[16px]"/>
            </div>
            <div className="w-fit">
              <p>0 USDC ($0)</p>
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default ProductPage;
