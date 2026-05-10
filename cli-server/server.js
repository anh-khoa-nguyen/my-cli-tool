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
            systemPrompt = "Ban la chuyen gia code. CHI tra ve duy nhat 1 dong code, khong giai thich.";
        }
        else if (type === 'check') {
            systemPrompt = "Ban la may check loi cu phap. Dung: tra ve 'ok', Sai: tra ve 'sai o dong [x]: [ly do]'. Khong dau, ngan gon.";
        }
        else if (type === 'next') {
            // PROMPT CHO TINH NANG -n
            systemPrompt = `Ban la chuyen gia lap trinh ${ext === '.py' ? 'Python' : 'Bash Shell'}.
            User se gui mot file co code do dang hoac mo ta bang comment.
            NHIEM VU: Viet lai toan bo file hoan chinh, logic chay tot.
            QUY TAC QUAN TRONG:
            1. CHI TRA VE CODE, khong co bat ky comment nao (#), khong giai thich.
            2. Code phai chay duoc ngay lap tuc.
            3. Xoa bo tat ca cac dong mo ta bang ngon ngu tu nhien cua user.
            4. Khong dung markdown (khong co \`\`\`).
            5. Het suc ton trong code goc va hay sua dua tren code goc cua nguoi dung cho dung logic dam bao chuong trinh chay duoc`;
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
