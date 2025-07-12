import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import API from '../api';
import logosvg from '../assets/svg/logo.svg';
import usersvg from '../assets/svg/user.svg';
import mailsvg from '../assets/svg/mail.svg';

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();

    // Form validation
    if (!form.name || !form.email || !form.password) {
      toast.error('Please fill in all fields', {
        position: 'top-center',
        icon: '⚠️',
      });
      return;
    }

    setIsLoading(true);
    const loadingToast = toast.loading('Creating your account...', {
      position: 'top-center',
    });

    try {
      const res = await API.post('/user/signup', form);
      toast.success(res.data.msg, {
        id: loadingToast,
        position: 'top-center',
        icon: '🎉',
        duration: 4000,
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.msg || 'Signup failed. Please try again.',
        {
          id: loadingToast,
          position: 'top-center',
          duration: 5000,
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, type: 'spring', stiffness: 120 },
    }),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white px-4"
    >
      {/* Header */}
      <motion.div className="flex items-center gap-3 mb-4">
        <motion.div
          whileHover={{ rotate: 5, scale: 1.05 }}
          className="bg-purple-600 rounded-xl p-2 shadow-lg"
        >
          <img src={logosvg} alt="Logo" className="w-10 h-10" />
        </motion.div>
        <div>
          <h1 className="font-extrabold text-3xl text-neutral-800">AutoTube</h1>
          <p className="text-base text-gray-500">Your Learning Tracker</p>
        </div>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center text-base text-gray-600 mb-10 max-w-sm"
      >
        Transform your YouTube watching into structured learning.
      </motion.p>

      {/* Card */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.08,
              delayChildren: 0.2,
            },
          },
        }}
        className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 w-full max-w-md"
      >
        <motion.h1
          variants={fieldVariants}
          custom={0}
          className="text-2xl font-bold text-center text-neutral-800 mb-2"
        >
          Create Account
        </motion.h1>
        <motion.p
          variants={fieldVariants}
          custom={1}
          className="text-center text-sm text-gray-500 mb-6"
        >
          Start your learning journey
        </motion.p>

        {/* Name Field */}
        <motion.div variants={fieldVariants} custom={2} className="mb-4">
          <label className="block text-sm font-semibold text-neutral-700 mb-1" htmlFor="name">
            Full Name
          </label>
          <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 gap-2 transition hover:border-purple-400 focus-within:border-purple-500">
            <img src={usersvg} alt="Name" className="w-4 h-4" />
            <input
              type="text"
              id="name"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Enter your name"
              className="w-full bg-transparent outline-none text-neutral-800 placeholder:text-gray-400 text-base"
            />
          </div>
        </motion.div>

        {/* Email Field */}
        <motion.div variants={fieldVariants} custom={3} className="mb-4">
          <label className="block text-sm font-semibold text-neutral-700 mb-1" htmlFor="email">
            Email Address
          </label>
          <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 gap-2 transition hover:border-purple-400 focus-within:border-purple-500">
            <img src={mailsvg} alt="Email" className="w-4 h-4" />
            <input
              type="email"
              id="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Enter your email"
              className="w-full bg-transparent outline-none text-neutral-800 placeholder:text-gray-400 text-base"
            />
          </div>
        </motion.div>

        {/* Password Field */}
        <motion.div variants={fieldVariants} custom={4} className="mb-6">
          <label className="block text-sm font-semibold text-neutral-700 mb-1" htmlFor="password">
            Password
          </label>
          <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 transition hover:border-purple-400 focus-within:border-purple-500">
            <input
              type="password"
              id="password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              className="w-full bg-transparent outline-none text-neutral-800 placeholder:text-gray-400 text-base"
            />
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.button
          variants={fieldVariants}
          custom={5}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={handleSignup}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl py-3 font-semibold transition hover:opacity-90 relative overflow-hidden"
        >
          {isLoading ? (
            <motion.span
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                className="block w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Creating Account...
            </motion.span>
          ) : (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              Create Account
            </motion.span>
          )}
        </motion.button>
        {isLoading && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }} // show after 2 seconds
            className="text-sm text-center mt-4 text-red-500"
          >
            If this is taking too long, please refresh and try again.
          </motion.p>
        )}
        {/* Login Link */}
        <motion.p
          variants={fieldVariants}
          custom={6}
          className="text-sm text-center text-gray-600 mt-5"
        >
          Already have an account?{' '}
          <a
            href="/"
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign in
          </a>
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default Signup;