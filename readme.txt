# Demo

## 概述

这是一个基于 Node.js 和 Express 构建的用于旅游日记平台后端。

## 安装

1. 克隆此仓库到本地机器：

    ```
    git clone git@github.com:dxdfy/tour_manage_nodejs.git
    ```

2. 安装项目依赖：

    ```
    npm install
    ```

## 使用

启动项目：

    ```
    node index.js
     ```
# 项目结构

该项目的文件结构如下：

- `index.js`: 项目的主要入口文件，包含了 Express 应用程序的初始化以及路由和中间件的配置。

- `config.js`: 包含项目的配置信息，如 JWT 密钥、过期时间、基础 URL 等。

- `.gitignore`: 指定了 Git 版本控制忽略的文件或文件夹。

- `db/`: 数据库连接配置。

- `router/`: 包含路由文件，用于定义 Express 的路由。

- `router-handle/`: 包含路由处理函数，用于处理路由请求。

- `schema/`: 可能包含了数据验证模式的定义，使用 Joi 进行数据验证。

- `node_modules/`: 包含项目所依赖的各种第三方模块。

- `public/`: 用于存放上传的图像和视频。

- `package.json`: 

- `package-lock.json`: 

# 使用技术栈

该项目使用以下技术栈：

- Node.js: 用于构建后端服务器。
- Express: Web 应用程序框架，用于简化 Node.js 开发。
- Joi: JavaScript 对象验证库，用于数据验证。
- bcryptjs: 用于密码加密和验证。
- jsonwebtoken: 用于生成和验证 JSON Web Tokens（JWT）。
- express-jwt: Express 中间件，用于验证 JWT。
- express-rate-limit: Express 中间件，用于限制 API 请求速率。
- cors: 用于处理跨域资源共享（CORS）。
- mysql/mysql2: MySQL Node.js 驱动程序，用于连接和操作 MySQL 数据库。
- multer: 用于处理文件上传。
- sharp: 用于图像处理。


