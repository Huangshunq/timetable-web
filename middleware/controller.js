const fs = require('mz/fs');

const addMapping = (router, mapping) => {
    for (let url in mapping) {
        if (url.startsWith('GET ')) {
            let path = url.substring(4);
            router.get(path, mapping[url]);
            console.log(`register URL mapping: GET ${path}`);
        } else if (url.startsWith('POST ')) {
            let path = url.substring(5);
            router.post(path, mapping[url]);
            console.log(`register URL mapping: POST ${path}`);
        } else if (url.startsWith('PUT ')) {
            let path = url.substring(4);
            router.put(path, mapping[url]);
            console.log(`register URL mapping: PUT ${path}`);
        } else if (url.startsWith('DELETE ')) {
            let path = url.substring(7);
            router.del(path, mapping[url]);
            console.log(`register URL mapping: DELETE ${path}`);
        } else {
            console.log(`invalid URL: ${url}`);
        }
    }
}

const addControllers = (router, dir) => {
    fs.readdirSync(__dirname + '/' + dir).filter((file) => {
        return file.endsWith('.js');
    }).forEach((file) => {
        console.log(`process controller: ${file}...`);
        let mapping = require(__dirname + '/' + dir + '/' + file);
        addMapping(router, mapping);
    });
}

module.exports = dir => {
    const controllers_dir = dir || '../controllers',
          router = require('koa-router')();
    addControllers(router, controllers_dir);
    return router.routes();
};