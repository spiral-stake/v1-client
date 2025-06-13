import errorIcon from "../../assets/icons/errorRed.svg";

const InputContainer = ({
  inputComponent,
  label,
  labelIcon,
  condition,
  errorMsg,
}: {
  inputComponent: JSX.Element;
  label?: string;
  labelIcon?: string;
  condition?: string;
  errorMsg?: string;
}) => {
  return (
    <div className="">
      <div className="flex justify-between text-stone-300 text-xs my-2">
        <div className="flex items-center gap-1">
          <img src={labelIcon} alt="" className="w-3 h-3" />
          <span className="">{label}</span>
        </div>
        <div>
          <span>{condition}</span>
        </div>
      </div>
      <div>{inputComponent}</div>
      {errorMsg && (
        <div className="hidden mt-1 items-center text-xs text-[#ef4444] gap-1">
          <img src={errorIcon} alt="" className="w-3 h-3" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

export default InputContainer;
