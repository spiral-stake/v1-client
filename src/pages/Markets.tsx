import PageTitle from "../components/low-level/PageTitle";
import PositionManager from "../contract-hooks/PositionManager";

const Markets = ({ positionManager }: { positionManager: PositionManager }) => {
    return (<div className="pb-16">
        <div className="py-16">
            <PageTitle
                title={"Markets"}
                subheading={`Seamlessly Leverage in one click, with our Cost-efficient FlashMint powered Auto-looping.`}
            />
        </div>{" "}
    </div>);
}

export default Markets;