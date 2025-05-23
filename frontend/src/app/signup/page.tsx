"use client";
import React, { useState, useEffect, useRef } from "react";
import { FcOk } from "react-icons/fc";
import { ImSpinner8 } from "react-icons/im";
import { HiMiniXMark } from "react-icons/hi2";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import axios from "axios";

export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMssg, setErrorMssg] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [signupForm, setSignupForm] = useState<boolean>(false);

  const formRef = useRef<HTMLFormElement>(null);

  const validateUsername = async (username: string) => {
    const regexp = /^[a-z0-9]{5,20}$/;
    if (regexp.test(username)) {
      try {
        setIsLoading(true);
        setErrorMssg("");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/check-username/${username}`
        );
        const data = await response.json();
        setIsLoading(false);

        if (data.data.exists) {
          setErrorMssg("Username Already Exists");
          setIsValid(false);
        } else {
          setErrorMssg("");
          setIsValid(true);
        }
      } catch (error) {
        toast.error("Unexped Error Occured");
        console.error(error);
      }
    } else {
      setIsLoading(true);
      setErrorMssg("");
      setIsValid(null);
      setTimeout(() => {
        setIsLoading(false);
        setErrorMssg("Please enter a username between 5 and 20 characters");
        setIsValid(false);
        return;
      }, 500);
    }
  };

  useEffect(() => {
    if (username) {
      validateUsername(username);
    } else {
      setIsValid(null);
      setErrorMssg("");
    }
  }, [username]);

  const handleClick = () => {
    if (isValid) {
      if (signupForm) {
        formRef.current?.requestSubmit();
      }
      setSignupForm(true);
    } else {
      toast.error("Please Enter Valid Username");
      setErrorMssg("Please Enter Username");
      setIsValid(false);
    }
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsSpinning(true);

    try {
      console.log(email);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/check-email/${email}`
      );
      const data = await response.json();
      if (data.data.exists) {
        toast.error("Email already exists, try Login instead");
        return;
      } else {
        try {
          const signupResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/signup`,
            {
              fullname,
              username,
              email,
              password,
            }
          );

          const { token } = signupResponse.data.data;

          if (token) {
            localStorage.setItem("token", token);
            toast.success("Account created successfully!");
            router.push("/");
          } else {
            toast.error("Signup failed. Please try again.");
          }
        } catch (error) {
          toast.error("Signup failed. Please try again.");
          console.log(error);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsSpinning(false);
    }
  };

  return (
    <div className="flex flex-row h-screen">
      <div className="h-screen sm:w-1/3 w-0 bg-amber-300">
        <header className="flex justify-left px-6"></header>
      </div>
      <div className="flex-1 sm:bg-amber-300 bg-gray-50 ">
        <div className="h-screen w-full rounded-l-2xl bg-gray-50 flex flex-col">
          <header className="flex justify-between sm:justify-end px-6">
            <div className="flex sm:hidden"></div>
            <div>
              <p className="p-5 flex">
                <span className="sm:block hidden">
                  Already have an account?
                </span>
                <span
                  className="underline cursor-pointer pl-1 hover:no-underline"
                  onClick={() => router.push("/login")}
                >
                  Sign in
                </span>
              </p>
            </div>
          </header>

          <div className="flex-1 sm:ml-32 mx-3 ">
            {/*Username validation*/}
            <div className={`${signupForm ? "hidden" : ""} sm:mt-40 mt-28`}>
              <p className="font-bold sm:text-3xl text-2xl px-2">
                Create your account
              </p>
              <p className="text-gray-500 px-2">
                Choose a username for your page.
              </p>
              <div
                className={`flex px-2 m-2 mt-4 h-12 w-90 sm:w-80 lg:w-1/2 bg-gray-200 rounded-xl focus-within:ring-1 ${
                  isValid == null
                    ? "focus-within:ring-black"
                    : isValid === true
                    ? "focus-within:ring-green-500"
                    : "focus-within:ring-red-500"
                }`}
              >
                <p className="py-3 shrink-0">flockshop.in/</p>
                <input
                  type="text"
                  placeholder="username"
                  className="outline-none bg-transparent ml-1 w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase())}
                />
                <div className="py-3">
                  {isLoading ? (
                    <ImSpinner8 className="animate-spin text-black h-5 w-5" />
                  ) : isValid === true ? (
                    <FcOk className="h-5 w-5" />
                  ) : isValid === false ? (
                    <HiMiniXMark className="h-4 w-4 bg-red-600 mt-1 text-white rounded-full" />
                  ) : null}
                </div>
              </div>
              <div className="px-3 text-xs text-red-600">{errorMssg}</div>

              <div className="sm:hidden flex flex-col justify-between border-gray-200 mt-8">
                <button
                  className={`${
                    isSpinning
                      ? "bg-amber-200 cursor-not-allowed"
                      : "bg-amber-300 hover:bg-amber-400 cursor-pointer"
                  } h-12 p-2 w-90 rounded-3xl ml-2`}
                  type="submit"
                  onClick={handleClick}
                  disabled={isSpinning}
                >
                  {isSpinning ? (
                    <ImSpinner8 className="animate-spin text-white h-5 w-5 ml-10" />
                  ) : (
                    "Sign Up"
                  )}
                </button>
                <p className="text-gray-600 text-md text-center mt-4 m-2">
                  By continuing, you agree to the{" "}
                  <span className="text-black underline hover:no-underline cursor-pointer">
                    terms of service
                  </span>{" "}
                  and{" "}
                  <span className="text-black underline hover:no-underline cursor-pointer">
                    privacy policy.
                  </span>
                </p>
              </div>
            </div>
            {/*Username validation end */}

            {/* signup page */}
            <div
              className={`${
                signupForm
                  ? "w-90  flex flex-col items-center justify-center"
                  : "hidden"
              } `}
            >
              <form
                className="flex flex-col sm:mt-10 mt-2 "
                ref={formRef}
                onSubmit={handleSubmit}
              >
                <h1 className="pl-4 font-bold text-2xl my-4 ">
                  Welcome to FlockShop!
                </h1>
                <input
                  type="text"
                  className="w-90 h-12 bg-gray-200 m-3 p-4 rounded-md text-black font-light text-sm"
                  placeholder="Full Name*"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  required
                />
                <input
                  type="email"
                  className={`w-90 h-12 bg-gray-200 m-3 p-4 rounded-md text-black font-light text-sm ${
                    isValid ? "" : "border-red-500 border"
                  }`}
                  placeholder="Email*"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  className="w-90 h-12 bg-gray-200 m-3 p-4 rounded-md text-black font-light text-sm"
                  placeholder="Password*"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </form>

              <div className="sm:hidden flex flex-col justify-between border-gray-200 mt-8">
                <button
                  className={`${
                    isSpinning
                      ? "bg-amber-200 cursor-not-allowed"
                      : "bg-amber-300 hover:bg-amber-400 cursor-pointer"
                  } h-12 p-2 w-32 rounded-3xl ml-2`}
                  type="submit"
                  onClick={handleClick}
                  disabled={isSpinning}
                >
                  {isSpinning ? (
                    <ImSpinner8 className="animate-spin text-white h-5 w-5 ml-10" />
                  ) : (
                    "Sign Up"
                  )}
                </button>
                <p className="text-gray-600 text-md text-center mt-4 m-4">
                  By continuing, you agree to the{" "}
                  <span className="text-black underline hover:no-underline cursor-pointer">
                    terms of service
                  </span>{" "}
                  and{" "}
                  <span className="text-black underline hover:no-underline cursor-pointer">
                    privacy policy.
                  </span>
                </p>
              </div>
            </div>
            {/* signup page end */}
          </div>
          <div className="hidden sm:flex justify-between px-12 m-2 border-t border-gray-200 pt-2">
            <p className="text-gray-800">
              By continuing, you agree to the{" "}
              <span className="text-black underline hover:no-underline cursor-pointer">
                terms of service
              </span>{" "}
              and{" "}
              <span className="text-black underline hover:no-underline cursor-pointer">
                privacy policy.
              </span>
            </p>
            <button
              className={`${
                isSpinning
                  ? "bg-amber-200 cursor-not-allowed"
                  : "bg-amber-300 hover:bg-amber-400 cursor-pointer"
              } h-12 p-2 w-32 rounded-3xl ml-2`}
              type="submit"
              onClick={handleClick}
              disabled={isSpinning}
            >
              {isSpinning ? (
                <ImSpinner8 className="animate-spin text-white h-5 w-5 ml-10" />
              ) : (
                "Continue"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
