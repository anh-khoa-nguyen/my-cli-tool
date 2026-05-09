require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// Khởi tạo Groq Client với Key lấy từ file .env
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/ask', async (req, res) => {
    try {
        const { question, type } = req.body; // type là 'shell' hoặc 'python'

        // Xác định ngôn ngữ dựa vào cờ -s hay -p
        const language = type === 'shell' ? 'Bash shell script (Linux)' : 'Python 3';

        // Tối quan trọng: SYSTEM PROMPT ép AI chỉ trả về code
        const systemPrompt = `Bạn là chuyên gia về ${language}. 
        Nhiệm vụ: Viết code giải quyết yêu cầu của người dùng.
        QUY TẮC BẮT BUỘC: 
        1. CHỈ TRẢ VỀ DUY NHẤT MỘT DÒNG LỆNH HOẶC ĐOẠN CODE.
        2. KHÔNG giải thích, KHÔNG chào hỏi, KHÔNG có markdown (không dùng \`\`\`).
        3. Nếu là shell, code phải chạy được ngay trên terminal.`;

        // Gọi Groq API (dùng model llama3 cực nhanh)
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: question }
            ],
            model: "llama3-8b-8192", // Hoặc dùng "llama3-70b-8192" nếu cần suy luận phức tạp
            temperature: 0.1, // Nhiệt độ thấp để câu trả lời chính xác, không lan man
            max_tokens: 200,
        });

        // Lọc kết quả, xóa khoảng trắng thừa hoặc dấu ``` nếu AI vô tình thêm vào
        let result = chatCompletion.choices[0]?.message?.content || "";
        result = result.replace(/```bash/g, '').replace(/```python/g, '').replace(/```/g, '').trim();

        res.json({ success: true, code: result });

    } catch (error) {
        console.error("Lỗi Server:", error);
        res.status(500).json({ success: false, message: "Lỗi khi gọi Groq API" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
