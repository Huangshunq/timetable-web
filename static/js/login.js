$(function() {
    $('#defaultForm').bootstrapValidator({
        live: 'submitted',
        trigger: 'blur keyup',
        feedbackIcons: {
            valid: 'glyphicon glyphicon-ok',
            invalid: 'glyphicon glyphicon-remove',
            validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
            ID: {
                validators: {
                    notEmpty: {
                        message: '学号不能为空'
                    },
                    stringLength: {
                        min: 12,
                        max: 12,
                        message: '学号位数须为12位'
                    },
                    regexp: {
                        regexp: /^[0-9]+$/,
                        message: '学号只能由数字组成'
                    }
                }
            },
            password: {
                validators: {
                    notEmpty: {
                        message: '密码不能为空'
                    }
                }
            },
            checkCode: {
                validators: {
                    notEmpty: {
                        message: '验证码不能为空'
                    },
                    regexp: {
                        regexp: /^[a-zA-Z0-9]+$/,
                        message: '验证码只能由数字、大小写字母组成'
                    },
                    stringLength: {
                        min: 4,
                        max: 4,
                        message: '请输入4个字符'
                    }
                }
            },
            line: {
                validators: {
                    notEmpty: {
                        message: '请选择线路'
                    }
                }
            }
        }
    })// 提交表单
    .on('success.form.bv', function(e) {
        e.preventDefault();
        var ID = $('input[name="ID"]').val(),
            form = $('#defaultForm')[0];
        form.action = '/' + ID + '/home';
        form.submit();
    });

    $('input[name="line"]').click(function() {
        var $checkCode = $('input[name="checkCode"]').prop('disabled', true);
        var $radio = $('input[name="line"]')
                        .filter(':not([data-closed])')
                        .prop('disabled', true);
        var that = this;
        $.ajax({
            type: 'GET',
            url: '/changeLine',
            data: {
                line: that.value
            },
            success: function(json) {
                $('#checkCode').prop('src', json.src);
                $checkCode.val('').prop('disabled', false);
                $radio.prop('disabled', false);
                $('#defaultForm').data('bootstrapValidator').revalidateField('checkCode');
            },
            error: function(jqXHR, textStatus, errText) {
                console.log(errText);
                $checkCode.prop('disabled', false);
                $radio.prop({
                    "disabled": false,
                    "checked": false
                });
                $(that).prop('disabled', true).attr('data-closed', 'true');
            }
        });
    });

    // 手动验证
    $('#validateBtn').click(function() {
        $('#defaultForm').bootstrapValidator('validate');
    });
    // 重置
    $('#resetBtn').click(function() {
        $('#defaultForm').data('bootstrapValidator').resetForm(true);
    });
});