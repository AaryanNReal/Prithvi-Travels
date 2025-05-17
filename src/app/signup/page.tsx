'use client';

import Link from "next/link";
import React, { useState } from "react";
import MobileNumberInput from "@/components/PhoneInput";
import { signInWithPopup, createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth, provider } from "../lib/firebase"; 
import { collection, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

const SignupPage = () => {
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handlePhoneChange = (value: string) => {
    setPhoneNumber(value);
  };

  // Sign up using email/password.
  // Create a new user document with a custom document ID: UID{timestamp}
  const handleSignup = async () => {
    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (!password) {
      setError("Please enter a password");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!agreeToTerms) {
      setError("You must agree to the Terms and Conditions");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create custom document ID instead of using user.uid
      const timestampUID = `UID${Date.now()}`;
      // Create a custom document reference in "users" collection
      const userDocRef = doc(collection(db, "users"), timestampUID);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          userID: timestampUID, // custom document id saved in field userID
          email,
          name: fullName,
          phone: phoneNumber,
          uid: user.uid, // original firebase uid for reference
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      setSuccess(`Account successfully created for ${email}`);
      router.push("/");
    } catch (error: any) {
      console.error("Sign-up error:", error);
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(`Registration failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Sign in with Google.
  // Create a new user document with a custom document ID if one doesn’t already exist.
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Create custom document ID
      const timestampUID = `UID${Date.now()}`;
      // Create a reference with the custom ID
      const userDocRef = doc(collection(db, "users"), timestampUID);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await setDoc(userDocRef, {
          userID: timestampUID,
          email: user.email,
          name: user.displayName || "",
          photoURL: user.photoURL || "",
          provider: "google",
          uid: user.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      router.push("/");
    } catch (error: any) {
      console.error("Sign-in error:", error);
      setError("Google sign-in failed. Please try again.");
    }
  };

  return (
    <>
      <section className="relative z-10 overflow-hidden pt-36 pb-16 md:pb-20 lg:pt-[180px] lg:pb-28">
        <div className="container">
          <div className="-mx-4 flex flex-wrap">
            <div className="w-full px-4">
              <div className="shadow-three dark:bg-dark mx-auto max-w-[500px] rounded-sm bg-white px-6 py-10 sm:p-[60px]">
                <h3 className="mb-3 text-center text-2xl font-bold text-black sm:text-3xl dark:text-white">
                  Create your account
                </h3>
                <p className="mb-11 text-center text-base font-medium text-body-color">
                  It's totally free and super easy
                </p>
                
                {error && (
                  <div className="mb-4 rounded-xs bg-red-50 p-3 text-red-700 border border-red-200">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-4 rounded-xs bg-green-50 p-3 text-green-700 border border-green-200">
                    {success}
                  </div>
                )}
                
                <button 
                  onClick={signInWithGoogle} 
                  disabled={loading}
                  className="mb-6 flex w-full items-center justify-center rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base transition-all duration-300 outline-hidden hover:border-primary hover:bg-primary/5 hover:text-primary dark:border-transparent dark:bg-[#2C303B] dark:shadow-two dark:text-body-color-dark dark:hover:border-primary dark:hover:bg-primary/5 dark:hover:text-primary disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <span className="mr-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g clipPath="url(#clip0_95:967)">
                        <path
                          d="M20.0001 10.2216C20.0122 9.53416 19.9397 8.84776 19.7844 8.17725H10.2042V11.8883H15.8277C15.7211 12.539 15.4814 13.1618 15.1229 13.7194C14.7644 14.2769 14.2946 14.7577 13.7416 15.1327L13.722 15.257L16.7512 17.5567L16.961 17.5772C18.8883 15.8328 19.9997 13.266 19.9997 10.2216"
                          fill="#4285F4"
                        />
                        <path
                          d="M10.2042 20.0001C12.9592 20.0001 15.2721 19.1111 16.9616 17.5778L13.7416 15.1332C12.88 15.7223 11.7235 16.1334 10.2042 16.1334C8.91385 16.126 7.65863 15.7206 6.61663 14.9747C5.57464 14.2287 4.79879 13.1802 4.39915 11.9778L4.27957 11.9878L1.12973 14.3766L1.08856 14.4888C1.93689 16.1457 3.23879 17.5387 4.84869 18.512C6.45859 19.4852 8.31301 20.0005 10.2046 20.0001"
                          fill="#34A853"
                        />
                        <path
                          d="M4.39911 11.9777C4.17592 11.3411 4.06075 10.673 4.05819 9.99996C4.0623 9.32799 4.17322 8.66075 4.38696 8.02225L4.38127 7.88968L1.19282 5.4624L1.08852 5.51101C0.372885 6.90343 0.00012207 8.4408 0.00012207 9.99987C0.00012207 11.5589 0.372885 13.0963 1.08852 14.4887L4.39911 11.9777Z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M10.2042 3.86663C11.6663 3.84438 13.0804 4.37803 14.1498 5.35558L17.0296 2.59996C15.1826 0.901848 12.7366 -0.0298855 10.2042 -3.6784e-05C8.3126 -0.000477834 6.45819 0.514732 4.8483 1.48798C3.2384 2.46124 1.93649 3.85416 1.08813 5.51101L4.38775 8.02225C4.79132 6.82005 5.56974 5.77231 6.61327 5.02675C7.6568 4.28118 8.91279 3.87541 10.2042 3.86663Z"
                          fill="#EB4335"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_95:967">
                          <rect width="20" height="20" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </span>
                  {loading ? "Signing in..." : "Sign in with Google"}
                </button>
                
                <div className="mb-8 flex items-center justify-center">
                  <span className="hidden h-[1px] w-full max-w-[60px] sm:block bg-body-color/50"></span>
                  <p className="w-full px-5 text-center text-base font-medium text-body-color">
                    Or, register with your email
                  </p>
                  <span className="hidden h-[1px] w-full max-w-[60px] sm:block bg-body-color/50"></span>
                </div>
                
                <form>
                  <div className="mb-8">
                    <label htmlFor="name" className="mb-3 block text-sm text-dark dark:text-white">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base transition-all duration-300 outline-hidden border-stroke dark:border-transparent dark:bg-[#2C303B] dark:shadow-two dark:text-body-color-dark focus:border-primary dark:focus:border-primary"
                    />
                  </div>
                  
                  <div className="mb-8">
                    <label htmlFor="contact" className="mb-3 block text-sm text-dark dark:text-white">
                      Contact Number
                    </label>
                    <MobileNumberInput onChange={(value) => setPhoneNumber(value)} />
                  </div>
                  
                  <div className="mb-8">
                    <label htmlFor="email" className="mb-3 block text-sm text-dark dark:text-white">
                      Work Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your Email"
                      className="w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base transition-all duration-300 outline-hidden border-stroke dark:border-transparent dark:bg-[#2C303B] dark:shadow-two dark:text-body-color-dark focus:border-primary dark:focus:border-primary"
                    />
                  </div>
                  
                  <div className="mb-8">
                    <label htmlFor="password" className="mb-3 block text-sm text-dark dark:text-white">
                      Your Password
                    </label>
                    <div className="relative">
                      <input
                        type={isPasswordVisible ? "text" : "password"}
                        name="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your Password"
                        className="w-full rounded-xs border bg-[#f8f8f8] px-6 py-3 text-base transition-all duration-300 outline-hidden border-stroke dark:border-transparent dark:bg-[#2C303B] dark:shadow-two dark:text-body-color-dark focus:border-primary dark:focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                        aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                      >
                        {isPasswordVisible ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                            <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-8 flex">
                    <label
                      htmlFor="checkboxLabel"
                      className="flex cursor-pointer select-none text-sm font-medium text-body-color"
                    >
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="checkboxLabel"
                          checked={agreeToTerms}
                          onChange={(e) => setAgreeToTerms(e.target.checked)}
                          className="sr-only"
                        />
                        <div
                          className={`mt-1 mr-4 flex h-5 w-5 items-center justify-center rounded-sm border dark:border-white/10 border-body-color/20 ${
                            agreeToTerms ? "bg-primary" : ""
                          }`}
                        >
                          <span className={agreeToTerms ? "opacity-100" : "opacity-0"}>
                            <svg width="11" height="8" viewBox="0 0 11 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M10.0915 0.951972L10.0867 0.946075L10.0813 0.940568C9.90076 0.753564 9.61034 0.753146 9.42927 0.939309L4.16201 6.22962L1.58507 3.63469C1.40401 3.44841 1.11351 3.44879 0.932892 3.63584C0.755703 3.81933 0.755703 4.10875 0.932892 4.29224L0.932878 4.29225L0.934851 4.29424L3.58046 6.95832C3.73676 7.11955 3.94983 7.2 4.1473 7.2C4.36196 7.2 4.55963 7.11773 4.71406 6.9584L10.0468 1.60234C10.2436 1.4199 10.2421 1.1339 10.0915 0.951972ZM4.2327 6.30081L4.2317 6.2998C4.23206 6.30015 4.23237 6.30049 4.23269 6.30082L4.2327 6.30081Z" fill="white" stroke="white" strokeWidth="0.4"/>
                            </svg>
                          </span>
                        </div>
                      </div>
                      <span>
                        By creating an account, you agree to our 
                        <a href="#0" className="text-primary hover:underline"> Terms and Conditions </a>
                        and 
                        <a href="#0" className="text-primary hover:underline"> Privacy Policy </a>
                      </span>
                    </label>
                  </div>
                  
                  <div className="mb-6">
                    <button
                      type="button"
                      onClick={handleSignup}
                      disabled={loading}
                      className="w-full rounded-xs px-9 py-4 text-base font-medium text-white transition duration-300 ease-in-out shadow-submit dark:shadow-submit-dark bg-primary hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? "Creating Account..." : "Sign up"}
                    </button>
                  </div>
                </form>
                <p className="text-center text-base font-medium text-body-color">
                  Already using Startup?{" "}
                  <Link href="/signin" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 z-[-1]">
          <svg
            width="1440"
            height="969"
            viewBox="0 0 1440 969"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <mask
              id="mask0_95:1005"
              style={{ maskType: "alpha" }}
              maskUnits="userSpaceOnUse"
              x="0"
              y="0"
              width="1440"
              height="969"
            >
              <rect width="1440" height="969" fill="#090E34" />
            </mask>
            <g mask="url(#mask0_95:1005)">
              <path
                opacity="0.1"
                d="M1086.96 297.978L632.959 554.978L935.625 535.926L1086.96 297.978Z"
                fill="url(#paint0_linear_95:1005)"
              />
              <path
                opacity="0.1"
                d="M1324.5 755.5L1450 687V886.5L1324.5 967.5L-10 288L1324.5 755.5Z"
                fill="url(#paint1_linear_95:1005)"
              />
            </g>
            <defs>
              <linearGradient
                id="paint0_linear_95:1005"
                x1="1178.4"
                y1="151.853"
                x2="780.959"
                y2="453.581"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
              <linearGradient
                id="paint1_linear_95:1005"
                x1="160.5"
                y1="220"
                x2="1099.45"
                y2="1192.04"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#4A6CF7" />
                <stop offset="1" stopColor="#4A6CF7" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>
    </>
  );
};

export default SignupPage;