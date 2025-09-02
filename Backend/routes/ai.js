import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const api_key = process.env.GROQ_API_KEY;
const base_url = process.env.BASE_URL;
const model = process.env.GROQ_MODEL;

router.post("/ai", async (req, res) => {
  const { transcript, summaryLength, quickQuizEnabled } = req.body;

  if (!transcript || !summaryLength) {
    return res
      .status(400)
      .json({ msg: "Missing required fields: transcript or summaryLength" });
  }

  const prompt = `
You are a helpful summarizer. Generate a ${summaryLength.toLowerCase()} summary of the transcript below.
Then list 5 key points that highlight the most important takeaways.
${
  quickQuizEnabled
    ? "Also generate 3 QnAs (question and answer pairs) based on the content."
    : ""
}

Return them in this format:

**Summary**
<summary here>

**Key Points**
1. ...
2. ...
3. ...
4. ...
5. ...

${
  quickQuizEnabled
    ? "**QnAs**\nQ1: ...\nA1: ...\nQ2: ...\nA2: ...\nQ3: ...\nA3: ..."
    : ""
}
`;

  try {
    const response = await axios.post(
      base_url,
      {
        model,
        messages: [
          {
            role: "system",
            content: prompt,
          },
          {
            role: "user",
            content: transcript,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${api_key}`,
          "Content-Type": "application/json",
        },
      }
    );

    const raw = response.data?.choices?.[0]?.message?.content;
    if (!raw) {
      return res.status(500).json({ msg: "Invalid response from Groq" });
    }

    const [rawSummary = "", rawKeyPoints = "", rawQnAs = ""] = raw.split(
      /(?=\*\*Key Points\*\*)|(?=\*\*QnAs\*\*)/
    );

    const summary = rawSummary.replace("**Summary**", "").trim();

    const keyPoints = rawKeyPoints
      .replace("**Key Points**", "")
      .trim()
      .split(/\n+/)
      .map((line) => line.replace(/^\d+\.\s*/, "").trim())
      .filter(Boolean);

    const qna = quickQuizEnabled
      ? rawQnAs
          .replace("**QnAs**", "")
          .trim()
          .split(/Q\d+:/)
          .slice(1)
          .map((block) => {
            const [q, a] = block.split(/A\d+:/);
            return {
              question: q?.trim() || "",
              answer: a?.trim() || "",
            };
          })
      : [];

    res.json({
      summary,
      keyPoints,
      qna,
    });
  } catch (error) {
    console.error(
      "Groq summarization error:",
      error.response?.data || error.message
    );
    res.status(500).json({ msg: "Failed to summarize", error: error.message });
  }
});

export default router;
