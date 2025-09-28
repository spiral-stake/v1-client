import { useEffect, useRef, useState } from "react";
import BigNumber from "bignumber.js";
import { CollateralToken, InternalSwapData, Token } from "../types";
import { useAccount, useChainId } from "wagmi";
import { calcLeverageApy, calcMaxLeverage } from "../utils";
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
import ProductTitle from "../components/new-components/productTitle";
import pencil from "../assets/icons/pencil.svg";
import NewTokenAmount from "../components/new-components/newTokenAmount";
import LeverageRange from "../components/new-components/leverageRange";
import Overlay from "../components/low-level/Overlay";
import ReviewOverlay from "../components/new-components/reviewOverlay";
import { HoverInfo } from "../components/low-level/HoverInfo";
import { toastSuccess } from "../utils/toastWrapper";
import InvestmentPlans from "../components/new-components/invetmentPlans";
import SlippageRange from "../components/new-components/slippageRange";
import { useQuery } from "wagmi/query";
import auto from "../assets/icons/auto.svg";
import { getSlippage } from "../utils/getSlippage";

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
  const [searchParams] = useSearchParams();
  const leverage = searchParams.get("leverage");
  const [desiredLtv, setDesiredLtv] = useState(
    Number(leverage) > 0 ? String(leverage) : ""
  );
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
  const slippageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initialize() {
      const collateralToken = flashLeverage.collateralTokens.find(
        (collateralToken) => collateralToken.address === collateralTokenAddress
      ) as CollateralToken;

      setCollateralToken({ ...collateralToken });
      setFromToken({ ...flashLeverage.usdc });
      setDesiredLtv(
        Number(leverage) > 0 ? String(leverage) : collateralToken.safeLtv
      );
    }

    initialize();
  }, [collateralTokenAddress]);

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
        `Deposited ${amountCollateral} USDC successfully!`,
        `You've deposited ${amountCollateral} USDC into ${collateralToken.symbol}. Your leveraged position is now earning yield.`
      );

      // Single API call with dynamic base URL
      const baseUrl = chainId !== 31337
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
      } catch (e) { }

      navigate("/portfolio");
    } catch (e) {
      setShowSummary(false);
      throw e;
    }
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
              icon={`/tokens/${collateralToken.symbol}.svg`}
              title={`${collateralToken.symbol.split("-")[0]}-${collateralToken.symbol.split("-")[1]
                } `}
              maturity={`${collateralToken.name.slice(
                collateralToken.name.length - 9,
                collateralToken.name.length - 7
              )}${" "}
                  ${collateralToken.name.slice(
                collateralToken.name.length - 7,
                collateralToken.name.length - 4
              )}${" "}
                  ${collateralToken.name.slice(
                collateralToken.name.length - 4,
                collateralToken.name.length
              )}`}
              subheading={`Deposit your stablecoins and automatically create a leveraged looping position with ${collateralToken.symbol.split("-")[0]
                }-${collateralToken.symbol.split("-")[1]
                } for maximized returns on your idle holdings.`}
            />
          </div>

          {/* deposit info mobile */}
          <div className="lg:hidden grid grid-cols-[1fr,auto,1fr] grid-rows-2 gap-[20px] items-center">
            <div>
              <div className="flex flex-col">
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
            </div>

            <div className="w-[2px] h-[24px] bg-white bg-opacity-[10%]"></div>
            <div className="pr-[0px]">
              <div className="flex items-center">
                <p className="text-[20px] text-[#E4E4E4] min-w-[40px] font-normal">
                  {maxLeverage}x
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
                          maxLeverage={maxLeverage}
                          maxLtv={collateralToken.maxLtv}
                          ltv={desiredLtv}
                          handleLtvSlider={handleLtvSlider}
                        />
                      }
                    />
                  )}
                </div>
              </div>

              <p className="text-[14px] text-[#8E8E8E]">Leverage</p>
            </div>

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

          {/* deposit info */}
          <div
            className="hidden lg:grid grid-cols-[160px_auto_160px_auto_160px_auto_160px]
 grid-rows-1 gap-[13px] cursor-default items-center"
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
            <div className="pr-[0px]">
              <div className="flex pr-[40px] items-center">
                <p className="text-[20px] text-[#E4E4E4] min-w-[40px] font-normal">
                  {maxLeverage}x
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
                        maxLeverage={maxLeverage}
                        maxLtv={collateralToken.maxLtv}
                        ltv={desiredLtv}
                        handleLtvSlider={handleLtvSlider}
                      />
                    </div>
                  )}
                </div>
              </div>

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

          {/* mobile deposit section */}
          <div className="bg-white flex flex-col lg:hidden w-full h-fit items-center gap-[24px] bg-opacity-[2%] rounded-xl p-[32px]">
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
                <div className="flex  items-center gap-[8px]">
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

            {/* old deposit button */}
            <ActionBtn
              btnLoading={false}
              text={actionBtn.text}
              disabled={actionBtn.disabled}
              expectedChainId={Number(chainId)}
              onClick={actionBtn.onClick}
            />

            <div className="flex flex-col w-full gap-[8px] test-[16px] font-[400] text-[#8E8E8E]">
              <div className="flex justify-between items-center">
                <p>Current price</p>
                <p>${Number(collateralToken.valueInUsd).toFixed(4)}</p>
              </div>
              <div className="flex justify-between items-center">
                <p>Liquidation price</p>
                <p>
                  $
                  {(
                    (Number(desiredLtv) / Number(collateralToken.liqLtv)) *
                    Number(collateralToken.valueInUsd)
                  ).toFixed(4)}
                </p>
              </div>
            </div>

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
                    <div className="">
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

          {/* investment plans */}
          <div>
            <InvestmentPlans
              maturity={`${collateralToken.name.slice(
                collateralToken.name.length - 9,
                collateralToken.name.length - 7
              )}${" "}
                  ${collateralToken.name.slice(
                collateralToken.name.length - 7,
                collateralToken.name.length - 4
              )}${", "}
                  ${collateralToken.name.slice(
                collateralToken.name.length - 4,
                collateralToken.name.length
              )}`}
              amountInUsd={Number(
                BigNumber(amountCollateral).multipliedBy(fromToken.valueInUsd)
              )}
              collateralToken={collateralToken}
              desiredLtv={desiredLtv}
              flashLeverage={flashLeverage}
            />
          </div>
        </div>

        {/* deposit part */}
        <div className="bg-white hidden lg:flex flex-col w-full h-fit items-center gap-[24px] bg-opacity-[2%] rounded-xl p-[32px]">
          <div className="flex w-full justify-between items-center">
            <div className="flex flex-col">
              <p className="text-[24px] text-[#FFFFFF] font-normal">Deposit</p>
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
              <p>Liquidation price</p>
              <p>
                $
                {(
                  (Number(desiredLtv) / Number(collateralToken.liqLtv)) *
                  Number(collateralToken.valueInUsd)
                ).toFixed(4)}
              </p>
            </div>
          </div>

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
