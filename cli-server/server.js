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
        const { content, type } = req.body;
        let systemPrompt = "";

        // PHAN LOAI YEU CAU DE DUA RA PROMPT CHUAN
        if (type === 'shell' || type === 'python') {
            const lang = type === 'shell' ? 'Bash Linux' : 'Python';
            systemPrompt = `Ban la chuyen gia ${lang}. 
            YEU CAU BAT BUOC: 
            1. CHI TRA VE DUY NHAT 1 DONG CODE HOAC DOAN CODE.
            2. KHONG giai thich, KHONG chao hoi, KHONG dung markdown (khong dung \`\`\`).
            3. Code phai chay duoc ngay.`;
        }
        else if (type === 'check') {
            systemPrompt = `Ban la may kiem tra loi cu phap (syntax checker).
            Nhiem vu: Kiem tra doan code user gui.
            YEU CAU BAT BUOC:
            1. Neu code dung hoan toan: CHI tra ve dung 1 chu "ok".
            2. Neu code sai: CHI tra ve theo dung dinh dang "sai o dong [so dong]: [ly do rut gon]".
            3. BAT BUOC dung tieng Viet khong dau de tra loi.
            4. KHONG noi them bat ky tu nao khac.`;
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: content }
            ],
            model: "openai/gpt-oss-120b",
            temperature: 0.1,
            max_tokens: 150,
        });

        let result = chatCompletion.choices[0]?.message?.content || "";
        // Don dep ket qua, xoa ky tu thua
        result = result.replace(/```bash/g, '').replace(/```python/g, '').replace(/```/g, '').trim();

        res.json({ success: true, text: result });

    } catch (error) {
        console.error("Loi Server:", error);
        res.status(500).json({ success: false, text: "loi server backend" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server dang chay tai http://localhost:${PORT}`);
});
