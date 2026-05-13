// file: server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/ask', async (req, res) => {
    try {
        const { content, type, ext } = req.body; // Nhan them thong tin duoi file (ext)
        let systemPrompt = "";

        if (type === 'shell' || type === 'python') {
            const lang = type === 'shell' ? 'Bash Shell' : 'Python';
            systemPrompt = `Ban la chuyen gia code ${lang}. CHI tra ve duy nhat 1 dong code, khong giai thich.`;
        }
        else if (type === 'check') {
            systemPrompt = "Ban la may check loi cu phap. Dung: tra ve 'ok', Sai: tra ve 'sai o dong [x]: [ly do]'. Khong dau, ngan gon.";
        }
        else if (type === 'next') {
            // PROMPT ĐÃ ĐƯỢC CẢI TIẾN ĐỂ ÉP AI GIỮ NGUYÊN CODE GỐC
            systemPrompt = `Bạn là công cụ hoàn thiện và sửa lỗi code ${ext === '.py' ? 'Python' : 'Bash Shell'}.
            Người dùng sẽ gửi một đoạn code dở dang hoặc có chứa các comment mô tả logic cần viết thêm.

            RÀNG BUỘC TỐI CAO (BẮT BUỘC PHẢI TUÂN THỦ 100%):
            1. GIỮ NGUYÊN CẤU TRÚC GỐC: Tuyệt đối giữ nguyên tên biến, tên hàm, và cấu trúc luồng (if/else, vòng lặp) mà người dùng đã viết.
            2. KHÔNG ĐƯỢC REFACTOR: Tuyệt đối không tự ý tối ưu hóa, viết ngắn lại hay thay đổi thuật toán theo cách của bạn. Khách hàng viết thế nào, bạn đi tiếp theo hướng đó.
            3. CHỈ ĐIỀN VÀ SỬA LỖI: Nhiệm vụ duy nhất của bạn là viết tiếp những phần code còn thiếu dựa trên comment, và sửa các lỗi cú pháp (nếu có) để code chạy được.
            4. FIX CODE: Bạn có thể dựa vào comment mô tả lỗi của chương trình để fix lại cho đúng trong trường hợp chương trình đang không ổn
            4. Xóa bỏ các dòng comment yêu cầu (bằng ngôn ngữ tự nhiên) của user sau khi đã chuyển nó thành code.
            5. FORMAT OUTPUT: TRẢ VỀ DUY NHẤT CODE THUẦN TÚY. Không sử dụng markdown (không có \`\`\`), không giải thích, không xin chào. Code phải chạy được ngay lập tức.`;
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: content }
            ],
            model: "openai/gpt-oss-120b", // Dung model manh de viet code dai
            temperature: 0.1,
        });

        let result = chatCompletion.choices[0]?.message?.content || "";
        result = result.replace(/```[a-z]*/g, '').replace(/```/g, '').trim();

        res.json({ success: true, text: result });
    } catch (error) {
        console.error("Loi server:", error.message);
        res.status(500).json({ success: false, text: "loi server" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server dang chay tai http://localhost:${PORT}`));
