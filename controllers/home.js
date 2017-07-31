const cheerio = require('cheerio');
const { getTimetableJSON, getSelectOpts }  = require('../lib');

// 登录信息
const postLogin = require('../request-opts/post-login');
const getSubUri = require('../request-opts/get-subUri');
const getSubdoc = require('../request-opts/get-subdoc');

const checkValidity = (Session_Val, {ID, password, checkCode, line}) => {
    if (typeof Session_Val !== 'string' || Session_Val.search(/^\w{24}$/) === -1) {
        throw new Error(`cookie is invalid`);
    } else if (typeof ID !== 'string' || ID.search(/^\d{12}$/) === -1) {
        throw new Error(`ID is invalid: ${ID}`);
    } else if (typeof password !== 'string' || password === '') {
        throw new Error(`password is invalid: ${password}`);
    } else if (typeof checkCode !== 'string' || checkCode.search(/^\w{4}$/) === -1) {
        throw new Error(`checkCode is invalid: ${checkCode}`);
    } else if (typeof line !== 'string' || line.search(/^[0-9]{1}$/) === -1){
        throw new Error(`line is invalid: ${line}`);
    } else {
        // console.log(`manage to load cookie: ${Session_Val}`);
        // console.log(`manage to load ID: ${ID}, password's length: ${password.length}, checkCode: ${checkCode}`);
        return {ID, password, checkCode, line};
    }
};

// 用参数 i 静态设置请求网址
const callback = async (ctx, next) => {
    // console.log(`--- Home.js receive request: ${ctx.params.ID}, i = ${ ctx.params.num } ---`);
    try {
        // Session_KVP: 将要获取的 ASP.NET_SessionId 键值对的字符串，以 “=”连接
        // Session_Val: 将要获取的 ASP.NET_SessionId 的值
        const Session_Val = ctx.cookies.get('ASP.NET_SessionId') || '';
        
        // checkValidity
        const body = checkValidity(Session_Val, ctx.request.body);

        // get uriObj
        const homePageUri = await postLogin(Session_Val, body);

        if (!homePageUri) {
            throw new Error('failed to get homePageUri');
        }


        const uriObj = await getSubUri(Session_Val, homePageUri, body.line);

        if (!uriObj) {
            throw new Error('failed to get uri');
        }

        // get personal message
        const timetableUri = uriObj['N121602'].uri;
        const $ = await getSubdoc(Session_Val, timetableUri, homePageUri, body.line);
        // console.log(timetableJSON);

        const main = {
                uri         :   homePageUri,
                ID          :   body.ID,
                line        :   body.line
              },
              // 查询课表 选项数据
              subdoc = {
                __VIEWSTATE :   $('input[name="__VIEWSTATE"]').val(),
                xnd         :   getSelectOpts($('#xnd')),
                xqd         :   getSelectOpts($('#xqd')),
                uri         :   timetableUri
              },
              // 用户信息
              userMsg = {
                id          :   $('#Label5').text(), // 学号
                name        :   $('#Label6').text(), // 姓名
                institute   :   $('#Label7').text(), // 学院
                major       :   $('#Label8').text(), // 专业
                class       :   $('#Label9').text(), // 班级
              };
        // render html
        await ctx.render('home.html', {
                    title: 'home',
                    timetableJSON: getTimetableJSON($),
                    main,
                    subdoc,
                    userMsg,
                    // uriObj,
                });
        // console.log('--- finish rendering --- \n');
        await next();
    } catch (err) {
        console.log(err.message);
        ctx.status = 406;
        ctx.message = err.message;
        await ctx.render('error.html', {
            title: 'error',
            status: err.status || err.statusCode,
            message: err.message
        });
        // console.log('--- redirect --- \n');
    }
};

module.exports = {
    'POST /:ID/home': callback
};