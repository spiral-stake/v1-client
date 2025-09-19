import { useState } from "react";
import Loader from "../components/low-level/Loader";
import PageTitle from "../components/low-level/PageTitle";
import ProductCard from "../components/new-components/productCard";
import RiskTab from "../components/new-components/riskTab";
import FlashLeverage from "../contract-hooks/FlashLeverage";
import { calcLeverageApy } from "../utils";

const Products = ({ flashLeverage }: { flashLeverage: FlashLeverage }) => {
  const [riskTab, setRiskTab] = useState<string>("all");

  return flashLeverage ? (
    <div className="flex flex-col gap-[48px] py-[48px]">
      <div className="">
        <PageTitle
          title="Maximize your stablecoin yields"
          subheading="Our system helps you leverage safely and instantly, so you earn more from the same money without extra effort."
        />
      </div>
      <div className="flex w-full gap-[48px]">
        <div className="flex flex-col gap-[16px]">
          <RiskTab risk="all" />
          <RiskTab risk="high" />
          <RiskTab risk="medium" />
          <RiskTab risk="low" />
        </div>
        <div className="grid grid-cols-2 gap-x-[24px] gap-y-[34px] px-6 w-full">
          {flashLeverage.collateralTokens.map((collateralToken, index) => (
            <ProductCard
              key={index}
              icon={`/tokens/${collateralToken.symbol}.svg`}
              name={collateralToken.symbol.split("-")[1]}
              apy={calcLeverageApy(
                collateralToken.impliedApy,
                collateralToken.borrowApy,
                collateralToken.safeLtv
              )}
              maturity={`${collateralToken.name.slice(
                collateralToken.name.length - 9,
                collateralToken.name.length - 7
              )}${" "}
                  ${collateralToken.name.slice(
                collateralToken.name.length - 7,
                collateralToken.name.length - 4
              )}${", "}
                  ${collateralToken.name.slice(
                collateralToken.name.length - 4,
                collateralToken.name.length
              )}`}
              underlyingCollatateralIcon={`/tokens/${collateralToken.symbol}.svg`}
              underlyingCollatateralName={collateralToken.info.underlyingCollateral}
              yieldSource={collateralToken.info.yieldSource}
              collateralTokenAddress={collateralToken.address}
            />
          ))}
        </div>
      </div>
    </div>
  ) : (
    <div className="mt-10">
      <Loader />
    </div>
  );
};

export default Products;
