import truncateStr from "../../utils/truncateStr";

const Info = ({symbol,title,value}:{symbol:string,title:string,value:string}) => {
    return ( 
        <div className="w-36 inline-flex flex-col justify-center items-start">
    <div className="justify-start text-neutral-200 text-xl font-medium font-['Outfit'] leading-normal">{truncateStr(value,15)}</div>
    <div className="flex justify-start items-center gap-2">
        <div className="w-4 h-4 relative overflow-hidden">
            <img src={symbol} alt="" />
        </div>
        <div className="text-neutral-400 text-sm font-normal font-['Outfit']">{title}</div>
    </div>
</div>
     );
}
 
export default Info;