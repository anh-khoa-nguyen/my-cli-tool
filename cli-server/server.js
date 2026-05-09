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
    console.log("\n--- CO REQUEST MOI ---");
    try {
        const { content, type } = req.body;
        console.log(`Loai: ${type}`);
        console.log(`Noi dung gui di: \n${content}`);

        let systemPrompt = "";
        if (type === 'shell' || type === 'python') {
            systemPrompt = "Ban la chuyen gia code. CHI tra ve duy nhat 1 dong code, khong giai thich.";
        } else {
            // PROMPT sieu chi tiet de soi loi bash
            systemPrompt = `Ban la chuyen gia fix loi Bash script. 
            Hay kiem tra doan code user gui. 
            Neu code chay duoc va hop le: tra ve "ok".
            Neu code co loi (ke ca loi logic nhu thieu $, thieu dau ngoac): tra ve "sai o dong [x]: [ly do]".
            YEU CAU: Tra loi tieng Viet khong dau, ngan gon duoi 20 tu.`;
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: content }
            ],
            model: "openai/gpt-oss-120b", // DUNG MODEL MANH NHAT CUA GROQ
            temperature: 0, 
        });

        const rawText = chatCompletion.choices[0]?.message?.content || "";
        console.log(`AI tra ve (Goc): "${rawText}"`);

        // Xu ly xoa ky tu du thua
        let result = rawText.replace(/```[a-z]*/g, '').replace(/```/g, '').trim();
        
        if (!result) result = "AI khong dua ra cau tra loi";
        
        console.log(`Ket qua sau khi lam sach: "${result}"`);
        res.json({ success: true, text: result });

    } catch (error) {
        console.error("LOI HE THONG:", error.message);
        res.status(500).json({ success: false, text: "loi ket noi AI" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log("Server Debug dang chay tai cong 3000..."));
