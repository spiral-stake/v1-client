const Overlay = ({
  overlay,
  onClose,
}: {
  overlay: React.ReactNode | undefined;
  onClose?: () => void;
}) => {
  return (
    overlay && (
      <div
        className="z-10 fixed top-0 left-0 bg-black bg-opacity-[70%] flex lg:justify-center items-end lg:items-center w-[100vw] h-[100vh]"
        onClick={onClose} // click on backdrop closes
      >
        {/* stop propagation so clicks inside content don’t close */}
        <div className="w-full lg:w-fit" onClick={(e) => e.stopPropagation()}>
          {overlay}
        </div>
      </div>
    )
  );
};

export default Overlay;
