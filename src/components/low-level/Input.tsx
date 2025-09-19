import TextLoading from "./TextLoading";

const Input = ({
  name,
  placeholder,
  value,
  onChange,
  disabled,
  autoFocus,
  type,
}: {
  name: string;
  placeholder?: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  autoFocus?: boolean;
  type?: string;
}) => {
  return disabled && !value ? (
    <TextLoading width={21} />
  ) : (
    <input
      type={type}
      autoFocus={autoFocus}
      autoComplete="off"
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      name={name}
      className="justify-start text-white flex-grow text-[20px] font-normal font-['Outfit'] bg-transparent outline-none"
    />
  );
};

export default Input;
