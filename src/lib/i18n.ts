const translations = {
    "app.title": "中欧银发经济 AI 知识库",
    "app.welcome": "欢迎使用 Next.js 和 shadcn/ui",
    "app.deploy": "立即部署",
    "app.readDocs": "阅读文档",
    "app.learn": "学习",
    "app.examples": "示例",
    "app.goToNextjs": "访问 nextjs.org →",
    "login.title": "登录",
    "login.username": "用户名",
    "login.password": "密码",
    "login.submit": "登录",
    "login.error": "登录失败，请检查您的凭据。",
    "login.logout": "退出",
    "documents.title": "文件详情",
    "documents.error.pdfOnly": "只支持上传 PDF 文件",
    "documents.upload.button": "上传文件",
    "documents.upload.error": "错误",
    "documents.upload.title": "上传文件：",
    "documents.upload.success": "上传成功",
    "documents.error.noId": "找不到文件 ID",
    "documents.error.notFound": "找不到文件",
    "documents.pagination.prev": "上一页",
    "documents.pagination.next": "下一页",
    "documents.error.uploadFailed": "文件上传失败",
    "chat.startChat": "开启聊天",
    "chat.basedOnDocs": "所有回答基于海量行业知识文档",
    "chat.placeholder": "开始提问...",
    "chat.citedDocs": "引用文档",
    "chat.viewDoc": "前往查看",
    "chat.error.server": "{status}（{code}）服务器错误，请重试 ({message})"
};

export function translate(key: keyof typeof translations): string {
    return translations[key];
}