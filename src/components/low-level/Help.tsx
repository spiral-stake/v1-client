import question from "../../assets/icons/question.svg";
const Help = ({ onClick }: { onClick: () => void }) => {
  return (
    <div
      onClick={onClick}
      className="z-10 cursor-pointer shadow-lg shadow-gray-900 w-fit fixed bottom-20 right-20 border-[1px] border-gray-800 rounded-full p-4 bg-white bg-opacity-[8%] backdrop-blur-2xl"
    >
      <img src={question} alt="" className="w-[30px]" />
    </div>
  );
};

export default Help;
