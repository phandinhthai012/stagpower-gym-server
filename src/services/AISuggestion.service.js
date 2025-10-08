import AISuggestion from "../models/AISuggestion";


export const createAISuggestion = async (aiSuggestionData) => {
    const aiSuggestion = await AISuggestion.create(aiSuggestionData);
    return aiSuggestion;
}

export const getAISuggestionById = async (id) => {
    const aiSuggestion = await AISuggestion.findById(id);
    if (!aiSuggestion) {
        const error = new Error("AISuggestion not found");
        error.statusCode = 404;
        error.code = "AISUGGESTION_NOT_FOUND";
        throw error;
    }
    return aiSuggestion;
}

export const getAISuggestionByMemberId = async (memberId) => {
    const aiSuggestion = await AISuggestion.find({ memberId: memberId });
    if (!aiSuggestion) {
        const error = new Error("AISuggestion not found");
        error.statusCode = 404;
        error.code = "AISUGGESTION_NOT_FOUND";
        throw error;
    }
    return aiSuggestion;
}

export const deleteAISuggestionById = async (id) => {
    const aiSuggestion = await AISuggestion.findByIdAndDelete(id);
    if (!aiSuggestion) {
        const error = new Error("AISuggestion not found");
        error.statusCode = 404;
        error.code = "AISUGGESTION_NOT_FOUND";
        throw error;
    }
    return aiSuggestion;
}


// export function buildAISuggestion({ goal, experience, fitnessLevel, preferredTime, weeklySessions }) {
//     return [
//         { role: "system", content: "You are a helpful assistant that provides fitness advice." },
//         {
//             role: "user", content:
//             `Mục tiêu: ${goal}
//             Trình độ: ${fitnessLevel}
//             Kinh nghiệm: ${experience}
//             Ngày rảnh: ${preferredTime}
//             Ngôn ngữ: ${weeklySessions}
//             Yêu cầu: Đề xuất 3 phương án, mỗi phương án gồm 5-7 bài, có lý do và độ khó tăng dần. Định dạng JSON chuẩn.` }
//     ];
// }
