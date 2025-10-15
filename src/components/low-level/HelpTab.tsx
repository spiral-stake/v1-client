import { Link } from "react-router-dom";

const HelpTab = ({icon,text,link}:{icon:string,text:string,link:string}) => {
    return ( <Link to={link} className="flex gap-[8px] items-center cursor-pointer bg-white rounded-full py-[11px] px-[16px] text-[14px] text-black font-[400]">
         <img src={icon} alt="" className="w-[16px]"/>
         <p>{text}</p>
    </Link> );
}
 
export default HelpTab;