import React, { useContext, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser, UserContext } from '../data/UserContext';
import { useSettings } from '../data/SettingsContext';
import API from '../api';
import Navbar from '../components/Navbar';
import usersvg from '../assets/svg/user.svg';
import malesvg from '../assets/svg/man.svg';
import passwordsvg from '../assets/svg/password.svg';
import deletesvg from '../assets/svg/delete.svg';
import booksvg from '../assets/svg/closedbook.svg';
import dangersvg from '../assets/svg/danger.svg';
import femalesvg from '../assets/svg/woman.svg';
import shieldsvg from '../assets/svg/shield.svg';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useUser();
  const { summaryLength, setSummaryLength, quickQuizEnabled, setQuickQuizEnabled } = useSettings();
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);
  const [changePassword, setChangePassword] = useState(false);
  const [clearData, setClearData] = useState(false);
  const [deleteAccount, setDeleteAccount] = useState(false);
  const [lastUpdatedPass, setLastUpdatedPass] = useState('');
  const [memberSince, setMemberSince] = useState('');
  const [oldPass, setOldPass] = useState('');
  const [deleteEmail, setDeleteEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [gender, setGender] = useState("Male");

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    }
  };

  const cardHover = {
    y: -3,
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
  };

  useEffect(() => {
    if (!user || !user.name) {
      navigate("/");
      toast.error('Please login to access settings', {
        position: 'top-center',
        icon: '🔒',
      });
      return;
    }

    if (user.createdAt) {
      setMemberSince(new Date(user.createdAt).toLocaleDateString());
    }

    if (user.updatedAt) {
      setLastUpdatedPass(new Date(user.updatedAt).toLocaleDateString());
    }
  }, [user]);

  const handleGenderChange = (e) => {
    setGender(e.target.value);
    toast.success('Gender preference updated', {
      position: 'top-center',
      icon: '👤',
      duration: 2000,
    });
  };

  const handleChangePass = async () => {
    if (!oldPass || !newPass) {
      toast.error('Please fill both password fields', {
        position: 'top-center',
        icon: '⚠️',
      });
      return;
    }

    const loadingToast = toast.loading('Updating password...', {
      position: 'top-center',
    });

    try {
      const res = await API.put(`user/${user._id}/change-pass`, {
        oldPassword: oldPass,
        newPassword: newPass,
      });

      if (res.data.success) {
        toast.success('Password changed successfully!', {
          id: loadingToast,
          position: 'top-center',
          icon: '🔑',
          duration: 3000,
        });
        setLastUpdatedPass(new Date(res.data.updateDate).toLocaleDateString());
        setMemberSince(new Date(res.data.createDate).toLocaleDateString());
        setChangePassword(false);
        setOldPass('');
        setNewPass('');
      } else {
        toast.error(res.data.message || "Failed to change password", {
          id: loadingToast,
          position: 'top-center',
          icon: '❌',
        });
      }
    } catch (error) {
      console.error("Failed to change password", error);
      toast.error('Failed to change password. Please try again.', {
        id: loadingToast,
        position: 'top-center',
        icon: '⚠️',
      });
    }
  };

  const handleClear = async () => {
    const loadingToast = toast.loading('Clearing your data...', {
      position: 'top-center',
    });

    try {
      const res = await API.delete(`user/${user._id}/clear`);
      const updatedUser = { ...user, history: [] };
      setUser(updatedUser);
      setClearData(false);
      
      toast.success('All learning data cleared!', {
        id: loadingToast,
        position: 'top-center',
        icon: '🗑️',
        duration: 3000,
      });
    } catch (error) {
      console.error("Failed to clear data:", error);
      toast.error('Failed to clear data. Please try again.', {
        id: loadingToast,
        position: 'top-center',
        icon: '⚠️',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteEmail !== user.email) {
      toast.error('Email does not match', {
        position: 'top-center',
        icon: '✖️',
      });
      return;
    }

    const loadingToast = toast.loading('Deleting your account...', {
      position: 'top-center',
    });

    try {
      const res = await API.delete(`user/${user._id}/delete`);

      if (res.data.success) {
        toast.success('Account deleted successfully', {
          id: loadingToast,
          position: 'top-center',
          icon: '👋',
          duration: 3000,
        });
        setUser(null);
        localStorage.clear();
        setDeleteAccount(false);
        navigate('/');
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error('Failed to delete account. Please try again.', {
        id: loadingToast,
        position: 'top-center',
        icon: '⚠️',
      });
    }
  };

  return (
    <>
      <Navbar item={"Settings"} />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='bg-[#f4f9ff] min-h-screen flex flex-col items-center w-full pb-10 sm:pb-20 px-4 sm:px-6'
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center pt-6 sm:pt-10 w-full'
        >
          <h1 className='bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent text-2xl sm:text-3xl md:text-4xl lg:text-[3.1rem] pb-2 sm:pb-4 leading-snug font-bold'>
            Settings
          </h1>
          <p className='text-center text-sm sm:text-base text-neutral-800 max-w-lg mx-auto'>
            Customize your AutoTube experience and manage your account
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className='w-full max-w-4xl space-y-4 sm:space-y-6 mt-6 sm:mt-10'
        >
          {/* Profile Card */}
          <motion.div
            variants={item}
            whileHover={cardHover}
            className='bg-white p-4 sm:p-6 md:p-7 rounded-xl shadow-md'
          >
            <div className='flex gap-2 items-center'>
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                className='rounded-xl bg-blue-100 p-2'
              >
                <img src={usersvg} alt="" className='w-5 h-5 sm:w-6 sm:h-6' />
              </motion.div>
              <h1 className='font-semibold text-lg sm:text-xl'>Profile Information</h1>
            </div>

            <div className='my-4 sm:my-6 text-center flex flex-col items-center'>
              <div className='flex gap-3 sm:gap-4 items-center'>
                <motion.img
                  src={gender === "Male" ? malesvg : femalesvg}
                  alt=""
                  className='w-8 h-8 sm:w-10 sm:h-10'
                  whileHover={{ scale: 1.1 }}
                />
                <div>
                  <h1 className='font-bold text-lg sm:text-xl'>{user.name}</h1>
                  <p className='text-sm sm:text-base'>Member since <span>{memberSince}</span></p>
                </div>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
              <div className="mb-3 sm:mb-4">
                <label className="block text-sm sm:text-base font-semibold mb-1" htmlFor="name">Full Name*</label>
                <div className="flex items-center border rounded-xl px-3 py-2 w-full">
                  <input
                    type="name"
                    id="name"
                    required
                    placeholder="Enter your full name"
                    onChange={(e) => {
                      setUser({ ...user, name: e.target.value });
                    }}
                    defaultValue={user.name}
                    className="w-full bg-transparent outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="mb-3 sm:mb-5">
                <label className="block text-sm sm:text-base font-semibold mb-1" htmlFor="email">Email*</label>
                <div className="flex items-center border rounded-xl px-3 py-2 w-full">
                  <input
                    type="email"
                    required
                    id="email"
                    placeholder="Enter your email"
                    onChange={(e) => {
                      setUser({ ...user, email: e.target.value });
                    }}
                    defaultValue={user.email}
                    className="w-full bg-transparent outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="mb-3 sm:mb-4">
                <label className="block text-sm sm:text-base font-semibold mb-1" htmlFor="location">Location</label>
                <div className="flex items-center border rounded-xl px-3 py-2 w-full">
                  <input
                    type="text"
                    id="location"
                    placeholder="City, Country"
                    className="w-full bg-transparent outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="mb-3 sm:mb-5">
                <label className="block text-sm sm:text-base font-semibold mb-1" htmlFor="gender">Gender</label>
                <select
                  className='flex items-center border rounded-xl px-3 py-2 w-full text-sm sm:text-base'
                  value={gender}
                  onChange={handleGenderChange}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Preferences Card */}
          <motion.div
            variants={item}
            whileHover={cardHover}
            className='bg-white p-4 sm:p-6 md:p-7 rounded-xl shadow-md'
          >
            <div className='flex gap-2 items-center'>
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                className='rounded-xl bg-purple-100 p-2'
              >
                <img src={booksvg} alt="" className='w-5 h-5 sm:w-6 sm:h-6' />
              </motion.div>
              <h1 className='font-semibold text-lg sm:text-xl'>Learning Preferences</h1>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
              <div className="mb-3 sm:mb-5">
                <label className="block text-sm sm:text-base font-semibold mb-1" htmlFor="summarylength">Summary Length</label>
                <select
                  value={summaryLength}
                  onChange={(e) => {
                    setSummaryLength(e.target.value);
                    toast.success('Summary length preference saved', {
                      position: 'top-center',
                      icon: '📝',
                      duration: 2000,
                    });
                  }}
                  className='flex items-center border rounded-xl px-3 py-2 w-full text-sm sm:text-base'
                >
                  <option value="Short (1-2 paragraphs)">Short</option>
                  <option value="Medium (3-4 paragraphs)">Medium</option>
                  <option value="Detailed (5+ paragraphs)">Detailed</option>
                </select>
              </div>

              <div className="mb-3 sm:mb-5">
                <label className="block text-sm sm:text-base font-semibold mb-1" htmlFor="theme">Theme</label>
                <select 
                  className='flex items-center border rounded-xl px-3 py-2 w-full text-sm sm:text-base'
                  onChange={() => {
                    toast('Dark mode is coming soon!', {
                      position: 'top-center',
                      icon: '🌙',
                      duration: 3000,
                    });
                  }}
                >
                  <option value="Light">Light</option>
                  <option value="Dark">Dark</option>
                </select>
              </div>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className='flex w-full rounded-xl items-center justify-between p-3 sm:p-4 bg-neutral-50 mt-4'
            >
              <div>
                <h1 className='font-semibold text-sm sm:text-base'>Auto-generate QuickQuiz</h1>
                <p className='text-xs sm:text-sm text-neutral-500'>Automatically create QuickQuiz from video content</p>
              </div>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="relative inline-block w-10 sm:w-12 mr-1 sm:mr-2 align-middle select-none"
              >
                <input
                  type="checkbox"
                  checked={quickQuizEnabled}
                  onChange={(e) => {
                    setQuickQuizEnabled(e.target.checked);
                    toast.success(
                      e.target.checked 
                        ? 'QuickQuiz enabled' 
                        : 'QuickQuiz disabled',
                      {
                        position: 'top-center',
                        icon: e.target.checked ? '✅' : '❌',
                        duration: 2000,
                      }
                    );
                  }}
                  className="toggle-checkbox absolute block w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  style={{ right: quickQuizEnabled ? '0' : '1rem' }}
                />
                <label
                  htmlFor="toggle"
                  className={`toggle-label block overflow-hidden h-4 sm:h-6 rounded-full cursor-pointer ${quickQuizEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                ></label>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Privacy Card */}
          <motion.div
            variants={item}
            whileHover={cardHover}
            className='bg-white p-4 sm:p-6 md:p-7 rounded-xl shadow-md'
          >
            <div className='flex gap-2 items-center'>
              <motion.div
                whileHover={{ rotate: 5, scale: 1.05 }}
                className='rounded-xl bg-orange-100 p-2'
              >
                <img src={shieldsvg} alt="" className='w-5 h-5 sm:w-6 sm:h-6' />
              </motion.div>
              <h1 className='font-semibold text-lg sm:text-xl'>Account Privacy</h1>
            </div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className='flex w-full rounded-xl items-center justify-between p-3 sm:p-4 bg-neutral-50 mt-4 sm:mt-5'
            >
              <div>
                <h1 className='font-semibold text-sm sm:text-base'>Password</h1>
                <p className='text-xs sm:text-sm text-neutral-500'>Last changed {lastUpdatedPass}</p>
              </div>
              <motion.button
                onClick={() => setChangePassword(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base text-blue-600 hover:bg-blue-100 rounded-lg transition-colors'
              >
                Change Password
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Danger Zone Card */}
          <motion.div
            variants={item}
            whileHover={cardHover}
            className='bg-red-50 p-4 sm:p-6 md:p-7 rounded-xl shadow-lg border border-red-100'
          >
            <h1 className='font-semibold text-base sm:text-lg text-amber-900'>Danger Zone</h1>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className='flex flex-col sm:flex-row w-full rounded-xl items-center justify-between p-2 sm:p-3 mt-3 sm:mt-5'
            >
              <div className='mb-2 sm:mb-0'>
                <h1 className='font-semibold text-sm sm:text-base text-amber-900'>Clear All Learning Data</h1>
                <p className='text-xs sm:text-sm text-red-500'>This will permanently delete all your videos and progress</p>
              </div>
              <motion.button
                onClick={() => setClearData(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='px-4 py-2 text-sm sm:text-base text-red-500 border border-red-500 rounded-lg transition-colors'
              >
                Clear Data
              </motion.button>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className='flex flex-col sm:flex-row w-full rounded-xl items-center justify-between p-2 sm:p-3 mt-3 sm:mt-5'
            >
              <div className='mb-2 sm:mb-0'>
                <h1 className='font-semibold text-sm sm:text-base text-amber-900'>Delete Account</h1>
                <p className='text-xs sm:text-sm text-red-500'>Permanently delete your account and all associated data</p>
              </div>
              <motion.button
                onClick={() => setDeleteAccount(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='px-4 py-2 text-sm sm:text-base text-white bg-red-500 rounded-lg transition-colors'
              >
                Delete Account
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {changePassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring" }}
                className="bg-white rounded-xl shadow-lg p-4 sm:p-6 w-[90%] max-w-md"
              >
                <div className='flex gap-2 items-center justify-center mb-3 sm:mb-4'>
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                      transition: { repeat: Infinity, duration: 2 }
                    }}
                    className='rounded-xl bg-amber-100 p-2'
                  >
                    <img src={passwordsvg} alt="" className='w-5 h-5 sm:w-6 sm:h-6' />
                  </motion.div>
                  <h1 className='font-semibold text-lg sm:text-xl'>Change Password</h1>
                </div>

                <motion.div
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="space-y-3 sm:space-y-4"
                >
                  <motion.div variants={item} className="mb-3 sm:mb-4">
                    <label className="block font-medium text-sm sm:text-base mb-1" htmlFor="oldPassword">Old Password</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="password"
                      id="oldPassword"
                      placeholder="Enter your old password"
                      onChange={(e) => setOldPass(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 outline-none text-sm sm:text-base"
                    />
                  </motion.div>

                  <motion.div variants={item} className="mb-4 sm:mb-6">
                    <label className="block font-medium text-sm sm:text-base mb-1" htmlFor="newPassword">New Password</label>
                    <motion.input
                      whileFocus={{ scale: 1.01 }}
                      type="password"
                      id="newPassword"
                      placeholder="Enter your new password"
                      onChange={(e) => setNewPass(e.target.value)}
                      className="w-full border rounded-lg px-3 py-2 outline-none text-sm sm:text-base"
                    />
                  </motion.div>

                  <motion.div variants={item} className="flex justify-end gap-3 sm:gap-4">
                    <motion.button
                      onClick={() => {
                        setChangePassword(false);
                        toast('Password change cancelled', {
                          position: 'top-center',
                          icon: '❌',
                        });
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base rounded-lg bg-neutral-100 hover:bg-neutral-200"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleChangePass}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-3 sm:px-4 py-1 sm:py-2 text-sm sm:text-base rounded-lg border hover:border-blue-400 bg-blue-200 text-blue-900"
                    >
                      Save
                    </motion.button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {clearData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring" }}
                className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-[90%] max-w-md border border-red-100"
              >
                <div className='flex flex-col items-center text-center mb-4 sm:mb-6'>
                  <motion.div
                    className='rounded-xl bg-red-100 p-2 sm:p-3 mb-2 sm:mb-3'
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                  >
                    <img
                      src={deletesvg}
                      alt="Warning"
                      className='w-6 h-6 sm:w-8 sm:h-8 text-red-500'
                    />
                  </motion.div>
                  <h1 className='font-bold text-xl sm:text-2xl text-gray-800 mb-1'>Clear Data</h1>
                  <p className='text-sm sm:text-base text-gray-600'>Are you sure you want to clear all data? This action cannot be undone.</p>
                </div>

                <motion.div
                  className="flex justify-end gap-2 sm:gap-3"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  <motion.button
                    variants={item}
                    onClick={() => {
                      setClearData(false);
                      toast('Clear action cancelled', {
                        position: 'top-center',
                        icon: '❌',
                      });
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 sm:px-5 py-1 sm:py-2 text-sm sm:text-base rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    variants={item}
                    onClick={handleClear}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 sm:px-5 py-1 sm:py-2 text-sm sm:text-base rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 font-medium shadow-sm"
                  >
                    Confirm
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {deleteAccount && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="bg-white rounded-xl shadow-xl p-4 sm:p-6 w-[90%] max-w-md border border-red-200"
              >
                <div className='flex flex-col items-center text-center mb-3 sm:mb-5'>
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      transition: { repeat: Infinity, duration: 1.5 }
                    }}
                    className='rounded-full bg-red-100 p-2 sm:p-3 mb-3 sm:mb-4'
                  >
                    <img
                      src={dangersvg}
                      alt="Warning"
                      className='w-6 h-6 sm:w-8 sm:h-8 text-red-600'
                    />
                  </motion.div>
                  <h1 className='font-bold text-xl sm:text-2xl text-gray-800 mb-1 sm:mb-2'>Delete Account</h1>
                  <p className='text-sm sm:text-base text-gray-600 mb-2 sm:mb-4'>This will permanently delete your account and all associated data.</p>
                </div>

                <motion.div
                  className="mb-4 sm:mb-6"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  <motion.p variants={item} className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                    To confirm, type <span className="font-mono font-bold text-red-600">{user.email}</span> below:
                  </motion.p>
                  <motion.input
                    variants={item}
                    whileFocus={{ scale: 1.01 }}
                    type="email"
                    placeholder="Enter your email"
                    onChange={(e) => setDeleteEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 focus:ring-2 focus:ring-red-200 focus:border-red-400 outline-none transition-all text-sm sm:text-base"
                  />
                </motion.div>

                <motion.div
                  className="flex justify-end gap-2 sm:gap-3"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  <motion.button
                    variants={item}
                    onClick={() => {
                      setDeleteAccount(false);
                      toast('Account deletion cancelled', {
                        position: 'top-center',
                        icon: '❌',
                      });
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 sm:px-5 py-1.5 sm:py-2.5 text-sm sm:text-base rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 font-medium"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    variants={item}
                    onClick={handleDeleteAccount}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 sm:px-5 py-1.5 sm:py-2.5 text-sm sm:text-base rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 font-medium shadow-sm disabled:opacity-50"
                    disabled={deleteEmail !== user.email}
                  >
                    Delete Account
                  </motion.button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
};

export default Settings;