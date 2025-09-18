const ReviewinfoTabs = ({title,info}:{title: string,info:string}) => {
  return (
    <div className="bg-white text-[14px] bg-opacity-[8%] border-[1px] border-white border-opacity-[10%] rounded-xl px-[16px] py-[12px] grid grid-cols-[40%,60%]">
     <p className="text-white text-opacity-[70%]">{title}</p>
     <p>{info}</p>
    </div>
  );
};

export default ReviewinfoTabs;
