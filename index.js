#!/usr/bin/env node
const { program } = require('commander');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// THAY LINK NGROK CUA BAN VAO DAY
const SERVER_URL = 'https://spleeniest-snippier-agustin.ngrok-free.dev/api/ask'; 

program
  .option('-s, --shell <query>', 'Hoi lenh shell')
  .option('-p, --python <query>', 'Hoi lenh python')
  .option('-t, --test <filepath>', 'Kiem tra file');

program.parse(process.argv);
const options = program.opts();

function removeAccents(str) {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

async function sendRequest(content, type) {
    try {
        const response = await axios.post(SERVER_URL, {
            content: removeAccents(content),
            type: type
        }, {
            headers: { 'ngrok-skip-browser-warning': 'true' }
        });

        if (response.data.success) {
            // .trim() de xoa khoang trang, khong them \n vao console.log
            process.stdout.write(removeAccents(response.data.text).trim() + '\n');
        }
    } catch (error) {
        console.log("loi ket noi");
    }
}

if (options.shell) {
    sendRequest(options.shell, 'shell');
} 
else if (options.python) {
    sendRequest(options.python, 'python');
} 
else if (options.test) {
    const filePath = path.resolve(options.test);
    if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        sendRequest(fileContent, 'check');
    }
}
