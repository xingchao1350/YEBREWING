# 本地服务器设置指南

为了正确加载模块文件，您需要通过Web服务器访问应用程序，而不是直接从文件系统打开HTML文件。以下是几种设置本地服务器的方法：

## 方法1：使用Python内置的HTTP服务器

如果您已安装Python，可以使用其内置的HTTP服务器：

### Python 3.x

1. 打开命令提示符或PowerShell
2. 导航到项目根目录：`cd 路径/到/项目文件夹`
3. 运行以下命令：`python -m http.server 8000`
4. 在浏览器中访问：`http://localhost:8000`

### Python 2.x

1. 打开命令提示符或PowerShell
2. 导航到项目根目录：`cd 路径/到/项目文件夹`
3. 运行以下命令：`python -m SimpleHTTPServer 8000`
4. 在浏览器中访问：`http://localhost:8000`

## 方法2：使用Node.js和http-server

如果您已安装Node.js：

1. 全局安装http-server：`npm install -g http-server`
2. 导航到项目根目录：`cd 路径/到/项目文件夹`
3. 运行以下命令：`http-server -p 8000`
4. 在浏览器中访问：`http://localhost:8000`

## 方法3：使用Visual Studio Code的Live Server扩展

如果您使用Visual Studio Code：

1. 安装"Live Server"扩展
2. 右键点击index.html文件
3. 选择"Open with Live Server"
4. 浏览器将自动打开并访问正确的URL

## 方法4：使用PHP内置服务器

如果您已安装PHP：

1. 打开命令提示符或PowerShell
2. 导航到项目根目录：`cd 路径/到/项目文件夹`
3. 运行以下命令：`php -S localhost:8000`
4. 在浏览器中访问：`http://localhost:8000`

## 注意事项

- 确保您通过`http://`协议访问应用程序，而不是`file://`协议
- 如果使用的端口（如8000）已被占用，可以尝试其他端口，如8080、3000等
- 确保您的防火墙没有阻止本地Web服务器 