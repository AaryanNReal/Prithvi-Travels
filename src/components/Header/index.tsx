"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef, useCallback } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import menuData from "./menuData";
import SignOutDropdown from "./signout";
import ItineraryModal from "../ItineraryModal";

const Header = () => {
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLUListElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // State management
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [openIndex, setOpenIndex] = useState(-1);
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  // Memoized handlers
  const toggleNavbar = useCallback(() => {
    setNavbarOpen(prev => !prev);
  }, []);

  const handleSubmenu = useCallback((index: number) => {
    if (window.innerWidth < 1024) {
      // For mobile, toggle the submenu
      setOpenIndex(prev => prev === index ? -1 : index);
    } else {
      // For desktop, hover behavior remains
      setOpenIndex(index);
    }
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut(auth);
      console.log("✅ Signed out successfully");
    } catch (error) {
      console.error("❌ Sign out error:", error);
    }
  }, []);

  const handleMenuItemClick = useCallback((item: any) => {
    if (item.onClick === 'openItineraryModal') {
      setModalOpen(true);
    }
    if (navbarOpen) {
      setNavbarOpen(false);
    }
  }, [navbarOpen]);

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

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenIndex(-1);
      }
      if (mobileMenuRef.current && navbarOpen && !mobileMenuRef.current.contains(event.target as Node)) {
        setNavbarOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [navbarOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setNavbarOpen(false);
  }, [pathname]);

  // Add/remove body overflow when mobile menu is open
  useEffect(() => {
    if (navbarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [navbarOpen]);

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
            {/* Logo */}
            <div className="w-auto max-w-full xl:mr-5">
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
                  width={165}
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
            <div className="hidden lg:flex lg:justify-center lg:space-x-6 xl:space-x-8">
              <nav className="flex space-x-6 xl:space-x-8">
                <ul className="flex space-x-6 xl:space-x-8" ref={dropdownRef}>
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
                            onMouseEnter={() => handleSubmenu(index)}
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

              {/* Desktop Auth buttons */}
              <div className="ml-4 flex items-center space-x-4">
                {user ? (
                  <SignOutDropdown
                    items={[
                      { label: "Profile", href: "/profile" },
                      { label: "My Bookings", href: "/mybooking" },
                      { label: "Help Desk", href: "/helpdesk" },
                      { label: "Sign Out", onClick: handleSignOut },
                    ]}
                  />
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
            </div>

            {/* Mobile menu button */}
            <div className="flex lg:hidden">
              <button
                onClick={toggleNavbar}
                id="navbarToggler"
                aria-label="Toggle Menu"
                aria-expanded={navbarOpen}
                className="inline-flex items-center justify-center rounded-md p-2 text-gray-800 hover:bg-gray-100 hover:text-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
              >
                <span className="sr-only">{navbarOpen ? 'Close menu' : 'Open menu'}</span>
                {navbarOpen ? (
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          ref={mobileMenuRef}
          className={`lg:hidden fixed inset-0 z-50 bg-white dark:bg-gray-800 transition-all duration-300 ease-in-out transform ${
            navbarOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ top: sticky ? '64px' : '80px', height: 'calc(100vh - 80px)' }}
        >
          <div className="h-full overflow-y-auto px-6 py-4">
            <nav className="flex flex-col space-y-4">
              <ul className="space-y-4">
                {menuData.map((menuItem, index) => (
                  <li key={index} className="border-b border-gray-200 dark:border-gray-700 pb-2">
                    {menuItem.path && !menuItem.submenu ? (
                      menuItem.isbutton ? (
                        <button
                          onClick={() => handleMenuItemClick(menuItem)}
                          className="w-full text-left py-3 text-base font-medium text-gray-800 hover:text-primary dark:text-gray-300 dark:hover:text-white"
                        >
                          {menuItem.title}
                        </button>
                      ) : (
                        <Link
                          href={menuItem.path}
                          className={`block py-3 text-base font-medium ${
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
                      <div className="space-y-2">
                        <button
                          onClick={() => handleSubmenu(index)}
                          className="flex w-full items-center justify-between py-3 text-base font-medium text-gray-800 hover:text-primary dark:text-gray-300 dark:hover:text-white"
                          aria-expanded={openIndex === index}
                        >
                          <span>{menuItem.title}</span>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            className={`ml-2 transform transition-transform ${
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
                          <div className="pl-4 space-y-2 mt-2">
                            {menuItem.submenu.map((submenuItem, subIndex) => (
                              <Link
                                href={submenuItem.path}
                                key={subIndex}
                                className="block py-2 text-sm text-gray-800 hover:text-primary dark:text-gray-300 dark:hover:text-white"
                                onClick={() => setNavbarOpen(false)}
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

              {/* Mobile Auth buttons */}
              <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                {user ? (
                  <div className="space-y-4">
                    <Link
                      href="/profile"
                      className="block w-full rounded-md px-4 py-2.5 text-center text-base font-medium text-gray-800 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      onClick={() => setNavbarOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      href="/mybooking"
                      className="block w-full rounded-md px-4 py-2.5 text-center text-base font-medium text-gray-800 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      onClick={() => setNavbarOpen(false)}
                    >
                      My Bookings
                    </Link>
                    <Link
                      href="/helpdesk"
                      className="block w-full rounded-md px-4 py-2.5 text-center text-base font-medium text-gray-800 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      onClick={() => setNavbarOpen(false)}
                    >
                      Help Desk
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setNavbarOpen(false);
                      }}
                      className="block w-full rounded-md px-4 py-2.5 text-center text-base font-medium text-gray-800 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3">
                    <Link
                      href="/signin"
                      className="rounded-md px-4 py-2.5 text-center text-base font-medium text-gray-800 hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                      onClick={() => setNavbarOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-md bg-primary px-4 py-2.5 text-center text-base font-medium text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md"
                      onClick={() => setNavbarOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
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