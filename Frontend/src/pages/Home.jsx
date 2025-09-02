import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../api";
import { motion } from "framer-motion";
import { useUser } from "../data/UserContext";
import { useSettings } from "../data/SettingsContext";
import { useNavigate } from "react-router-dom";
import CircularProgress from "../components/CircularProgress";
import youtubelogo from "../assets/svg/youtube.svg";
import linksvg from "../assets/svg/link.svg";
import magicsvg from "../assets/svg/arroww.svg";
import booksvg from "../assets/svg/book.svg";
import cardsvg from "../assets/svg/cards.svg";
import playsvg from "../assets/svg/play.svg";
import historysvg from "../assets/svg/history.svg";
import firesvg from "../assets/svg/fire.svg";
import usersvg from "../assets/svg/user.svg";
import completesvg from "../assets/svg/complete.svg";
import completewsvg from "../assets/svg/completew.svg";
import toast from "react-hot-toast";

const Home = () => {
  const { user, setUser } = useUser();
  const {
    summaryLength,
    setSummaryLength,
    quickQuizEnabled,
    setQuickQuizEnabled,
  } = useSettings();
  const navigate = useNavigate();

  const [videoUrl, setVideoUrl] = useState("");
  const [completePer, setCompletePer] = useState(0);
  const [activeTab, setActiveTab] = useState("summary");
  const [loading, setLoading] = useState(false);
  const [completedVideos, setCompletedVideos] = useState(0);
  const [watchedVideos, setWatchedVideos] = useState(0);
  const [pageLoading, setPageLoading] = useState(true);
  const [latestVideo, setLatestVideo] = useState({
    title: "",
    author: "",
    thumbnail: "",
    date: "",
    time: "",
    videoUrl: "",
    isCompleted: false,
    summary: "",
    keyPoints: [],
    qna: [],
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
      },
    },
  };

  const buttonSpring = {
    type: "spring",
    stiffness: 400,
    damping: 10,
    mass: 0.5,
  };

  useEffect(() => {
    console.log(summaryLength);

    const fetchUser = async () => {
      if (!user || !user._id) {
        navigate("/");
        return;
      }

      try {
        const res = await API.get(`/user/${user._id}`);
        const videosFromDB = res.data.user.videos || [];

        setUser((prev) => ({
          ...prev,
          history: [...videosFromDB],
        }));

        updateProgress(res.data.user.videos);
      } catch (err) {
        console.error("Error fetching user from DB:", err);
        toast.error("Failed to load your history. Please refresh the page.", {
          position: "top-center",
          icon: "⚠️",
        });
      } finally {
        setPageLoading(false);
      }
    };

    fetchUser();
  }, []);

  const updateProgress = (videos) => {
    const completed = videos.filter((v) => v.isCompleted).length;
    const total = videos.length;
    const percent = total > 0 ? (completed / total) * 100 : 0;

    setCompletePer(percent);
    setCompletedVideos(completed);
    setWatchedVideos(total);
  };

  const testVideoUrl = (url) => {
    return url.includes("youtube.com/watch") || url.includes("youtu.be/");
  };

  const fetchTranscript = async () => {
    if (!videoUrl) {
      toast.error("Please enter a YouTube URL", {
        position: "top-center",
        icon: "🔗",
      });
      return;
    }

    if (!testVideoUrl(videoUrl)) {
      toast.error("Please enter a valid YouTube URL", {
        position: "top-center",
        icon: "❌",
      });
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading("Analyzing video content...", {
      position: "top-center",
      icon: "🔍",
    });

    try {
      const encodedUrl = encodeURIComponent(videoUrl);
      const response = await fetch(
        `https://youtube-transcript3.p.rapidapi.com/api/transcript-with-url?url=${encodedUrl}&flat_text=true&lang=en`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": "youtube-transcript3.p.rapidapi.com",
            "x-rapidapi-key":
              "d35e47d289mshcaa95f9768d61d4p1fdb41jsn86b99a932737",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch transcript");
      }

      const data = await response.json();
      const transcriptText = data.transcript;

      const aiRes = await API.post("/summarize/ai", {
        transcript: transcriptText,
        summaryLength,
        quickQuizEnabled,
      });

      const {
        summary: parsedSummary,
        keyPoints: parsedKeyPoints,
        qna: parsedQnA,
      } = aiRes.data;
      console.log(parsedSummary);

      const ytRes = await fetch(
        `https://www.youtube.com/oembed?url=${encodedUrl}&format=json`
      );
      const ytData = await ytRes.json();

      const newVideo = {
        title: ytData.title,
        author: ytData.author_name,
        thumbnail: ytData.thumbnail_url,
        date: new Date().toLocaleDateString([], {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        videoUrl,
        isCompleted: false,
        summary: parsedSummary,
        keyPoints: parsedKeyPoints,
        qna: parsedQnA,
      };

      const res = await API.post(`/user/${user._id}/add-video`, newVideo);

      setUser((prev) => ({
        ...prev,
        history: res.data.videos,
      }));

      setLatestVideo(newVideo);
      updateProgress(res.data.videos);

      toast.success("Video analysis complete!", {
        id: loadingToast,
        position: "top-center",
        icon: "✅",
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze video. Please try again.", {
        id: loadingToast,
        position: "top-center",
        icon: "⚠️",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsComplete = async () => {
    if (!latestVideo.videoUrl) return;

    const loadingToast = toast.loading("Updating your progress...", {
      position: "top-center",
    });

    try {
      const res = await API.put(`/user/${user._id}/mark-complete`, {
        videoUrl: latestVideo.videoUrl,
      });

      const updatedVideos = res.data.videos;
      const updatedVideo = updatedVideos.find(
        (v) => v.videoUrl === latestVideo.videoUrl
      );

      setLatestVideo({ ...updatedVideo });
      setUser((prev) => ({
        ...prev,
        history: [...updatedVideos],
      }));

      updateProgress(updatedVideos);

      toast.success(
        updatedVideo.isCompleted
          ? "Marked as completed! 🎉"
          : "Removed from completed list",
        {
          id: loadingToast,
          position: "top-center",
          duration: 3000,
        }
      );
    } catch (err) {
      console.error("Mark complete error", err);
      toast.error("Failed to update status. Please try again.", {
        id: loadingToast,
        position: "top-center",
        icon: "⚠️",
      });
    }
  };

  return (
    <>
      <Navbar item={"Dashboard"} />
      <div className="bg-[#f4f9ff] min-h-screen font-sans text-gray-800">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center w-full mx-auto text-center px-4 sm:px-6 lg:px-8 pt-12 md:pt-20 pb-6 md:pb-10"
        >
          <motion.h1
            variants={itemVariants}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-[3.1rem] pb-2 md:pb-4 leading-snug font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            Welcome {user && user.name}!
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-neutral-600 text-sm sm:text-base md:text-lg my-2 md:my-3 mx-auto max-w-xs sm:max-w-md md:max-w-2xl"
          >
            Paste any YouTube URL to get AI-powered summaries, QuickQuiz, and
            track your learning journey
          </motion.p>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -3 }}
            transition={buttonSpring}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 md:mt-10 bg-white p-3 sm:p-4 rounded-xl w-full max-w-xs sm:max-w-md md:max-w-2xl shadow-md"
          >
            <motion.img
              src={youtubelogo}
              className="w-8 h-8 sm:w-10 sm:h-10"
              whileHover={{ rotate: 10 }}
              transition={buttonSpring}
              alt="YouTube Logo"
            />
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="w-full sm:w-[70%]"
            >
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Paste YouTube URL here"
                className="w-full p-2 text-sm sm:text-base rounded-lg bg-white border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-purple-300 transition duration-200"
              />
            </motion.div>
            <motion.button
              onClick={fetchTranscript}
              disabled={loading}
              whileHover={{
                scale: 1.05,
                y: -3,
              }}
              whileTap={{
                scale: 0.98,
                y: 2,
              }}
              transition={buttonSpring}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-xs sm:text-sm whitespace-nowrap shadow-lg"
            >
              <motion.img
                src={magicsvg}
                className="w-3 h-3 sm:w-4 sm:h-4"
                whileHover={{ rotate: 15 }}
                alt="Magic Icon"
              />
              <p>{loading ? "Fetching..." : "Analyze"}</p>
            </motion.button>
          </motion.div>
          <motion.p
            variants={itemVariants}
            className="text-xs sm:text-sm text-neutral-400 mt-2"
          >
            Supports YouTube videos with available transcripts
          </motion.p>
        </motion.div>

        {latestVideo.title && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex flex-col w-full sm:w-4/5 md:w-3/4 lg:w-2/3 mx-auto bg-white shadow-md items-center rounded-xl overflow-hidden my-6 sm:my-8"
          >
            <div className="w-full relative">
              <img
                src={latestVideo.thumbnail}
                className="w-full h-48 sm:h-64 object-cover rounded-xl"
                alt=""
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl"></div>
              <div className="absolute right-0 bottom-0 left-0 text-white p-4">
                <h1 className="text-sm sm:text-lg font-semibold line-clamp-2">
                  {latestVideo.title}
                </h1>
                <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-300">
                  <img
                    src={usersvg}
                    className="w-3 h-3 sm:w-4 sm:h-4"
                    alt="User"
                  />
                  <span>{latestVideo.author}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between bg-neutral-50 p-3 sm:p-5 w-full">
              <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2 mb-2 sm:mb-0">
                <motion.button
                  onClick={() => setActiveTab("summary")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={buttonSpring}
                  className={`flex items-center gap-1 sm:gap-2 mx-1 sm:mx-2 rounded-xl font-semibold p-2 text-xs sm:text-sm ${
                    activeTab === "summary"
                      ? "bg-blue-100 text-blue-600"
                      : "text-neutral-500"
                  }`}
                >
                  <img src={booksvg} className="w-3 h-3 sm:w-4 sm:h-4" alt="" />
                  <span>Summary</span>
                </motion.button>
                <motion.button
                  onClick={() => setActiveTab("qna")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={buttonSpring}
                  className={`flex items-center gap-1 sm:gap-2 mx-1 sm:mx-2 rounded-xl font-semibold p-2 text-xs sm:text-sm ${
                    activeTab === "qna"
                      ? "bg-purple-100 text-purple-600"
                      : "text-neutral-500"
                  }`}
                >
                  <img src={cardsvg} className="w-3 h-3 sm:w-4 sm:h-4" alt="" />
                  <span>QuickQuiz</span>
                </motion.button>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-1 sm:gap-2">
                <motion.a
                  href={latestVideo.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={buttonSpring}
                  className="flex items-center gap-1 sm:gap-2 mx-1 sm:mx-2 text-xs sm:text-sm"
                >
                  <img className="w-6 h-6 sm:w-8 sm:h-8" src={playsvg} alt="" />
                  <span>Watch Video</span>
                </motion.a>
                <motion.button
                  onClick={markAsComplete}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={buttonSpring}
                  className={`flex items-center gap-1 sm:gap-2 mx-1 sm:mx-2 text-xs sm:text-sm ${
                    latestVideo.isCompleted
                      ? "bg-green-100 text-green-700"
                      : "bg-green-500 text-white"
                  } rounded-xl font-semibold    p-2`}
                >
                  <img
                    className="w-4 h-4 sm:w-5 sm:h-5"
                    src={latestVideo.isCompleted ? completesvg : completewsvg}
                    alt=""
                  />
                  <span>
                    {latestVideo.isCompleted ? "Completed" : "Mark Complete"}
                  </span>
                </motion.button>
              </div>
            </div>

            <div className="p-3 sm:p-5 w-full">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                }}
              >
                {activeTab === "summary" ? (
                  <div>
                    <h1 className="font-bold text-lg sm:text-xl text-purple-700">
                      AI Summary
                    </h1>
                    <p className="text-gray-700 text-sm sm:text-base mb-3 sm:mb-4">
                      {latestVideo.summary}
                    </p>

                    {latestVideo.keyPoints &&
                      latestVideo.keyPoints.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          <h2 className="font-semibold text-base sm:text-lg text-purple-600">
                            Key Points
                          </h2>
                          <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base mt-1 sm:mt-2 space-y-1">
                            {latestVideo.keyPoints.map((point, index) => (
                              <motion.li
                                key={index}
                                initial={{ x: -10, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.1 * index }}
                              >
                                {point}
                              </motion.li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                  </div>
                ) : latestVideo.qna?.length > 0 ? (
                  <div>
                    <h1 className="font-bold text-lg sm:text-xl text-purple-700">
                      QuickQuiz
                    </h1>
                    <ul className="list-decimal pl-4 sm:pl-5 space-y-1 sm:space-y-2 text-sm sm:text-base">
                      {latestVideo.qna.map((item, index) => (
                        <motion.li
                          key={index}
                          initial={{ x: -10, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.1 * index }}
                        >
                          <p className="text-blue-700 font-semibold">
                            {item.question}
                          </p>
                          <p className="text-gray-600">Answer: {item.answer}</p>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm sm:text-base">
                    No questions generated.
                  </p>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Dashboard & History */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row mx-4 sm:mx-8 md:mx-12 lg:mx-16 xl:mx-24 2xl:mx-32 gap-4 sm:gap-6"
        >
          <div className="p-2 sm:p-4 space-y-3 sm:space-y-5 w-full lg:w-1/3">
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-2xl shadow-md p-5 flex flex-col items-center gap-4"
            >
              <h1 className="font-bold text-lg sm:text-xl">
                Learning Progress
              </h1>
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 p-2 rounded-lg shadow-md transition duration-200 hover:shadow-lg w-1/2 md:w-40">
                <img src={firesvg} className="w-10 h-10" alt="" />
                <div className="text-center">
                  <h1 className="font-bold text-2xl">
                    {user?.history?.length || 0}
                  </h1>
                  <p>My Streak</p>
                </div>
              </div>
              <div className="p-4 sm:p-6 px-8 sm:px-16 lg:px-8 xl:px-16">
                <CircularProgress completionRate={completePer} />
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-md p-3 sm:p-5 flex flex-col items-center gap-2 sm:gap-4"
            >
              <div className="flex items-center gap-2">
                <img
                  src={historysvg}
                  className="w-6 h-6 sm:w-8 sm:h-8"
                  alt=""
                />
                <h1 className="font-bold text-lg sm:text-xl">Videos Watched</h1>
              </div>
              <div className="text-center">
                <h1 className="font-bold text-xl sm:text-2xl">
                  {watchedVideos}
                </h1>
                <p className="text-xs sm:text-base text-neutral-500">
                  {completedVideos} Completed
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            variants={itemVariants}
            className="m-2 sm:m-4 bg-white rounded-xl shadow-md w-full lg:w-2/3"
          >
            <div className="p-3 sm:p-5">
              <h1 className="font-bold text-lg sm:text-xl">Recent Learning</h1>
              <p className="text-xs sm:text-base text-neutral-500">
                Your Latest video summaries
              </p>
            </div>
            <hr className="mb-2 sm:mb-4" />

            <div className="space-x-2 overflow-y-auto overflow-x-hidden max-h-96">
              {user.history &&
                user.history.map((video, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                    onClick={() => {
                      setLatestVideo(video);
                    }}
                    className="rounded-lg cursor-pointer"
                  >
                    <div className="flex">
                      <motion.img
                        src={video.thumbnail}
                        className="h-24 rounded-3xl object-cover p-4"
                        whileHover={{ scale: 1.05 }}
                        alt=""
                      />
                      <div className="space-y-1 sm:space-y-2 relative p-1 sm:p-2">
                        <img
                          src={completesvg}
                          className={`${
                            video.isCompleted ? "" : "hidden"
                          } top-0 right-1 sm:right-2 absolute w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7`}
                          alt=""
                        />
                        <h1 className="font-semibold text-xs sm:text-sm md:text-base line-clamp-1 sm:line-clamp-2">
                          {video.title}
                        </h1>
                        <div className="flex gap-2 sm:gap-4 md:gap-6 text-neutral-500 text-xs sm:text-sm md:text-base">
                          <h1 className="flex items-center gap-1">
                            <img
                              src={usersvg}
                              className="w-3 h-3 sm:w-4 sm:h-4"
                              alt=""
                            />
                            <span className="line-clamp-1">{video.author}</span>
                          </h1>
                          <p>{video.time}</p>
                        </div>
                        <p className="text-xs text-gray-700 line-clamp-1 sm:line-clamp-2">
                          {video.summary?.slice(0, 3560)}...
                        </p>
                        <div className="flex gap-1 sm:gap-2 text-xs font-medium">
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="bg-blue-100 text-blue-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full"
                          >
                            5 key points
                          </motion.span>
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            className="bg-purple-100 text-purple-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full"
                          >
                            {video.qna?.length || 0} QuickQuiz
                          </motion.span>
                        </div>
                      </div>
                    </div>
                    <hr className="my-2 sm:my-4 md:my-6" />
                  </motion.div>
                ))}

              {user.history && user.history.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-between w-full mt-4 sm:mt-7 bg-white rounded-xl p-8 sm:p-12 md:p-16 lg:p-20 space-y-1 sm:space-y-2 shadow-lg"
                >
                  <motion.img
                    src={linksvg}
                    animate={{
                      y: [0, -5, 0],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    className="w-12 h-12 sm:w-16 sm:h-16"
                    alt=""
                  />

                  <h1 className="font-semibold text-base sm:text-lg md:text-xl text-neutral-500">
                    No Learning History
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-neutral-500">
                    Start by analyzing your first YouTube video
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
};

export default Home;
