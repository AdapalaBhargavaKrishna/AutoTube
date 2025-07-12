import User from '../models/User.js';
import express from 'express';
import bcrypt from 'bcrypt';

const router = express.Router();

router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ msg: "User Already Exists" })

        const hashPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashPassword, videos: [] })
        await newUser.save()
        res.status(201).json({ msg: "User Created", user: newUser })
    } catch (err) {
        res.status(500).json({ msg: "Signup Error", error: err.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ msg: "user Not Found" })

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

        res.status(201).json({ msg: "Login Successful", user })

    } catch (err) {
        res.status(500).json({ msg: "Server Error", error: err.message })
    }
})

router.post('/firebase-login', async (req, res) => {
    try {
        const { name, email } = req.body;
        let user = await User.findOne({ email });

        if (!user) {

            const hashedEmail = await bcrypt.hash(email, 10);
            user = new User({ name, email, password: hashedEmail });
            await user.save();
            return res.status(201).json({ msg: "User Created", user });
        }

        res.status(201).json({ msg: "Login Successful", user });

    } catch (err) {
        res.status(500).json({ msg: "Server Error", error: err.message });
    }
})

router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ msg: "User not found" });
        res.status(200).json({ user })
    } catch (err) {
        res.status(500).json({ msg: "Server Error", error: err.message })
    }
})

router.post('/:id/add-video', async (req, res) => {
    try {
        const { id } = req.params
        const {
            title,
            author,
            thumbnail,
            date,
            time,
            videoUrl,
            summary,
            keyPoints,
            qna,
            isCompleted
        } = req.body;

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ msg: "User not found" })

        const newVideo = {
            title,
            author,
            thumbnail,
            date,
            time,
            videoUrl,
            summary,
            keyPoints,
            qna,
            isCompleted
        };
        user.videos.push(newVideo)
        await user.save();

        res.status(200).json({ msg: "video added successfully", videos: user.videos })
    } catch (err) {
        res.status(500).json({ msg: "Error adding video", error: err.message });
    }
})

router.put('/:id/mark-complete', async (req, res) => {

    const { videoUrl } = req.body

    try {
        const { id } = req.params
        const user = await User.findById(id);
        if (!user) return res.status(404).json({ msg: "User not found" })

        const video = user.videos.find(v => v.videoUrl === videoUrl)
        if (video) video.isCompleted = true;

        await user.save()
        res.json({ videos: user.videos })

    } catch (err) {
        res.status(500).json({ msg: "Error mark video", error: err.message });
    }
})

router.delete('/:id/clear', async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findById(id)
        if (!user) return res.status(404).json({ msg: "User not found" });

        user.videos = []
        await user.save()

        res.status(200).json({ msg: "History Cleared", videos: [] })
    } catch (err) {
        res.status(500).json({ msg: "Error clear data", error: err.message });
    }
})

router.put('/:id/change-pass', async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body
        const { id } = req.params
        const user = await User.findById(id)
        if (!user) return res.status(404).json({ msg: "User not found" })

        const isMatch = await bcrypt.compare(oldPassword, user.password)
        if (!isMatch) return res.status(401).json({ msg: "Old Password Incorrect" });

        user.password = await bcrypt.hash(newPassword, 10)
        await user.save()

        res.json({ success: true, message: "Password updated successfully.", updateDate: user.updatedAt, createDate: user.createdAt });
    } catch (err) {
        res.status(500).json({ msg: "Error change pass", error: err.message });
    }
})

router.delete('/:id/delete', async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ msg: "User not found" })

        res.status(200).json({ success: true, msg: "User deleted successfully" })
    } catch (err) {
        res.status(500).json({ msg: "Error change pass", error: err.message });
    }
})
router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ success: true, msg: "Password reset successfully" });
});


export default router