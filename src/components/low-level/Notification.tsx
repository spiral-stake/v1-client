const Notification = ({tokenLogo,title,msg,ago,time}:{tokenLogo:string,title:string,msg:string,ago:string,time:string}) => {
    return ( 
        <div className="w-full p-3 bg-slate-800 bg-opacity-70 rounded-md inline-flex justify-start items-start gap-3">
    <div className="flex-1 flex justify-start items-start gap-3">
        <div className="pt-1 h-5 w-5 flex justify-start items-center gap-2">
            <img src={tokenLogo} alt="logo" />
        </div>
        <div className="flex-1 inline-flex flex-col justify-center items-start gap-1">
            <div className="text-center justify-start text-white text-base font-medium font-['Outfit'] leading-tight">{title}</div>
            <div className="self-stretch justify-start text-white text-opacity-70 text-xs font-normal font-['Outfit'] leading-none">{msg}</div>
        </div>
        <div className="self-stretch inline-flex flex-col justify-between items-end">
            <div className="text-right justify-start text-white text-opacity-50 text-xs font-normal font-['Outfit'] leading-none">{ago}</div>
            <div className="text-right justify-start text-lime-500 text-xs font-normal font-['Outfit'] leading-none">{time}</div>
        </div>
    </div>
</div>
     );
}
 
export default Notification;