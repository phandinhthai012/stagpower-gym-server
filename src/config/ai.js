import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsonrepair } from 'jsonrepair';
import dotenv from "dotenv";
dotenv.config();

export const aiConfig = {
    provider: "gemini", 
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-4o-mini",
        temperature: 0.2, // Giảm temp cho OpenAI để trả JSON chuẩn
        maxTokens: 2000,
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
        // Dùng Flash là chuẩn cho tốc độ/giá
        model: "gemini-2.5-flash", 
        
        // Cấu hình sinh nội dung
        generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.8,
            maxOutputTokens: 4500,
            responseMimeType: "application/json", // QUAN TRỌNG NHẤT: Ép AI trả về JSON thuần
        },
    },
};

let aiClient;

// --- CẤU HÌNH OPENAI ---
if (aiConfig.provider === "openai") {
    const client = new OpenAI({ apiKey: aiConfig.openai.apiKey });
    aiClient = {
        generate: async (prompt) => {
            try {
                const response = await client.chat.completions.create({
                    model: aiConfig.openai.model,
                    messages: [
                        { role: "system", content: "You are a helpful assistant that outputs JSON." },
                        { role: "user", content: prompt }
                    ],
                    temperature: aiConfig.openai.temperature,
                    max_tokens: aiConfig.openai.maxTokens,
                    response_format: { type: "json_object" } // Ép OpenAI trả JSON
                });
                
                const rawText = response.choices[0].message.content;
                return JSON.parse(rawText); // Không cần jsonrepair vì OpenAI mode này rất chuẩn
            } catch (error) {
                console.error("❌ OpenAI Error:", error.message);
                throw error;
            }
        },
    };
}

// --- CẤU HÌNH GEMINI ---
if (aiConfig.provider === "gemini") {
    const genAI = new GoogleGenerativeAI(aiConfig.gemini.apiKey);
    
    // Khởi tạo model với config tối ưu
    const gModel = genAI.getGenerativeModel({
        model: aiConfig.gemini.model,
        generationConfig: aiConfig.gemini.generationConfig,
        safetySettings: [
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        ],
    });

    aiClient = {
        generate: async (prompt) => {
            try {
                // Gemini hỗ trợ JSON mode native, cực nhanh
                const result = await gModel.generateContent(prompt);
                
                if (!result || !result.response) {
                    throw new Error('AI returned invalid response structure');
                }

                // Kiểm tra lý do dừng (Safety, Token limit...)
                const finishReason = result.response.candidates?.[0]?.finishReason;
                if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
                     // Nếu bị block bởi safety, ném lỗi rõ ràng
                    if (finishReason === 'SAFETY') throw new Error('Blocked by Safety Filters');
                    if (finishReason === 'RECITATION') throw new Error('Blocked by Recitation');
                }

                const rawText = result.response.text();

                if (!rawText) {
                    throw new Error('AI returned empty text');
                }

                // Dù đã bật JSON mode, vẫn nên dùng try/catch với jsonrepair 
                // để phòng trường hợp model (hiếm khi) trả về markdown dư thừa
                try {
                    return JSON.parse(rawText);
                } catch (e) {
                    // Fallback: Nếu JSON.parse lỗi, dùng jsonrepair cứu
                    console.warn("⚠️ JSON native parse failed, using jsonrepair...");
                    const fixed = jsonrepair(rawText);
                    return JSON.parse(fixed);
                }
                
            } catch (error) {
                console.error('❌ AI Generation Error:', {
                    message: error.message,
                    // Log ngắn gọn để debug
                    promptPreview: prompt?.substring(0, 50) + "..." 
                });
                throw new Error(`AI processing failed: ${error.message}`);
            }
        },
    };
}

export default aiClient;