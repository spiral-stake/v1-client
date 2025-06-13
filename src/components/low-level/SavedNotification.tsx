import tokenIcon from "../../assets/icons/Group.svg";
import BtnFull from "./BtnFull";
import Notification from "./Notification";

const SavedNotification = () => {
  const notifications = [
    {
      tokenIcon: tokenIcon,
      title: "023 swETH 04",
      msg: "Pool is starting soon",
      ago: "02m",
      time: "18 Mar,18:22:08",
    },
    {
      tokenIcon: tokenIcon,
      title: "04 swETH 03",
      msg: "Deposit & Bid window open for Cycle 1",
      ago: "02m",
      time: "00:12:12",
    },
    {
      tokenIcon: tokenIcon,
      title: "04 swETH 03",
      msg: "Cycle 2 starting in",
      ago: "02m",
      time: "00:12:12",
    },
    {
      tokenIcon: tokenIcon,
      title: "04 swETH 03",
      msg: "Deposit window open for Cycle 1",
      ago: "02m",
      time: "00:12:12",
    },
  ];

  return (
    <div className="w-[400px] p-4 rounded-md">
      <div className="w-full flex flex-col gap-2 mb-20">
        {notifications.map((notification) => (
          <Notification
            tokenLogo={notification.tokenIcon}
            ago={notification.ago}
            msg={notification.msg}
            time={notification.time}
            title={notification.title}
          />
        ))}
      </div>
      <BtnFull onClick={() => {}} text="View more" />
    </div>
  );
};

export default SavedNotification;
