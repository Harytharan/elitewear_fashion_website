import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { signInstart, signInSuccess, signInFailure } from "../../redux/user/userSlice";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { FaEnvelope, FaLock, FaTimes } from "react-icons/fa";
import OAuth from "./OAuth";
//sign page 
export default function SignIn({ onClose, onSignUp }) {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const { loading } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const validateForm = () => {
    let isValid = true;
    let newErrors = { email: "", password: "" };

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }
    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignInChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
    setErrors({ ...errors, [e.target.id]: "" });
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      dispatch(signInstart());
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email.toLowerCase(),
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        dispatch(signInFailure(data.message));
        Swal.fire({ icon: "error", title: "Oops...", text: data.message });
        return;
      }

      dispatch(signInSuccess(data));
      onClose();
      navigate(data.ismanager ? "/manager" : "/");
      Swal.fire({ position: "top-end", icon: "success", title: "Login successful", showConfirmButton: false, timer: 1500 });
    } catch (error) {
      dispatch(signInFailure(error.message));
      Swal.fire({ icon: "error", title: "Oops...", text: error.message });
    }
  };

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md relative" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
          <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-700" onClick={onClose}><FaTimes size={24} /></button>
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div className="relative">
              <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
              <input type="email" id="email" placeholder="Email" className="w-full pl-10 pr-4 py-2 border rounded-md" onChange={handleSignInChange} required />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>
            <div className="relative">
              <FaLock className="absolute top-3 left-3 text-gray-400" />
              <input type="password" id="password" placeholder="Password" className="w-full pl-10 pr-4 py-2 border rounded-md" onChange={handleSignInChange} required />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>
            <button className="w-full py-2 bg-DarkColor text-white rounded-md shadow-md hover:bg-ExtraDarkColor disabled:opacity-50" disabled={loading}>
              {loading ? "Loading..." : "Sign In"}
            </button>
          </form>
          <div className="mt-4 text-center">or login with</div>
          <OAuth />
          <p className="mt-6 text-sm text-center">Don't have an account? <span className="text-DarkColor cursor-pointer hover:underline" onClick={onSignUp}>Sign Up</span></p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
