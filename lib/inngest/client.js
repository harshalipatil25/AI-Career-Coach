import { Inngest } from "inngest";

export const inngest = new Inngest({
  id: "PathVise-AI Career Coach", // Unique app ID
  name: "PathVise-AI Career Coach",
  credentials: {
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
    },
  },
});