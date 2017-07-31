
const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const deleteCheckCode = require('../model/checkCode').deleteCheckCode;
const request = require('request-promise-native').defaults({
    headers: {
        "User-Agent"                : "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
        "Accept"                    : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language"           : "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3",
        "Accept-Encoding"           : "gzip, deflate",
        "Content-Type"              : "application/x-www-form-urlencoded",
        "Connection"                : "keep-alive",
        "Upgrade-Insecure-Requests" : "1"
    },
    form: {
        "Textbox1"          :	"",
        "RadioButtonList1"  :	"%D1%A7%C9%FA",
        "Button1"           :	"",
        "lbLanguage"        :	"",
        "hidPdrs"           :	"",
        "hidsc"             :	""
    },
    uri: 'default2.aspx',
    method: 'POST',
    encoding: null,
    resolveWithFullResponse: true,
    simple: false,
    timeout: 10000
});

// ID: 用户学号
// password: 用户密码
// checkCode: 验证二维码的字符串
// line: 线路选择
const setPostLoginOpt = (cookie, {ID, password, checkCode, line = 2}) => {
    switch (parseInt(line)) {
        case 1:
            return {
                baseUrl: 'http://210.38.137.126:8016/',
                form: {
                    "__VIEWSTATE"       :	"dDwtNTE2MjI4MTQ7Oz61L6x6++KxDmUi3mVHED4viE+96g==",
                    "txtUserName"       :	ID,
                    "TextBox2"          :	password,
                    "txtSecretCode"     :	checkCode
                },
                headers: {
                    "Host"                      : "210.38.137.126:8016",
                    "Referer"                   : "http://210.38.137.126:8016/default2.aspx",
                    "Cookie"                    : "ASP.NET_SessionId=" + cookie
                }
            };
        case 2:
            return {
                baseUrl: 'http://210.38.137.125:8016/(' + cookie + ')/',
                form: {
                    "__VIEWSTATE"       :	"dDwtNTE2MjI4MTQ7Oz5WR1EbGMlRvo75Riw9uGtak7dJvg==",
                    "txtUserName"       :	ID,
                    "TextBox2"          :	password,
                    "txtSecretCode"     :	checkCode,
                },
                headers: {
                    "Host"                      : "210.38.137.125:8016",
                    "Referer"                   : "http://210.38.137.125:8016/(" + cookie + ")/default2.aspx",
                }
            };
        case 3:
            return {
                baseUrl: 'http://210.38.137.124:8016/(' + cookie + ')/',
                form: {
                    "__VIEWSTATE"       :	"dDwtNTE2MjI4MTQ7Oz6WR7s578c/Dz+1j8PmgxTMetLRyA==",
                    "txtUserName"       :	ID,
                    "TextBox2"          :	password,
                    "txtSecretCode"     :	checkCode,
                },
                headers: {
                    "Host"                      : "210.38.137.124:8016",
                    "Referer"                   : "http://210.38.137.124:8016/(" + cookie + ")/default2.aspx",
                }
            };
        default:
            throw new Error('failed to set PostLoginOpt');
    }
};

const postLogin = async (Session_Val, body) => {
    // post logOn request
    const POST_LOGON_OPTS = setPostLoginOpt(Session_Val, body);
    // console.log(POST_LOGON_OPTS);
    const homePageUri = await request(POST_LOGON_OPTS)
                            .then(res => {
                                deleteCheckCode(Session_Val);
                                if (res.statusCode >= 500) {
                                    // 500 'internal server error'
                                    // 503 'Service Unavailable'
                                    throw new Error(`failed to login: ${res.statusMessage}`);
                                } else if (res.statusCode === 302 && res.headers.location) { 
                                    // 302 get redirect location
                                    // console.log(`manage to get location: ${res.headers.location || null}`);
                                    return res.headers.location || null;
                                } else if (res.statusCode === 200) {
                                    const $body = cheerio.load(iconv.decode(res.body, 'gb2312')),
                                          alertMsg = $body('#form1').children().last().html().match(/\'{1}\S+?\'{1}/)[0];
                                    // console.log(`${res.statusCode} : ${alertMsg}`);
                                    throw new Error(`Not Acceptable`);
                                } else {
                                    throw new Error(`${res.statusCode} : Unknown error`);
                                }
                            });
    return homePageUri;
};

module.exports = postLogin;