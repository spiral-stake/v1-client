import React, { useState, useRef, useEffect } from "react";
import logoBlue from "../../assets/icons/logoBlue.svg";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { toastError } from "../../utils/toastWrapper";
import { handleAsync } from "../../utils/handleAsyncFunction";

function InviteOverlay() {
  const [validated, setValidated] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const validatedName = localStorage.getItem("validatedName");

    if (!validatedName) setValidated(false);
    else setValidated(true);
  }, []);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value.toUpperCase();
      setCode(newCode);

      if (value && index < code.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").toUpperCase().slice(0, 6);
    const newCode = [...code];

    for (let i = 0; i < pastedData.length; i++) {
      if (i < 6) {
        newCode[i] = pastedData[i];
      }
    }

    setCode(newCode);

    const nextEmptyIndex = newCode.findIndex((digit) => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inviteCode = code.join("");
    const codeDocRef = doc(db, "inviteCodes", inviteCode);

    // Get the document
    const codeDoc = await getDoc(codeDocRef);

    // Check if document exists and not validated before
    if (codeDoc.exists() && !codeDoc.data().validated) {
      localStorage.setItem("validatedName", codeDoc.data().username);

      updateDoc(codeDocRef, {
        validated: true,
      });

      setValidated(true);
    } else {
      toastError("Invalid Invite Code", "Provided invite code was invalid or expired");
    }
  };

  const isCodeComplete = code.every((digit) => digit !== "");

  return (
    !validated && (
      <section className="z-10 fixed top-0 left-0 bg-neutral-700 bg-opacity-50 flex justify-center items-end lg:items-center w-[100vw] h-[100vh]">
        <div className="blur-0 bg-gradient-to-b from-slate-900 to-gray-950 rounded-xl lg:rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-800 inline-flex flex-col justify-start items-center gap-6">
          <div className="w-[390px] flex flex-col items-center rounded-2xl p-6">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full blur opacity-75"></div>
              <img src={logoBlue} alt="" className="w-[72px]" />
            </div>

            <h1 className="text-2xl font-semibold text-white mt-4 tracking-tight">Invite Code</h1>
            <p className="text-white/70 text-sm text-center mb-5">
              Kindly enter your invitation code to gain access to the beta version that has been
              sent to your email.
            </p>

            <form onSubmit={handleAsync(handleSubmit, setLoading)} className="w-full space-y-5">
              <div className="grid grid-cols-6 gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-full h-[56px] text-center text-3xl font-bold border-[2px] bg-transparent border-gray-800 rounded-lg text-white 
                      focus:outline-none 
                      transition-all duration-200 ease-in-out transform hover:scale-105 focus:scale-105
                      placeholder:text-gray-500"
                    placeholder=""
                    autoComplete="none"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={!isCodeComplete || loading}
                className={`w-full text-sm bg-blue-600 text-white py-2 rounded-3xl disabled:bg-gray-600`}
              >
                {!loading ? "Join Beta Version" : "Validating ..."}
              </button>
            </form>

            <p className="mt-4 text-white/70 text-sm">
              Don't have an invite code?{" "}
              <a
                href="#"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 
                 border-b border-blue-400/30 hover:border-blue-300"
              >
                Contact us
              </a>
            </p>
          </div>
        </div>
      </section>
    )
  );
}

export default InviteOverlay;
