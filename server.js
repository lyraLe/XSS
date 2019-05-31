// 用户登录后，返回一个cookie

let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');


let app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname)));

// 解析请求体
app.use(bodyParser.urlencoded({extended: true})); // a=1&b=2 => {a:1, b:2}
// 解析cookie
app.use(cookieParser());
// 伪造已注册用户
let userLists = [{
    username: 'zfpx',
    password: 'zfpx'
}, {
    username: 'lyra',
    password: 'lyra'
}];

let COOKIE_ID = "connect.sid";
let cookies={}; // 用于存储标识和用户关联关系
// 用户登录
app.post('/api/login', function(req, res) {
    const { username, password } = req.body;
    let existedUser = userLists.find(user => (user.username === username && user.password === password));
    if(existedUser) {
        // 用户登录成功后返回客户端一个登录成功信息
        const userId = Math.random() + Date.now(); // 唯一标识信息
        cookies[userId] = existedUser; // {110d***: {username: '', password: ''}}
        res.cookie(COOKIE_ID, userId, {httpOnly: false}); // 防止通过document.cookied获取cookie
        res.json({code: 0});
    } else {
        res.json({code: 1, errMsg: '用户不存在'});
    }
})

// 反射型脚本攻击 
// 诱导用户点击如下链接（一次性）；这种攻击方式一般是服务器端没有进行校验
// http://localhost:3000/welcome?type=<script>setInterval(function(){alert(1)}, 1)</script> 定时器死循环
// http://localhost:3000/welcome?type=<script>alert(doument.cookie)</script> // 暴漏cookie，所以前端一般设置{httpOnly: true}
// 如上，脚本中可以插入任何想要插入的代码，可以写一个接口传递，将攻击者需要的信息传送给攻击者
// chrome浏览器本身对于路径中存在的异常，会有XSS屏蔽功能；但是像firefox就会执行路径中的脚本
app.get('/welcome', function(req, res) {
    // 服务器将路径中type对应的参数传递的数据原封不动的传到页面中
    //res.send(req.query.type); // 注意：res.send req.query，该行代码会出现XSS攻击
    res.send(encodeURIComponent(req.query.type))
})


// 假设已有两条记录
let comments = [{
    username: 'zfpx',
    content: '学前端，选珠峰'
}, {
    username: 'lyra',
    content: 'lyra是个开心的小程序员'
}];
// 获取历史评论记录
app.get('/api/comments', function(req, res){
    res.json({code: 0, comments})
})
// 发表评论

// XSS存储型 恶意脚本存储到服务器上，所有人访问都会造成攻击；比反射型，DOM-Based危害范围都大
app.post('/api/addComment', function(req, res) {
    let reqCookie = req.cookies[COOKIE_ID];
    let user = cookies[reqCookie] || {};
    if (user.username) { // {username:'', password:''} 用户已登陆
        comments.push({username: user.username, content: req.body.content});
        res.json({code: 0})
    } else {
        res.json({code: 1, error: '用户未登录'})
    }  
})
app.listen(3000)
