import { useEffect, useRef, useState } from "react";
import BigNumber from "bignumber.js";
import { CollateralToken, InternalSwapData, Token } from "../types";
import { useAccount, useChainId } from "wagmi";
import { calcLeverageApy, calcLeverage } from "../utils";
import ActionBtn from "../components/ActionBtn";
import ERC20 from "../contract-hooks/ERC20";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import LeverageBreakdown from "../components/LeverageBreakdown";
import Action from "../components/Action";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import setting from "../assets/icons/setting.svg";
import {
  getExternalSwapData,
  getInternalSwapData,
} from "../api-services/swapAggregator";
import axios from "axios";
import arrowBack from "../assets/icons/arrowBack.svg";
import pencil from "../assets/icons/pencil.svg";
import TokenAmount from "../components/low-level/TokenAmount";
import LeverageRange from "../components/LeverageRange";
import Overlay from "../components/low-level/Overlay";
import { HoverInfo } from "../components/low-level/HoverInfo";
import { toastSuccess } from "../utils/toastWrapper";
import InvestmentPlans from "../components/InvestmentPlans";
import SlippageRange from "../components/new-components/slippageRange";
import auto from "../assets/icons/auto.svg";
import { getSlippage } from "../utils/getSlippage";
import DepositReviewOverlay from "../components/DepositReviewOverlay";
import ProductTitle from "../components/low-level/ProductTitle.tsx";
import PoolInfo from "../components/low-level/PoolInfo.tsx";

const ProductPage = ({ flashLeverage }: { flashLeverage: FlashLeverage }) => {
  const [showSlippage, setShowSlippage] = useState(false);
  const [showLTV, setShowLTV] = useState(false);
  const [collateralToken, setCollateralToken] = useState<CollateralToken>();
  const [fromToken, setFromToken] = useState<Token>();
  const [amountCollateral, setAmountCollateral] = useState("");
  const [slippage, setSlippage] = useState(
    getSlippage(Number(amountCollateral))
  );
  const [autoMode, setAutoMode] = useState(true);
  const [desiredLtv, setDesiredLtv] = useState("");
  const [leverage, setLeverage] = useState("");
  const [leverageApy, setLeverageApy] = useState("");
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
    warning: "",
  });
  const [externalSwapData, setExternalSwapData] = useState<InternalSwapData>(); // Only used by leverageWrapper
  const [internalSwapData, setSwapData] = useState<InternalSwapData>();

  const { address: collateralTokenAddress } = useParams();
  const [searchParams] = useSearchParams();

  const appChainId = useChainId();
  const { chainId, address } = useAccount();
  const navigate = useNavigate();
  const initialLeverage = searchParams.get("leverage");

  const ltvRef = useRef<HTMLDivElement>(null);
  const slippageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initialize() {
      const collateralToken = flashLeverage.collateralTokens.find(
        (collateralToken) => collateralToken.address === collateralTokenAddress
      ) as CollateralToken;

      setCollateralToken({ ...collateralToken });
      setFromToken({ ...flashLeverage.usdc });

      setDesiredLtv(
        Number(initialLeverage) > 0
          ? String(initialLeverage)
          : collateralToken.safeLtv
      );
    }

    initialize();
  }, [collateralTokenAddress]);

  useEffect(() => {
    if (!collateralToken) return;

    setLeverage(calcLeverage(desiredLtv));
    setLeverageApy(
      calcLeverageApy(
        collateralToken.impliedApy,
        collateralToken.borrowApy,
        desiredLtv
      )
    );
  }, [desiredLtv, collateralToken]);

  useEffect(() => {
    if (autoMode) {
      setSlippage(getSlippage(Number(amountCollateral)));
    }
  }, [amountCollateral]);

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
    updateUserCollateralBalance();
    updateUserCollateralAllowance();
  }, [address, fromToken]);

  useEffect(() => {
    if (!collateralToken) return;

    const updateActionBtn = () => {
      const collateral = new BigNumber(amountCollateral || 0);
      const userBalance = new BigNumber(userFromTokenBalance || 0);
      const leverageValue = new BigNumber(leverage || 1);
      const liquidityUsd = new BigNumber(
        collateralToken.liquidityAssetsUsd || 0
      );

      // Case 1: Empty or zero input
      if (amountCollateral === "" || collateral.isZero()) {
        return setActionBtn((prev) => ({
          ...prev,
          disabled: true,
          error: "",
          warning: "",
        }));
      }

      // Case 2: Amount exceeds user balance
      if (collateral.isGreaterThan(userBalance)) {
        return setActionBtn((prev) => ({
          ...prev,
          disabled: true,
          error: "Amount exceeds your available balance",
          warning: "",
        }));
      }

      // Case 3: Amount exceeds max leverage limit
      const maxLeverageAmount = BigNumber.max(
        new BigNumber(0),
        liquidityUsd.dividedBy(leverageValue.minus(1)).minus(1000)
      );

      if (collateral.isGreaterThan(maxLeverageAmount)) {
        return setActionBtn((prev) => ({
          ...prev,
          disabled: true,
          error: "Exceeds Max Leverage Amount",
          warning: "",
        }));
      }

      // Case 4: Recommended minimum warning
      if (collateral.lt(new BigNumber(5000))) {
        return setActionBtn((prev) => ({
          ...prev,
          text: "Leverage",
          disabled: false,
          warning: "You have to deposit more than >$5,000 for better return.",
          error: "",
        }));
      }

      // Case 5: All good — enable action
      return setActionBtn((prev) => ({
        ...prev,
        text: "Leverage",
        disabled: false,
        error: "",
        warning: "",
      }));
    };

    updateActionBtn();
  }, [collateralToken, leverage, amountCollateral, userFromTokenBalance]);

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
            slippage,
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

  useEffect(() => {
    function handleLTVClickOutside(event: MouseEvent) {
      if (ltvRef.current && !ltvRef.current.contains(event.target as Node)) {
        setShowLTV(false);
      }
    }
    if (window.innerWidth >= 1024) {
      document.addEventListener("mousedown", handleLTVClickOutside);
    }
    return () => {
      if (window.innerWidth >= 1024) {
        document.removeEventListener("mousedown", handleLTVClickOutside);
      }
    };
  }, []);

  useEffect(() => {
    function handleSlippageClickOutside(event: MouseEvent) {
      if (
        slippageRef.current &&
        !slippageRef.current.contains(event.target as Node)
      ) {
        setShowSlippage(false);
      }
    }

    if (window.innerWidth >= 1024) {
      document.addEventListener("mousedown", handleSlippageClickOutside);
    }

    return () => {
      if (window.innerWidth >= 1024) {
        document.removeEventListener("mousedown", handleSlippageClickOutside);
      }
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

    try {
      const isSameToken = collateralToken.address === fromToken.address;

      // Early return if external swap data is needed but missing
      if (!isSameToken && !externalSwapData) return;

      const { positionId, amountDepositedInUsd } = await (isSameToken
        ? flashLeverage.leverage(
            address,
            desiredLtv,
            fromToken as CollateralToken,
            amountCollateral,
            internalSwapData
          )
        : flashLeverage.swapAndLeverage(
            address,
            desiredLtv,
            fromToken,
            amountCollateral,
            externalSwapData!,
            collateralToken,
            internalSwapData
          ));

      // Single toast success message
      toastSuccess(
        `Deposited successfully!`,
        `You've leveraged ${amountCollateral} ${fromToken.symbol}. Please collect ${collateralToken.symbol} returned from slippage`
      );

      // Single API call with dynamic base URL
      const baseUrl =
        chainId !== 31337
          ? "https://api.spiralstake.xyz"
          : "http://localhost:5000";

      try {
        await axios.post(`${baseUrl}/leverage/open`, {
          user: address.toLowerCase(),
          positionId,
          amountDepositedInUsd,
          atImpliedApy: collateralToken.impliedApy,
          atBorrowApy: collateralToken.borrowApy,
          desiredLtv,
        });
      } catch (e) {}

      navigate("/portfolio");
    } catch (e) {
      setShowSummary(false);
      throw e;
    }
  }

  const setAmountToMax = (maxLeverageAmount: BigNumber) => {
    const truncated = new BigNumber(userFromTokenBalance)
      .multipliedBy(100)
      .integerValue(BigNumber.ROUND_FLOOR) // BigNumber floor
      .div(100); // back to original scale

    setAmountCollateral(BigNumber.min(truncated, maxLeverageAmount).toFixed(2));
  };

  return (
    collateralToken &&
    fromToken && (
      <div className="flex flex-col pt-[16px] gap-[24px] lg:flex-row lg:gap-[32px] lg:pb-16 lg:pt-[48px]">
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
              icon={`/tokens/${collateralToken.symbolExtended}.svg`}
              title={collateralToken.symbol}
              maturity={collateralToken.maturityDate}
              subheading={`Deposit your stablecoins and automatically create a leveraged looping position with ${collateralToken.symbol} for maximized returns on your idle holdings.`}
              collateralToken={collateralToken}
            />
          </div>

          {/* deposit info mobile */}
          <div className="lg:hidden grid grid-cols-[1fr,auto,1fr] grid-rows-2 gap-[20px] items-center">
            <div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <p className="text-[20px] text-[#E4E4E4] font-normal">
                    {leverageApy}%
                  </p>
                  <HoverInfo
                    content={
                      <LeverageBreakdown
                        collateralTokenApy={collateralToken.impliedApy}
                        borrowApy={collateralToken.borrowApy}
                        leverage={leverage}
                      />
                    }
                  />
                </div>
                <p className="text-[14px] text-[#8E8E8E]">Max APY</p>
              </div>
            </div>

            <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%]"></div>
            <div className="pr-[0px]">
              <div className="flex items-center">
                <p className="text-[20px] text-[#E4E4E4] min-w-[40px] font-normal">
                  {leverage}x
                </p>
                <div className="flex items-center gap-[8px]">
                  <img
                    src={pencil}
                    alt=""
                    className="w-[35px] cursor-pointer rounded-[20px] shadow-md shadow-gray-900"
                    onClick={() => setShowLTV(!showLTV)}
                  />
                  {showLTV && (
                    <Overlay
                      onClose={() => setShowLTV(false)}
                      overlay={
                        <LeverageRange
                          leverage={leverage}
                          maxLtv={collateralToken.maxLtv}
                          ltv={desiredLtv}
                          handleLtvSlider={handleLtvSlider}
                        />
                      }
                    />
                  )}
                </div>
              </div>

              <p className="text-[14px] text-[#8E8E8E] cursor-default">
                Leverage
              </p>
            </div>

            <div className="pr-[60px]">
              <p className="text-[20px] text-[#E4E4E4] min-w-[70px] font-normal">
                {desiredLtv}%
              </p>
              <p className="text-[14px] text-[#8E8E8E]">Your LTV</p>
            </div>

            <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%] font-normal"></div>
            <div>
              <p className="text-[20px] text-[#E4E4E4] min-w-[70px] font-normal">
                {collateralToken.liqLtv}%
              </p>
              <p className="text-[14px] text-[#8E8E8E] cursor-default">
                Liquidation LTV
              </p>
            </div>
          </div>

          {/* deposit info */}
          <div
            className="hidden lg:grid grid-cols-[160px_auto_160px_auto_160px_auto_160px]
 grid-rows-1 gap-[13px] items-center"
          >
            <div className="flex flex-col pr-[60px]">
              <div className="flex items-center gap-1">
                <p className="text-[20px] text-[#E4E4E4] font-normal">
                  {leverageApy}%
                </p>
                <HoverInfo
                  content={
                    <LeverageBreakdown
                      collateralTokenApy={collateralToken.impliedApy}
                      borrowApy={collateralToken.borrowApy}
                      leverage={leverage}
                    />
                  }
                />
              </div>
              <p className="text-[14px] text-[#8E8E8E]">Max APY</p>
            </div>
            <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%]"></div>
            <div className="pr-[0px]">
              <div className="flex pr-[40px] items-center">
                <p className="text-[20px] text-[#E4E4E4] min-w-[40px] font-normal">
                  {leverage}x
                </p>
                <div ref={ltvRef} className="flex items-center gap-[8px]">
                  <img
                    src={pencil}
                    alt=""
                    className="w-[35px] cursor-pointer rounded-[20px] shadow-md shadow-gray-900"
                    onClick={() => setShowLTV(!showLTV)}
                  />
                  {showLTV && (
                    <div className="absolute  top-[200px] z-50 left-[290px]">
                      <LeverageRange
                        leverage={leverage}
                        maxLtv={collateralToken.maxLtv}
                        ltv={desiredLtv}
                        handleLtvSlider={handleLtvSlider}
                      />
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[14px] text-[#8E8E8E] cursor-default">
                Leverage
              </p>
            </div>
            <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%]"></div>
            <div className="pr-[60px]">
              <p className="text-[20px] text-[#E4E4E4] min-w-[70px] font-normal">
                {desiredLtv}%
              </p>
              <p className="text-[14px] text-[#8E8E8E]">Your LTV</p>
            </div>
            <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%] font-normal"></div>
            <div>
              <p className="text-[20px] text-[#E4E4E4] min-w-[70px] font-normal">
                {collateralToken.liqLtv}%
              </p>
              <p className="text-[14px] text-[#8E8E8E] cursor-default">
                Liquidation LTV
              </p>
            </div>
          </div>

          {/* mobile deposit section */}
          <div className="w-full flex flex-col gap-[16px] lg:hidden">
            <PoolInfo collateralToken={collateralToken} leverage={leverage} />
            <div className="bg-white flex flex-col lg:hidden w-full h-fit items-center gap-[24px] bg-opacity-[2%] rounded-xl p-[20px] lg:p-[32px]">
              <div className="flex w-full justify-between items-center">
                <div className="flex flex-col">
                  <p className="text-[24px] text-[#FFFFFF] font-normal">
                    Deposit
                  </p>
                  <p className="text-[15px] text-[#8B8B8B]">
                    Deposit assets, earn max yield
                  </p>
                </div>
                <div className="bg-white bg-opacity-[4%] p-[6px] px-[8px] rounded-[999px] flex items-center gap-[8px]">
                  <div className="flex items-center gap-[4px]">
                    <p className="text-[14px] font-[400] text-[#8B8B8B]">
                      {parseFloat((slippage * 100).toFixed(3))}%
                    </p>{" "}
                    {autoMode && <img src={auto} alt="" className="w-[24px]" />}
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <img
                      src={setting}
                      alt=""
                      className="w-[36px] cursor-pointer shadow-lg rounded-full shadow-gray-900"
                      onClick={() => setShowSlippage(!showSlippage)}
                    />
                    {showSlippage && (
                      <Overlay
                        onClose={() => setShowSlippage(false)}
                        overlay={
                          <SlippageRange
                            autoMode={autoMode}
                            setAutoMode={setAutoMode}
                            amountCollateral={amountCollateral}
                            slippage={slippage}
                            setSlippage={setSlippage}
                          />
                        }
                      />
                    )}
                  </div>
                </div>
              </div>

              <TokenAmount
                tokens={[flashLeverage.usdc, collateralToken]}
                selectedToken={fromToken}
                handleTokenChange={handleFromTokenChange}
                amount={amountCollateral}
                handleAmountChange={setAmountCollateral}
                amountInUsd={BigNumber(amountCollateral).multipliedBy(
                  fromToken.valueInUsd
                )}
                warning={actionBtn.warning}
                error={actionBtn.error}
                balance={userFromTokenBalance}
                setAmountToMax={setAmountToMax}
                maxLeverageAmount={BigNumber.max(
                  0,
                  BigNumber(collateralToken?.liquidityAssetsUsd)
                    .dividedBy(BigNumber(leverage).minus(1))
                    .minus(1000)
                )}
              />

              {/* old deposit button */}
              <ActionBtn
                btnLoading={false}
                text={actionBtn.text}
                disabled={actionBtn.disabled}
                expectedChainId={Number(chainId)}
                onClick={actionBtn.onClick}
              />

              <div className="flex flex-col w-full gap-[8px] text-[14px] lg:text-[16px] font-[400] text-[#8E8E8E]">
                <div className="flex justify-between items-center">
                  <p>Current price</p>
                  <p>${Number(collateralToken.valueInUsd).toFixed(4)}</p>
                </div>
                <div className="flex justify-between items-center">
                  <p>Your Liquidation Price</p>
                  <p>
                    $
                    {(
                      (Number(desiredLtv) / Number(collateralToken.liqLtv)) *
                      Number(collateralToken.valueInUsd)
                    ).toFixed(4)}
                  </p>
                </div>
                {/* <div className="flex justify-between items-center">
                  <p>Available Borrow</p>
                  <p>
                    ${`${formatNumber(collateralToken.liquidityAssetsUsd)}`}
                  </p>
                </div> */}
                {/* <div className="flex justify-between items-center">
                  <p>Borrow Market</p>
                  <a
                    className="text-white underline"
                    target="_blank"
                    href={`https://app.morpho.org/ethereum/market/${collateralToken.morphoMarketId}`}
                  >
                    {" "}
                    <p>{`${collateralToken.symbol} / ${collateralToken.loanToken.symbol}`}</p>
                  </a>
                </div> */}
              </div>

              {/* review section */}
              {showSummary && (
                <Overlay
                  overlay={
                    <div className="flex flex-col gap-[16px] z-50 backdrop-blur-2xl">
                      <DepositReviewOverlay
                        token={fromToken}
                        handleApprove={handleApprove}
                        completed={userFromTokenAllowance?.gte(
                          BigNumber(amountCollateral)
                        )}
                        setShowSummary={setShowSummary}
                        amountCollateral={amountCollateral}
                        collateralToken={collateralToken}
                        desiredLtv={desiredLtv}
                        leverage={leverage}
                        leverageApy={leverageApy}
                      />
                      <div className="">
                        {userFromTokenAllowance.gte(amountCollateral) && (
                          <Action
                            text={
                              internalSwapData
                                ? "Deposit"
                                : "Fetching Routes..."
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

          {/* investment plans */}
          <div>
            <InvestmentPlans
              collateralToken={collateralToken}
              leverage={leverage}
              leverageApy={leverageApy}
              amountInUsd={Number(
                BigNumber(amountCollateral).multipliedBy(fromToken.valueInUsd)
              )}
              desiredLtv={desiredLtv}
              flashLeverage={flashLeverage}
            />
          </div>
        </div>

        {/* desktop second half */}
        <div className="hidden w-full lg:flex flex-col gap-[16px]">
          {/* pool info part */}
          <PoolInfo collateralToken={collateralToken} leverage={leverage} />

          {/* deposit part */}
          <div className="bg-white hidden lg:flex flex-col w-full h-fit items-center gap-[24px] bg-opacity-[2%] rounded-xl p-[32px]">
            <div className="flex w-full justify-between items-center">
              <div className="flex flex-col">
                <p className="text-[24px] text-[#FFFFFF] font-normal">
                  Deposit
                </p>
                <p className="text-[15px] text-[#8B8B8B]">
                  Deposit assets, earn max yield
                </p>
              </div>
              <div className="bg-white bg-opacity-[4%] p-[6px] px-[8px] rounded-[999px] flex items-center gap-[8px]">
                <div className="flex items-center gap-[4px]">
                  <p className="text-[14px] font-[400] text-[#8B8B8B]">
                    {parseFloat((slippage * 100).toFixed(3))}%
                  </p>
                  {autoMode && <img src={auto} alt="" className="w-[24px]" />}
                </div>
                <div ref={slippageRef} className="flex items-center gap-[8px]">
                  <img
                    src={setting}
                    alt=""
                    className="w-[36px] cursor-pointer shadow-lg rounded-full shadow-gray-900"
                    onClick={() => setShowSlippage(!showSlippage)}
                  />
                  {showSlippage && (
                    <div className="absolute  top-[215px] z-50 right-[97px]">
                      <SlippageRange
                        autoMode={autoMode}
                        setAutoMode={setAutoMode}
                        amountCollateral={amountCollateral}
                        slippage={slippage}
                        setSlippage={setSlippage}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <TokenAmount
              tokens={[flashLeverage.usdc, collateralToken]}
              selectedToken={fromToken}
              handleTokenChange={handleFromTokenChange}
              amount={amountCollateral}
              handleAmountChange={setAmountCollateral}
              amountInUsd={BigNumber(amountCollateral).multipliedBy(
                fromToken.valueInUsd
              )}
              warning={actionBtn.warning}
              error={actionBtn.error}
              balance={userFromTokenBalance}
              setAmountToMax={setAmountToMax}
              maxLeverageAmount={BigNumber.max(
                0,
                new BigNumber(collateralToken?.liquidityAssetsUsd)
                  .dividedBy(BigNumber(leverage).minus(1))
                  .minus(1000)
              )}
            />
            {/* old deposit button */}
            <ActionBtn
              btnLoading={false}
              text={actionBtn.text}
              disabled={actionBtn.disabled}
              expectedChainId={Number(chainId)}
              onClick={actionBtn.onClick}
            />

            <div className="flex flex-col w-full gap-[8px] text-[15px] text-[#8E8E8E]">
              <div className="flex justify-between items-center">
                <p>Current price</p>
                <p>${Number(collateralToken.valueInUsd).toFixed(4)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p>Your Liquidation Price</p>
                <p>
                  $
                  {(
                    (Number(desiredLtv) / Number(collateralToken.liqLtv)) *
                    Number(collateralToken.valueInUsd)
                  ).toFixed(4)}
                </p>
              </div>
              {/* <div className="flex justify-between items-center">
                <p>Available Borrow</p>
                <p>${`${formatNumber(collateralToken.liquidityAssetsUsd)}`}</p>
              </div> */}
              {/* <div className="flex justify-between items-center">
                <p>Borrow Market</p>
                <a
                  className="text-white underline"
                  target="_blank"
                  href={`https://app.morpho.org/ethereum/market/${collateralToken.morphoMarketId}`}
                >
                  {" "}
                  <p>{`${collateralToken.symbol} / ${collateralToken.loanToken.symbol}`}</p>
                </a>
              </div> */}
            </div>

            {/* review section */}
            {showSummary && (
              <Overlay
                overlay={
                  <div className="flex flex-col gap-[16px] z-50 backdrop-blur-2xl">
                    <DepositReviewOverlay
                      token={fromToken}
                      handleApprove={handleApprove}
                      completed={userFromTokenAllowance?.gte(
                        BigNumber(amountCollateral)
                      )}
                      setShowSummary={setShowSummary}
                      amountCollateral={amountCollateral}
                      collateralToken={collateralToken}
                      desiredLtv={desiredLtv}
                      leverage={leverage}
                      leverageApy={leverageApy}
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
      </div>
    )
  );
};

export default ProductPage;
