import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { handleAsync } from "../../utils/handleAsyncFunction.ts";
import { toastSuccess } from "../../utils/toastWrapper.tsx";
import { NATIVE_ADDRESS } from "../../utils/NATIVE.ts";
import { Base } from "../../contract-hooks/Base.ts";
import Pool from "../../contract-hooks/Pool.ts";
import { Cycle, Position } from "../../types/index.ts";
import BigNumber from "bignumber.js";
import ERC20 from "../../contract-hooks/ERC20.ts";
import Input from "../low-level/Input.tsx";
import ActionBtn from "../ActionBtn.tsx";
import { displayTokenAmount } from "../../utils/displayTokenAmounts.ts";
import Loading from "../low-level/Loading.tsx";
import { HoverInfo } from "../low-level/HoverInfo.tsx";
import UserMessage from "../low-level/SuccessMsg.tsx";
import checkIconBig from "../../assets/icons/checkIconBig.svg";
import errorIconBig from "../../assets/icons/errorIconBig.svg";
import Countdown from "react-countdown";
import { renderCountdown } from "../low-level/CountdownRenderer.tsx";

const PoolDepositTab = ({
  pool,
  currentCycle,
  position,
  updatePosition,
  isCycleDepositAndBidOpen,
  showOverlay,
}: {
  pool: Pool;
  currentCycle: Cycle;
  position: Position;
  updatePosition: (value: number) => void;
  isCycleDepositAndBidOpen: boolean;
  showOverlay: (overlayComponent: JSX.Element | null | undefined) => void;
}) => {
  const [userBaseTokenBalance, setUserBaseTokenBalance] = useState<BigNumber>();
  const [userBaseTokenAllowance, setUserBaseTokenAllowance] = useState<BigNumber>();
  const [loading, setLoading] = useState(false);
  const [actionBtn, setActionBtn] = useState({
    text: "",
    onClick: () => {},
    disabled: false,
  });

  const { address } = useAccount();

  useEffect(() => {
    if (!address) return;

    updateUserBaseTokenBalance();
    updateUserBaseTokenAllowance();
  }, [address]);

  useEffect(() => {
    const updatingActionBtn = () => {
      if (userBaseTokenBalance?.isLessThan(pool.amountCycle)) {
        return setActionBtn({
          ...actionBtn,
          text: `Insufficient ${pool.baseToken.symbol} Balance`,
          disabled: true,
        });
      }

      if (pool.baseToken.address !== NATIVE_ADDRESS) {
        if (userBaseTokenAllowance?.isLessThan(pool.amountCycle)) {
          return setActionBtn({
            text: `Approve and Deposit`,
            disabled: false,
            onClick: handleAsync(
              () => handleApproveAndCycleDeposit(pool.baseToken, pool.address, pool.amountCycle),
              setLoading
            ),
          });
        }

        return setActionBtn({
          text: `Deposit Cycle Amount`,
          disabled: false,
          onClick: handleAsync(handleCycleDeposit, setLoading),
        });
      } else {
        return setActionBtn({
          text: `Deposit Cycle Amount`,
          disabled: false,
          onClick: handleAsync(handleCycleDeposit, setLoading),
        });
      }
    };

    updatingActionBtn();
  }, [
    userBaseTokenBalance,
    userBaseTokenAllowance,
    position,
    currentCycle,
    isCycleDepositAndBidOpen,
  ]);

  useEffect(() => {
    if (!loading) return showOverlay(undefined);
    showOverlay(<div></div>);
  }, [loading]);

  const updateUserBaseTokenBalance = async () => {
    if (!address) return;
    let balance;

    if (pool.baseToken.address !== NATIVE_ADDRESS) {
      balance = await pool.baseToken.balanceOf(address);
    } else {
      balance = await new Base("", []).getNativeBalance(address);
    }

    setUserBaseTokenBalance(balance);
  };

  const updateUserBaseTokenAllowance = async () => {
    if (!address) return;
    if (pool.baseToken.address !== NATIVE_ADDRESS) {
      const allowance = await pool.baseToken.allowance(address, pool.address);
      setUserBaseTokenAllowance(allowance);
    }
  };

  const handleApproveAndCycleDeposit = async (token: ERC20, to: string, value: BigNumber) => {
    await token.approve(to, value.toString());
    await Promise.all([updateUserBaseTokenAllowance(), handleCycleDeposit()]);
  };

  const handleCycleDeposit = async () => {
    await pool.depositCycle(position.id);

    toastSuccess(
      "Deposit Complete",
      `Cycle amount deposited successfully, ${pool.amountCycle} ${pool.baseToken.symbol} worth of ${pool.ybt.symbol} collateral released`
    );
    await Promise.all([
      updateUserBaseTokenBalance(),
      updateUserBaseTokenAllowance(),
      updatePosition(position.id),
    ]);
  };

  const renderDepositTab = () => {
    // If cycleAmount is already deposited
    if (position.cyclesDeposited[currentCycle.count]) {
      return (
        <div>
          <UserMessage
            icon={checkIconBig}
            title={`${displayTokenAmount(
              pool.amountCycle,
              pool.baseToken
            )} deposited successfully.`}
            message={`You have successfully deposited in this cycle ${currentCycle.count}.`}
          />
        </div>
      );
    }
    // Deposit Window closed
    if (!isCycleDepositAndBidOpen) {
      // Missed cycle deposit
      if (!position.cyclesDeposited[currentCycle.count]) {
        return (
          <UserMessage
            icon={errorIconBig}
            title={`Cycle Deposit window is closed.`}
            message={`Your ${displayTokenAmount(pool.amountCycle, pool.baseToken)} worth of ${
              pool.ybt.symbol
            } collateral has been liquidated for your missed cycle deposit`}
          />
        );
      }
    }

    // If cycle deposit is open and deposit is pending
    if (!loading) {
      return (
        <>
          <div className="">
            <Input
              disabled={true}
              value={displayTokenAmount(pool.amountCycle)}
              inputTokenSymbol={pool.baseToken.symbol}
              name={""}
              onChange={() => {}}
            />
          </div>
          <div>
            <ActionBtn
              text={actionBtn.text}
              disabled={actionBtn.disabled}
              expectedChainId={pool.chainId}
              onClick={actionBtn.onClick}
            />
          </div>
        </>
      );
    } else {
      return (
        <div className="relative h-[70px]">
          <div className="absolute z-20 w-full">
            <Loading loadingText="Depositing" />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col justify-center gap-4">
      <div className="flex justify-between">
        <div className="flex items-center gap-1">
          <span>Cycles Deposit</span>
          <HoverInfo content="Make timely cycle deposits, to get equivivalent portion of your YBT collateral released back" />
        </div>
        <div className="px-2.5 py-2 bg-neutral-800 rounded-[33.78px] inline-flex justify-start items-center gap-1.5">
          <div className="justify-start text-neutral-300 text-xs font-normal font-['Outfit'] leading-none">
            Time left:{" "}
            <Countdown
              date={currentCycle.depositAndBidEndTime * 1000}
              renderer={renderCountdown}
              onComplete={() => {}} // closeCycleDepositAndBidWindow would be closed by PoolBidTab
            />
          </div>
        </div>
      </div>

      {renderDepositTab()}
    </div>
  );
};

export default PoolDepositTab;
