const DropdownIcon = ({ isOpen }: { isOpen: boolean }) => {
    return (<svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
    >
        <path
            d="M13 6L8 11L3 6"
            stroke="#6A7692"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>);
}

export default DropdownIcon;