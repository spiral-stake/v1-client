import { Base } from "./Base";
import { abi as TOKEN_ABI } from "../abi/ERC20.sol/ERC20.json";
import { formatUnits, parseUnits } from "../utils/formatUnits.ts";
import { Token } from "../types/index.ts";

export default class ERC20 extends Base {
  name: string;
  symbol: string;
  decimals: number;

  constructor(token: Token, ...extendedAbis: any[]) {
    super(token.address, [...TOKEN_ABI, ...extendedAbis]);

    this.name = token.name;
    this.symbol = token.symbol;
    this.decimals = token.decimals;
  }

  ///////////////////////////
  // WRITE FUNCTIONS
  /////////////////////////

  async approve(spender: string, amount: string) {
    const parsedAmount = parseUnits(amount, this.decimals);
    return this.write("approve", [spender, parsedAmount]);
  }

  ///////////////////////////
  // READ FUNCTIONS
  /////////////////////////

  async allowance(owner: string, spender: string) {
    const allowance = await this.read("allowance", [owner, spender]);
    return formatUnits(allowance as bigint, this.decimals);
  }

  async balanceOf(account: string) {
    const balance = await this.read("balanceOf", [account]);
    return formatUnits(balance as bigint, this.decimals);
  }
}
