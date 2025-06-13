const Select = ({name,options,onChange,value}:{name:string,options:string[],onChange:()=>void,value:string}) => {
    return ( 
       <div >
        <select name={name} onChange={onChange} value={value} id="" className="bg-spiral-dark-blue outline-none">
            {options.map((option:string, index:number) => (
             <option 
             key={index} 
             value={option}
             style={{ backgroundColor: 'transparent' }}
             className="text-white"
           >
             {option}
           </option>
            ))}
          </select>
       </div>
     );
}
 
export default Select;