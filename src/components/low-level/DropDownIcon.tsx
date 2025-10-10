import arrowDown from "../../assets/icons/arrowDown.svg"

const DropdownIcon = ({ isOpen }: { isOpen: boolean }) => {
    return (
        <img src={arrowDown} alt="" className={`w-[32px] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
    );
}

export default DropdownIcon;