const BidInfoRow = ({ label, value }: { label: string; value: string | number }) => {
  return (
    <div className="self-stretch inline-flex justify-between items-start">
      <div className="justify-start text-white text-opacity-70 text-xs font-normal font-['Outfit']">
        {label}
      </div>
      <div className="justify-start text-white text-xs font-normal font-['Outfit']">{value}</div>
    </div>
  );
};

export default BidInfoRow;
