const getSubdoc = require('../request-opts/get-subdoc');
const postLookup = require('../request-opts/post-lookup');
const { getTimetableJSON } = require('../lib');

const callback = async (ctx, next) => {
    // console.log(`--- timetable.js receive request: ${ctx.params.ID} ---`);
    try {
        // Session_Val: 将要获取的 ASP.NET_SessionId 的值
        const Session_Val = ctx.cookies.get('ASP.NET_SessionId') || '';

        if (Session_Val === '') {
            throw new Error('failed to get cookie');
        } 
        // else {
        //     console.log(`manage to load cookie: ${Session_Val}`);
        // }

        // get schedule message
        // console.log(ctx.request.query);
        const { $, __VIEWSTATE, isSame } = await postLookup(Session_Val, ctx.request.query);

        if (isSame) {
            ctx.status = 304;
            ctx.message = 'not modified';
            // console.log('--- not modified --- \n');
            return;
        } else if (!$ || !__VIEWSTATE) {
            throw new Error('failed to lookup timetable!');
        }

        ctx.body = {
            main: getTimetableJSON($),
            __VIEWSTATE
        };
        // console.log('--- finish --- \n');
        await next();
    } catch (err) {
        console.log(err.message);
        ctx.status = 406;
        ctx.message = err.message;
    }
};

module.exports = {
    'GET /:ID/timetable': callback
};