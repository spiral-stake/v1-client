import { useEffect, useRef, useState } from "react";
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
import setting from "../assets/icons/setting.svg";
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
import NewTokenAmount from "../components/new-components/newTokenAmount";
import LeverageRange from "../components/new-components/leverageRange";
import Overlay from "../components/low-level/Overlay";
import ReviewOverlay from "../components/new-components/reviewOverlay";
import { HoverInfo } from "../components/low-level/HoverInfo";
import { toastSuccess } from "../utils/toastWrapper";
import InvestmentPlans from "../components/new-components/invetmentPlans";

const ProductPage = ({ flashLeverage }: { flashLeverage: FlashLeverage }) => {
  const [slippage, setSlippage] = useState(0.005);
  const [showLTV, setShowLTV] = useState(false);
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

  const ltvRef = useRef<HTMLDivElement>(null);

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
              slippage,
              flashLeverage,
              collateralToken,
              desiredLtv,
              amountCollateral
            )
          );
        } else {
          const _externalSwapData = await getExternalSwapData(
            appChainId,
            slippage,
            flashLeverage.address,
            fromToken,
            amountCollateral,
            collateralToken
          );
          setSwapData(
            await getInternalSwapData(
              appChainId,
              slippage,
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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ltvRef.current && !ltvRef.current.contains(event.target as Node)) {
        setShowLTV(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
        toastSuccess(
          `Deposited ${amountCollateral} USDC succesfully!`,
          `You’ve deposited ${amountCollateral} USDC into ${collateralToken.symbol}. Your leveraged position is now earning yield.`
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
        toastSuccess(
          `Deposited ${amountCollateral} USDC succesfully!`,
          `You’ve deposited ${amountCollateral} USDC into ${collateralToken.symbol}. Your leveraged position is now earning yield.`
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
          <Link to={"/products"}>
            <div className="flex gap-[6px] text-[#E4E4E4]">
              <img src={arrowBack} alt="" />
              <p>Back</p>
            </div>
          </Link>

          {/* title and subtitle */}
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

          {/* deposit info */}
          <div
            className="grid grid-cols-[160px_auto_160px_auto_160px_auto_160px]
 grid-rows-1 gap-[13px] items-center"
          >
            <div className="flex flex-col pr-[60px]">
              <div className="flex items-center gap-1">
                <p className="text-[20px] text-[#E4E4E4] font-normal">
                  {calcLeverageApy(
                    collateralToken.impliedApy,
                    collateralToken.borrowApy,
                    desiredLtv
                  )}
                  %
                </p>
                <HoverInfo
                  content={
                    <LeverageBreakdown
                      collateralTokenApy={collateralToken.impliedApy}
                      borrowApy={collateralToken.borrowApy}
                      maxLeverage={maxLeverage}
                    />
                  }
                />
              </div>
              <p className="text-[14px] text-[#8E8E8E]">Max APY</p>
            </div>
            <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%]"></div>
            <div className="pr-[60px]">
              <p className="text-[20px] text-[#E4E4E4] min-w-[70px] font-normal">
                {maxLeverage}x
              </p>
              <p className="text-[14px] text-[#8E8E8E]">Leverage</p>
            </div>
            <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%]"></div>
            <div className="pr-[60px]">
              <p className="text-[20px] text-[#E4E4E4] min-w-[70px] font-normal">
                {desiredLtv}%
              </p>
              <p className="text-[14px] text-[#8E8E8E]">Safe LTV</p>
            </div>
            <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%] font-normal"></div>
            <div>
              <p className="text-[20px] text-[#E4E4E4] min-w-[70px] font-normal">
                {collateralToken.liqLtv}%
              </p>
              <p className="text-[14px] text-[#8E8E8E]">Liquidation LTV</p>
            </div>
          </div>

        {/* investment plans */}
        <div>
          <InvestmentPlans collateralToken={collateralToken} desiredLtv={desiredLtv} flashLeverage={flashLeverage}/>
        </div>

        </div>

        {/* deposit part */}
        <div className="bg-white flex flex-col w-full h-fit items-center gap-[24px] bg-opacity-[2%] rounded-xl p-[32px]">
          <div className="flex w-full justify-between items-center">
            <div className="flex flex-col">
              <p className="text-[24px] text-[#FFFFFF] font-normal">Deposit</p>
              <p className="text-[15px] text-[#8B8B8B]">
                Deposit assets, earn max yield
              </p>
            </div>
            <div className="flex flex-col gap-[4px] items-end">
              <div ref={ltvRef} className="flex items-center gap-[8px]">
                <img
                  src={setting}
                  alt=""
                  className="w-[36px] cursor-pointer"
                  onClick={() => setShowLTV(!showLTV)}
                />
                {showLTV && (
                  <div className="absolute  top-[215px] z-50 right-[97px]">
                    <LeverageRange
                      slippage={slippage}
                      setSlippage={setSlippage}
                      maxLeverage={maxLeverage}
                      maxLtv={collateralToken.maxLtv}
                      ltv={desiredLtv}
                      handleLtvSlider={handleLtvSlider}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <NewTokenAmount
            tokens={[flashLeverage.usdc, collateralToken]}
            selectedToken={fromToken}
            handleTokenChange={handleFromTokenChange}
            amount={amountCollateral}
            handleAmountChange={setAmountCollateral}
            amountInUsd={BigNumber(amountCollateral).multipliedBy(
              fromToken.valueInUsd
            )}
            error={actionBtn.error}
            balance={userFromTokenBalance}
            setAmountToMax={setAmountToMax}
          />

          {/* deposit button */}
          {/* <div className="flex justify-center items-center rounded-xl w-full bg-white bg-opacity-[8%] p-[10px]">
            <p className="text-[14px]">Deposit USDC</p>
          </div> */}

          {/* old deposit button */}
          <ActionBtn
            btnLoading={false}
            text={actionBtn.text}
            disabled={actionBtn.disabled}
            expectedChainId={Number(chainId)}
            onClick={actionBtn.onClick}
          />

          {/* deposit summary */}
          {/* <div className="flex text-[16px] w-full justify-between text-[#8E8E8E]">
            <div className="flex items-center gap-[8px] w-fit">
              <p>Deposit amount</p>
              <img src={infoIcon} alt="" className="w-[16px]" />
            </div>
            <div className="w-fit">
              <p>0 USDC ($0)</p>
            </div>
          </div> */}

          {/* review section */}
          {showSummary && (
            <Overlay
              overlay={
                <div className="flex flex-col gap-[16px] z-50 backdrop-blur-2xl">
                  <ReviewOverlay
                    token={fromToken}
                    handleApprove={handleApprove}
                    completed={userFromTokenAllowance?.gte(
                      BigNumber(amountCollateral)
                    )}
                    setShowSummary={setShowSummary}
                    amountCollateral={amountCollateral}
                    collateralToken={collateralToken}
                    desiredLtv={desiredLtv}
                  />
                  <div>
                    {userFromTokenAllowance.gte(amountCollateral) && (
                      <Action
                        text={
                          internalSwapData ? "Deposit" : "Fetching Routes..."
                        }
                        token={fromToken}
                        amountToken={amountCollateral}
                        actionHandler={handleLeverage}
                        disabled={!internalSwapData}
                      />
                    )}
                  </div>
                </div>
              }
            />
          )}
        </div>
      </div>
    )
  );
};

export default ProductPage;
