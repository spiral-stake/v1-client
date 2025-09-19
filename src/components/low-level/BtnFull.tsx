import { ClipLoader } from "react-spinners";
import CheckIconBlue from "../../assets/icons/CheckBig.svg";
import lock from "../../assets/icons/lock-svgrepo-com.svg";

const BtnFull = ({
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
      className="flex justify-center items-center border-[1px] border-white border-opacity-[14%] bg-white text-black font-normal disabled:bg-opacity-[8%] text-sm disabled:font-light min-w-[80px] h-10 disabled:text-white px-2.5 py-2 rounded-full outline-none w-full disabled:bg-neutral-700 disabled:cursor-not-allowed"
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
    </button>
  );
};

export default BtnFull;
