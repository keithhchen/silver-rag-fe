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
    "login.logout": "退出"
};

export function translate(key: keyof typeof translations): string {
    return translations[key];
}