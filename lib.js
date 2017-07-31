
const cheerio = require('cheerio');

const toWeekNum = char => {
    switch (char) {
        case '一': return 1;
        case '二': return 2;
        case '三': return 3;
        case '四': return 4;
        case '五': return 5
        case '六': return 6;
        case '日': return 7;
        default: throw new Error('toWeekNum err');
    }
}

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
                                    // console.log(weekInfo[0]);
                                    course.weekInfo = weekInfo[0].slice(1);
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

module.exports = {
    getTimetableJSON,
    getSelectOpts
};