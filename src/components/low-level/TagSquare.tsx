const TagSquare = ({ text, color }: { text: string; color: string }) => {
  const colors: Record<string, string> = {
    green: "text-green-400 bg-stone-900",
    red: "text-red-500 bg-stone-900",
    gray: "text-neutral-500 bg-zinc-400 bg-opacity-20",
    yellow: "text-yellow-300 bg-stone-800",
  };

  return (
    <div
      className={`p-1 px-2 text-xs rounded inline-flex justify-start items-center gap-1.5 ${colors[color]}`}
    >
      <div>{text}</div>
    </div>
  );
};

export default TagSquare;
