import { useState } from "react";
import { handleAsync } from "../utils/handleAsyncFunction";
import ActionBtn from "./ActionBtn";
import { Token } from "../types";
import { useChainId } from "wagmi";

const Action = ({
  text,
  actionHandler,
  token,
  amountToken,
  disabled,
  completed,
}: {
  text: string;
  actionHandler: () => Promise<void>;
  token: Token;
  amountToken: string;
  completed?: boolean;
  disabled?: boolean;
}) => {
  const [loading, setLoading] = useState(false);

  const chainId = useChainId();

  return (
    <div className="w-full">
      <ActionBtn
        btnLoading={loading}
        text={text}
        disabled={disabled}
        completed={completed}
        expectedChainId={Number(chainId)}
        onClick={handleAsync(
          () => (!completed ? actionHandler() : Promise.resolve()),
          setLoading
        )}
      />
    </div>
  );
};

export default Action;
