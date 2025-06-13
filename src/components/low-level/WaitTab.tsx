import TextLoading from "./TextLoading";
import BtnFull from "./BtnFull";
import Countdown from "react-countdown";
import { renderCountdownTag } from "./CountdownRenderer";
import { useState } from "react";
import { handleAsync } from "../../utils/handleAsyncFunction";
import Loading from "./Loading";
import ActionBtn from "../ActionBtn";

const WaitTab = ({
  icon,
  title,
  msg,
  countdownTarget,
  onCountdownComplete,
  btnText,
  btnOnClick,
  btnDisabled,
  poolChainId,
}: {
  icon?: string;
  title: string;
  msg: string | undefined;
  countdownTarget?: number;
  onCountdownComplete?: () => void;
  btnText?: string;
  btnOnClick?: () => Promise<void>;
  btnDisabled?: boolean;
  poolChainId?: number;
}) => {
  const [loading, setLoading] = useState(false);

  return (
    <div className="w-full p-1 inline-flex flex-col justify-start items-start gap-5">
      <div className="self-stretch p-3 bg-gradient-to-b from-slate-900 to-gray-950 min-h-[250px] rounded-xl flex flex-col justify-center items-center gap-8">
        <div className="self-stretch inline-flex justify-center items-center">
          <div className="flex-1 inline-flex flex-col justify-start items-center gap-3">
            <div className="self-stretch inline-flex justify-start items-center gap-2">
              <div className="flex-1 h-0" />
              <img src={icon} alt="" />
              <div className="flex-1 inline-flex flex-col justify-start items-start gap-2" />
            </div>
            <div className="self-stretch flex flex-col justify-start items-center gap-6">
              <div className="self-stretch flex flex-col justify-start items-center gap-2">
                <div className="self-stretch text-center justify-start text-white text-base font-medium font-['Outfit'] leading-normal">
                  {title}
                </div>

                {countdownTarget && onCountdownComplete && (
                  <div>
                    <Countdown
                      renderer={renderCountdownTag}
                      date={countdownTarget * 1000}
                      onComplete={onCountdownComplete}
                    />
                  </div>
                )}

                <div className="w-64 text-center justify-start">
                  <span className="text-white text-opacity-70 text-xs font-normal font-['Outfit'] leading-none">
                    {msg ? msg : <TextLoading lineCount={2} />}
                  </span>
                </div>
              </div>
              {btnText &&
                btnOnClick &&
                poolChainId &&
                (!loading ? (
                  <ActionBtn
                    text={btnText}
                    onClick={handleAsync(btnOnClick, setLoading)}
                    expectedChainId={poolChainId}
                    disabled={loading}
                  />
                ) : (
                  <Loading loadingText="Redeeming" />
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaitTab;
