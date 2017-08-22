const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const request = require('request-promise-native').defaults({
    headers: {
        "User-Agent"                :   "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
        "Accept"                    :   "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language"           :   "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3",
        "Accept-Encoding"           :   "gzip, deflate",
        "Connection"                :   "keep-alive",
        "Upgrade-Insecure-Requests" :   "1",
    },
    encoding: null,
    resolveWithFullResponse: true,
    timeout: 10000
});

const setGetSubdocOpt = (cookie, uri, homePageUri, line = 2) => {
    switch (parseInt(line)) {
        case 1:
            return {
                baseUrl: 'http://210.38.137.126:8016/',
                uri: uri,
                headers: {
                    "Host"                      :   "210.38.137.126:8016",
                    "Referer"                   :   "http://210.38.137.126:8016" + homePageUri,
                    "Cookie"                    :   "ASP.NET_SessionId=" + cookie
                }
            };
        case 2:
            return {
                baseUrl: 'http://210.38.137.125:8016/(' + cookie + ')/',
                uri: uri,
                headers: {
                    "Host"                      :   "210.38.137.125:8016",
                    "Referer"                   :   "http://210.38.137.125:8016" + homePageUri
                }
            };
        case 3:
            return {
                baseUrl: 'http://210.38.137.124:8016/(' + cookie + ')/',
                uri: uri,
                headers: {
                    "Host"                      :   "210.38.137.124:8016",
                    "Referer"                   :   "http://210.38.137.124:8016" + homePageUri
                }
            };
        default:
            throw new Error('failed to set GetSubdocOpt');
    }
};

const getSubdoc = (Session_Val, timetableUri, homePageUri, line = 2) => {
    const GET_SCHEDULE_OPTS = setGetSubdocOpt(Session_Val, timetableUri, homePageUri, line);
    // console.log(GET_SCHEDULE_OPTS);
    return request(GET_SCHEDULE_OPTS)
            .then(res => {
                const body = iconv.decode(res.body, 'gb2312'),
                        $ = cheerio.load(body);
                return $;
            })
            .catch(err => {
                if (err.statusCode === 302 || err.statusCode === 404) {
                    // html: Object move to here
                    // console.log(res.statusCode);
                    return Promise.reject(new Error('Object move to here'));
                } else if (err.statusCode >= 500) {
                    err.message = err.response.statusMessage || 'The server is currently unable to handle the request';
                }
                return Promise.reject(err);
            });
};

module.exports = getSubdoc;
