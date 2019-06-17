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



app.listen(3001)






