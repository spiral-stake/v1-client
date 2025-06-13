const Overlay = ({ overlay }: { overlay: React.ReactNode | undefined }) => {
  return (
    overlay && (
      <section className="z-10 fixed top-0 left-0 bg-neutral-700 bg-opacity-50 flex justify-center items-end lg:items-center w-[100vw] h-[100vh]">
        {overlay}
      </section>
    )
  );
};

export default Overlay;
