var $ = require("zepto");
var http = require('ajax');
var Selectlist = require('kami/selectlist');
var query = require('query');
var config = require('../config.js');

var item_tpl = require("../../mods/patientlist/patientlist.hbs");

var $list = $('#list');
var url = '/server/patient/findPatientList';
var isInfo = query.get().from == 'addorder' ? false : true;

!isInfo && $('.m-header .regret').attr('href', 'patientlist.html?from=addorder');

var searchHander = null;
$('.js-search').on('input', function() {
	clearTimeout(searchHander);
	var inputVal = $.trim($(this).val());
	var len = inputVal.length;
	if (len) {
		$('.js-delete').show();
		searchHander = setTimeout(function() {
			setList({
				"cxlx":"qbhz",
				"gjz": inputVal
			});
		}, 300);
	} else {
		$('.js-delete').hide();
		$list.html('');
	}
});

$('.js-delete').on('tap', function() {
	$('.js-search').val('');
	$(this).hide();
	$('.js-delete').hide();
	$list.html('');
});

// 获取患者列表
function setList(data) {
	http.post({
        url: url,
		data: JSON.stringify(data),
        contentType:"application/json",
        success: function(res) {
            if ( res.status == '0') {
				var data = res.data;
				if (data && data.length) {
					$list.find('.no-result').remove();
					$list.html(item_tpl({
						items: dataProcess(data),
						isInfo: isInfo
					}));
				} else {
					$list.html('');
					$list.html('<p class="no-result">未搜索到匹配结果</p>');
				}
            }
        }
    });
}

// 数据处理
function dataProcess(data) {
	var len = data.length;
	var newDate = [];
	for (var i = 0; i < len; i ++) {
		var item = data[i];
		var dateBirth = item.csrq || '2016';
		newDate.push({
			hzId: item.hzId,
			name: item.xm,
			avatar: item.hztx || (item.xb == '1' ? config.defaultAvatarMale : config.defaultAvatarFemale),
			sex: item.xb == '1' ? '男' : '女',
			age: new Date().getFullYear() - dateBirth.substr(0,4),
			zhzlrq: item.zhzlrq ? (item.zhzlrq.substr(0,4) + '.' + item.zhzlrq.substr(4,2) + '.' + item.zhzlrq.substr(6, 2)) : item.zhzlrq
		});
	}
	return newDate;
}
