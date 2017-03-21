var $ = require('zepto');
var http = require('ajax');
var store = require('store');
var config = require('../config.js');
var tip=require("kami/tip");

var order_tpl = require('./order.hbs');
var patient_tpl = require('./patientmanager.hbs');
var work_tpl = require('./workmanager.hbs');
var user_tpl = require('./user.hbs');

var $order= $('#order');
var $patient = $('#patient');
var $work = $('#work');

var storeInfo = store.get();

// 用户信息
$('#user').html(user_tpl({
    userName: storeInfo.ysmc,
    userAvatar: storeInfo.jgtx || config.defaultAvatarMale
}));

// 患者管理信息
setDom({
    url: '/server/patient/findTodayCount',
    $dom: $patient,
    tpl: patient_tpl,
    data: {}
}, function(data) {
    data['month'] = new Date().getMonth() + 1;
    render({
        $dom: $patient,
        tpl: patient_tpl,
    }, data);
    render({
        tpl: order_tpl,
        $dom: $order,
    }, {'dqyy': data.dqyy});
});

// 业务信息
var today = new Date();
var todayStr = today.getFullYear() + '-' + toTwoDigit(today.getMonth() + 1);
setDom({
    url: '/server/busi/findFistPageBusi',
    $dom: $work,
    tpl: work_tpl,
    data: {
       "timeType": "2",
       "checkTime": todayStr
    }
}, function(data) {
    render({
        $dom: $work,
        tpl: work_tpl,
    }, data);
});

// 发送请求
function setDom(params, fuc) {
    var url = params.url;
    var $dom = params.$dom;
    var tpl = params.tpl;
    var data = params.data;
    http.post({
        url : url,
        data: JSON.stringify(data),
        contentType:"application/json",
        success: function(res) {
            if ( res.status == 0) {
                fuc(res.data);
            }
        }
    });
}
//切换账号
/*$(document).on("tap",".js-qiehuan",function(){
	 store.clear();
	window.location.href="/webapp/html/login.html";
});*/

// 渲染页面
function render(params, data) {
    var $dom = params.$dom;
    var tpl = params.tpl;
    $dom.html(tpl(data));
}

/**
 * 转换两位数
 * @param num
 * @returns {string}
 */
function toTwoDigit(num) { return num < 10 ? "0" + num : num; }
