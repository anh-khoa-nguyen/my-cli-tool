#!/usr/bin/env node
const { program } = require('commander');
const axios = require('axios');
const ora = require('ora');
const fs = require('fs');
const path = require('path');

const SERVER_URL = 'http://localhost:3000/api/ask'; 

program
  .version('1.0.0')
  .description('Tro ly AI tren Terminal (Ho tro tieng Viet khong dau)');

program
  .option('-s, --shell <query>', 'Hoi AI lenh shell script')
  .option('-p, --python <query>', 'Hoi AI lenh python')
  .option('-t, --test <filepath>', 'Kiem tra loi cu phap cua file');

program.parse(process.argv);
const options = program.opts();

// Ham xoa dau tieng Viet (phong truong hop user go co dau)
function removeAccents(str) {
    if (!str) return '';
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
}

async function sendRequest(content, type, loadingMsg) {
    const cleanContent = removeAccents(content);
    const spinner = ora(loadingMsg).start();

    try {
        const response = await axios.post(SERVER_URL, {
            content: cleanContent,
            type: type
        });

        spinner.stop();
        
        if (response.data.success) {
            // In ket qua tu AI tra ve
            console.log("\n" + removeAccents(response.data.text) + "\n");
        } else {
            console.log("loi: server xu ly that bai.");
        }

    } catch (error) {
        spinner.stop();
        console.log("loi: khong the ket noi toi server.");
    }
}

// XU LY LOGIC CAC LENH
if (options.shell) {
    sendRequest(options.shell, 'shell', 'dang tim lenh shell...');
} 
else if (options.python) {
    sendRequest(options.python, 'python', 'dang tim lenh python...');
} 
else if (options.test) {
    const filePath = path.resolve(options.test);
    
    // Kiem tra xem file co ton tai khong
    if (!fs.existsSync(filePath)) {
        console.log(`loi: khong tim thay file ${options.test}`);
        process.exit(1);
    }

    // Doc noi dung file va gui len cho AI
    const fileContent = fs.readFileSync(filePath, 'utf8');
    sendRequest(fileContent, 'check', 'dang kiem tra loi file...');
} 
else {
    if (process.argv.length <= 2) {
        program.help();
    }
}
