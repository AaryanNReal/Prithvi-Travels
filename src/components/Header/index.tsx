"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/app/lib/firebase";
import menuData from "./menuData";
import SignOutDropdown from "./signout";
import ItineraryModal from "../ItineraryModal"; // Make sure this component exists

const Header = () => {
  const pathname = usePathname();
  const dropdownRef = useRef(null);

  // State management
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [openIndex, setOpenIndex] = useState(-1);
  const [user, setUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Toggle mobile navbar
  const toggleNavbar = () => {
    setNavbarOpen(!navbarOpen);
  };

  // Handle sticky navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY >= 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle submenu toggle
  const handleSubmenu = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("✅ Signed out successfully");
    } catch (error) {
      console.error("❌ Sign out error:", error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle menu item clicks
  const handleMenuItemClick = (item) => {
    if (item.onClick === 'openItineraryModal') {
      setModalOpen(true);
    }
    if (navbarOpen) {
      setNavbarOpen(false); // Close mobile menu on click
    }
  };

  return (
    <>
      <header
        className={`header top-0 left-0 z-40 flex w-full items-center justify-center ${
          sticky
            ? "dark:bg-gray-dark dark:shadow-sticky-dark shadow-sticky fixed z-9999 bg-white/80 backdrop-blur-xs transition"
            : "absolute bg-transparent"
        }`}
      >
        <div className="container ">
          <div className="relative  flex items-center justify-between">
            <div className="w- max-w-full px-3 xl:mr-10">
              <Link
                href="/"
                className={`header-logo block w-full ${
                  sticky ? "py-3 lg:py-2" : "py-6"
                } `}
              >
                <Image
                  src="/images/logo/logo.png"
                  alt="logo"
                  width={150}
                  height={100}
                  className="dark:hidden"
                />
                <Image
                  src="/images/logo/logo.png"
                  alt="logo"
                  width={100}
                  height={10}
                  className="hidden dark:block"
                />
              </Link>
            </div>
            <div className="flex w-full font-semibold items-center justify-between px-1">
              <div>
                <button
                  onClick={toggleNavbar}
                  id="navbarToggler"
                  aria-label="Mobile Menu"
                  className="ring-primary absolute top-1/2 right-4 block translate-y-[-50%] rounded-lg px-3 py-[6px] focus:ring-2 lg:hidden"
                >
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? "top-[7px] rotate-45" : ""
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? "opacity-0" : ""
                    }`}
                  />
                  <span
                    className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${
                      navbarOpen ? "top-[-8px] -rotate-45" : ""
                    }`}
                  />
                </button>
                <nav
                  id="navbarCollapse"
                  className={`navbar border-body-color/50 dark:border-body-color/20 dark:bg-dark absolute right-0 z-30 w-[250px] rounded border-[.5px] bg-white px-6 py-4 duration-300 lg:visible lg:static lg:w-auto lg:border-none lg:!bg-transparent lg:p-0 lg:opacity-100 ${
                    navbarOpen
                      ? "visibility top-full opacity-100"
                      : "invisible top-[120%] opacity-0"
                  }`}
                >
                  <ul className="block lg:flex lg:space-x-11" ref={dropdownRef}>
                    {menuData.map((menuItem, index) => (
                      <li key={index} className="group relative">
                        {menuItem.path && !menuItem.submenu ? (
                          menuItem.isbutton ? (
                            <button
                              onClick={() => handleMenuItemClick(menuItem)}
                              className="flex py-2 text-base lg:mr-0 lg:inline-flex lg:px-0 lg:py-6  text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                            >
                              {menuItem.title}
                            </button>
                          ) : (
                            <Link
                              href={menuItem.path}
                              className={`flex py-2 text-base lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 ${
                                pathname === menuItem.path
                                  ? "text-dark hover:text-primary"
                                  : "text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                              }`}
                            >
                              {menuItem.title}
                            </Link>
                          )
                        ) : menuItem.submenu ? (
                          <>
                            <p
                              onClick={() => handleSubmenu(index)}
                              className="text-dark group-hover:text-primary flex cursor-pointer items-center justify-between py-2 text-base lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 dark:text-white/70 dark:group-hover:text-white"
                            >
                              {menuItem.title}
                              <span className="pl-3">
                                <svg width="25" height="24" viewBox="0 0 25 24">
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                    fill="currentColor"
                                  />
                                </svg>
                              </span>
                            </p>
                            <div
                              className={`submenu dark:bg-dark relative top-full left-0 rounded-sm bg-white transition-[top] duration-300 group-hover:opacity-100 lg:invisible lg:absolute lg:top-[110%] lg:block lg:w-[250px] lg:p-4 lg:opacity-0 lg:shadow-lg lg:group-hover:visible lg:group-hover:top-full ${
                                openIndex === index ? "block" : "hidden"
                              }`}
                            >
                              {menuItem.submenu.map((submenuItem, index) => (
                                <Link
                                  href={submenuItem.path}
                                  key={index}
                                  className="text-dark hover:text-primary block rounded-sm py-2.5 text-sm lg:px-3 dark:text-white/70 dark:hover:text-white"
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
              <div className="flex items-center justify-end pr-16 lg:pr-0">
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
                      className="text-dark text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2 lg:px-8 lg:py-3 mr-2 font-medium hover:opacity-70 dark:text-white block md:inline-block"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="text-sm md:text-base px-3 py-1.5 md:px-4 md:py-2 lg:px-8 lg:py-3 font-medium transition duration-300 block md:inline-block md:bg-primary md:hover:bg-primary/90 md:rounded-xs md:shadow-btn md:hover:shadow-btn-hover md:text-white text-primary hover:opacity-70"
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