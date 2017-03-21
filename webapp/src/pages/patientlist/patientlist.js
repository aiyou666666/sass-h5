var $ = require("zepto");
var http = require('ajax');
var Selectlist = require('kami/selectlist');
var store = require("store");
var config = require('../config.js');
var query = require('query');

var item_tpl = require("../../mods/patientlist/patientlist.hbs");
var select_tpl = require("./selectlist.hbs");
var header_tpl = require("./header.hbs");

var url = '/server/patient/findPatientTopgradeForPage';
var patientUrl = '/server/patient/getDictionarys';

var isInfo = query.get().from == 'addorder' ? false : true;

var $list = $('#list');
var $selectlist = $('#seletList');
var gmain = $(".g-main").get(0);

var newDate = [];
var page = 1;

var total = 0;
var hasMore = true;

var today = new Date();
var year = today.getFullYear();
var month = today.getMonth() + 1;

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
var todayStr = year + toTwoDigit(month) + toTwoDigit(today.getDate());
var mondayStr = year + toTwoDigit(month) + toTwoDigit(today.getDate() - today.getDay() +1);
var sundayStr = year + toTwoDigit(month) + toTwoDigit(today.getDate() + (7 - today.getDay()));
var firstStr = year+ toTwoDigit(month) + '01';
var lastStr = year + toTwoDigit(month) + toTwoDigit(dayMap[today.getMonth() + 1]);

var newMonth = (month - 3 > 0) ? (month - 3) : (month - 3 + 13);
var newYear = (month - 3 > 0) ? year : year - 1;

var beforeStr = newYear + toTwoDigit(newMonth) + toTwoDigit(01) ;
var checkData = [{
		mc: '今天',
		zhzlrqfrom: todayStr + '000000',
		zhzlrqend: todayStr + '235959'
	}, {
		mc: '本周',
		zhzlrqfrom: mondayStr + '000000',
		zhzlrqend: sundayStr + '235959'
	}, {
		mc: '本月',
		zhzlrqfrom: firstStr + '000000',
		zhzlrqend: lastStr + '235959'
	}, {
		mc: '近三个月',
		zhzlrqfrom: beforeStr + '000000',
		zhzlrqend: todayStr + '235959'
	}];
var gradeData = []; //会员等级
var typeData = []; //患者分类

var _data = {
	"cxlx":"qbhz",
	"page": page
};

getRequire({
	url: url,
	$dom: $list,
	tpl: item_tpl,
	data: _data
});

setTabData();

function setTabData() {
	getTabData({
		"scbz":"0",
		"zdlxBm":"hzfl",
	}, $('.js-catalag'));
	getTabData({
		"scbz":"0",
		"zdlxBm": "hydj",
	}, $('.js-grade'));

}


// 获取tab数据 会员等级 && 患者分类
function getTabData(data, $dom) {
	http.post({
        url : patientUrl,
		data: JSON.stringify(data),
        contentType:"application/json",
        success: function(res) {
            if ( res.status == '0') {
				var data = res.data;
				if (data && data.length) {
					if ($dom.hasClass('js-grade')) {
						gradeData = data;
					} else {
						typeData = data;
					}
					return data;
				} else {
					$dom.find('.icon').remove();
					$dom.addClass('no-click');
					return {};
				}
            }
        }
    });
}

// 获取请求
function getRequire(params) {
	var url = params.url;
	var data = params.data;
	http.post({
        url : url,
		data: JSON.stringify(data),
        contentType:"application/json",
        success: function(res) {
            if ( res.status == '0') {
				$(".loading-wrapper").hide();
				var data = res.data;

				hasMore = (data.total - total - data.rows.length> 0) ? true : false;
				total = data.rows.length;
				if (params.data.page == 1) {
					$('header').html(header_tpl({
						total: data.total
					}));
					!isInfo && $('.m-header .js-submit').attr('href', $('.m-header .js-submit').attr('href') + '?from=addorder');

				}
				if (data && data.total) {
					$list.find('.no-result').remove();
					render(data.rows, params);
				} else {
					$('#list').html('<p class="no-result">没有匹配结果</p>');
				}
            }
        }
    });
}

// 渲染患者数据
function render(data, params) {
	params.$dom.append(params.tpl({
		items: dataProcess(data),
		isInfo: isInfo
	}));
}

// 数据处理
function dataProcess(data) {
	var len = data.length;
	var newDate = [];
	for (var i = 0; i < len; i ++) {
		var item = data[i];
		var dateBirth = item.csrq || '2016';
		newDate.push({
			name: item.xm,
			avatar: item.hztx || (item.xb == '1' ? config.defaultAvatarMale : config.defaultAvatarFemale),
			sex: item.xb == '1' ? '男' : '女',
			age: new Date().getFullYear() - dateBirth.substr(0,4),
			hzId: item.hzId,
			zhzlrq: item.zhzlrq ? (item.zhzlrq.substr(0,4) + '.' + item.zhzlrq.substr(4,2) + '.' + item.zhzlrq.substr(6, 2)) : '暂未约时间就诊'
		});
	}
	return newDate;
}

// 高级筛选交互
$('.m-listTap .flex-item').on('tap', function(e) {
	e.preventDefault();
	var that = $(this);
	if (!that.hasClass('no-click')) {
		if (that.hasClass('active')) {
			that.removeClass('active');
			$selectlist.hide();
		} else {
			$('.m-listTap .flex-item.active').removeClass('active');
			that.addClass('active');
			setSelectList(that);
		}
	}
});

$('.m-bottom-fixBtn').on('tap', function(e) {
	e.preventDefault();
	store.set('returnUrl', 'patientlist.html');
	window.location.href = 'addpatient.html';
});

/*患者详情 */
/*$(document).on("tap",".m-patientItem",function(e){
	    var hzId=$(this).attr("data-id");
	    window.location.href="/webapp/html/patientinfo.html?id="+hzId+"&from=patientlist"
});
*/
$selectlist.on('tap', 'li', function() {
	$('.m-listTap .flex-item.active').removeClass('active');
	$selectlist.hide();
	var type = $('#seletList ul').attr('data-value');
	var id = $(this).attr('data-value');
	var data = { page: page };
	page = 1;
	if (type == 'hydj' || type == 'hzfl') {
		data[type] = id;
	} else {
		data['hydj'] = id;
		data['zhzlrqfrom'] = $(this).attr('data-from');
		data['zhzlrqend'] = $(this).attr('data-end');
	}
	_data = data;
	getRequire({
		 url: url,
		 $dom: $list,
		 tpl: item_tpl,
		 data: _data
	});
	$('#list').html('');
});

function setSelectList($elem) {
	if ($elem.hasClass('js-time')) {
		setTabList({
			items: checkData,
			type: 'zhzlrq',
			isDate: true
		});
	} else if ($elem.hasClass('js-grade')) {
		setTabList({
			items: gradeData,
			type: 'hydj'
		});
	} else if ($elem.hasClass('js-catalag')) {
		setTabList({
			items: typeData,
			type: 'hzfl'
		});
	}

}
// 渲染 tab
function setTabList(data) {
	$selectlist.html(select_tpl(data)).show();
}
function stopPop(evt) {
  evt.stopPropagation();
}

// 下拉加载
var isLoading = false;
var isSwipe = false;
$('.flex').on('scroll', loadMoreList);
function loadMoreList() {
	 gmain.addEventListener("touchstart", stopPop, false);
	if ( !isLoading && hasMore && ($('.flex').height() - ($('.flex').offset().top + $('.flex').scrollTop()) < 100)  ) {
 	   isLoading = true;
 	   $(".loading-wrapper").show();
 	   setTimeout(function(){
 		   page ++;
		   _data.page ++ ;
 		   getRequire({
 				url: url,
 				$dom: $list,
 				tpl: item_tpl,
 				data: _data
 		   });
 		   isLoading = false;
 	   }, 1000);
    }
}
/**
 * 转换两位数
 * @param num
 * @returns {string}
 */
function toTwoDigit(num) { return num < 10 ? "0" + num : num; }
