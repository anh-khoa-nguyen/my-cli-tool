#!/usr/bin/env node

const { Command } = require('commander');
const { spawnSync } = require('child_process');
const path = require('path');
const axios = require('axios');
const ora = require('ora');

const program = new Command();
const SERVER_URL = 'http://localhost:3000/api/ask';

program
  .name('mycmd')
  .description('Trợ lý AI và công cụ kiểm tra cú pháp trên Terminal')
  .version('1.0.0');

program
  .option('-t, --test <file>', 'Kiểm tra cú pháp của file (.sh hoặc .py)')
  .option('-s, --shell <query>', 'Hỏi AI lệnh Shell Script')
  .option('-p, --python <query>', 'Hỏi AI lệnh Python');

async function askAI(question, type) {
    const spinner = ora(`Đang hỏi AI cách viết ${type}...`).start();

    try {
        const response = await axios.post(SERVER_URL, {
            question: question,
            type: type
        });

        spinner.stop();
        
        if (response.data.success) {
            console.log("\n" + response.data.code + "\n");
        } else {
            console.log("❌ Có lỗi từ server.");
        }

    } catch (error) {
        spinner.stop();
        console.log("❌ Không thể kết nối tới Server. Vui lòng kiểm tra lại mạng hoặc Server đang tắt.");
    }
}

program.parse(process.argv);
const options = program.opts();

if (options.test) {
    const filePath = options.test;
    const ext = path.extname(filePath).toLowerCase();
    
    let cmd = '';
    let args = [];

    if (ext === '.sh') {
      cmd = 'bash';
      args = ['-n', filePath];
    } else if (ext === '.py') {
      cmd = 'python';
      args = ['-m', 'py_compile', filePath];
    } else {
      console.log(`\x1b[31m[LỖI] Không hỗ trợ định dạng file ${ext}. Chỉ hỗ trợ .sh và .py\x1b[0m`);
      process.exit(1);
    }

    const result = spawnSync(cmd, args, { encoding: 'utf8', shell: true });

    if (result.status === 0) {
      console.log(`\x1b[32m[OK] File ${filePath} không có lỗi cú pháp.\x1b[0m`);
    } else {
      console.log(`\x1b[31m[LỖI] Kiểm tra cú pháp thất bại cho ${filePath}:\x1b[0m`);
      console.log(`\x1b[31m${result.stderr || result.stdout}\x1b[0m`);
    }
} else if (options.shell) {
    askAI(options.shell, 'shell');
} else if (options.python) {
    askAI(options.python, 'python');
} else {
    if (process.argv.length <= 2) {
        program.help();
    }
}
