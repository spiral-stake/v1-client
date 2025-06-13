import BigNumber from "bignumber.js";
import Pool from "../contract-hooks/Pool";
import { Cycle } from "../types";

function calculateAPRFromBidAmount(
  pool: Pool,
  bidAmount: BigNumber,
  currentCycle: Cycle
): BigNumber {
  const remainingCycles = pool.totalCycles - currentCycle.count;
  const remainingCycleDeposits = pool.amountCycle.multipliedBy(remainingCycles);

  const cycleDuration = new BigNumber(pool.cycleDuration); // In seconds
  const secondsInYear = new BigNumber(31536000); // 365 days in seconds

  // We need to find the APR that would result in the given bid amount
  // Using binary search for efficiency
  let lowAPR = new BigNumber(0);
  let highAPR = new BigNumber(10); // Starting with a reasonable upper bound (1000%)
  let midAPR = highAPR.plus(lowAPR).dividedBy(2);

  const tolerance = new BigNumber(0.0000001); // Acceptable precision
  let calculatedBidAmount: BigNumber;

  // Binary search to find the APR
  while (highAPR.minus(lowAPR).isGreaterThan(tolerance)) {
    midAPR = highAPR.plus(lowAPR).dividedBy(2);

    // Calculate bid amount using the midAPR
    calculatedBidAmount = calculateBidAmountWithAPR(
      pool,
      midAPR,
      remainingCycles,
      remainingCycleDeposits,
      cycleDuration,
      secondsInYear
    );

    if (calculatedBidAmount.isGreaterThan(bidAmount)) {
      highAPR = midAPR;
    } else {
      lowAPR = midAPR;
    }

    // Check if we're close enough to the target bid amount
    if (calculatedBidAmount.minus(bidAmount).abs().dividedBy(bidAmount).isLessThan(tolerance)) {
      break;
    }
  }

  return midAPR;
}

// Helper function to calculate bid amount given an APR (extracted from original function)
function calculateBidAmountWithAPR(
  pool: Pool,
  APR: BigNumber,
  remainingCycles: number,
  remainingCycleDeposits: BigNumber,
  cycleDuration: BigNumber,
  secondsInYear: BigNumber
): BigNumber {
  const periodicRate = APR.dividedBy(secondsInYear).multipliedBy(cycleDuration);

  // Calculate the interest for each remaining cycle
  let totalInterest = new BigNumber(0);
  let outstandingPrincipal = remainingCycleDeposits;

  // For each cycle, we calculate interest on the reducing balance
  for (let i = 0; i < remainingCycles; i++) {
    // Calculate interest for this cycle on the current outstanding principal
    const cycleInterest = outstandingPrincipal.multipliedBy(periodicRate);
    totalInterest = totalInterest.plus(cycleInterest);

    // Reduce the outstanding principal for the next cycle
    outstandingPrincipal = outstandingPrincipal.minus(pool.amountCycle);
  }

  return totalInterest;
}

export { calculateAPRFromBidAmount, calculateBidAmountWithAPR };
