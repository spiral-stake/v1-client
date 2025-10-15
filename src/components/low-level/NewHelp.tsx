import newhelp from "../../assets/icons/newhelp.svg";
import HelpTab from "./HelpTab";
import google from "../../assets/icons/google.svg";
import telegram from "../../assets/icons/telegram.svg";
import React, { useState } from "react";

const NewHelp = ({showHelpTabs,setShowHelpTabs}:{showHelpTabs:boolean,setShowHelpTabs:React.Dispatch<React.SetStateAction<boolean>>}) => {
  

  return (
    <div className="flex flex-col items-end gap-[8px] z-10 fixed bottom-[30px] right-[16px] lg:right-[80px]">
      {showHelpTabs && (
        <div className="flex flex-col gap-[8px]">
          <HelpTab icon={google} text="Fill the Google form" link=""/>
          <HelpTab icon={telegram} text="Chat on Telegram" link=""/>
        </div>
      )}
      <img
        src={newhelp}
        onClick={() => setShowHelpTabs(!showHelpTabs)}
        alt=""
        className="w-[40px] cursor-pointer"
      />
    </div>
  );
};

export default NewHelp;
