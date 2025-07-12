import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoutes from './routes/User.js'
import aiRoutes from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors())
app.use(express.json())
app.use('/user', userRoutes)
app.use('/summarize', aiRoutes);

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("Mongo Connected"))
.catch(err => console.error("Mongo connection error", err))

app.get('/', (req, res) => {
    res.send("Backend Running")
})


app.listen(PORT, () => {
    console.log("Server Running")
})