const writeCheckCode = require('../model/checkCode').writeCheckCode;
const request = require('request-promise-native').defaults({
    headers: {
        "User-Agent"              : "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
        "Accept"                  : "*/*",
        "Accept-Language"         : "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3",
        "Accept-Encoding"         : "gzip, deflate",
        "Connection"              : "keep-alive",
        "Cache-Control"           : "max-age=0"
    },
    uri: 'CheckCode.aspx',
    encoding: null,
    resolveWithFullResponse: true,
    timeout: 10000
});

const setGetCheckCodeOpt = (cookie, line = 2) => {
    switch (parseInt(line)) {
        case 1:
            return {
                baseUrl: 'http://210.38.137.126:8016/',
                headers: {
                    "Host"                    : "210.38.137.126:8016",
                    "Referer"                 : "http://210.38.137.126:8016/default2.aspx",
                    "Cookie"                  : "ASP.NET_SessionId=" + cookie
                }
            };
        case 2:
            return {
                baseUrl: 'http://210.38.137.125:8016/(' + cookie + ')/',
                headers: {
                    "Host"                    : "210.38.137.125:8016",
                    "Referer"                 : "http://210.38.137.125:8016/(" + cookie + ")/default2.aspx"
                }
            };
        case 3:
            return {
                baseUrl: 'http://210.38.137.124:8016/(' + cookie + ')/',
                headers: {
                    "Host"                    : "210.38.137.124:8016",
                    "Referer"                 : "http://210.38.137.124:8016/(" + cookie + ")/default2.aspx"
                }
            };
        default:
            throw new Error('failed to set GetCheckCodeOpt');
    }
};

const getCheckCode = (Session_Val, line = 2) => {
    const GET_PIC_OPTS = setGetCheckCodeOpt(Session_Val, line);
    // console.log(GET_PIC_OPTS);
    return request(GET_PIC_OPTS)
            .then(
                res => writeCheckCode(Session_Val, res.body)
            ).then(
                () => `/static/img/${Session_Val}.gif`
            )
            .catch(err => {
                throw err;
            });
};

module.exports = getCheckCode;