const CustomSelect = ({
  name,
  options,
  onChange,
  value,
}: {
  name: string;
  options: string[];
  onChange: (name: string, value: string) => void;
  value: string;
}) => {
  return (
    <div className="w-full flex flex-row p-1 bg-white bg-opacity-5 text-xs rounded-md justify-evenly">
      {options.map((option) => (
        <div
          onClick={() => onChange(name, option)}
          key={option}
          className={`w-full flex justify-center items-center p-1 px-5 rounded cursor-pointer transition-all duration-200 ${
            option === value ? "text-black bg-white" : ""
          }`}
        >
          <span>{option}</span>
        </div>
      ))}
    </div>
  );
};

export default CustomSelect;
