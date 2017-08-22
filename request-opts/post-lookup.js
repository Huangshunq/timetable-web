const iconv = require('iconv-lite');
const cheerio = require('cheerio');
const request = require('request-promise-native').defaults({
    headers: {
        "User-Agent"                :   "Mozilla/5.0 (Windows NT 10.0; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
        "Accept"                    :   "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language"           :   "zh-CN,zh;q=0.8,en-US;q=0.5,en;q=0.3",
        "Accept-Encoding"           :   "gzip, deflate",
        "Content-Type"              :   "application/x-www-form-urlencoded",
        "Connection"                :   "keep-alive",
        "Upgrade-Insecure-Requests" :   "1"
    },
    form: {
        "__EVENTARGUMENT"   :   ""
    },
    method: 'POST',
    encoding: null,
    resolveWithFullResponse: true,
    timeout: 10000
});

const setPostLookupOpt = ({cookie, uri, timetableUri, __EVENTTARGET, __VIEWSTATE, xnd, xqd, line = 2}) => {
    switch (parseInt(line)) {
        case 1:
            return {
                baseUrl: 'http://210.38.137.126:8016/',
                uri: uri,
                form: {
                    "__EVENTTARGET"     :   __EVENTTARGET,
                    "__VIEWSTATE"       :	__VIEWSTATE,
                    "xnd"               :   xnd,
                    "xqd"               :   xqd
                },
                headers: {
                    "Host"                      :   "210.38.137.126:8016",
                    "Referer"                   :   "http://210.38.137.126:8016/" + timetableUri,
                    "Cookie"                    :   "ASP.NET_SessionId=" + cookie
                }
            };
        case 2:
            return {
                baseUrl: 'http://210.38.137.125:8016/(' + cookie + ')/',
                uri: uri,
                form: {
                    "__EVENTTARGET"     :   __EVENTTARGET,
                    "__VIEWSTATE"       :	__VIEWSTATE,
                    "xnd"               :   xnd,
                    "xqd"               :   xqd
                },
                headers: {
                    "Host"                      :   "210.38.137.125:8016",
                    "Referer"                   :   "http://210.38.137.125:8016/(" + cookie + ")/" + timetableUri,
                },
            };
        case 3:
            return {
                baseUrl: 'http://210.38.137.124:8016/(' + cookie + ')/',
                uri: uri,
                form: {
                    "__EVENTTARGET"     :   __EVENTTARGET,
                    "__VIEWSTATE"       :	__VIEWSTATE,
                    "xnd"               :   xnd,
                    "xqd"               :   xqd
                },
                headers: {
                    "Host"                      :   "210.38.137.124:8016",
                    "Referer"                   :   "http://210.38.137.124:8016/(" + cookie + ")/" + timetableUri,
                },
            };
        default:
            throw new Error('failed to set PostLookupOpt');
    }
};

const getTimetable = (cookie = void(0), query = {}) => {
    let __EVENTTARGET;
    let {
        homePageUri,
        uri,
        timetableUri,
        __VIEWSTATE,
        defxnd,
        defxqd,
        xnd,
        xqd,
        line
     } = query;
    if (!__VIEWSTATE && homePageUri) {
        const getSubdoc = require('./get-subdoc');
        return getSubdoc(cookie, timetableUri, homePageUri, line)
                .then($ => {
                    return {
                        $,
                        __VIEWSTATE: $('input[name="__VIEWSTATE"]').val()
                    };
                });
    } else if (!cookie || !timetableUri || !uri  || !defxnd || !defxqd || !xnd || !xqd) {
        throw new Error('can not find all query params');
    } else {
        timetableUri = encodeURIComponent(timetableUri);
    }

    if (defxnd === xnd && defxqd === xqd) {
        return {
            isSame: true
        };
    } else if (defxnd === xnd || defxqd === xqd) {
        __EVENTTARGET = (defxnd === xnd) ? 'xqd' : 'xnd';
    } else {
        __EVENTTARGET = 'xqd';
    }

    const POST_LOOKUP_OPTS = setPostLookupOpt({
                                cookie, 
                                uri, 
                                timetableUri,
                                __EVENTTARGET, 
                                __VIEWSTATE,
                                xnd, 
                                xqd,
                                line
                            });

    return request(POST_LOOKUP_OPTS)
            .then(res => {
                const $ = cheerio.load(iconv.decode(res.body, 'gb2312'));
                return {
                    $,
                    __VIEWSTATE: $('input[name="__VIEWSTATE"]').val()
                };
            })
            .catch(err => {
                if (err.response && err.response.statusMessage) {
                    console.log(`failed to lookup: ${err.response.statusMessage}`);
                }
                if (err.statusCode === 503 || err.statusCode === 500) {
                    // 500: 'Internal Server Error'
                    // 503: 'Service Unavailable'
                    err.message = err.response.statusMessage || 'The server is currently unable to handle the request';
                } else if (!err.message) {
                    err.message = 'Unknown error';
                }
                return Promise.reject(err);
            });
};

module.exports = getTimetable;