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
    setOpenIndex(prev => prev === index ? -1 : index);
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
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="container mx-auto ">
          <div className="relative flex items-center justify-between ">
            {/* Logo */}
            <div className="w-auto max-w-full xl:mr-5 ">
              <Link
                href="/"
                className={`header-logo block w-full ${
                  sticky ? "py-3 lg:py-2" : "py-6"
                }`}
                aria-label="Home"
              >
                <Image
                  src="/images/logo/logo.png"
                  alt="Company Logo"
                  width={140}
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

            {/* Navigation */}
            <div className="flex w-full ml-3 items-center justify-between font-semibold">
              <div className="flex-1">
                {/* Mobile menu button */}
                <button
                  onClick={toggleNavbar}
                  id="navbarToggler"
                  aria-label="Toggle Menu"
                  aria-expanded={navbarOpen}
                  className="ring-primary absolute right-4 top-1/2 block -translate-y-1/2 rounded-lg px-3 py-1.5 focus:ring-2 lg:hidden"
                >
                  <span className={`sr-only ${navbarOpen ? 'Close menu' : 'Open menu'}`} />
                  <span
                    className={`relative my-1.5 block h-0.5 w-7 bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? "top-2 rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-7 bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? "opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-7 bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? "-top-2 -rotate-45" : ""
                    }`}
                  />
                </button>

                {/* Navigation menu */}
                <nav
                  id="navbarCollapse"
                  className={`navbar absolute right-0 top-full z-30 w-64 rounded-lg border border-gray-200 bg-white px-6 py-4 shadow-lg transition-all duration-300 dark:border-gray-700 dark:bg-gray-800 lg:static lg:flex lg:w-auto lg:border-none lg:bg-transparent lg:p-0 lg:shadow-none lg:dark:bg-transparent ${
                    navbarOpen
                      ? "visible opacity-100"
                      : "invisible opacity-0 lg:visible lg:opacity-100"
                  }`}
                  aria-label="Main navigation"
                >
                  <ul className="block space-y-4 lg:flex lg:space-x-8 lg:space-y-0" ref={dropdownRef}>
                    {menuData.map((menuItem, index) => (
                      <li key={index} className="group relative">
                        {menuItem.path && !menuItem.submenu ? (
                          menuItem.isbutton ? (
                            <button
                              onClick={() => handleMenuItemClick(menuItem)}
                              className="flex w-full items-center py-2 text-base text-gray-800 hover:text-primary dark:text-gray-300 dark:hover:text-white lg:px-0 lg:py-6"
                            >
                              {menuItem.title}
                            </button>
                          ) : (
                            <Link
                              href={menuItem.path}
                              className={`flex items-center py-2 text-base lg:px-0 lg:py-6 ${
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
                              className="group flex w-full items-center justify-between py-2 text-base text-gray-800 hover:text-primary dark:text-gray-300 dark:hover:text-white lg:px-0 lg:py-6"
                              aria-expanded={openIndex === index}
                              aria-haspopup="true"
                            >
                              {menuItem.title}
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
                            <div
                              className={`submenu absolute left-0 top-full mt-2 w-56 rounded-lg bg-white shadow-lg transition-all duration-300 dark:bg-gray-800 lg:invisible lg:opacity-0 lg:group-hover:visible lg:group-hover:opacity-100 ${
                                openIndex === index ? "block" : "hidden"
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

              {/* Auth buttons */}
              <div className="flex items-center justify-end space-x-4  lg:pr-0">
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
                      className="rounded-md px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white md:text-base"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary/90 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800 md:text-base"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Itinerary Modal */}
      <ItineraryModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};

export default Header;