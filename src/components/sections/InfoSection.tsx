import { HoverInfo } from "../low-level/HoverInfo";

const APYInfo = ({ title, apy, apyBreakdown, description }: { title: string, apy: string, apyBreakdown?: JSX.Element | React.ReactElement, description: string }) => {
    return (
        <section className="rounded-sm bg-gradient-to-b from-slate-900 to-gray-950 text-white p-4 sm:p-5 md:p-8 flex flex-col justify-end gap-3 col-span-2">

            <h4 className="text-lg font-semibold">{title}</h4>

            <h4 className="text-sm font-semibold">{"Through PT-slvlUSD"}</h4>
            <div className="flex flex-col gap-3">
                <h3
                    className="text-4xl font-bold bg-gradient-to-r from-orange-100 to-orange-600 bg-clip-text text-transparent"
                    data-testid="easyBorrow-form-borrowRate"
                >
                    {apy}%
                    <span className="mx-0.5"> {apyBreakdown && <HoverInfo content={apyBreakdown} />}</span>
                </h3>

                <div className="text-sm text-gray-300">
                    {description}
                </div>
            </div>
        </section>
    );
}

export default APYInfo;