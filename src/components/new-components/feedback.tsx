import close from "../../assets/icons/close.svg";
import form from "../../assets/icons/form.svg";
import discord from "../../assets/icons/discord.svg";
import React from "react";
import { Link } from "react-router-dom";

const Feedback = ({
  setShowFeedback,
}: {
  setShowFeedback: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <div className="bg-white lg:w-[500px] rounded-[16px] bg-opacity-[8%] backdrop-blur-2xl flex flex-col gap-[20px] p-[24px]">
      <div className="flex justify-between items-center text-[20px]">
        <p>Feedback</p>
        <div
          onClick={() => setShowFeedback(false)}
          className="flex cursor-pointer justify-center items-center p-[2px] bg-white bg-opacity-[16%] rounded-full"
        >
          <img src={close} alt="" className="w-[24px]" />
        </div>
      </div>
      <div className="flex gap-[24px]">
        <Link
          to={"https://forms.gle/RRX1LARDP6UuLAeh9"}
          className="w-full cursor-pointer flex flex-col justify-between items-center rounded-[16px] py-2 border-white hover:bg-white hover:bg-opacity-[10%]"
        >
          <img src={form} alt="" className="w-[48px]" />
          <p>feedback</p>
        </Link>
        <div className="w-full cursor-pointer flex flex-col justify-between items-center rounded-[16px] py-2 border-white hover:bg-white hover:bg-opacity-[10%]">
          <img src={discord} alt="" className="w-[60px]" />
          <p>join our discord community</p>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
