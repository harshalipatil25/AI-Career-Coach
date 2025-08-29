import { GoogleGenerativeAI } from "@google/generative-ai";
import { inngest } from "./client";
// import { db } from "../prisma";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const generateIndustryInsights = inngest.createFunction(
  { name: "Generate Industry Insights" },
  { cron: "0 0 * * 0" }, // Runs every Sunday at midnight
  async ({ event, step }) => {
    try {
      // Fetch distinct industries
      const industries = await step.run("Fetch industries", async () => {
        return await db.industryInsight.findMany({
          select: { industry: true },
          distinct: ["industry"],
        });
      });

      for (const { industry } of industries) {
        const prompt = `
          Analyze the current state of the ${industry} industry and provide insights in ONLY the following JSON format without any additional notes or explanations:
          {
            "salaryRanges": [
              { "role": "string", "min": number, "max": number, "median": number, "location": "string" }
            ],
            "growthRate": number,
            "demandLevel": "High" | "Medium" | "Low",
            "topSkills": ["skill1", "skill2"],
            "marketOutlook": "Positive" | "Neutral" | "Negative",
            "keyTrends": ["trend1", "trend2"],
            "recommendedSkills": ["skill1", "skill2"]
          }
          
          IMPORTANT: Return ONLY the JSON. No additional text, notes, or markdown formatting.
          Include at least 5 common roles for salary ranges.
          Growth rate should be a percentage.
          Include at least 5 skills and trends.
        `;

        const res = await step.ai.wrap("gemini", async () => {
          return await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          });
        });

        const text = res?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

        if (!text) throw new Error(`Empty response from AI for ${industry}`);

        let insights;
        try {
          insights = JSON.parse(text);
        } catch (error) {
          console.error("Failed to parse AI response for", industry, text);
          throw new Error(`Invalid JSON response for ${industry}`);
        }

        await step.run(`Update ${industry} insights`, async () => {
          await db.industryInsight.update({
            where: { industry },
            data: {
              ...insights,
              lastUpdated: new Date(),
              nextUpdate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
          });
        });
      }
    } catch (error) {
      console.error("Error in generateIndustryInsights function:", error);
      throw new Error("Industry insights generation failed");
    }
  }
);

