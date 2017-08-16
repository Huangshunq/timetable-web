const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const request = require('request-promise-native').defaults({
    headers: {
        "User-Agent"                : "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
        "Accept"                    : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language"           : "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3",
        "Accept-Encoding"           : "gzip, deflate",
        "Connection"                : "keep-alive",
        "Upgrade-Insecure-Requests" : "1"
    },
    encoding: null,
    resolveWithFullResponse: true,
    timeout: 10000
});

const setGetMainPageOpt = (cookie, homePageUri, line = 2) => {
    switch (parseInt(line)) {
        case 1:
            return {
                baseUrl: 'http://210.38.137.126:8016',
                uri: homePageUri,
                headers: {
                    "Host"                      : "210.38.137.126:8016",
                    "Referer"                   : "http://210.38.137.126:8016/default2.aspx",
                    "Cookie"                    : "ASP.NET_SessionId=" + cookie
                }
            };
        case 2:
            return {
                baseUrl: 'http://210.38.137.125:8016',
                uri: homePageUri,
                headers: {
                    "Host"                      : "210.38.137.125:8016",
                    "Referer"                   : "http://210.38.137.125:8016/(" + cookie + ")/default2.aspx"
                }
            };
        case 3:
            return {
                baseUrl: 'http://210.38.137.124:8016',
                uri: homePageUri,
                headers: {
                    "Host"                      : "210.38.137.124:8016",
                    "Referer"                   : "http://210.38.137.124:8016/(" + cookie + ")/default2.aspx"
                }
            };
        default:
            throw new Error('failed to set GetMainPageOpt');
    }
};

 // redirect request and get uriObj
const getSubUri = (Session_Val, homePageUri, line = 2) => {
    const GET_MAIN_PAGE_OPTS = setGetMainPageOpt(Session_Val, homePageUri, line);
    // console.log(GET_MAIN_PAGE_OPTS);
    return request(GET_MAIN_PAGE_OPTS)
            .then(res => {
                // get uriObj
                const body = iconv.decode(res.body, 'gb2312'),
                        $ = cheerio.load(body,{
                            decodeEntities: false
                        }),
                        tagArr = $('a[target="zhuti"]').toArray();
                    // 学生个人课表
                    //  URI = $('.sub').eq(4).find('a')[0].attribs.href || '',
                let uriObj = {};
                for (tag of tagArr) {
                    const name = $(tag).text(),
                            uri = tag.attribs.href,
                            key = uri.slice(-7);
                    uriObj[key] = { name, uri };
                }
                return uriObj;
            });
};

module.exports = getSubUri;