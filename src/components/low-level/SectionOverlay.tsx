const SectionOverlay = ({
  overlay,
}: {
  overlay: React.ReactNode | undefined;
}) => {
  return (
    overlay && (
      <div className="w-full h-full absolute z-10 bg-gradient-to-l bg-slate-900 bg-opacity-80">
        {overlay}
      </div>
    )
  );
};

export default SectionOverlay;
