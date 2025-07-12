import React, { useContext, useEffect, useState } from 'react';
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase/firebase";
import { useNavigate } from "react-router-dom";
import API from '../api';
import { UserContext } from '../data/UserContext';
import logosvg from '../assets/svg/logo.svg';
import googlelogo from '../assets/svg/google.svg';
import arrowsvg from '../assets/svg/arrow.svg';
import mailsvg from '../assets/svg/mail.svg';
import organisesvg from '../assets/svg/organise.svg';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setUser(null);
    localStorage.removeItem("autotube-user");
    toast.success("Session cleared. Please login again.", {
      position: "top-center",
      icon: '🔒',
    });
  }, []);

  const handleSignin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill in all fields", {
        position: "top-center",
        icon: '⚠️',
      });
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading("Authenticating...", {
      position: "top-center",
    });

    try {
      const res = await API.post('/user/login', form);
      toast.success(`Welcome back!`, {
        id: loadingToast,
        position: "top-center",
        icon: '👋',
      });

      setUser({
        _id: res.data.user._id,
        name: res.data.user.name,
        email: res.data.user.email,
        createdAt: res.data.user.createdAt,
        updatedAt: res.data.user.updatedAt
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.msg || "Login failed. Please check your credentials.",
        {
          id: loadingToast,
          position: "top-center",
          duration: 4000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    const loadingToast = toast.loading("Connecting with Google...", {
      position: "top-center",
    });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const res = await API.post('/user/firebase-login', {
        name: user.displayName,
        email: user.email
      });

      toast.success(`Welcome, ${user.displayName.split(' ')[0]}!`, {
        id: loadingToast,
        position: "top-center",
        icon: '🎉',
      });

      setUser({
        _id: res.data.user._id,
        name: res.data.user.name,
        email: res.data.user.email,
        createdAt: res.data.user.createdAt,
        updatedAt: res.data.user.updatedAt
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Google login failed:", error);
      toast.error("Google login failed. Please try again.", {
        id: loadingToast,
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  const buttonHover = {
    scale: 1.02,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  const buttonTap = {
    scale: 0.98,
    transition: { type: "spring", stiffness: 400, damping: 10 }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section with Login Form */}
      <div className="w-full bg-gradient-to-br from-gray-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Branding and Features */}
            <div className="space-y-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-4"
              >
                <motion.div
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl p-3 shadow-lg"
                >
                  <img src={logosvg} alt="Logo" className="w-12 h-12" />
                </motion.div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    AutoTube
                  </h1>
                  <p className="text-xl text-neutral-600">
                    Your Learning Tracker
                  </p>
                </div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-gray-900"
              >
                Transform your YouTube watching into structured learning
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-6"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <img src={logosvg} alt="Track" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Track Your Progress</h3>
                    <p className="text-gray-600">
                      Automatically log time spent learning across all videos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <img src={organisesvg} alt="Organize" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Organize Content</h3>
                    <p className="text-gray-600">
                      Create structured learning paths with custom playlists.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <img src={arrowsvg} alt="Retention" className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Measure Retention</h3>
                    <p className="text-gray-600">
                      Get insights with spaced repetition reminders.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Side - Login Form */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md mx-auto"
            >

              <div className="p-8 sm:p-10">
                <motion.div variants={itemVariants}>
                  <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
                  <p className="text-center text-neutral-500 text-lg mb-6">
                    Continue your learning journey
                  </p>
                </motion.div>

                {/* Google Login Button */}
                <motion.button
                  variants={itemVariants}
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="group relative flex items-center justify-center gap-3 w-full h-14 border rounded-xl bg-neutral-50 font-medium text-lg text-neutral-900 hover:bg-gray-100 transition mb-4"
                >
                  <motion.img
                    src={googlelogo}
                    alt="Google"
                    className="w-6 h-6"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 1 }}
                  />
                  <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
                  <motion.img
                    src={arrowsvg}
                    alt="Arrow"
                    className="absolute right-4 opacity-0 group-hover:opacity-100 transition"
                    initial={{ x: -10 }}
                    animate={{ x: 0 }}
                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 0.5 }}
                  />
                </motion.button>

                {/* Divider */}
                <motion.div
                  className="flex items-center my-5"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex-grow h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
                  <span className="mx-3 text-sm font-semibold text-neutral-500">OR</span>
                  <div className="flex-grow h-px bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
                </motion.div>

                {/* Email Input */}
                <motion.div variants={itemVariants} className="mb-5">
                  <label className="block text-lg font-semibold mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <motion.div
                    className="flex items-center border rounded-xl px-4 py-3 gap-2 hover:border-purple-400 focus-within:border-purple-500 transition"
                    whileHover={{ scale: 1.01 }}
                  >
                    <img src={mailsvg} alt="Email" className="w-5 h-5" />
                    <input
                      type="email"
                      id="email"
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="Enter your email"
                      className="w-full bg-transparent outline-none text-lg"
                    />
                  </motion.div>
                </motion.div>

                {/* Password Input */}
                <motion.div variants={itemVariants} className="mb-6">
                  <label className="block text-lg font-semibold mb-2" htmlFor="password">
                    Password
                  </label>
                  <motion.div
                    className="flex items-center border rounded-xl px-4 py-3 hover:border-purple-400 focus-within:border-purple-500 transition"
                    whileHover={{ scale: 1.01 }}
                  >
                    <input
                      type="password"
                      id="password"
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Enter your password"
                      className="w-full bg-transparent outline-none text-lg"
                    />
                  </motion.div>
                </motion.div>

                {/* Sign In Button */}
                <motion.button
                  variants={itemVariants}
                  whileHover={buttonHover}
                  whileTap={buttonTap}
                  onClick={handleSignin}
                  disabled={isLoading}
                  className="relative w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl py-4 text-lg font-semibold hover:opacity-90 transition overflow-hidden"
                >
                  {isLoading ? (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center gap-2"
                    >
                      <motion.span
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="block w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                      />
                      Signing in...
                    </motion.span>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      Sign In
                    </motion.span>
                  )}
                </motion.button>

                {isLoading && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="text-sm text-center mt-4 text-red-500"
                  >
                    If this is taking too long, please refresh and try again.
                  </motion.p>
                )}

                {/* Sign Up Link */}
                <motion.p
                  variants={itemVariants}
                  className="text-center text-neutral-600 mt-6 text-lg"
                >
                  Don't have an account?{' '}
                  <motion.a
                    href="/signup"
                    className="text-blue-600 font-semibold hover:underline"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Sign up
                  </motion.a>
                </motion.p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="w-full bg-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How AutoTube Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Transform your YouTube watching into an effective learning system
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {/* Step 1 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="bg-purple-100 p-5 rounded-full mb-6">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img src={googlelogo} alt="Connect" className="w-10 h-10" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">1. Connect Your Account</h3>
              <p className="text-gray-600">
                Link your YouTube account to automatically track your watched videos.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="bg-blue-100 p-5 rounded-full mb-6">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img src={logosvg} alt="Organize" className="w-10 h-10" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">2. Organize Content</h3>
              <p className="text-gray-600">
                Create learning playlists and categorize videos by topic.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
              className="flex flex-col items-center text-center"
            >
              <div className="bg-indigo-100 p-5 rounded-full mb-6">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img src={arrowsvg} alt="Track" className="w-10 h-10" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">3. Track & Improve</h3>
              <p className="text-gray-600">
                Review your progress and optimize your learning strategy.
              </p>
            </motion.div>
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            viewport={{ once: true }}
            className="mt-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl p-10 text-center"
          >
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Learning?</h3>
            <p className="text-xl text-purple-100 mb-6">
              Get started today with AutoTube
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-purple-600 font-semibold text-lg px-8 py-3 rounded-lg shadow-lg"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              Get Started Now
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;