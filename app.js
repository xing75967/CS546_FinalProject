import express from 'express';
import session from 'express-session';
import { engine } from 'express-handlebars';
import configRoutes from './routes/index.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// 导入自定义的 Handlebars 助手
import { handlebarsHelpers } from './helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// **关键改动：将静态文件目录指向 frontend/public**
// 当浏览器请求 /public/css/main.css 时, Express 会提供 ./frontend/public/css/main.css 文件
app.use('/public', express.static('frontend/public'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 设置 Handlebars 模板引擎，并注册自定义助手
app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: handlebarsHelpers
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// 设置 Session
app.use(session({
    name: 'AuthState',
    secret: 'This is a secret string for session signing!',
    resave: false,
    saveUninitialized: false
}));

// 中间件：将用户登录状态传递给所有模板
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    // 将 flash messages 传递给模板
    res.locals.errorMessage = req.session.errorMessage;
    res.locals.successMessage = req.session.successMessage;
    // 删除 session 中的消息，确保只显示一次
    delete req.session.errorMessage;
    delete req.session.successMessage;
    next();
});

configRoutes(app);

app.listen(3000, () => {
    console.log("We've now got a server!");
    console.log('Your routes will be running on http://localhost:3000');
});
