import { useState } from "react";
import copyIcon from "../../assets/icons/copy.svg";

const CopyText = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset copied state after 2 seconds
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div className="flex items-center">
      <span className="text-xs text-spiral-light-gray">{text}</span>
      <img 
        src={copyIcon} 
        alt="copy" 
        className="ml-1 cursor-pointer" 
        onClick={handleCopy}
        title="Copy to clipboard"
      />
      {copied && <span className="text-xs text-green-500 ml-1">Copied!</span>}
    </div>
  );
};

export default CopyText;