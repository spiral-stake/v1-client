import { toast } from "react-hot-toast";
import PopupNotification from "../components/low-level/PopupNotification";
import errorIcon from "../assets/icons/errorSmall.svg"
import checkGreen from "../assets/icons/checkGreen.svg"
import infoIcon from "../assets/icons/infoIcon.svg"

export const toastError = (title:string , message: string) => {
  return toast.custom(()=> (
    <PopupNotification icon={errorIcon} link="" text={message} title={title}/>
  ));
};

export const toastSuccess = (title:string , message: string) => {
  return toast.custom(()=>(
    <PopupNotification icon={checkGreen} link="" text={message} title={title}/>
  ))
};

export const toastInfo = (title:string , message: string) => {
  return toast.custom(()=>(
    <PopupNotification icon={infoIcon} link="" text={message} title={title}/>
  ))
};
