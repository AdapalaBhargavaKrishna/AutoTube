import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    title: String,
    author: String,
    thumbnail: String,
    date: String,
    time: String,
    videoUrl: String,
    summary: String,
    keyPoints: [String],
    qna: [
    {
      question: String,
      answer: String
    }
  ],
    isCompleted: Boolean
}, {_id: false});

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    videos : [videoSchema],
}, {timestamps: true});

const User = mongoose.model('User', userSchema)

export default User;