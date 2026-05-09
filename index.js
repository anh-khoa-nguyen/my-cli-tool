#!/usr/bin/env node
const { program } = require('commander');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const SERVER_URL = 'https://spleeniest-snippier-agustin.ngrok-free.dev/api/ask'; 

program
  .option('-s, --shell <query>', 'Hoi lenh shell')
  .option('-p, --python <query>', 'Hoi lenh python')
  .option('-t, --test <filepath>', 'Kiem tra file')
  .option('-n, --next <filepath>', 'Hoan thien file va ghi de'); // Option moi

program.parse(process.argv);
const options = program.opts();

function removeAccents(str) {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

async function sendRequest(content, type, filePath = null) {
    const ext = filePath ? path.extname(filePath) : '';
    try {
        const response = await axios.post(SERVER_URL, {
            content: removeAccents(content),
            type: type,
            ext: ext // Gui kem duoi file de AI biet ngon ngu
        }, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });

        if (response.data.success) {
            const result = response.data.text.trim();
            
            if (type === 'next' && filePath) {
                // GHI DE VAO FILE
                fs.writeFileSync(filePath, result, 'utf8');
                process.stdout.write(`da hoan thien file: ${path.basename(filePath)}\n`);
            } else {
                process.stdout.write(removeAccents(result) + '\n');
            }
        }
    } catch (error) {
        process.stdout.write('loi ket noi\n');
    }
}

// DIEU HUONG
if (options.shell) {
    sendRequest(options.shell, 'shell');
} 
else if (options.python) {
    sendRequest(options.python, 'python');
} 
else if (options.test) {
    const f = path.resolve(options.test);
    if (fs.existsSync(f)) sendRequest(fs.readFileSync(f, 'utf8'), 'check');
}
else if (options.next) {
    const f = path.resolve(options.next);
    if (fs.existsSync(f)) {
        // Doc file va gui di de AI hoan thien
        sendRequest(fs.readFileSync(f, 'utf8'), 'next', f);
    } else {
        process.stdout.write('khong tim thay file\n');
    }
}
