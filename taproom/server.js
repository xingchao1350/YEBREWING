/**
 * 简单的HTTP服务器，用于本地开发
 * 使用方法：
 * 1. 安装Node.js
 * 2. 在命令行中运行：node server.js
 * 3. 在浏览器中访问：http://localhost:3000
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// 端口配置
const PORT = process.env.PORT || 3000;

// MIME类型映射
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.ttf': 'font/ttf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
    '.txt': 'text/plain',
    '.md': 'text/markdown'
};

// 创建HTTP服务器
const server = http.createServer((req, res) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    // 解析URL
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }
    
    // 获取文件扩展名
    const extname = path.extname(filePath).toLowerCase();
    
    // 设置内容类型
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // 读取文件
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // 文件不存在
                console.error(`文件不存在: ${filePath}`);
                fs.readFile('./404.html', (err, content) => {
                    if (err) {
                        // 404页面也不存在
                        res.writeHead(404);
                        res.end('404 Not Found');
                    } else {
                        // 返回404页面
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                // 服务器错误
                console.error(`服务器错误: ${err.code}`);
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // 成功读取文件
            res.writeHead(200, { 
                'Content-Type': contentType,
                // 禁用缓存
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                'Surrogate-Control': 'no-store'
            });
            res.end(content, 'utf-8');
        }
    });
});

// 启动服务器
server.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log('按 Ctrl+C 停止服务器');
}); 