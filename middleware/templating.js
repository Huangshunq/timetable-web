const nunjucks = require('nunjucks');

const createEnv = (path, opts) => {
    let 
        autoescape = opts.autoescape === undefined ? true : opts.autoescape,
        noCache = opts.noCache || false,
        watch = opts.watch || false,
        throwOnUndefined = opts.throwOnUndefined || false,
        env = new nunjucks.Environment(
            new nunjucks.FileSystemLoader(path || 'views', {
                noCache: noCache,
                watch: watch
            }), {
                autoescape: autoescape,
                throwOnUndefined: throwOnUndefined
            });
    if (opts.filters) {
        for (let f in opts.filters) {
            env.addFilter(f, opts.filters[f]);
        }
    }
    return env;
};

const templating = (path, opts) => {
    // 创建 Nunjucks 的 env 对象：
    let env = createEnv(path, opts);
    return async (ctx, next) => {
        // 给 ctx 绑定 render 函数：
        ctx.render = (view, model) => {
            // 把 render 后的内容赋值给 response.body：
            ctx.response.body = env.render(view, Object.assign({}, ctx.state || {}, model || {}));
            // 设置 Content-Type：
            ctx.response.type = 'text/html';
        };
        // 继续处理请求：
        await next();
    };
};

module.exports = templating;