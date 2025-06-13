import Skeleton from "react-loading-skeleton";

const TextLoading = ({ width, lineCount }: { width?: number | string; lineCount?: number }) => {
  return <Skeleton highlightColor="#01152a" baseColor="#03050d" width={width} count={lineCount} />;
};

export default TextLoading;
