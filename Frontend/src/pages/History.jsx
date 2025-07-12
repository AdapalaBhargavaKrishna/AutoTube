import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../api';
import Navbar from '../components/Navbar';
import { useUser } from '../data/UserContext';
import videosvg from '../assets/svg/video.svg';
import completesvg from '../assets/svg/complete.svg';
import streaksvg from '../assets/svg/fire.svg';
import searchsvg from '../assets/svg/search.svg';
import calendersvg from '../assets/svg/calender.svg';
import usersvg from '../assets/svg/user.svg';
import deletesvg from '../assets/svg/delete.svg';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const History = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('recent');
  const [clearData, setClearData] = useState(false);
  const { user, setUser } = useUser();
  const navigate = useNavigate();

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
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
  };

  const buttonSpring = {
    type: "spring",
    stiffness: 400,
    damping: 10
  };

  useEffect(() => {
    if (!user || !user.name) {
      navigate("/");
      toast.error('Please login to view your history', {
        position: 'top-center',
        icon: '🔒',
      });
    }
  }, [user]);

  const handleClear = async () => {
    const loadingToast = toast.loading('Clearing your history...', {
      position: 'top-center',
    });
    
    try {
      const res = await API.delete(`user/${user._id}/clear`);
      const updatedUser = { ...user, history: [] };
      setUser(updatedUser);
      setClearData(false);
      
      toast.success('History cleared successfully!', {
        id: loadingToast,
        position: 'top-center',
        icon: '🗑️',
      });
    } catch (error) {
      console.error("Failed to clear history:", error);
      toast.error('Failed to clear history. Please try again.', {
        id: loadingToast,
        position: 'top-center',
        icon: '⚠️',
      });
    }
  };

  const getDateObj = (dateStr, timeStr) => new Date(`${dateStr} ${timeStr}`);

  const filteredVideos = user?.history
    ?.filter(video => video.title.toLowerCase().includes(searchTerm.toLowerCase()))
    ?.filter(video => {
      if (filter === 'completed') return video.isCompleted;
      if (filter === 'ongoing') return !video.isCompleted;
      return true;
    })
    ?.sort((a, b) => {
      const dateA = getDateObj(a.date, a.time);
      const dateB = getDateObj(b.date, b.time);

      if (sort === 'recent') return dateB - dateA;
      if (sort === 'oldest') return dateA - dateB;
      if (sort === 'alphabetical') return a.title.localeCompare(b.title);
      return 0;
    });

  return (
    <>
      <Navbar item={"History"} />
      <div className='bg-[#f4f9ff] min-h-screen flex flex-col items-center pb-10 sm:pb-20 px-4 sm:px-6'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center pt-6 sm:pt-10 w-full'
        >
          <h1 className='font-bold text-2xl sm:text-3xl md:text-4xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
            Learning History
          </h1>
          <p className='text-sm sm:text-base text-neutral-500 max-w-md mx-auto'>
            Track your learning journey and revisit your favorite videos
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8 w-full max-w-6xl'
        >
          {[
            { icon: videosvg, title: 'Videos Processed', value: user?.history?.length || 0, bg: 'bg-blue-100' },
            { icon: completesvg, title: 'Completed', value: user?.history?.filter(v => v.isCompleted).length || 0, bg: 'bg-green-100' },
            { icon: streaksvg, title: 'My Streak', value: user?.history?.length || 0, bg: 'bg-gradient-to-r from-orange-100 to-red-100' },
          ].map((card, i) => (
            <motion.div
              key={i}
              variants={item}
              whileHover={cardHover}
              className='bg-white p-4 sm:p-6 rounded-xl shadow-md flex items-center gap-3 sm:gap-4 hover:shadow-lg transition-shadow'
            >
              <motion.div
                className={`${card.bg} w-10 h-10 sm:w-12 sm:h-12 p-2 rounded-xl`}
                whileHover={{ rotate: 5, scale: 1.05 }}
              >
                <img src={card.icon} alt="" className='w-full h-full' />
              </motion.div>
              <div>
                <h2 className='text-xl sm:text-2xl font-bold'>{card.value}</h2>
                <p className='text-xs sm:text-sm text-gray-500'>{card.title}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className='mt-6 sm:mt-8 w-full max-w-6xl bg-white rounded-xl shadow-md p-4 sm:p-5 flex flex-col sm:flex-row flex-wrap items-center gap-3 sm:gap-4'
        >
          <motion.div
            whileHover={{ scale: 1.01 }}
            className='flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 w-full sm:w-auto sm:flex-1 min-w-[200px]'
          >
            <img src={searchsvg} className='w-4 h-4' alt="Search" />
            <input
              type="text"
              placeholder='Search videos...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
              className='outline-none text-sm w-full bg-transparent placeholder:text-gray-500'
            />
          </motion.div>

          <div className='flex gap-3 sm:gap-4 w-full sm:w-auto'>
            <motion.select
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className='text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm flex-1'
            >
              <option value="all">All Videos</option>
              <option value="completed">Completed</option>
              <option value="ongoing">Ongoing</option>
            </motion.select>

            <motion.select
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className='text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white shadow-sm flex-1'
            >
              <option value="recent">Most Recent</option>
              <option value="oldest">Oldest First</option>
              <option value="alphabetical">A → Z</option>
            </motion.select>
          </div>

          {user?.history?.length > 0 && (
            <motion.button
              onClick={() => setClearData(true)}
              whileHover={{ scale: 1.05, backgroundColor: '#fee2e2' }}
              whileTap={{ scale: 0.95 }}
              transition={buttonSpring}
              className='flex items-center gap-1 text-red-500 hover:bg-red-100 px-3 py-2 rounded-lg transition text-sm sm:text-base w-full sm:w-auto justify-center'
            >
              <img src={deletesvg} alt="" className='w-4 h-4' />
              Clear All
            </motion.button>
          )}
        </motion.div>

        {/* Empty State */}
        {user?.history?.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring" }}
            className='flex flex-col items-center justify-between w-full max-w-6xl mt-6 sm:mt-8 bg-white rounded-xl p-16 sm:p-20 space-y-2 shadow-lg'
          >
            <motion.img
              src={calendersvg}
              alt=""
              className='w-16 h-16 sm:w-20 sm:h-20'
              animate={{
                y: [0, -5, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: "easeInOut"
              }}
            />
            <h1 className='font-semibold text-lg sm:text-xl text-neutral-500'>No Learning History</h1>
            <p className='text-sm sm:text-base text-neutral-500 text-center'>Start by analyzing your first YouTube video</p>
          </motion.div>
        )}

        {/* Video List */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className='w-full max-w-6xl space-y-4 mt-6'
        >
          <AnimatePresence>
            {filteredVideos?.length > 0 && filteredVideos.map((video, index) => (
              <motion.div
                key={video.videoUrl + index}
                variants={item}
                whileHover={cardHover}
                className="relative bg-white rounded-xl sm:rounded-2xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-shadow"
                onClick={() => {
                  toast.success(`Selected: ${video.title}`, {
                    position: 'top-center',
                    duration: 2000,
                    icon: '🎬',
                  });
                }}
              >
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-5">
                  <motion.div
                    className="w-full sm:w-32 h-20 sm:h-24 rounded-lg sm:rounded-xl overflow-hidden"
                    whileHover={{ scale: 1.03 }}
                  >
                    <img
                      src={video.thumbnail}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  <div className="flex flex-col justify-between flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-800 line-clamp-2 mb-1 flex-1 pr-2">
                        {video.title}
                      </h3>
                      {video.isCompleted && (
                        <img
                          src={completesvg}
                          className="w-5 h-5 sm:w-6 sm:h-6 ml-2"
                          alt="Complete"
                        />
                      )}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500 flex flex-wrap gap-2 sm:gap-3 mb-2">
                      <span className="flex items-center gap-1">
                        <img src={usersvg} className="w-3 h-3 sm:w-4 sm:h-4" />
                        {video.author}
                      </span>
                      <span>{video.date}</span>
                      <span>{video.time}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3">
                      {video.summary
                        ? video.summary.slice(0, 200) + (video.summary.length > 200 ? "..." : "")
                        : "No summary available for this video."}
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs font-medium">
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                      >
                        5 key points
                      </motion.span>
                      <motion.span
                        whileHover={{ scale: 1.05 }}
                        className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full"
                      >
                        {video.qna?.length || 0} QuickQuiz
                      </motion.span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {user?.history?.length > 0 && filteredVideos?.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='mt-8 sm:mt-10 text-gray-500 text-center text-sm sm:text-base'
            >
              No matching videos found.
            </motion.div>
          )}
        </motion.div>

        <AnimatePresence>
          {clearData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring" }}
                className="bg-white rounded-lg shadow-xl p-5 sm:p-6 w-full max-w-md border border-red-100"
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

                <div className="flex justify-end gap-3">
                  <motion.button
                    onClick={() => {
                      setClearData(false);
                      toast('Clear action cancelled', {
                        position: 'top-center',
                        icon: '❌',
                      });
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 sm:px-5 py-1 sm:py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200 font-medium text-sm sm:text-base"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={handleClear}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 sm:px-5 py-1 sm:py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 font-medium shadow-sm text-sm sm:text-base"
                  >
                    Confirm
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default History;