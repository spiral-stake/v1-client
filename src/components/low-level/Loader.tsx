import ClipLoader from "react-spinners/ClipLoader";

const Loader = () => {
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center", padding: "10px" }}>
      <ClipLoader size={21} color="rgb(8 79 170)" />
    </div>
  );
};

export default Loader;
