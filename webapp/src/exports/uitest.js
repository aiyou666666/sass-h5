var Calendar = require("kami/calendar")
window.Kami.disableTapEvent = true;


var options = {
    container: '#calendar',
    // now: '2015-03-03',  // 非必填，默认当前时间
    dateRange: ['2015-03-02', '2020-12-31']  // 非必填，默认当前日期至10年后
};
var calendar = new Calendar(options);
calendar.render();
