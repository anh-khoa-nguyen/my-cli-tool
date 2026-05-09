#!/bin/bash
echo "Đang tải mycmd tool..."
# Tải file từ GitHub về thư mục /usr/local/bin/ (đây là thư mục chứa lệnh hệ thống của Linux)
# LƯU Ý: Bạn cần thay thế link dưới đây bằng link GitHub Release hoặc link Raw thực tế của bạn
curl -sL "https://raw.githubusercontent.com/anh-khoa-nguyen/my-cli-tool/main/mycmd" -o /usr/local/bin/mycmd

echo "Đang cấp quyền thực thi..."
chmod +x /usr/local/bin/mycmd

echo "Cài đặt THÀNH CÔNG! Bấm mycmd để bắt đầu."
