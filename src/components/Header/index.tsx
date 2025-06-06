"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { onAuthStateChanged, signOut, getAuth } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/app/lib/firebase";
import menuData from "./menuData";
import ItineraryModal from "../ItineraryModal";

const Header = () => {
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLUListElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // State management
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [openIndex, setOpenIndex] = useState(-1);
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("Account");
  const [modalOpen, setModalOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Fetch user data from Firebase
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const usersQuery = query(
            collection(db, "users"),
            where("uid", "==", currentUser.uid)
          );
          const querySnapshot = await getDocs(usersQuery);
          if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data();
            setUserName(data.name || currentUser.displayName || "Account");
          } else {
            setUserName(currentUser.displayName || "Account");
          }
        } catch (error) {
          console.error("Error fetching user:", error);
          setUserName("Account");
        }
      } else {
        setUserName("Account");
      }
    });
    return () => unsubscribe();
  }, []);

  // Memoized handlers
  const toggleNavbar = useCallback(() => {
    setNavbarOpen(prev => !prev);
    if (!navbarOpen) {
      setProfileDropdownOpen(false);
    }
  }, [navbarOpen]);

  const toggleProfileDropdown = useCallback(() => {
    setProfileDropdownOpen(prev => !prev);
    if (!profileDropdownOpen) {
      setNavbarOpen(false);
    }
  }, [profileDropdownOpen]);

  const handleSubmenu = useCallback((index: number) => {
    setOpenIndex(prev => prev === index ? -1 : index);
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      console.log("✅ Signed out successfully");
      setProfileDropdownOpen(false);
    } catch (error) {
      console.error("❌ Sign out error:", error);
    }
  }, []);

  const handleMenuItemClick = useCallback((item: any) => {
    if (item.onClick === 'openItineraryModal') {
      setModalOpen(true);
    }
    setNavbarOpen(false);
  }, []);

  // Scroll effect with debounce
  useEffect(() => {
    let scrollTimer: NodeJS.Timeout;
    
    const handleScroll = () => {
      setIsScrolling(true);
      setSticky(window.scrollY >= 80);
      
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        setIsScrolling(false);
      }, 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimer);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenIndex(-1);
      }
      if (mobileMenuRef.current && navbarOpen && !mobileMenuRef.current.contains(event.target as Node)) {
        setNavbarOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navbarOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setNavbarOpen(false);
    setOpenIndex(-1);
  }, [pathname]);

  return (
    <>
      <header
        ref={headerRef}
        className={`header top-0 left-0 z-40 flex w-full items-center justify-center ${
          sticky
            ? `fixed z-9999 bg-white/80 backdrop-blur-xs transition-all duration-300 ${
                isScrolling ? 'shadow-sm' : 'shadow-sticky'
              } dark:bg-gray-dark dark:shadow-sticky-dark`
            : 'absolute bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="relative flex items-center justify-between py-3">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="w-auto max-w-full">
                <Link
                  href="/"
                  className={`header-logo block w-full ${
                    sticky ? "py-2 lg:py-1" : "py-4"
                  }`}
                  aria-label="Home"
                >
                  <Image
                    src="/images/logo/logo.png"
                    alt="Company Logo"
                    width={135}
                    height={40}
                    priority
                    className="dark:hidden"
                  />
                  <Image
                    src="/images/logo/logo-dark.png"
                    alt="Company Logo"
                    width={150}
                    height={40}
                    className="hidden dark:block"
                  />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden xl:flex xl:items-center">
                <nav className="flex">
                  <ul className="flex space-x-6" ref={dropdownRef}>
                    {menuData.map((menuItem, index) => (
                      <li key={index} className="group relative">
                        {menuItem.path && !menuItem.submenu ? (
                          menuItem.isbutton ? (
                            <button
                              onClick={() => handleMenuItemClick(menuItem)}
                              className="flex items-center py-6 text-base text-gray-800 hover:text-primary dark:text-gray-300 dark:hover:text-white px-0"
                            >
                              {menuItem.title}
                            </button>
                          ) : (
                            <Link
                              href={menuItem.path}
                              className={`flex items-center py-6 text-base px-0 ${
                                pathname === menuItem.path
                                  ? "text-primary dark:text-white"
                                  : "text-gray-800 hover:text-primary dark:text-gray-300 dark:hover:text-white"
                              }`}
                              aria-current={pathname === menuItem.path ? "page" : undefined}
                            >
                              {menuItem.title}
                            </Link>
                          )
                        ) : menuItem.submenu ? (
                          <>
                            <button
                              onClick={() => handleSubmenu(index)}
                              className="group flex items-center justify-between py-6 text-base text-gray-800 hover:text-primary dark:text-gray-300 dark:hover:text-white px-0"
                              aria-expanded={openIndex === index}
                              aria-haspopup="true"
                            >
                              {menuItem.title}
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                className={`ml-1 transform transition-transform ${
                                  openIndex === index ? "rotate-180" : ""
                                }`}
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M4.293 5.293a1 1 0 011.414 0L8 7.586l2.293-2.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                                />
                              </svg>
                            </button>
                            <div
                              className={`absolute left-0 top-full mt-2 w-56 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 transition-all duration-200 dark:bg-gray-800 ${
                                openIndex === index ? "scale-100 opacity-100" : "scale-95 opacity-0 invisible"
                              }`}
                              role="menu"
                            >
                              {menuItem.submenu.map((submenuItem, subIndex) => (
                                <Link
                                  href={submenuItem.path}
                                  key={subIndex}
                                  className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                                  role="menuitem"
                                >
                                  {submenuItem.title}
                                </Link>
                              ))}
                            </div>
                          </>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>

            {/* Desktop Auth buttons */}
            <div className="hidden xl:flex items-center space-x-4">
              {user ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center space-x-1 rounded-md px-4 py-2 text-base font-medium text-gray-800 hover:text-primary dark:text-gray-300 dark:hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0Z" />
                    </svg>
                    <span>{userName}</span>
                  </button>
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800">
                      <Link
                        href="/profile"
                        className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/mybooking"
                        className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        My Bookings
                      </Link>
                      <Link
                        href="/helpdesk"
                        className="block px-4 py-2.5 text-sm text-gray-800 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Help Desk
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full px-4 py-2.5 text-left text-sm text-gray-800 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="rounded-md px-4 py-2 text-base font-medium text-gray-800 transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md bg-primary px-4 py-2 text-base font-medium text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu buttons - visible below xl breakpoint (1280px) */}
            <div className="flex xl:hidden">
              {/* Profile dropdown button for mobile */}
              {user && (
                <div className="relative mr-3" ref={profileDropdownRef}>
                  <button
                    onClick={toggleProfileDropdown}
                    className="flex items-center justify-center rounded-full p-2 text-gray-800 focus:outline-none dark:text-gray-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0Z" />
                    </svg>
                  </button>
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800">
                      <Link
                        href="/profile"
                        className="block px-4 py-2.5 text-sm text-gray-800 dark:text-gray-300"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        href="/mybooking"
                        className="block px-4 py-2.5 text-sm text-gray-800 dark:text-gray-300"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        My Bookings
                      </Link>
                      <Link
                        href="/helpdesk"
                        className="block px-4 py-2.5 text-sm text-gray-800 dark:text-gray-300"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        Help Desk
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full px-4 py-2.5 text-left text-sm text-gray-800 dark:text-gray-300"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Main menu button */}
              <button
                onClick={toggleNavbar}
                id="navbarToggler"
                aria-label="Toggle Menu"
                aria-expanded={navbarOpen}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-800 focus:outline-none dark:text-gray-300"
              >
                <span className="sr-only">Menu</span>
                <svg
                  className={`h-6 w-6 transition-transform ${navbarOpen ? 'rotate-90' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation - visible below xl breakpoint (1280px) */}
        <div
          ref={mobileMenuRef}
          className={`xl:hidden fixed right-0 z-40 bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out transform ${
            navbarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{
            top: sticky ? '64px' : '80px',
            height: 'auto',
            maxHeight: 'calc(100vh - 80px)',
            width: '200px',
            borderLeft: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '-2px 0 10px rgba(0,0,0,0.1)'
          }}
        >
          <div className="h-full overflow-y-auto px-3 py-3">
            <nav className="flex flex-col space-y-2">
              <ul className="space-y-2">
                {menuData.map((menuItem, index) => (
                  <li 
                    key={index} 
                    className="border-b border-gray-200 dark:border-gray-700 pb-1"
                    onMouseEnter={() => menuItem.submenu && setOpenIndex(index)}
                    onMouseLeave={() => menuItem.submenu && setOpenIndex(-1)}
                  >
                    {menuItem.path && !menuItem.submenu ? (
                      menuItem.isbutton ? (
                        <button
                          onClick={() => handleMenuItemClick(menuItem)}
                          className="w-full text-left py-2 text-sm font-medium text-gray-800 dark:text-gray-300"
                        >
                          {menuItem.title}
                        </button>
                      ) : (
                        <Link
                          href={menuItem.path}
                          className={`block py-2 text-sm font-medium ${
                            pathname === menuItem.path
                              ? "text-primary dark:text-white"
                              : "text-gray-800 dark:text-gray-300"
                          }`}
                          aria-current={pathname === menuItem.path ? "page" : undefined}
                        >
                          {menuItem.title}
                        </Link>
                      )
                    ) : menuItem.submenu ? (
                      <div className="relative">
                        <button
                          onClick={() => handleSubmenu(index)}
                          className="flex w-full items-center justify-between py-2 text-sm font-medium text-gray-800 dark:text-gray-300"
                          aria-expanded={openIndex === index}
                        >
                          <span>{menuItem.title}</span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 20 20"
                            className={`ml-1 transform transition-transform ${
                              openIndex === index ? "rotate-180" : ""
                            }`}
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                            />
                          </svg>
                        </button>
                        {openIndex === index && (
                          <div className="pl-3 space-y-1 mt-1">
                            {menuItem.submenu.map((submenuItem, subIndex) => (
                              <Link
                                href={submenuItem.path}
                                key={subIndex}
                                className="block py-1 text-xs text-gray-800 dark:text-gray-300"
                                onClick={() => {
                                  setNavbarOpen(false);
                                  setOpenIndex(-1);
                                }}
                              >
                                {submenuItem.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </header>

      {/* Itinerary Modal */}
      <ItineraryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
 
export default Header;