import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

const DropdownMenu: React.FC<{ items: { label: string; href?: string; onClick?: () => void }[] }> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState("Account");
  const [loading, setLoading] = useState(true);
  let closeTimeout: NodeJS.Timeout;

  // Fetch user data from Firebase by comparing current uid to uid in users collection
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const usersQuery = query(
            collection(db, "users"),
            where("uid", "==", user.uid)
          );
          const querySnapshot = await getDocs(usersQuery);
          if (!querySnapshot.empty) {
            // Use the name found in the matching document (or fallback to user.displayName)
            const data = querySnapshot.docs[0].data();
            setUserName(data.name || user.displayName || "Account");
          } else {
            setUserName(user.displayName || "Account");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          setUserName("Account");
        }
      } else {
        setUserName("Account");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Auto-close dropdown after delay
  const startCloseTimer = () => {
    if (closeTimeout) clearTimeout(closeTimeout);
    closeTimeout = setTimeout(() => setIsOpen(false), 200);
  };

  const stopCloseTimer = () => {
    if (closeTimeout) clearTimeout(closeTimeout);
  };

  const handleMouseEnter = () => {
    setIsOpen(true);
    stopCloseTimer();
  };

  const handleMouseLeave = () => {
    startCloseTimer();
  };

  if (loading) {
    return (
      <div className="relative inline-block text-left">
        <button className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300">
          Loading...
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative inline-block text-left"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button className="flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-700">
        <div className="flex items-center">
          {/* Original User Icon */}
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0Z" />
          </svg>
          <span>{userName}</span>
          <svg
            className={`ml-2 h-5 w-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>
      {isOpen && (
        <div
          className="absolute mt-2 w-52 origin-top-right rounded-md bg-white shadow-lg ring-opacity-5 focus:outline-none z-10 transition-all duration-150 ease-out"
          onMouseEnter={stopCloseTimer}
          onMouseLeave={startCloseTimer}
        >
          <div className="py-1">
            {items.map((item, index) => (
              <a
                key={index}
                href={item.href || "#"}
                onClick={(e) => {
                  if (item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  }
                  setIsOpen(false);
                }}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;