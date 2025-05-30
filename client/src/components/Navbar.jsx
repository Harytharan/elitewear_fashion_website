import React, { useState, useEffect } from "react";
import { Link } from "react-scroll";
import { FaUser, FaShoppingCart } from "react-icons/fa";
import SignIn from "./auth/SignIn";
import SignUp from "./auth/SignUp";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import {
  signOutUserstart,
  signOutUserFailure,
  signOutUserSuccess,
} from "../redux/user/userSlice";
import { NavLink } from "react-router-dom";
import logo from "./../assets/img/logo-removebg-preview.png";

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [cartCount, setCartCount] = useState(0);

  // ✅ Load cart count on mount and keep it updated
  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cart.length);
    };

    updateCartCount();

    // Optional: Poll every 1 second to reflect updates
    const interval = setInterval(updateCartCount, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleSignInClick = () => {
    setShowSignIn(true);
    setShowSignUp(false);
  };

  const handleSignUpClick = () => {
    setShowSignUp(true);
    setShowSignIn(false);
  };

  const handleCloseModal = () => {
    setShowSignIn(false);
    setShowSignUp(false);
  };

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserstart());
      const res = await fetch("/api/auth/signout");
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      localStorage.removeItem("cart");
      setCartCount(0); // Clear the badge
      dispatch(signOutUserSuccess(data));
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  return (
    <header className="fixed w-full z-10">
      <section>
        <div className="flex flex-row justify-between p-5 md:px-32 px-5 bg-PrimaryColor shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
          <div>
            <NavLink to="/" spy={true} smooth={true} duration={500}>
              <h1 className="text-2xl font-semibold text-ExtraDarkColor cursor-pointer">
                <img src={logo} className="w-52" />
              </h1>
            </NavLink>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex flex-row items-center text-lg font-semibold gap-8 text-ExtraDarkColor">
            {["home", "shop", "products", "review"].map((item) => (
              <Link
                key={item}
                to={item}
                spy={true}
                smooth={true}
                duration={500}
                className="hover:text-black transition duration-300 ease-in-out cursor-pointer"
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </Link>
            ))}
          </nav>

          {/* User Profile and Cart */}
          <div className="flex items-center gap-5 relative">
            {currentUser ? (
              <div
                className="relative"
                onMouseEnter={() => setShowDropdown(true)}
                onMouseLeave={() => setShowDropdown(false)}
              >
                <img
                  src={currentUser.avatar}
                  alt="Profile"
                  className="w-8 h-8 rounded-full cursor-pointer"
                />
                <AnimatePresence>
                  {showDropdown && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md z-20"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ul className="py-2">
                        {/* <NavLink to="/profile">
                          <li className="px-4 py-2 hover:bg-SecondaryColor cursor-pointer text-ExtraDarkColor">
                            Profile
                          </li>
                        </NavLink> */}
                        <NavLink to="/my-orders">
                          <li className="px-4 py-2 hover:bg-SecondaryColor cursor-pointer text-ExtraDarkColor">
                            My Orders
                          </li>
                        </NavLink>
                        <li
                          className="px-4 py-2 hover:bg-SecondaryColor cursor-pointer text-ExtraDarkColor"
                          onClick={handleSignOut}
                        >
                          Logout
                        </li>
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <FaUser
                size={25}
                className="text-DarkColor cursor-pointer"
                onClick={handleSignInClick}
              />
            )}

            {/* 🛒 Cart Icon with Badge */}
            <NavLink to="/cart">
              <div className="text-DarkColor relative">
                <FaShoppingCart size={25} className="cursor-pointer" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </div>
            </NavLink>
          </div>
        </div>

        {/* Sign In / Sign Up Modals */}
        {showSignIn && (
          <SignIn onClose={handleCloseModal} onSignUp={handleSignUpClick} />
        )}
        {showSignUp && (
          <SignUp onClose={handleCloseModal} onSignIn={handleSignInClick} />
        )}
      </section>
    </header>
  );
}
