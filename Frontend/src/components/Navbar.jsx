import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from "../firebase/firebase";
import { signOut } from "firebase/auth";
import { useUser, UserContext } from '../data/UserContext';
import logosvg from '../assets/svg/logo.svg';
import homesvg from '../assets/svg/home.svg';
import settingssvg from '../assets/svg/settings.svg';
import historysvg from '../assets/svg/historyw.svg';
import userlogo from '../assets/svg/user.svg';
import menusvg from '../assets/svg/menu.svg'; // Add a menu icon

const Navbar = ({ item }) => {
    const { user } = useUser();
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [signingOut, setSigningOut] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const links = [
        { name: "Dashboard", svg: homesvg, path: "/Dashboard" },
        { name: "History", svg: historysvg, path: "/History" },
        { name: "Settings", svg: settingssvg, path: "/Settings" }
    ];

    const handleSignOut = async () => {
        try {
            setSigningOut(true);
            await signOut(auth);
            setUser(null);
            localStorage.removeItem("autotube-user");
            navigate('/');
        } catch (error) {
            console.error("Error signing out:", error);
        } finally {
            setSigningOut(false);
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target) &&
                mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
                setIsMobileMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Animation variants
    const logoVariants = {
        hover: { rotate: 10, scale: 1.05 },
        tap: { rotate: -5, scale: 0.95 }
    };

    const navItemVariants = {
        hover: { y: -2, scale: 1.05 },
        tap: { y: 1, scale: 0.98 }
    };

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 }
    };

    const mobileMenuVariants = {
        hidden: { opacity: 0, x: '100%' },
        visible: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: '100%' }
    };

    return (
        <motion.nav 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className='w-full bg-white p-1 flex items-center justify-between shadow-sm border-b border-gray-100 px-4'
        >
            {/* Logo Section */}
            <motion.div 
                className='flex items-center gap-2 p-1 cursor-pointer'
                whileHover="hover"
                whileTap="tap"
                onClick={() => navigate('/Dashboard')}
            >
                <motion.div 
                    variants={logoVariants}
                    className='bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-lg'
                >
                    <img src={logosvg} className='w-11 h-11 p-2 rounded-lg' alt="AutoTube Logo" />
                </motion.div>
                <div>
                    <h1 className='font-bold text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
                        AutoTube
                    </h1>
                    <p className='text-neutral-500 text-sm'>Your Learning Tracker</p>
                </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className='hidden md:flex items-center gap-4'>
                <ul className='flex gap-4 ml-auto p-2'>
                    {links.map((link, index) => (
                        <motion.li 
                            key={index}
                            variants={navItemVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className={`text-lg flex items-center gap-2 ${
                                item === link.name 
                                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600' 
                                    : 'text-neutral-600 hover:text-neutral-900'
                            } font-medium py-2 px-4 rounded-lg transition-all`}
                        >
                            <img 
                                src={link.svg} 
                                className={`w-5 h-5 ${item === link.name ? 'opacity-100' : 'opacity-70'}`} 
                                alt={link.name} 
                            />
                            <Link to={link.path} className="whitespace-nowrap">
                                {link.name}
                            </Link>
                        </motion.li>
                    ))}
                </ul>

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                    <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="group flex h-10 w-10 select-none items-center justify-center rounded-lg bg-white leading-8 text-zinc-950 shadow-[0_-1px_0_0px_#d4d4d8_inset,0_0_0_1px_#f4f4f5_inset,0_0.5px_0_1.5px_#fff_inset] hover:bg-zinc-50 hover:via-zinc-900 hover:to-zinc-800 active:shadow-[-1px_0px_1px_0px_#e4e4e7_inset,1px_0px_1px_0px_#e4e4e7_inset,0px_0.125rem_1px_0px_#d4d4d8_inset]" aria-label="Change language"><span className="flex items-center group-active:[transform:translate3d(0,1px,0)]"> <img src={userlogo} alt="User" className="w-10 h-10 rounded-xl p-2" /></span></button>
                    <AnimatePresence>
                        {isDropdownOpen && (
                            <motion.div
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                variants={dropdownVariants}
                                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                                className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-xl z-50 p-4 text-left border border-gray-100"
                            >
                                <div className="mb-3">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                                <motion.button
                                    onClick={handleSignOut}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-center gap-2 mt-2 bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 font-medium px-3 py-2 rounded-lg text-sm transition-all"
                                >
                                    {signingOut ? (
                                        <>
                                            <motion.span
                                                animate={{ rotate: 360 }}
                                                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                                className="block w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"
                                            />
                                            Signing Out...
                                        </>
                                    ) : (
                                        "Sign Out"
                                    )}
                                </motion.button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-4">
                <motion.button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm border border-gray-200 hover:shadow-md transition-all"
                    aria-label="Menu"
                >
                    <img src={menusvg} className="w-6 h-6" alt="Menu" />
                </motion.button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        ref={mobileMenuRef}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={mobileMenuVariants}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-y-0 right-0 w-64 bg-white shadow-xl z-50 p-6 border-l border-gray-200"
                    >
                        <div className="flex flex-col h-full">
                            {/* User Info */}
                            <div className="flex items-center gap-3 mb-8">
                                <img 
                                    src={userlogo} 
                                    alt="User" 
                                    className="w-12 h-12 rounded-full bg-gray-100 p-2"
                                />
                                <div>
                                    <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>

                            {/* Navigation Links */}
                            <ul className="flex-1 space-y-4">
                                {links.map((link, index) => (
                                    <motion.li 
                                        key={index}
                                        variants={navItemVariants}
                                        whileHover="hover"
                                        whileTap="tap"
                                        className={`text-lg flex items-center gap-3 ${
                                            item === link.name 
                                                ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-600' 
                                                : 'text-neutral-600 hover:text-neutral-900'
                                        } font-medium py-3 px-4 rounded-lg transition-all`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <img 
                                            src={link.svg} 
                                            className={`w-6 h-6 ${item === link.name ? 'opacity-100' : 'opacity-70'}`} 
                                            alt={link.name} 
                                        />
                                        <Link to={link.path} className="whitespace-nowrap">
                                            {link.name}
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>

                            {/* Sign Out Button */}
                            <motion.button
                                onClick={handleSignOut}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full flex items-center justify-center gap-2 mt-auto bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-600 font-medium px-4 py-3 rounded-lg text-sm transition-all"
                            >
                                {signingOut ? (
                                    <>
                                        <motion.span
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="block w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full"
                                        />
                                        Signing Out...
                                    </>
                                ) : (
                                    "Sign Out"
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;