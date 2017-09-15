
function updateWeekSel (num) {
    var $weekSel = $('#weekSel');
    var valStr = $weekSel.children('option:selected')
                         .prop('selected', false)
                         .val();
    var week = num ? parseInt(valStr) + num : 1;
    var optStr = 'option[value="' + week + '"]';
    $weekSel.children(optStr).prop('selected', true);
    return week;
}
function updateBtn (week) {
    if (week === 1) {
        $('#prevWeek').addClass('disabled').prop('disabled', true);
    } else if (week >= 2) {
        $('#prevWeek').removeClass('disabled').prop('disabled', false);
    }
    if (week <= 24) {
        $('#nextWeek').removeClass('disabled').prop('disabled', false);
    } else if (week === 25) {
        $('#nextWeek').addClass('disabled').prop('disabled', true);
    }
}
function updateTermSel ($defxnd, $defxqd, $xnd, $xqd) {
    $defxnd.prop('selected', false).removeAttr('data-sel');
    $defxqd.prop('selected', false).removeAttr('data-sel');

    $xnd.prop('selected', true).attr('data-sel', 'true');
    $xqd.prop('selected', true).attr('data-sel', 'true');

    console.log($defxnd.val() + ':' + $defxnd.prop('selected') + '\
    ' + $defxqd.val() + ':' + $defxqd.prop('selected') + '\
    ' + $xnd.val() + ':' + $xnd.prop('selected') + '\
    ' + $xqd.val() + ':' + $xqd.prop('selected'));
}
function show (JSON, week) {
    $('td[rowspan="2"]').html('<p></p><p></p><p></p>').css('background-color', '');
    for (key in JSON) {
        if (!JSON.hasOwnProperty(key)) {
            continue;
        }
        var obj = JSON[key];
        var singleOrDouble = week % 2 === 1 ? 1 : 2;
        if (!obj.weekInfo || singleOrDouble === obj.weekInfo) {
            if (week >= obj.startWeek && week <= obj.endWeek) {
                $('#r' + obj.beginSection + 'c' + obj.dayOfWeek)
                .html('<p>' + (obj.name || '') + '</p><p>' 
                        + (obj.teacher || '') + '</p><p>' 
                        +  (obj.classroom || '') + '</p>'
                    )
                .css('background-color', '#ddd');
            }
        }
    }
}

$(function() {
    show(timetableJSON, 1);
    $('#weekSel').change(function() {
        var week = parseInt($(this).children('option:selected').val());//selected值
        show(timetableJSON, week);
        updateBtn(week);
    });
    $('#prevWeek').click(function() {
        var week = updateWeekSel(-1);
        show(timetableJSON, week);
        updateBtn(week);
    });
    $('#nextWeek').click(function() {
        var week = updateWeekSel(1);
        show(timetableJSON, week);
        updateBtn(week);
    });
    $('#refresh').click(function() {
        updateWeekSel(0);
        show(timetableJSON, 1);
        updateBtn(1);
    });
    $('#shift').click(function() {
        var $shift = $(this).prop('disabled', true);
        var $defxnd = $('#xnd option[data-sel="true"]');
        var $defxqd = $('#xqd option[data-sel="true"]');
        var $xnd = $('#xnd option:selected');
        var $xqd = $('#xqd option:selected');
        $.ajax(shiftUrl, {
            async: false,
            type: 'GET',
            data: {
                uri: subdoc.uri,
                __VIEWSTATE: subdoc.__VIEWSTATE,
                xnd: $xnd.val(),
                xqd: $xqd.val(),
                defxnd: $defxnd.val(),
                defxqd: $defxqd.val(),
                line: main.line
            },
            success: function (res) {
                if (!res) {
                    console.log('not modified');
                    return;
                }
                updateWeekSel(0);
                show(res.timetableJSON, 1);
                updateBtn(1);
                updateTermSel($defxnd, $defxqd, $xnd, $xqd);
                timetableJSON = res.timetableJSON;
                subdoc.__VIEWSTATE = res.__VIEWSTATE || subdoc.__VIEWSTATE;
                $shift.prop('disabled', false);
            },
            error: function (jqXHR, textStatus, errText) {
                alert(errText);
            }
        });
    });
});