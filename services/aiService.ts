import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { AiFeedbackResponse } from '../types';

export const getAiFeedback = async (htmlInput: string): Promise<AiFeedbackResponse> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // Remove style tag content to reduce token count
    const htmlWithoutStyle = htmlInput.replace(/<style>[\s\S]*?<\/style>/, '<style>/* CSS content removed for brevity */</style>');

    const prompt = `You are GEM 2.0, a world-class marketing copywriter and strategist.
Your task is to analyze the provided product page HTML to provide expert marketing feedback.

Your feedback must be structured into five categories:
1.  **Headline Analysis**: Evaluate text elements for impact, clarity, and appeal.
2.  **Storytelling Analysis**: Assess brand story and product descriptions for emotional connection and persuasion.
3.  **Conversion Analysis**: Analyze elements related to driving sales and building trust (e.g., CTAs, pricing presentation).
4.  **연출 사진 제안 (Image Enhancement Suggestions)**: Suggest new photos that are missing from the page. For each suggestion, provide specific, actionable recommendations in Korean using markdown for clarity (e.g., using '*' for bullet points), detailing the **composition/angle (구도)**, **background (배경)**, and **model/props (모델/소품)** to create a compelling visual. For this '연출 사진 제안' category, you MUST create a separate JSON object for EACH individual photo suggestion. Do not group multiple suggestions into one long string.
5.  **Overall Suggestions**: Provide high-level advice to improve marketing effectiveness.

For each piece of feedback, you must provide a concise, actionable suggestion in Korean.
Provide your response strictly in the JSON format defined by the provided schema.

Here is the user's HTML input:
\`\`\`html
${htmlWithoutStyle}
\`\`\`
`;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                category: { type: Type.STRING },
                suggestion: { type: Type.STRING },
            },
            required: ["category", "suggestion"],
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const feedbackText = response.text.trim();
        const feedbackJson = JSON.parse(feedbackText);
        
        if (!Array.isArray(feedbackJson)) {
            throw new Error("AI response is not a valid array.");
        }

        return feedbackJson as AiFeedbackResponse;

    } catch (e) {
        console.error("Error calling Gemini API:", e);
        if (e instanceof Error) {
            throw new Error(`Failed to get feedback from AI: ${e.message}`);
        }
        throw new Error("An unknown error occurred while fetching AI feedback.");
    }
};

export const applyAiSuggestion = async (currentHtml: string, suggestion: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are an expert web designer and copywriter. Below is the full HTML code for a product detail page and a user-selected suggestion for improvement. Your task is to rewrite the entire HTML code to apply the suggestion.
Do not just mechanically change one part. Instead, review the entire code and ensure the new change fits cohesively and harmoniously with the overall design, tone, and structure.
You MUST return only the complete, updated HTML source code as a single block of text. Do NOT include any explanations, comments, or markdown formatting like \`\`\`html.

Current HTML:
\`\`\`html
${currentHtml}
\`\`\`

Suggestion to apply:
"${suggestion}"
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        let updatedHtml = response.text.trim();
        if (updatedHtml.startsWith('```html')) {
            updatedHtml = updatedHtml.substring(7);
        }
        if (updatedHtml.endsWith('```')) {
            updatedHtml = updatedHtml.substring(0, updatedHtml.length - 3);
        }
        
        return updatedHtml.trim();

    } catch (e) {
        console.error("Error calling Gemini API to apply suggestion:", e);
        if (e instanceof Error) {
            throw new Error(`Failed to apply suggestion via AI: ${e.message}`);
        }
        throw new Error("An unknown error occurred while applying AI suggestion.");
    }
};

export const getAiSuggestionsFromNotes = async (userNotes: string, currentHtml: string): Promise<AiFeedbackResponse> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are GEM 2.0, an expert marketing strategist. Your task is to analyze the user's notes and the current product page HTML. Based on the notes, generate a list of actionable suggestions to improve the page.

For each identified change, provide:
1. A clear suggestion in Korean.
2. A relevant \`category\` (e.g., "Copywriting", "Design", "Strategy").

Your response must be a JSON array of objects, conforming to the specified structure. Do not suggest code changes, but rather provide strategic advice based on the user's notes and the provided HTML.

The user's notes are:
\`\`\`
${userNotes}
\`\`\`

The current product page HTML is:
\`\`\`html
${currentHtml}
\`\`\`

Provide the output in the specified JSON format only.`;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                category: { type: Type.STRING },
                suggestion: { type: Type.STRING },
            },
            required: ["category", "suggestion"],
        },
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const feedbackText = response.text.trim();
        const feedbackJson = JSON.parse(feedbackText);
        
        if (!Array.isArray(feedbackJson)) {
            throw new Error("AI response is not a valid array.");
        }

        return feedbackJson as AiFeedbackResponse;

    } catch (e)
    {
        console.error("Error calling Gemini API for suggestions:", e);
        if (e instanceof Error) {
            throw new Error(`Failed to get suggestions from AI: ${e.message}`);
        }
        throw new Error("An unknown error occurred while fetching AI suggestions.");
    }
};

export const getBenchmarkingAnalysis = async (base64Image: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are GEM 2.0, a world-class UI/UX designer and marketing strategist.
    Analyze the provided product detail page screenshot. Your analysis should be comprehensive, covering:
    1.  **Strengths**: What does this page do well in terms of design, layout, copy, and persuasion?
    2.  **Weaknesses**: Where could this page be improved?
    3.  **Actionable Suggestions**: Provide specific, actionable recommendations for improvement.

    Format your response in clear, easy-to-read Markdown. Instead of providing JSON, focus on giving high-quality textual analysis and strategic advice that the user can implement in their HTML.
    Please provide your analysis in Korean.`;

    const imagePart = {
        inlineData: {
            mimeType: 'image/jpeg',
            data: base64Image,
        },
    };

    const textPart = {
      text: prompt
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
        });

        return response.text;

    } catch (e) {
        console.error("Error calling Gemini API for benchmarking analysis:", e);
        if (e instanceof Error) {
            throw new Error(`Failed to get benchmarking analysis from AI: ${e.message}`);
        }
        throw new Error("An unknown error occurred while fetching AI benchmarking analysis.");
    }
};

export const generateImageFromSuggestion = async (prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Create a photorealistic, high-quality marketing image for an e-commerce product page based on the following description. The image should look professional and appealing to customers. Description: ${prompt}`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/png',
              aspectRatio: '4:3',
            },
        });
        
        if (!response.generatedImages || response.generatedImages.length === 0) {
            throw new Error("AI did not return any images.");
        }

        return response.generatedImages[0].image.imageBytes;

    } catch (e) {
        console.error("Error calling Gemini API for image generation:", e);
        if (e instanceof Error) {
            throw new Error(`Failed to generate image from AI: ${e.message}`);
        }
        throw new Error("An unknown error occurred while generating AI image.");
    }
};

export const generateJsonFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are an AI assistant that analyzes an image of a product detail page and converts it into a structured JSON object according to a specific schema.

**TASK:** Analyze the provided image and generate a \`ProductPlan\` JSON object.

**JSON SCHEMA:**
The root object is \`ProductPlan\`:
{
  "project": "string",
  "description": "string",
  "blocks": "Block[]"
}
Each block in the "blocks" array must have a unique "block_id" (e.g., "hero-1", "image-1").

**AVAILABLE BLOCK TYPES:**
Use the most appropriate block type for each section of the page.

1.  \`hero_section\`: \`{ "block_id": "...", "type": "hero_section", "brandTag": "...", "mainTitle": "...", "subTitle": "...", "emojiDeco": "..." }\`
2.  \`full_image\`: \`{ "block_id": "...", "type": "full_image", "src": "...", "alt": "...", "sticker": { "text": "...", "position": "top-right" } }\`
3.  \`catch_phrase\`: \`{ "block_id": "...", "type": "catch_phrase", "lines": ["...", "..."] }\`
4.  \`story_card\`: \`{ "block_id": "...", "type": "story_card", "badge": { "icon": "...", "text": "..." }, "mainText": "...", "pointText": "..." }\`
5.  \`choice_section\`: \`{ "block_id": "...", "type": "choice_section", "title": "...", "subtitle": "...", "choices": [{ "label": "...", "imgSrc": "...", "imgAlt": "...", "name": "..." }] }\`
6.  \`points_section\`: \`{ "block_id": "...", "type": "points_section", "title": "...", "subtitle": "...", "points": [{ "icon": "...", "title": "...", "description": "..." }] }\`
7.  \`detail_section\`: \`{ "block_id": "...", "type": "detail_section", "title": "...", "items": [{ "label": "...", "title": "...", "text": "...", "imgSrc": "...", "imgAlt": "..." }] }\`
8.  \`usage_section\`: \`{ "block_id": "...", "type": "usage_section", "title": "...", "subtitle": "...", "mainImage": { "src": "...", "alt": "..." }, "items": [{ "emoji": "...", "title": "...", "description": "..." }] }\`
9.  \`recommend_section\`: \`{ "block_id": "...", "type": "recommend_section", "badge": "...", "text": "..." }\`
10. \`info_section\`: \`{ "block_id": "...", "type": "info_section", "title": "...", "rows": [{ "key": "...", "value": "..." }] }\`
11. \`notice_section\`: \`{ "block_id": "...", "type": "notice_section", "title": "...", "items": ["...", "..."] }\`
12. \`footer_section\`: \`{ "block_id": "...", "type": "footer_section", "logo": "...", "text": "...", "emoji": "..." }\`

**IMPORTANT INSTRUCTIONS:**
- **Image URLs**: For all \`src\` and \`imgSrc\` properties, use a realistic placeholder URL from a service like postimg.cc, e.g., \`https://i.postimg.cc/3xc1KTLw/placeholder.jpg\`. Do not use generic placeholders.
- **Text Content**: Transcribe all text from the image as accurately as possible. The page is in Korean, so transcribe the Korean text.
- **Structure**: Replicate the order of sections from the image in the "blocks" array.
- **Output**: Your response must be ONLY the raw JSON object, starting with \`{\` and ending with \`}\`. No explanations or markdown.
`;
    
    const imagePart = {
        inlineData: {
            mimeType: mimeType,
            data: base64Image,
        },
    };

    const textPart = { text: prompt };
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: { parts: [textPart, imagePart] },
            config: {
                responseMimeType: "application/json",
            },
        });
        
        const jsonText = response.text.trim();
        JSON.parse(jsonText); 
        return jsonText;

    } catch (e) {
        console.error("Error calling Gemini API for JSON generation from image:", e);
        if (e instanceof Error) {
            throw new Error(`Failed to generate JSON from image via AI: ${e.message}`);
        }
        throw new Error("An unknown error occurred while generating JSON from image.");
    }
};

export const insertImageIntoHtml = async (currentHtml: string, imageDataUrl: string, suggestionContext: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `You are an expert web developer specializing in e-commerce design. A user wants to add a new image to their product detail page based on a specific suggestion.

Your task is to seamlessly integrate the new image into the provided HTML code.

**Context:**
- **Current HTML:** The full HTML code of the page is provided below.
- **User's Goal (Suggestion):** "${suggestionContext}"
- **New Image:** The image is provided as a data URL.

**Instructions:**
1.  Analyze the current HTML structure and the user's goal.
2.  Determine the most logical and aesthetically pleasing location to insert the new image. It should fit the flow of the page.
3.  Wrap the image in a \`<div class="full-image">\` container for consistency with the existing design system. The \`<img>\` tag should have a descriptive \`alt\` attribute based on the suggestion context and its content should be the data URL. The data URL for the image is: \`${imageDataUrl}\`
4.  Return the **complete, updated HTML source code**.

**IMPORTANT:**
- You MUST return only the raw HTML code.
- Do NOT include any explanations, comments, or markdown formatting like \`\`\`html.

Current HTML:
\`\`\`html
${currentHtml}
\`\`\`
`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        let updatedHtml = response.text.trim();
        if (updatedHtml.startsWith('```html')) {
            updatedHtml = updatedHtml.substring(7);
        }
        if (updatedHtml.endsWith('```')) {
            updatedHtml = updatedHtml.substring(0, updatedHtml.length - 3);
        }
        
        return updatedHtml.trim();

    } catch (e) {
        console.error("Error calling Gemini API to insert image:", e);
        if (e instanceof Error) {
            throw new Error(`Failed to insert image via AI: ${e.message}`);
        }
        throw new Error("An unknown error occurred while inserting image via AI.");
    }
};

export const editImageWithAi = async (base64ImageData: string, mimeType: string, prompt: string): Promise<string> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64ImageData,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        if (!response.candidates || response.candidates.length === 0) {
            if (response.promptFeedback) {
                console.error("Prompt was blocked during image editing:", response.promptFeedback);
                throw new Error(`The image editing request was blocked. Reason: ${response.promptFeedback.blockReason}`);
            }
            throw new Error("AI did not return any candidates in the response for image editing.");
        }

        const imagePart = response.candidates[0].content?.parts?.find(part => part.inlineData);
        if (imagePart?.inlineData) {
            return imagePart.inlineData.data;
        }

        throw new Error("AI did not return an edited image in the response parts.");

    } catch (e) {
        console.error("Error calling Gemini API for image editing:", e);
        if (e instanceof Error) {
            throw new Error(`Failed to edit image via AI: ${e.message}`);
        }
        throw new Error("An unknown error occurred while editing the image.");
    }
};