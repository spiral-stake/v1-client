const PageTitle = ({ title, subheading }: { title: string, subheading: string }) => {
    return (
        <div className="w-full pb-6">
            <div className="justify-start text-gray-200 text-3xl font-medium font-['Outfit']">{title}</div>
            <div className="max-w-[650px] justify-start text-sm mt-2 text-stone-300 font-[Outfit] font-light leading-normal">{subheading}</div>
        </div>
    );
}

export default PageTitle;