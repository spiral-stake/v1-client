import Input from "./Input";
import Select from "./Select";

const InputSelect = () => {
    return ( 
        <div>
            <Input/>
            <Select name={"cycleDuration"}
        onChange={() => {}}
        options={["minutes", "hours", "days", "months"]}
        value="minutes"/>
        </div>
     );
}
 
export default InputSelect;