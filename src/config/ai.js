import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { jsonrepair } from 'jsonrepair';
import dotenv from 'dotenv';
dotenv.config();

export const aiConfig = {
    provider: "gemini", // hoặc "openai"
    openai: {
        apiKey: process.env.OPENAI_API_KEY,
        model: "gpt-4o-mini",
        temperature: 0.7,
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY || "your-api-key",
        model: "gemini-2.0-flash", //gemini-pro
        maxTokens: 1000,
        // Giảm mạnh độ "sáng tạo" để model tập trung vào logic và cú pháp đúng.
        // 0.0 là xác định nhất, 0.2 là một lựa chọn an toàn để code nhất quán.
        temperature: 0.2,
        // Giới hạn model chỉ xem xét các token có xác suất cao nhất.
        // Giúp loại bỏ các lựa chọn từ vựng lạ hoặc không liên quan.
        topK: 40,
        // Hoạt động cùng với temperature, đảm bảo model chọn từ một nhóm token hợp lý.
        topP: 0.85,
        // Đặt giới hạn đầu ra đủ lớn để chứa được các file code API hoàn chỉnh.
        maxOutputTokens: 4096,
    },
};


let aiClient;

if (aiConfig.provider === "openai") {
    const client = new OpenAI({ apiKey: aiConfig.openai.apiKey });
    aiClient = {
        generate: async (prompt) => {
            const response = await client.chat.completions.create({
                model: aiConfig.openai.model,
                messages: [{ role: "user", content: prompt }],
                temperature: aiConfig.openai.temperature,
                // response_format: { type: "json_object" } // nếu muốn ép JSON
            });
            return response.choices[0].message.content;
        },
    };
}

if (aiConfig.provider === "gemini") {
    const genAI = new GoogleGenerativeAI(aiConfig.gemini.apiKey);
    const gModel = genAI.getGenerativeModel({
        model: aiConfig.gemini.model,
        generationConfig: {
            temperature: aiConfig.gemini.temperature,
            topK: aiConfig.gemini.topK,
            topP: aiConfig.gemini.topP,
            maxOutputTokens: aiConfig.gemini.maxOutputTokens,
        },
        safetySettings: [
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        ],
    });

    aiClient = {
        generate: async (prompt) => {
            const result = await gModel.generateContent(prompt);
            const rawText = result.response.text();
            if (!rawText || rawText.trim().length === 0) {
                throw new Error('AI returned empty response');
            }
            const fixed = jsonrepair(rawText);
            const json = JSON.parse(fixed);
            return json;
        },
    };
}

// export const prompt = async (data) => {
//     const { gender, age, heightCm, weightKg, bodyFatPct, experienceLevel, goal } = data;
//     const today = new Date().toISOString().split('T')[0];
//     return `
//         Bạn là huấn luyện viên thể hình chuyên nghiệp. Dựa trên hồ sơ sức khỏe và mục tiêu của hội viên, hãy xây dựng kế hoạch tập luyện an toàn, hiệu quả, khả thi trong tuần, đồng thời đưa ra lưu ý dinh dưỡng và phục hồi. Trả lời bằng tiếng Việt, theo đúng định dạng JSON bên dưới.
//         [HỒ SƠ HỘI VIÊN]
//         - Thông tin cơ bản:
//           - Họ tên:
//           - Giới tính: ${gender}  (nam/nữ/khác)
//           - Tuổi: ${age}
//           - Chiều cao: ${heightCm} cm
//           - Cân nặng: ${weightKg} kg
//           - Tỷ lệ mỡ ước tính: ${bodyFatPct}% (nếu có)
//           - Mức độ kinh nghiệm: ${experienceLevel} (newbie/beginner/intermediate/advanced)

//         [MỤC TIÊU TẬP LUYỆN]
//         - Mục tiêu tập luyện:
//           - Mục tiêu tập luyện:${goal}
//         [YÊU CẦU XUẤT KẾT QUẢ]
//         - Ưu tiên an toàn theo chống chỉ định; thay thế bài tập nếu có nguy cơ.
//         - Khối lượng/độ khó phù hợp kinh nghiệm; có lộ trình tăng tiến (progression).
//         - Phù hợp mục tiêu; cân đối các nhóm cơ và năng lượng.
//         - Gợi ý khởi động, giãn cơ, thời gian nghỉ giữa hiệp; lưu ý kỹ thuật chính.
//         - Kèm gợi ý dinh dưỡng & phục hồi ngắn gọn, khả thi.
//         - Chỉ xuất JSON đúng schema sau, không thêm text ngoài JSON
//         [RÀNG BUỘC NGÀY]
//         - Ngày hôm nay là ${today}.
//         - bạn là huấn luyện viên chuyên nghiệp, phải gợi ý ngày trong tương lai (có thể hôm nay hoặc ngày mai, hoặc ngày mai sau, các ngày trong tương lai)
//         [SCHEMA]
//                 recommendationDate: {
//                     type: Date,
//                     required: [true, 'Recommendation date is required'],
//                 },

//                 goal: {
//                     type: String,

//                     required: [true, 'Goal is required'],
//                 },
//                 exercises: [{
//                     name: {
//                         type: String,
//                         required: [true, 'Exercise name is required'],
//                     },
//                     // số lần lặp lại
//                     sets: {
//                         type: Number,
//                         min: [1, 'Sets cannot be less than 1'],
//                         max: [20, 'Sets cannot be greater than 20'],
//                     },
//                     // số lập lại động tác trong mỗi set
//                     reps: {
//                         type: Number,
//                         min: [1, 'Reps must be at least 1'],
//                         max: [100, 'Reps cannot exceed 100']
//                     },
//                     restTime: {
//                         type: Number,
//                         min: [0, 'Rest time cannot be negative'],
//                         max: [100, 'Rest time cannot be greater than 100'],
//                     },
//                     instructions: {
//                         type: String,
//                         default: '',
//                     },

//                 }],
//                 workoutDuration: {
//                     type: Number,
//                     default: null
//                 },
//                 difficultyLevel: {
//                     type: String,
//                     enum: ['Beginner', 'Intermediate', 'Advanced'],
//                     default: 'Beginner',
//                 },
//                 nutrition: {
//                     type: String,
//                     default: '',
//                 },
//                 notes: {
//                     type: String,
//                     default: '',
//                 },
//                 status: {
//                     type: String,
//                     required: [true, 'Status is required'],
//                     enum: ['Pending', 'Completed', 'Cancelled'],
//                     default: 'Pending',
//                 },
//             };
//         `;
// };

// function extractJsonFromRaw(rawText) {
//     try {
//         // B1. Xóa ký tự markdown ```json ``` hoặc ``` ở đầu/cuối
//         let cleaned = rawText
//             .replace(/^```json/, '')  // bỏ ```json đầu
//             .replace(/^```/, '')      // bỏ nếu không có json
//             .replace(/```$/, '')      // bỏ ``` cuối
//             .trim();

//         // B2. Nếu có dấu ngoặc kép bọc cả chuỗi (trường hợp bạn dán), bỏ chúng
//         if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
//             cleaned = cleaned.slice(1, -1);
//         }

//         // B3. Chuẩn hóa lại các ký tự escape: chuyển \\n, \\" thành ký tự thật
//         cleaned = cleaned
//             .replace(/\\n/g, '\n')
//             .replace(/\\"/g, '"');

//         // B4. Cắt từ { đến } cuối cùng (phòng khi có rác ngoài)
//         const start = cleaned.indexOf('{');
//         const end = cleaned.lastIndexOf('}');
//         if (start !== -1 && end > start) {
//             cleaned = cleaned.slice(start, end + 1);
//         }

//         // B5. Parse sang object JSON thật
//         const jsonData = JSON.parse(cleaned);
//         return jsonData;
//     } catch (err) {
//         console.error("❌ Parse JSON thất bại:", err.message);
//         return null;
//     }
// }

export default aiClient;