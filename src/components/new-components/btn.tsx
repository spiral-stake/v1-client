const Btn = ({text,color}:{text:string,color:string}) => {
    return ( <div className={`${color==="gray"?"bg-white bg-opacity-[8%] text-white":"bg-white text-[black]"}`}>
<p className="">{text}</p>
    </div> );
}
 
export default Btn;