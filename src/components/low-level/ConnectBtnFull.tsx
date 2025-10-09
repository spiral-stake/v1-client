import { ClipLoader } from "react-spinners";
import lock from "../../assets/icons/lock-svgrepo-com.svg";
import power from "../../assets/icons/power.svg";

const ConnectBtnFull = ({
  text,
  onClick,
  disabled,
  btnLoading,
  completed,
}: {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  btnLoading?: boolean;
  completed?: boolean;
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="flex gap-[8px] justify-center py-[11px] px-[16px] items-center bg-white bg-opacity-[12%] text-[14px] disabled:font-light min-w-[80px] h-10 text-white rounded-[9999px] outline-none w-full disabled:bg-neutral-700 disabled:cursor-not-allowed"
    >
      {!btnLoading ? (
        !completed ? (
          text
        ) : (
          <img className="w-5" src={lock} alt="" />
        )
      ) : (
        <ClipLoader size={11} color="black" />
      )}
      <img src={power} alt="" className="w-[16px]" />
    </button>
  );
};

export default ConnectBtnFull;
