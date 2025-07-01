import { useEffect, useState } from "react";
import PageTitle from "../components/low-level/PageTitle";
import LTVSlider from "../components/LTVSlider";
import PositionManager from "../contract-hooks/PositionManager";
import BigNumber from "bignumber.js";
import { Token } from "../types";
import { useAccount, useChainId } from "wagmi";
import { calcLeverageApy, calcMaxLeverage } from "../utils";
import ActionBtn from "../components/ActionBtn";
import ERC20 from "../contract-hooks/ERC20";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import TokenAmount from "../components/TokenAmount";
import APYInfo from "../components/sections/InfoSection";
import LeverageBreakdown from "../components/LeverageBreakdown";
import Action from "../components/Action";
import LeverageViaPyUSD from "../contract-hooks/LeverageWrapper";
import { useNavigate, useParams } from "react-router-dom";
import { readCollateralToken } from "../config/contractsData";
import Loader from "../components/low-level/Loader";
import SectionOverlay from "../components/low-level/SectionOverlay";
import lockIcon from "../assets/icons/lock-svgrepo-com.svg";
import closeIcon from "../assets/icons/close.svg";

const Leverage = ({
  positionManager,
  flashLeverage,
  leverageWrapper,
}: {
  positionManager: PositionManager;
  flashLeverage: FlashLeverage;
  leverageWrapper: LeverageViaPyUSD;
}) => {
  const [collateralToken, setCollateralToken] = useState<Token>();
  const [fromToken, setFromToken] = useState<Token>();
  const [amountCollateral, setAmountCollateral] = useState("");
  const [amountCollateralInUsd, setAmountCollateralInUsd] = useState<BigNumber>(
    BigNumber(0)
  );
  const [desiredLtv, setLtv] = useState("75");
  const [maxLeverage, setMaxLeverage] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [actionBtn, setActionBtn] = useState({
    text: "Leverage",
    onClick: () => {
      setShowSummary(true);
    },
    disabled: false,
    error: "",
  });
  const [loading, setLoading] = useState(true);
  const [userFromTokenBalance, setUserFromTokenBalance] = useState<BigNumber>(
    BigNumber(0)
  );
  const [userFromTokenAllowance, setUserFromTokenAllowance] =
    useState<BigNumber>(BigNumber(0));

  // const [error, setError] = useState("");

  const { address: collateralTokenAddress } = useParams();
  const appChainId = useChainId();

  const { chainId, address } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    async function initializeFromToken() {
      if (!leverageWrapper || !flashLeverage || !positionManager) return;

      if (!collateralTokenAddress) return;
      const _collateralToken = await readCollateralToken(
        appChainId,
        collateralTokenAddress
      );

      setCollateralToken(_collateralToken);
      setLoading(false);
    }

    initializeFromToken();
  }, [
    leverageWrapper,
    flashLeverage,
    positionManager,
    collateralTokenAddress,
    appChainId,
  ]);

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
    async function updateCollateralValueInUsd() {
      if (positionManager && fromToken && amountCollateral) {
        setAmountCollateralInUsd(
          collateralToken == fromToken
            ? await positionManager.getTokenUsdValue(
                fromToken,
                amountCollateral
              )
            : BigNumber(amountCollateral)
        );
      } else {
        setAmountCollateralInUsd(BigNumber(0));
      }
    }

    updateCollateralValueInUsd();
  }, [positionManager, fromToken, amountCollateral]);

  useEffect(() => {
    setMaxLeverage(calcMaxLeverage(desiredLtv));
  }, [desiredLtv]);

  useEffect(() => {
    updateUserCollateralBalance();
    updateUserCollateralAllowance();
  }, [address, collateralToken, fromToken]);

  useEffect(() => {
    if (!positionManager || !flashLeverage || !leverageWrapper) return;
    setFromToken(leverageWrapper.frxUSD);
  }, [positionManager, flashLeverage, leverageWrapper]);

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
      } else {
        return setActionBtn((prev) => ({
          ...prev,
          disabled: false,
          error: "",
        }));
      }
    };

    updateActionBtn();
  }, [amountCollateral, userFromTokenBalance]);

  const updateUserCollateralBalance = async () => {
    if (!address || !fromToken) return;
    const balance = await new ERC20(fromToken).balanceOf(address);
    setUserFromTokenBalance(balance);
  };

  const updateUserCollateralAllowance = async () => {
    if (!address || !collateralToken || !fromToken) return;

    let allowance;
    if (fromToken == collateralToken) {
      allowance = await new ERC20(fromToken).allowance(
        address,
        flashLeverage.address
      );
    } else {
      allowance = await new ERC20(fromToken).allowance(
        address,
        leverageWrapper.address
      );
    }

    setUserFromTokenAllowance(allowance);
  };

  const handleFromTokenChange = (token: Token) => {
    setFromToken(token);
    setAmountCollateral("");
  };

  const handleLtvSlider = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLtv(BigNumber(e.target.value).toFixed(2));
  };

  async function handleApprove() {
    if (!address || !collateralToken || !fromToken) return;

    if (collateralToken == fromToken) {
      await new ERC20(fromToken).approve(
        flashLeverage.address,
        amountCollateral
      );
    } else {
      await new ERC20(fromToken).approve(
        leverageWrapper.address,
        amountCollateral
      );
    }
    setUserFromTokenAllowance(BigNumber(amountCollateral));
  }

  async function handleLeverage() {
    if (!flashLeverage || !fromToken || !address || !collateralToken) return;

    if (collateralToken == fromToken) {
      await flashLeverage.leverage(
        address,
        fromToken,
        amountCollateral,
        desiredLtv
      );
    } else {
      await leverageWrapper.leverage(
        fromToken,
        amountCollateral,
        collateralToken,
        desiredLtv
      );
    }

    navigate("/my-positions");
  }

  return (
    <>
      {loading ? (
        <div className="mt-10">
          <Loader />
        </div>
      ) : (
        collateralToken &&
        flashLeverage &&
        leverageWrapper &&
        fromToken && (
          <div className="pb-16">
            <div className="py-16">
              <PageTitle
                title={`Auto Loop \u00A0 ⟳ \u00A0 ${collateralToken.symbol}`}
                subheading={`Seamlessly Leverage in one click, with our cost-efficient Auto-looping powered by stblUSD's Flashmint`}
              />
            </div>{" "}
            <div className="xl:grid xl:grid-cols-[67%_calc(33%-18px)] xl:gap-[18px]">
              <form
                onSubmit={(e) => e.preventDefault()}
                className="flex flex-1 flex-col gap-4 relative"
              >
                {showSummary && (
                  <SectionOverlay
                    overlay={
                      <div className="w-full h-full relative p-2">
                        <img
                          className="w-7 absolute h-full justify-self-center"
                          src={lockIcon}
                          alt=""
                        />
                        <img
                          className="w-10 absolute justify-self-end cursor-pointer"
                          onClick={() => setShowSummary(false)}
                          src={closeIcon}
                          alt=""
                        />
                      </div>
                    }
                  />
                )}
                <section className="flex flex-col gap-3 p-1.5 bg-gradient-to-b from-slate-900 to-gray-950">
                  <div className="flex flex-col gap-3">
                    <div className="relative grid grid-cols-1 md:grid-cols-2">
                      <TokenAmount
                        title="Loop"
                        titleHoverInfo="Loop your assets to enjoy fixed leveraged yield"
                        tokens={[leverageWrapper.frxUSD, collateralToken]}
                        selectedToken={fromToken}
                        handleTokenChange={handleFromTokenChange}
                        amount={amountCollateral}
                        handleAmountChange={setAmountCollateral}
                        amountInUsd={amountCollateralInUsd}
                        bgStyle={"bg-slate-950"}
                        error={actionBtn.error}
                      />

                      <section className="rounded-sm p-4 sm:p-5 md:p-8 flex flex-1 justify-center items-center flex-col gap-4 bg-gradient-to-l from-slate-950 via-gray-900 to-slate-950">
                        <div className="text-4xl font-semibold">
                          {maxLeverage}x Leverage
                        </div>
                      </section>
                    </div>

                    <LTVSlider
                      maxLtv={flashLeverage?.maxLeverageLtv}
                      ltv={desiredLtv}
                      handleLtvSlider={handleLtvSlider}
                    />
                  </div>

                  <div className="px-7">
                    <ActionBtn
                      btnLoading={false}
                      text={actionBtn.text}
                      disabled={actionBtn.disabled}
                      expectedChainId={Number(chainId)}
                      onClick={actionBtn.onClick}
                    />
                  </div>
                </section>
              </form>

              {/* INFO SECTION */}
              <div className="sticky top-2 hidden h-fit xl:block">
                <section className="rounded-sm p-0 grid h-fit grid-cols-1 sm:grid-cols-[3fr_2fr] xl:grid-cols-1">
                  <APYInfo
                    title={`${
                      collateralToken.isPT
                        ? "Fixed Leveraged APY"
                        : "Max Leveraged APY"
                    } (${collateralToken.symbol})`}
                    description="Loop your staked stable's for fixed leveraged yield"
                    apy={`${!collateralToken.isPT ? "~" : ""} ${calcLeverageApy(
                      collateralToken.apy,
                      positionManager.borrowApy,
                      desiredLtv
                    )}`}
                    apyBreakdown={
                      <LeverageBreakdown
                        collateralTokenApy={collateralToken.apy}
                        borrowApy={positionManager.borrowApy}
                        maxLeverage={maxLeverage}
                      />
                    }
                  />

                  {/* Actions */}
                  {showSummary && (
                    <section className="rounded-sm text-white">
                      <section className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-semibold text-white">
                            Actions
                          </h3>
                        </div>
                        <div className="rounded-sm border border-[#142435]">
                          <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 sm:gap-x-8 md:grid-cols-[auto_auto_auto_1fr_auto]">
                            <Action
                              text="Approve"
                              token={fromToken}
                              amountToken={amountCollateral}
                              actionHandler={handleApprove}
                              completed={userFromTokenAllowance?.gte(
                                BigNumber(amountCollateral)
                              )}
                            />
                            <Action
                              text="Leverage"
                              token={fromToken}
                              amountToken={amountCollateral}
                              actionHandler={handleLeverage}
                              disabled={userFromTokenAllowance.lt(
                                amountCollateral
                              )}
                            />
                          </div>
                        </div>
                      </section>
                    </section>
                  )}
                </section>
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
};

export default Leverage;
