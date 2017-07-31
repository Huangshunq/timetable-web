// 请求信息
const getCookie = require('../request-opts/get-cookie');
const getCheckCode = require('../request-opts/get-checkCode');

const callback = async (ctx, next) => {
    // console.log(`--- Login.js receive request ---`);
    const isChangeLine = ctx.path === '/changeLine' ? true : false;
    try {
        // get cookie

        const line = isChangeLine ? parseInt(ctx.query.line) : 2;

        // Session_Val: 将要获取的 ASP.NET_SessionId 的值
        const Session_Val = await getCookie(line);

        if (Session_Val === '') {
            throw new Error('failed to get cookie');
        }

        // get checkCode picture
        const checkCodeUri = await getCheckCode(Session_Val, line);

        if (!checkCodeUri) {
            throw new Error('failed to get checkCode picture');
        }

        // set cookie
        const GETTIME = new Date().getTime();
        ctx.cookies.set('ASP.NET_SessionId', Session_Val, {
            CreationTime: GETTIME,
            domain: "localhost", // "210.38.137.126"
            Expires: "会话",
            HostOnly: true,
            httpOnly: false,
            LastAccessed: GETTIME,
            path: "/",
            Secure: false
        });

        if (isChangeLine) {
            // JSON
            ctx.body = {
                "src": `static/img/${Session_Val}.gif`,
                "ASP.NET_SessionId": Session_Val
            };
        } else {
            // render html
            await ctx.render('login.html', {
                        title: 'login',
                        pic: checkCodeUri
                    });
        }
        // console.log('--- finish rendering --- \n');
        await next();
    } catch (err) {
        console.log(err.message);
        ctx.status = 404;
        ctx.message = err.message;
        if (!isChangeLine) {
            await ctx.render('error.html', {
                        title: 'error',
                        status: err.status || err.statusCode,
                        message: err.message
                    });
        }
        // console.log('--- send error --- \n');
    }
};

module.exports = {
    'GET /' : callback,
    'GET /index' : callback,
    'GET /login' : callback,
    // 更换线路
    'GET /changeLine' : callback
};