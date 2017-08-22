const request = require('request-promise-native').defaults({
    headers: {
        "User-Agent"                : "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
        "Accept"                    : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language"           : "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3",
        "Accept-Encoding"           : "gzip, deflate",
        "Referer"                   : "http://www.gdou.edu.cn/jw/zf.html",
        "Connection"                : "keep-alive",
        "Upgrade-Insecure-Requests" : "1",
        "Cache-Control"             : "max-age=0"
    },
    uri: 'default2.aspx',
    encoding: null,
    resolveWithFullResponse: true,
    timeout: 10000
});

const setGetCookieOpt = (line = 2) => {
    switch (parseInt(line)) {
        case 1:
            return {
                baseUrl: 'http://210.38.137.126:8016/',
                headers: {
                    "Host": "210.38.137.126:8016",
                }
            };
        case 2:
            return {
                baseUrl: 'http://210.38.137.125:8016/',
                headers: {
                    "Host": "210.38.137.125:8016"
                }
            };
        case 3:
            return {
                baseUrl: 'http://210.38.137.124:8016/',
                headers: {
                    "Host": "210.38.137.124:8016"
                }
            };
        default:
            throw new Error('failed to set GetCookieOpt');
    }
};

const getCookie = (line = 2) => {
    const GET_COOKIE_OPTS = setGetCookieOpt(line);
    return request(GET_COOKIE_OPTS)
            .then(res => {
                let Session_Val = '';
                if (res.headers['set-cookie']) {
                    // Session_KVP: 将要获取的 ASP.NET_SessionId 键值对的字符串，以 “=”连接
                    // Session_Val: 将要获取的 ASP.NET_SessionId 的值
                    const Session_KVP = res.headers['set-cookie'][0].replace(/; path=\// , '') || '';
                    Session_Val = Session_KVP.substring(18) || '';
                } else if (res.statusCode === 200 && res.request.uri.path) {
                    Session_Val = res.request.uri.path.substring(2,26);
                    // console.log(`get path: ${res.request.uri.path}`);
                } else {
                    return Promise.reject(new Error('failed to get cookie from res.headers'));
                }
                // console.log(`manage to get Session_Val: ${Session_Val}`);
                return Session_Val;
            })
            .catch(err => {
                if (err.statusCode === 503 || err.statusCode === 500) {
                    // 500: 'Internal Server Error'
                    // 503: 'Service Unavailable'
                    if (err.response && err.response.statusMessage) {
                        err.response.statusMessage = `failed to get cookie: ${err.response.statusMessage}`;
                    }
                    err.message = err.response.statusMessage || 'The server is currently unable to handle the request';
                } else if (!err.message) {
                    err.message = 'failed to get cookie: Unknown error';
                }
                return Promise.reject(err);
            });
};

module.exports = getCookie;