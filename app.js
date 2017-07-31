const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const templating = require('./middleware/templating');
const controller = require('./middleware/controller');
const staticFiles = require('./middleware/staticFiles');

const app = new Koa();

app.use(bodyParser());

// templating 中间件
app.use(templating('views', {
    watch: true,
    autoescape: false
}));

app.use(staticFiles('/static/', __dirname + '/static'));

app.use(controller());

module.exports = app.listen(1111, () => {
    console.log('listening on port 7777...\n');
});