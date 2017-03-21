var $ = require('zepto');
var _ = require('lodash');
var http = require('ajax');
var tip = require("kami/tip");
var store = require("store");

var tmplText = $('#calendar-tmpl').text();
var stplText = $('#schedule-tmpl').text();
var compiled = _.template(tmplText);
var scompiled = _.template(stplText);
var now = new Date();
var year = now.getFullYear();
var month = now.getMonth() + 1;
var day = now.getDate();

var today;

var firstDay = year + '/' + toTwoDigit(month) + '/01';
var start = year  + toTwoDigit(month) + '01'

var blank = new Date(firstDay).getDay();

var dayMap = {
    '1': 31,
    '2': year % 4 == 0 ? 29 : 28,
    '3': 31,
    '4': 30,
    '5': 31,
    '6': 30,
    '7': 31,
    '8': 31,
    '9': 30,
    '10': 31,
    '11': 30,
    '12': 31
};
var days = dayMap[month];
var lastDay =  year + toTwoDigit(month) + toTwoDigit(days);
var date = {
    'data' : {
        year: year,
        blank : blank,
        month : toTwoDigit(month),
        days: days,
        today: toTwoDigit(day),
        hours: [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23]
    }
};

var doctorName = store.get('ysmc') || '';


getItems();

/**
 * 解析模板
 * @param date
 */
function setCalendarData(date) {

    $('.calendar-wrapper').html('');
    var compiledHtml = compiled(date);
    $('.calendar-wrapper').html(compiledHtml);
    $('.title-bar .name').text(doctorName);
    if (date.data.today == toTwoDigit(now.getDate())) {
        today = $('.today-light');
    }
}
function setScheduleData(date) {
    $('#schedule').html('');
    var compiledHtml = scompiled(date);
    $('#schedule').html(compiledHtml);
    var timeLine = $('.timeline');
    var len = timeLine.length;
    for (var i = 0;i < len; i++) {
        if (!$(timeLine[i]).next().length) {
            $(timeLine[i]).addClass('no-item');
        }
    }
}

/**
 * 显示日历
 */
function showCalendar() {
    $('.today-light').removeClass('today-light');
    today.addClass('today-light');
    $('ul.date-wrapper').show();
    $('#schedule').hide();
    $('.title-bar span').css('visibility', 'visible');

}

/**
 * 显示日程
 * @param $elem 当前日期元素
 */
function showSchedule($elem) {
    var list = $elem.parent();
    var size = parseInt($('html').css('font-size'));
    $('.today-light').removeClass('today-light');
    $elem.addClass('today-light');
    $('ul.date-wrapper').hide();
    $('#schedule').show();
    $('.schedule-list.pm').hide();
    list.show();
    $('.title-bar span').css('visibility','hidden');
    focusSchedule($('.schedule-list.am'));
    $('.schedule-list').css('height', ($(window).height() - 50 - 153 - 60)/size + 'rem' );

}

/**
 * 获取当日日程
 * @param dates
 */
function getSchedule(dates,$elem) {
    var url = '/server/appointWx/findApointByDateWx';
    http.post({
        url: url,
        data: JSON.stringify({
            yyksrq: dates + '000000',
            yyjsrq: dates + "235959"
        }),
        success: function(res){
            if (res.status == "0") {
                var data = res.data;
                var len = data.length;
                date.data.schedule = [];
                if (len) {
                    for (var i = 0; i < len; i ++ ) {
                        var apptTimeBegin = new Date(data[i].apptTimeBegin);
                        var apptTimeEnd = new Date(data[i].apptTimeEnd);
                        var item = [];
                        if (data[i].items) {
                            var itemsList = data[i].items;
                            var itemLen = itemsList.length;
                            for (var j = 0; j < itemLen; j++)  {
                                item.push({'dictName': mapItem[itemsList[j]]});
                            }
                        }
                        date.data.schedule.push( {
                            'hour': toTwoDigit(apptTimeBegin.getHours()),
                            'min': toTwoDigit(apptTimeBegin.getMinutes()),
                            'items':  item,
                            'apptTimeBegin': toTwoDigit(apptTimeBegin.getHours()) + ':' + toTwoDigit(apptTimeBegin.getMinutes()),
                            'apptTimeEnd': toTwoDigit(apptTimeEnd.getHours()) + ':' + toTwoDigit(apptTimeEnd.getMinutes()),
                            'isTimeOut': now.getTime() - apptTimeBegin.getTime() > 0 ? true : false,
                            'patientId' : data[i].patientId || '',
                            'apptId': data[i].apptId || '',
                            'patientName': data[i].patientName || ''
                        });

                    }
                }
                if ($elem) {
                    if ($elem.hasClass('today') ) {
                        if (toTwoDigit(now.getMonth()+1) != month) {
                            year = now.getFullYear();
                            month = now.getMonth() + 1;
                            day = now.getDate();
                            date.data.days = dayMap[month];
                            date.data.month = toTwoDigit(month);

                            start = year + date.data.month + '01';
                            lastDay =  year + date.data.month + toTwoDigit(date.data.days);
                            firstDay = year + '/' + date.data.month + '/01';
                            date.data.blank = new Date(firstDay).getDay();
                            date.data.year = year;
                            date.data.today = toTwoDigit(day);
                            setCalendar();
                        } else {

                            setScheduleData(date);
                            if ($('#schedule').css('display') == 'block') {
                                showSchedule(today);
                            } else {
                                showSchedule($('.today-light'));
                            }

                        }
                    } else {
                        setScheduleData(date);
                        // $('.schedule-list').css('height', ($(window).height() - 50 - 153 - 60)/50 + 'rem' );

                        showSchedule($elem);
                    }

                } else {
                    setScheduleData(date);
                    // $('.schedule-list').css('height', ($(window).height() - 50 - 153 - 60)/50 + 'rem' );

                    showSchedule($('.today-light'));
                }

            }
        },
        //调用出错执行的函数
        error: function(){
            alert("======出错了");
        }
    });
}

/**
 * 获取当月日程
 * @type {Array}
 */

function setCalendar(isMonthType) {
    var url = '/server/appointWx/findAppointDayNumWx';
    http.post({
        url: url,
        data: JSON.stringify({
            yyksrq : start + '000000',
            yyjsrq : lastDay + '000000'
        }),
        success: function(res) {
            var scheduleList = [];
            if (res.status == "0") {
                var data = res.data;
                if (data) {
                    var len = data.length;

                    if (len) {
                        for (var i = 0; i < len; i++) {
                            scheduleList.push(data[i]);
                        }

                    }
                }
                date.data.scheduleList = scheduleList;

                setCalendarData(date);
                if (!isMonthType) {
                    getSchedule('' + year + toTwoDigit(month) + toTwoDigit(day));
                }
                isLoading = false;
            } else {

                tip.show({
    				content: res.desc
    			});
            }
        },
        //调用出错执行的函数
        error: function(){
            isLoading = false;
            alert("======出错了");
        }
    });
}

/**
 * 自动滑动到最早的日程
 * @param $elem
 */
function focusSchedule($elem) {
    $('.schedule-list').scrollTop(0);
    if ($elem.find('.focus').length) {
        var focus = $elem.find('.focus');
        $elem.scrollTop(focus.offset().top - $elem.offset().top);
    }
}
var mapItem = {};


function getItems() {
    var url = '/server/appointWx/findYyItemWx';
    http.post({
        url: url,
        data: JSON.stringify({}),
        success: function(data){
            var datas = data;
            var result = datas.status;
            if (result == "0") {
                var len = datas.data.length;
                for (var i = 0; i < len; i ++) {
                    mapItem[datas.data[i].dictCode] = datas.data[i].dictName;
                }
                setCalendar(true);
            } else {

                tip.show({
    				content: data.desc
    			});
            }
        },
        //调用出错执行的函数
        error: function(){
            alert("======出错了");
        }
    });
}



/**
 * 转换两位数
 * @param num
 * @returns {string}
 */
function toTwoDigit(num) { return num < 10 ? "0" + num : num; }

/**
 * 点击日期，日程显示时候只请求日程
 * 日历时，设置日程，请求日程
 */
var isLoading = false;
$('.wrapper').on('tap', '.data', function(e) {
    e.preventDefault();


    getSchedule($(this).attr('data-value'), $(this));

}).on('tap', '.icon-calendar', function(e) {
    e.preventDefault();
    if ($('#schedule').css('display') == 'block') {
        showCalendar();
    } else {
        getSchedule(today.attr('data-value'), $('.today'));
    }

}).on('tap', '.time-tab .tab', function(e) {
    e.preventDefault();
    var that = $(this);
    $('.time-tab .active').removeClass('active');
    that.addClass('active');
    if ($(this).hasClass('pm')) {
        $('.schedule-list').hide();
        $('.schedule-list.pm').show();
        focusSchedule($('.schedule-list.pm'));
    } else {
        $('.schedule-list').hide();
        $('.schedule-list.am').show();
        focusSchedule($('.schedule-list.am'));
    }
}).on('tap', '.today', function(e) {
    e.preventDefault();
    getSchedule(today.attr('data-value'), $(this));

}).on('tap', '.icon-arrow-right-border', function() {
    if (!isLoading) {
        isLoading = true;
        if (month == 12) {
            month = 1;
            year = year + 1;
        } else {
            month = month + 1;
        }
        date.data.days = dayMap[month];
        date.data.month = toTwoDigit(month);

        start = year + date.data.month + '01';
        lastDay =  year + date.data.month + toTwoDigit(date.data.days);
        firstDay = year + '/' + date.data.month + '/01';
        date.data.blank = new Date(firstDay).getDay();
        date.data.year = year;
        if (year == now.getFullYear() && month == (now.getMonth() + 1)) {
            date.data.today = toTwoDigit(now.getDate());
        } else {
            date.data.today = 0;
        }

        setCalendar(true);
    }

}).on('tap', '.icon-arrow-left-border', function() {
    if (month == 1) {
        month = 12;
        year = year - 1;
    } else {
        month = month - 1;
    }

    date.data.days = dayMap[month];
    date.data.month = toTwoDigit(month);
    date.data.year = year;
    start = year + date.data.month + '01';
    lastDay =  year + date.data.month + toTwoDigit(date.data.days);
    firstDay = year + '/' + date.data.month + '/01';
    date.data.blank = new Date(firstDay).getDay();
    if (year == now.getFullYear() && month == (now.getMonth() + 1)) {
        date.data.today = toTwoDigit(now.getDate());
    } else {
        date.data.today = 0;
    }

    setCalendar(true);

}).on('tap', '.schedule-item.focus', function() {
    window.location.href = "orderdetail.html?appid=" + $(this).attr('data-id');
});
