const cheerio = require('cheerio');

const isString = val => {
    return typeof val === 'string';
};

const toWeekNum = char => {
    switch (char) {
        case '一': return 1;
        case '二': return 2;
        case '三': return 3;
        case '四': return 4;
        case '五': return 5;
        case '六': return 6;
        case '日': return 7;
        default: return 0;
    }
};

const parseWeekInfo = weekInfo => {
    const char = weekInfo[0].slice(1);
    // console.log(char);
    switch (char) {
        case '单周': return 1;
        case '双周': return 2;
        default: return 0;
    }
};

const checkSessionVal = Session_Val => {
    return isString(Session_Val) && Session_Val.search(/^\w{24}$/) !== -1;
};

const checkForm = ({ID, password, checkCode, line}) => {
    let err = false, msg = '';
    if (!isString(ID) || ID.search(/^\d{12}$/) === -1) {
        err = true;
        msg = `ID is invalid: ${ID}`;
    } else if (!isString(password) || password === '') {
        err = true;
        msg = `password is invalid: ${password}`;
    } else if (!isString(checkCode) || checkCode.search(/^\w{4}$/) === -1) {
        err = true;
        msg = `checkCode is invalid: ${checkCode}`;
    } else if (!isString(line) || line.search(/^[0-9]{1}$/) === -1) {
        err = true;
        msg = `line is invalid: ${line}`;
    }
    return { err, msg };
};

const getTimetableJSON = $ => {
    const $table = $('#Table1');
    let timetableJSON = {},
        length = 0;
    $table.find('tr').each((i, tr) => {
        if (i === 0 || i === 1) {
            return;
        }
        // console.log(`${i} : ${tr}`);
        // 对每个 td 进行操作
        $(tr).children().each((n, td) => {
            if (n === 0) {
                return;
            }
            const $td = $(td),
                  courseBase = {
                      beginSection : i - 1,
                      sectionNum : parseInt($td.attr('rowspan'))
                  };
            let course = Object.assign({}, courseBase);
            // console.log($td.html());
            if ($td.attr('rowspan')) {
                let count = 0;
                $td.find('br').each((k, br) => {
                    if (br.prev.data) {
                        // console.log($br.prev.data);
                        switch ((k - count) % 4) {
                            case 0:
                                course.name = br.prev.data;
                                break;
                            case 1:
                                // 字符串处理提取 起始周，结束周，周几上课 的信息
                                const weekMSG = br.prev.data,
                                      duration = weekMSG.slice(weekMSG.indexOf('{')),
                                      reg = /\d{1,2}-{1}\d{1,2}/,
                                      startWeekString = duration.match(reg)[0].split('-')[0],
                                      endWeekString = duration.match(reg)[0].split('-')[1];
                                // console.log(`${duration} -> ${duration.match(reg)}`);
                                course.dayOfWeek = toWeekNum(weekMSG.charAt(1));
                                course.startWeek = parseInt(startWeekString);
                                course.endWeek = parseInt(endWeekString);
                                // 处理可能出现的其它信息如 单双周 情况
                                const weekInfo = duration.match(/\|\S+周/);
                                if (weekInfo) {
                                    course.weekInfo = parseWeekInfo(weekInfo);
                                }
                                break;
                            case 2:
                                course.teacher = br.prev.data;
                                // console.log(br.next.data);
                                course.classroom = br.next ? br.next.data : void(0);
                                break;
                            case 3:
                                course.classroom = br.prev.data || '';
                                timetableJSON[++length] = course;
                                course = Object.assign({}, courseBase);
                                break;
                            default:
                                console.log(`k 值异常：${k}`);
                        }
                    } else {
                        count++;
                    }
                });
                timetableJSON[++length] = course;
            }
        });
    });
    return timetableJSON;
};

const getSelectOpts = $select => {
    return $select.children().map((i, op) => ({
        val: op.attribs.value,
        sel: (op.attribs.selected ? op.attribs.selected : void(0))
    })).toArray();
};

const getdocData = ($, timetableUri) => ({
    // 查询课表 选项数据
    docData: {
        __VIEWSTATE :   $('input[name="__VIEWSTATE"]').val(),
        xnd         :   getSelectOpts($('#xnd')),
        xqd         :   getSelectOpts($('#xqd')),
        uri         :   timetableUri
    },
    // 用户数据
    userData: {
        id          :   $('#Label5').text(), // 学号
        name        :   $('#Label6').text(), // 姓名
        institute   :   $('#Label7').text(), // 学院
        major       :   $('#Label8').text(), // 专业
        class       :   $('#Label9').text(), // 班级
    }
});

module.exports = {
    checkSessionVal,
    checkForm,
    getTimetableJSON,
    getdocData
};