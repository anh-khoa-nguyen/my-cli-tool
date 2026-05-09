#!/bin/bash
echo "dang tai mycmd tool..."
# THAY LINK RAW GITHUB CUA FILE 'mycmd' VAO DUONG LINK DUOI DAY
curl -sL "https://raw.githubusercontent.com/anh-khoa-nguyen/my-cli-tool/main/mycmd" -o /usr/local/bin/mycmd

echo "dang cap quyen thuc thi..."
chmod +x /usr/local/bin/mycmd

echo "cai dat thanh cong! bam mycmd de bat dau."