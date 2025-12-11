const PoolInfoTab = ({ icon, title, info, extraInfo }: { icon: string, title: string, info: string, extraInfo: string }) => {
    return (<div className="w-full flex items-center px-[12px] py-[10.5px] gap-[12px] rounded-[12px] bg-white bg-opacity-[2%]">
        <div>
            <img src={icon} alt="" className="w-[36px]" />
        </div>
        <div className="flex flex-col gap-[4px]">
            <p className="text-[11px] lg:text-[14px] text-[#D9F5D380]">{title}</p>
            <p className="text-[16px]">{info} <span className="text-sm text-gray-400">({extraInfo})</span></p>
        </div>
    </div>);
}

export default PoolInfoTab;