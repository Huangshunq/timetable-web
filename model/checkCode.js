
const fs = require('mz/fs');

// 检查验证码图片数量
(function () {
    fs.readdir('./static/img')
      .then(files => {
          if (files.length > 10) {
            files.forEach((el) => {
                fs.unlink(`static/img/${el}`)
                  .catch(err => {
                      console.log(err.stack);
                  });
            });
            console.log(`delete checkCode pictures`);
          } else {
            console.log(`checkCode count: ${files.length}`);
          }
      });
})();

const writeCheckCode = async (Session_Val, body) => {
    await fs.writeFile(`static/img/${Session_Val}.gif`, body)
            // .then(() => {
            //     console.log(`manage to write gif: ${Session_Val}.gif`);
            // })
            .catch(err => {
                console.log('failed to write gif');
                throw err;
            });
};

const deleteCheckCode = (Session_Val) => {
    fs.unlink(`static/img/${Session_Val}.gif`)
        // .then(() => {
        //     console.log(`unlink file: ${Session_Val}.gif`);
        // })
        .catch(err => {
            console.log(`failed to unlink file: ${Session_Val}.gif`);
            // throw err;
        });
};

module.exports = {
    writeCheckCode,
    deleteCheckCode    
}