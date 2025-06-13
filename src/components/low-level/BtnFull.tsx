import { ClipLoader } from "react-spinners";
import Loader from "./Loader";

const BtnFull = ({
  text,
  onClick,
  disabled,
  btnLoading,
}: {
  text: string;
  onClick: () => void;
  disabled?: boolean;
  btnLoading?: boolean;
}) => {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className="bg-spiral-blue text-sm font-light text-white px-3 py-2 rounded-full outline-none w-full disabled:bg-neutral-700 disabled:bg-opacity-50 disabled:text-zinc-500"
    >
      {!btnLoading ? text : <ClipLoader size={11} color="white" />}
    </button>
  );
};

export default BtnFull;
