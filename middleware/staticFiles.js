const path = require('path');
const mime = require('mime');
const fs = require('mz/fs');

/**
 * @params url : 项目起始的目录 '/static/'
 * @params dir : 完整目录 __dirname + '/static'
 */
const staticFiles = (url, dir) => {
    return async (ctx, next) => {
        // if (ctx.headers.cookie) {
        //     ctx.status = 404;
        //     ctx.message = 'wrong';
        // } else {
            let rpath = ctx.request.path;
            // 判断是否以指定的 url 开头：
            if (rpath.startsWith(url)) {
                // 获取文件完整路径：
                let fp = path.join(dir, rpath.substring(url.length));
                // 判断文件是否存在：
                if (await fs.exists(fp)) {
                    // 查找文件的 mime：
                    ctx.set('Content-Type', mime.lookup(rpath));
                    // 读取文件内容并赋值给 response.body：
                    ctx.response.body = await fs.readFile(fp);
                } else {
                    // 文件不存在：
                    ctx.status = 404;
                }
            } else {
                // 不是指定前缀的 URL，继续处理下一个 middleware：
                await next();
            }
        // }
    };
};

module.exports = staticFiles;