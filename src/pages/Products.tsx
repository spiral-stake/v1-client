import { Link } from "react-router-dom";
import PageTitle from "../components/low-level/PageTitle";
import { calcLeverageApy } from "../utils";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import Loader from "../components/low-level/Loader";

const Products = ({ flashLeverage }: { flashLeverage: FlashLeverage }) => {
  return (
    flashLeverage ? (
      <div className="pb-16">
        <div className="py-16">
          <PageTitle
            title="Stable Leveraged Yields"
            subheading="Seamlessly Enjoy Leveraged Yield in one click, with our FlashLeverage mechanism"
          />
        </div>

        <div className="relative w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 justify-center">
            {flashLeverage.collateralTokens.map((collateralToken, index) => (
              <div
                key={index}
                className="bg-gradient-to-b from-slate-900 to-gray-950 rounded-2xl p-6 relative backdrop-blur-sm bg-opacity-90 text-white"
              >
                {/* Token Image Badge */}
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white bg-opacity-80">
                  <img className="w-11" src={collateralToken.image} alt={collateralToken.symbol} />
                </div>

                {/* Token Symbol */}
                <h3 className="text-gray-200 text-lg font-semibold mb-10">
                  {collateralToken.symbol}
                </h3>

                {/* Interest Rate Display */}
                <div className="mb-20">
                  <p className="text-gray-300 text-sm mb-1">
                    Max Leveraged
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-200">
                      {calcLeverageApy(collateralToken.apy, flashLeverage.borrowApy, collateralToken.maxLtv)}
                    </span>
                    <span className="text-gray-400 text-sm">APY</span>
                  </div>
                </div>

                {/* Know More Button */}
                <Link to={`/leverage/${collateralToken.address}`}>
                  <button className="w-full bg-black py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors">
                    Know more
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    ) : (
      <div className="mt-10">
        <Loader />
      </div>
    )
  );
};

export default Products;
