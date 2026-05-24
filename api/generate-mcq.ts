import { GoogleGenAI } from '@google/genai';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `Based on the following blog content, generate one multiple choice question with exactly 4 options. Return ONLY a JSON object in this exact format, nothing else:
{
  "question": "The question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctOptionIndex": 0
}

Blog Content:
${content.substring(0, 5000)}
`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    
    return res.status(200).json({ text: response.text });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to generate MCQ' });
  }
}
