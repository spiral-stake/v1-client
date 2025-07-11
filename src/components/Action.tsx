import { useState } from "react";
import { handleAsync } from "../utils/handleAsyncFunction";
import ActionBtn from "./ActionBtn";
import { Token } from "../types";
import { useChainId } from "wagmi";

const Action = ({ text, actionHandler, token, amountToken, disabled, completed }: { text: string, actionHandler: () => Promise<void>, token: Token, amountToken: string, completed?: boolean, disabled?: boolean }) => {
    const [loading, setLoading] = useState(false);

    const chainId = useChainId();

    return (<div
        className="col-span-full grid grid-rows-2 lg:grid-rows-1 lg:grid-cols-[auto_1fr_auto] lg:gap-8 items-center gap-y-3 border-b border-[#142435] p-4 last:border-none sm:p-5"
        data-testid="actions-row-2"
    >
        <div
            className="overflow-x-auto overflow-y-hidden whitespace-nowrap text-xs font-medium col-span-1 lg:col-span-1 flex items-center gap-1.5 sm:overflow-visible md:col-span-1"
            data-chromatic="ignore"
        >
            {text}
        </div>
        <div className="text-xs font-medium col-span-1 lg:col-span-1 text-right lg:text-start col-start-2 md:col-span-3">
            {amountToken}{" "}
            <span className="text-gray-400">{token.symbol}</span>
        </div>
        <div className="w-full col-span-2 lg:col-span-1">
            <ActionBtn
                btnLoading={loading}
                text={text}
                disabled={disabled}
                completed={completed}
                expectedChainId={Number(chainId)}
                onClick={handleAsync(
                    () => !completed ? actionHandler() : Promise.resolve(),
                    setLoading
                )}
            />
        </div>
    </div>);
}

export default Action;