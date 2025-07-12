import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import astronaut from '../assets/svg/astronaut.svg';
import planet from '../assets/svg/planet.svg';
import stars from '../assets/svg/stars.svg';
import rocketsvg from '../assets/svg/rocket.svg';

const NotFound = () => {
  const navigate = useNavigate();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
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
        damping: 10
      }
    }
  };

  const floatingAstronaut = {
    animate: {
      y: [0, -15, 0],
      rotate: [0, 5, -5, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  const rotatingPlanet = {
    animate: {
      rotate: 360,
      transition: {
        duration: 30,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Stars background */}
      <motion.img 
        src={stars} 
        alt="stars" 
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
      />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="text-center z-10 max-w-2xl"
      >
        <motion.div variants={item} className="relative">
          {/* Floating Astronaut */}
          <motion.img
            src={astronaut}
            alt="Lost astronaut"
            className="w-40 h-40 mx-auto mb-8"
            variants={floatingAstronaut}
            animate="animate"
          />

          {/* Rotating Planet */}
          <motion.img
            src={planet}
            alt="Planet"
            className="absolute -bottom-10 -right-10 w-24 h-24 opacity-70"
            variants={rotatingPlanet}
            animate="animate"
          />
        </motion.div>

        <motion.h1 
          variants={item}
          className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-300 bg-clip-text text-transparent"
        >
          404
        </motion.h1>

        <motion.h2 
          variants={item}
          className="text-2xl md:text-3xl font-semibold mb-6"
        >
          Houston, we have a problem!
        </motion.h2>

        <motion.p 
          variants={item}
          className="text-lg mb-8 text-gray-300 max-w-lg mx-auto"
        >
          The page you're looking for seems to have drifted off into the cosmos. 
          Don't worry, we'll help you get back on course.
        </motion.p>

        <motion.button
          variants={item}
          whileHover={{ 
            scale: 1.05,
            boxShadow: "0 0 15px rgba(124, 58, 237, 0.5)"
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3 rounded-full font-medium flex items-center gap-2 mx-auto"
        >
          <img src={rocketsvg} className="w-5 h-5" alt="rocket" />
          Launch Me Home
        </motion.button>

        
      </motion.div>

      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute bg-white rounded-full"
          style={{
            width: '2px',
            height: '2px',
            top: `${Math.random() * 50 + 10}%`,
            left: `${Math.random() * 100}%`,
            boxShadow: '0 0 6px 2px white'
          }}
          animate={{
            x: [0, -200],
            y: [0, 100],
            opacity: [0, 1, 0],
            transition: {
              duration: 2 + Math.random() * 3,
              delay: Math.random() * 5,
              repeat: Infinity,
              repeatDelay: Math.random() * 10
            }
          }}
        />
      ))}
    </motion.div>
  );
};

export default NotFound;