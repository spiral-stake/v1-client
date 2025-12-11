export const createDefualtApproxParams = () => {
  return {
    guessMin: 0n,
    guessMax: 0n,
    guessOffchain: 0n,
    maxIteration: 0n,
    eps: 0n,
  };
};

export const createDefaultLimitOrderData = () => {
  return {
    limitRouter: "0x0000000000000000000000000000000000000000",
    epsSkipMarket: "0",
    normalFills: [],
    flashFills: [],
    optData: "0x",
  };
};
