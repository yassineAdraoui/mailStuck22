
import { GoogleGenAI, Type } from "@google/genai";
import { EmailInput, EmailAnalysis } from "./types";

export const analyzeEmails = async (emails: EmailInput[]): Promise<EmailAnalysis[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
  
  const prompt = `Analyze the following 3 emails and provide a high-level summary and priority score (1-5) for each.
  Rules:
  1. Summary must be exactly one sentence.
  2. Priority score from 1 (Low) to 5 (Urgent).
  3. No hallucination.
  
  Emails to analyze:
  ${emails.map((e, i) => `Email ${i+1}:\nFrom: ${e.sender}\nSubject: ${e.subject}\nBody: ${e.body}`).join('\n\n')}
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analyses: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                summary: { type: Type.STRING, description: "A one-sentence summary of the email." },
                priorityScore: { type: Type.NUMBER, description: "Priority from 1 to 5." }
              },
              required: ["summary", "priorityScore"]
            }
          }
        },
        required: ["analyses"]
      }
    }
  });

  try {
    const json = JSON.parse(response.text || "{}");
    return json.analyses || [];
  } catch (error) {
    console.error("Failed to parse Gemini response", error);
    throw new Error("Failed to process email analysis.");
  }
};
