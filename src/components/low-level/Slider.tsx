const Slider = ({
  name,
  onChange,
  value,
  labels,
}: {
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  labels: string[];
}) => {
  // We need to handle the case where labels[0] might be something like "2 min"
  // Extract the first number from the first label
  const firstValue = parseInt(labels[0].match(/\d+/)?.[0] || "0");

  // Calculate the range
  const max = labels.length - 1;
  const range = max;

  // Calculate the current value relative to the range for the percentage
  const normalizedValue = parseInt(value) - firstValue;
  const percentage = (normalizedValue / range) * 100;

  return (
    <div className="relative mb-6">
      <div className="relative pb-8">
        {/* Background track */}
        <div className="absolute h-2 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>

        {/* Blue filled track */}
        <div
          className="absolute h-2 bg-blue-500 rounded-lg"
          style={{ width: `${percentage}%` }}
        ></div>

        {/* Actual range input - styled to show the thumb but hide the default track */}
        <input
          name={name}
          onChange={onChange}
          id="labels-range-input"
          type="range"
          value={value}
          min={firstValue}
          max={firstValue + max}
          step="1"
          className="w-full h-2 absolute appearance-none bg-transparent cursor-pointer focus:outline-none"
        />
      </div>

      {labels.map((label: string, index: number) => {
        if (index === 0) {
          return (
            <span
              key={index}
              className="text-sm text-gray-500 dark:text-gray-400 absolute start-0 -bottom-6"
            >
              {label}
            </span>
          );
        } else if (index === labels.length - 1) {
          return (
            <span
              key={index}
              className="text-sm text-gray-500 dark:text-gray-400 absolute end-0 -bottom-6"
            >
              {label}
            </span>
          );
        } else {
          const position = `${(index / (labels.length - 1)) * 100}%`;
          return (
            <span
              key={index}
              className="text-sm text-gray-500 dark:text-gray-400 absolute -translate-x-1/2 rtl:translate-x-1/2 -bottom-6"
              style={{ left: position }}
            >
              {label}
            </span>
          );
        }
      })}
    </div>
  );
};

export default Slider;
