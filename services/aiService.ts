import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { AiSuggestion, ProductPlan } from '../types';

const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

const suggestionSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            category: {
                type: Type.STRING,
                description: 'The category of the suggestion. Must be one of: "카피라이팅", "디자인/레이아웃", "사용자 경험(UX)", "콘텐츠", "연출 사진 제안", "기타".',
                enum: ['카피라이팅', '디자인/레이아웃', '사용자 경험(UX)', '콘텐츠', '연출 사진 제안', '기타'],
            },
            suggestion: {
                type: Type.STRING,
                description: 'The specific, actionable suggestion for improvement. This should be written in Korean.',
            },
        },
        required: ['category', 'suggestion'],
    },
};

export const getAiFeedback = async (html: string): Promise<AiSuggestion[]> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Here is the HTML for a product detail page. Please provide feedback to improve its marketing effectiveness. Analyze the copywriting, design, layout, UX, and content. Provide specific, actionable suggestions.
        \n\nHTML:\n${html}`,
        config: {
            systemInstruction: 'You are a senior Conversion Rate Optimization (CRO) expert and marketing consultant. Your task is to analyze product pages and provide feedback to increase sales. Provide your feedback in Korean.',
            responseMimeType: "application/json",
            responseSchema: suggestionSchema,
        },
    });

    try {
        const json = JSON.parse(response.text);
        if (Array.isArray(json) && json.every(item => 'category' in item && 'suggestion' in item)) {
            return json as AiSuggestion[];
        }
        throw new Error("Invalid JSON structure received from AI.");
    } catch (e) {
        console.error("Failed to parse AI feedback JSON:", e);
        throw new Error("The AI returned an invalid response format. Please try again.");
    }
};

export const getAiSuggestionsFromNotes = async (notes: string, plan: ProductPlan): Promise<AiSuggestion[]> => {
     const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the following user notes and the current page plan JSON, generate a list of actionable suggestions. Convert the user's raw feedback into concrete improvement ideas.
        \n\nUser Notes:\n${notes}\n\nCurrent Page Plan JSON:\n${JSON.stringify(plan, null, 2)}`,
        config: {
            systemInstruction: 'You are an expert UI/UX designer and frontend developer. Your task is to interpret user feedback and turn it into specific, actionable suggestions for improving a webpage. Provide your suggestions in Korean.',
            responseMimeType: "application/json",
            responseSchema: suggestionSchema,
        },
    });
    
     try {
        const json = JSON.parse(response.text);
        if (Array.isArray(json) && json.every(item => 'category' in item && 'suggestion' in item)) {
            return json as AiSuggestion[];
        }
        throw new Error("Invalid JSON structure received from AI.");
    } catch (e) {
        console.error("Failed to parse AI suggestions JSON:", e);
        throw new Error("The AI returned an invalid response format. Please try again.");
    }
};

export const applyAiSuggestion = async (plan: ProductPlan, suggestion: string): Promise<ProductPlan> => {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Apply the following suggestion to the provided JSON object representing a product page plan. Return ONLY the full, updated, valid JSON object. Do not include any explanations, markdown formatting, or anything other than the raw JSON.
        \n\nSuggestion:\n${suggestion}\n\nOriginal JSON:\n${JSON.stringify(plan, null, 2)}`,
        config: {
            systemInstruction: 'You are an expert frontend developer. You modify JSON data structures based on instructions and return only the raw, complete JSON.',
            responseMimeType: "application/json",
        }
    });
    
    try {
        // The Gemini API sometimes wraps the JSON in ```json ... ```, so we need to strip that.
        const responseText = response.text.trim().replace(/^```json\s*|```\s*$/g, '');
        return JSON.parse(responseText) as ProductPlan;
    } catch (e) {
        console.error("Failed to parse AI suggestion response JSON:", e, "Raw response:", response.text);
        throw new Error("The AI returned an invalid JSON format. Please try again.");
    }
};

export const generateJsonFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
     const imagePart = {
        inlineData: {
            mimeType: mimeType,
            data: base64Image,
        },
    };
    const textPart = {
        text: `Analyze this product page image and generate a JSON object that represents its structure and content based on the provided schema. The JSON should be compatible with my page builder. Make sure to populate all fields accurately. Guess image URLs from common royalty-free sources like Pexels or Unsplash if you cannot determine the exact source.`,
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            systemInstruction: 'You are a specialist in converting webpage screenshots into structured JSON data. You must adhere strictly to the provided JSON schema. Ensure the output is a single, clean JSON object.',
            responseMimeType: 'application/json',
        },
    });

    return response.text.trim();
};


export const insertImageIntoPlan = async (plan: ProductPlan, imageBase64: string, suggestion: string): Promise<ProductPlan> => {
    const textPart = {
        text: `I need to insert an image into the following JSON product plan. The context for the image is: "${suggestion}". Find the most logical and visually appealing place in the 'blocks' array to add a new 'full_image' block for this image. The new block's src should be a placeholder like "NEW_IMAGE_PLACEHOLDER". Return ONLY the full, updated JSON object.
        \n\nJSON Plan:\n${JSON.stringify(plan, null, 2)}`,
    };
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [textPart] },
        config: {
            systemInstruction: 'You are an expert web designer and content strategist. You strategically add new image blocks into an existing JSON page layout. You only return raw, complete JSON.',
            responseMimeType: "application/json",
        }
    });

    try {
        const responseText = response.text.trim().replace(/^```json\s*|```\s*$/g, '');
        // Replace the placeholder with the actual image data
        const newPlanString = responseText.replace(/"NEW_IMAGE_PLACEHOLDER"/g, `"data:image/png;base64,${imageBase64}"`);
        return JSON.parse(newPlanString) as ProductPlan;
    } catch (e) {
        console.error("Failed to parse AI image insertion response JSON:", e, "Raw response:", response.text);
        throw new Error("The AI returned an invalid JSON format. Please try again.");
    }
};

export const editImageWithAi = async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    const imagePart = {
        inlineData: {
            data: base64Image,
            mimeType: mimeType,
        },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [imagePart, textPart] },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.mimeType.startsWith('image/')) {
            return part.inlineData.data;
        }
    }

    throw new Error("AI did not return an edited image.");
};


export const generateImageFromSuggestion = async (suggestion: string): Promise<string> => {
    const promptResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Based on the following suggestion for a product page, create a short, descriptive, English prompt for an AI image generator. The prompt should describe a visually appealing scene.
        \n\nSuggestion: "${suggestion}"
        \n\nExample:
        Suggestion: "강아지 키링을 크리스마스 트리 옆에 두고 따뜻한 느낌의 연출 사진을 추가해보세요."
        Prompt: "A cute fluffy puppy keyring placed next to a beautifully decorated Christmas tree with warm, glowing lights, cozy atmosphere, close-up shot."
        `,
        config: {
            systemInstruction: 'You are a creative director who is an expert at writing prompts for AI image generators.'
        }
    });
    
    const imagePrompt = promptResponse.text.trim();

    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: imagePrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '4:3',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages[0].image.imageBytes;
    }

    throw new Error("AI failed to generate an image.");
};

export const generateJsonFromHtml = async (htmlInput: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    // CSS is not needed for analysis, so remove it to save tokens.
    const htmlWithoutStyle = htmlInput.replace(/<style>[\s\S]*?<\/style>/, '<style>/* CSS content removed for brevity */</style>');

    const prompt = `You are an AI assistant that analyzes the HTML of a product detail page and converts it into a structured JSON object according to a specific schema.

**TASK:** Analyze the provided HTML and generate a \`ProductPlan\` JSON object.

**JSON SCHEMA:**
The root object is \`ProductPlan\`:
{
  "project": "string",
  "description": "string",
  "blocks": "Block[]"
}
Each block in the "blocks" array must have a unique "block_id" (e.g., "hero-1", "image-1", "catch-phrase-1") and a "type".

**AVAILABLE BLOCK TYPES:**
- \`hero_section\`: { block_id: string, type: 'hero_section', brandTag: string, mainTitle: string, subTitle: string, emojiDeco: string }
- \`full_image\`: { block_id: string, type: 'full_image', src: string, alt: string, sticker?: { text: string, position: 'top-right' } }
- \`catch_phrase\`: { block_id: string, type: 'catch_phrase', lines: string[] }
- \`story_card\`: { block_id: string, type: 'story_card', badge: { icon: string, text: string }, mainText: string, pointText: string }
- \`choice_section\`: { block_id: string, type: 'choice_section', title: string, subtitle: string, choices: { label: string, imgSrc: string, imgAlt: string, name: string }[] }
- \`points_section\`: { block_id: string, type: 'points_section', title: string, subtitle: string, points: { icon: string, title: string, description: string }[] }
- \`detail_section\`: { block_id: string, type: 'detail_section', title: string, items: { label: string, title: string, text: string, imgSrc: string, imgAlt: string }[] }
- \`usage_section\`: { block_id: string, type: 'usage_section', title: string, subtitle: string, mainImage?: { src: string, alt: string }, items: { emoji: string, title: string, description: string }[] }
- \`recommend_section\`: { block_id: string, type: 'recommend_section', badge: string, text: string }
- \`video_testimonial\`: { block_id: string, type: 'video_testimonial', title: string, videoUrl: string, quote: string, author: string }
- \`info_section\`: { block_id: string, type: 'info_section', title: string, rows: { key: string, value: string }[] }
- \`notice_section\`: { block_id: string, type: 'notice_section', title: string, items: string[] }
- \`footer_section\`: { block_id: string, type: 'footer_section', logo: string, text: string, emoji: string }

**IMPORTANT INSTRUCTIONS:**
- **block_id**: Generate a descriptive and unique \`block_id\` for each block (e.g., "hero-section", "main-image", "special-points").
- **Image URLs**: For all \`src\` and \`imgSrc\` properties, extract the original URL from the HTML. Do not use placeholders.
- **Text Content**: Transcribe all text content from the HTML as accurately as possible. The page is in Korean, so transcribe the Korean text. Retain simple HTML tags like \`<strong>\` or \`<br>\` within text fields if they are present.
- **Structure**: Replicate the order of sections from the HTML in the "blocks" array.
- **Output**: Your response must be ONLY the raw JSON object, starting with \`{\` and ending with \`}\`. No explanations or markdown.

Here is the user's HTML input:
\`\`\`html
${htmlWithoutStyle}
\`\`\`
`;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
            },
        });
        
        const jsonText = response.text.trim().replace(/^```json\s*|```\s*$/g, '');
        JSON.parse(jsonText); // Validate that the response is valid JSON
        return jsonText;

    } catch (e) {
        console.error("Error calling Gemini API for JSON generation from HTML:", e);
        if (e instanceof Error) {
            throw new Error(`Failed to generate JSON from HTML via AI: ${e.message}`);
        }
        throw new Error("An unknown error occurred while generating JSON from HTML.");
    }
};
