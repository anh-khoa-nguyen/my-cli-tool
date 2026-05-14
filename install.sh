#!/bin/bash
echo "mycmd tool..."
# THAY LINK RAW GITHUB CUA FILE 'mycmd' VAO DUONG LINK DUOI DAY
curl -sL "https://raw.githubusercontent.com/anh-khoa-nguyen/my-cli-tool/main/mycmd" -o /usr/local/bin/mycmd

echo "ex..."
chmod +x /usr/local/bin/mycmd

echo "dn"