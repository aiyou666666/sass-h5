var $ = require("zepto");
var http = require("ajax");
var tip = require("kami/tip");
var loading = require("kami/loading");
var Calendar = require('kami/popcalendar');
var store = require("store");
require("../../exports/common.js");
var addorder_tpl = require("./addorder.hbs");
var editorder_tpl = require("./editorder.hbs");
var Popselect = require("kami/popselect");
var confirm = require("kami/confirm");
var query = require('query');
var validate = require("validate");
var Handlebars = require("hbsfy/runtime");
/*获取对象属性值 */
Handlebars.registerHelper("getobjVal", function(obj) {
	var value;
	for(index in obj) {
		value = obj[index];
	}
	return value;
});
Handlebars.registerHelper("getobjKey",function(obj){
	var key;
	for(currKey in obj){
		key=currKey;
	}
	
	return key;
	
});

$(function() {
	var $container = $("#container");
	var $yuyueDate, $matterlist, $yuyueVal, $timeRange, $timeRangeVal,
		$sex, $sexVal, $ageVal, $patientName, hasval = [],
		$bookingRemark, $yuyueTime, $showTime, $noticeMsg,
		$doctorName, $patientPhone, isSubmit = false;
	var currDate = new Date();
	var currTime = currDate.getFullYear() + "-" +((currDate.getMonth() + 1) > 10 ? (currDate.getMonth() + 1) : "0"+(currDate.getMonth() + 1)) + "-" + (currDate.getDate() > 10 ? currDate.getDate() : "0" + currDate.getDate());
	$container.append(addorder_tpl());

	function init() {
		$yuyueDate = $("#yuyueDate"); //预约日期
		$yuyueTime = $("#yuyueTime"); //预约时间
		$showTime = $("#showTime"); //展示时间
		$matterlist = $(".matter-list"); //预约事项
		$yuyueVal = $("#yuyueVal"); //预约类型
		$timeRange = $(".js-timeRange");
		$timeRangeVal = $(".timeRangeVal"); //预约时长
		$sex = $(".js-sex");
		$sexVal = $(".sexVal"); //患者性别
		$ageVal = $(".ageVal"); //患者年龄
		$patientName = $(".patientName"); //患者姓名
		$patientPhone = $(".patientPhone"); //患者手机号
		$bookingRemark = $(".bookingRemark"); //备注
		$doctorName = $(".doctorName"); //医生姓名
		$noticeMsg = $(".noticeMsg");
	}
	//初始化dom
	init();
	$(document).on("tap", ".js-getPatient", function() {
		window.location.href = "../html/patientlist.html?from=addorder"
	});

	//如果用用户id自动填充用户信息
	var hzid = query.get().id || "";
	var editOrder = query.get().editOrder || ""
	var apptId = query.get().appid || ""
	hzid && (function(hzid) {
		http.post({
			url: "/server/patient/findPatientById",
			data: JSON.stringify({
				"hzId": hzid
			}),
			success: function(res) {

				if(!res.data) {
					tip.show({
						content: res.desc
					});
					return;
				}
				var data = transfromData(res.data);
				$container.empty().append(addorder_tpl(data));
				/*重新获取dom */
				init();

			},
			error: function(error) {
				console.log(error);

			}
		});
	})(hzid);

	/*获得预约信息*/
	editOrder && (function(apptId) {
		http.post({
			url: "/server/appointWx/findAppointByIdWx",
			data: JSON.stringify({
				"apptId": apptId
			}),
			success: function(res) {

				console.log(res.data);
				if(!res.data) {
					tip.show({
						content: res.desc
					});
					return;
				}
				var data = transfromEditData(res.data);
				$container.empty().append(editorder_tpl(data));
				hzid = data.patientId;
				/*重新获取dom */
				init();

			},
			error: function(error) {
				console.log(error);

			}
		});

	})(apptId);

	/*添加预约*/
	$(document).on("tap", ".js-addorder", function() {
		if(isSubmit) return;
		var insertData = {};
		var orderData = {
			'apptId':{
				key:"预约id",
				value:apptId || ''
			 },
			'patientId': {
				key: "患者信息",
				value: hzid
			}, //患者id
			'patientName': {
				key: "患者姓名",
				value: $patientName.val()
			}, //患者姓名
			'patientAge': {
				key: "患者年龄",
				value: $ageVal.val()
			},
			'patientMobile': {
				key: '患者手机号',
				value: $patientPhone.val()
			}, //患者电话
			'patientGender': {
				key: '患者性别',
				value: $sexVal.val() == '男' ? '1' : '2'
			}, //患者性别
			'doctorId': {
				key: '预约医生',
				value: $doctorName.attr("data-id") || "" 
			},
			'apptTimeBegin': {
				key: '预约日期',
				value: ($yuyueDate.val()).split('-').join('')
			}, //预约日期
			'yuyueTime': {
				key: '预约时间',
				value: $yuyueTime.val().split(':').join('')
			},
			'duration': {
				key: '预约时长',
				value: $timeRangeVal.attr("data-val")
			}, //预约时长
			'items': {
				key: '预约事项',
				value: (function($matterlist) {
					var itemvalue = [];
					$matterlist.find('li').length > 0 && $matterlist.find('li').each(function(index, curr) {
						itemvalue.push($(curr).find(".item-val").attr("data-val"));
					});
					itemvalue = itemvalue.length > 0 ? itemvalue : '';
					return itemvalue;
				})($matterlist)
			}, //预约事项
			'remark': {
				key: '备注',
				value: $bookingRemark.val()
			} //备注
		};
		/*拼接日期 */
		orderData.apptTimeBegin.value = orderData.apptTimeBegin.value + "" + orderData.yuyueTime.value + "00";
		/*判断非空*/
		for(order in orderData) {
			if(order == "patientMobile") {
				if(!validate.isMobile(orderData[order].value)) {
					tip.show({
						content: "请填写正确格式的手机号"
					});
					return;
				}
			}
			//备注选填
		    if(order!="apptId"){	
			if(order != "remark" && orderData[order].value == '') {
				tip.show({
					content: "请填写" + orderData[order].key
				});

				return;
			}
		  }	
			if(orderData[order].key != '预约时间') {
				insertData[order] = orderData[order].value;
			}
		}
		isSubmit = true;
		//添加预约
		http.post({
			url: "/server/appointWx/savePatientAppointWx",
			data: JSON.stringify(insertData),
			success: function(res) {
				isSubmit = false;
				tip.show({
					content: res.desc
				});
				if(res.status == 0) {
					window.location.href = "/webapp/html/index.html";
				}
			},
			error: function(error) {
				isSubmit = false;
			}
		});

	});
	/*预约日期*/
	$(document).on("tap", ".js-yuyuetime", function() {
		var options = {
			container: '#container',
			extraClass: 'yo-dialog-select',
			frmateKey: "date", //按年 按月份 按日期
			duration: 0.2,
			displayCount: 5
		};
		var calendar = new Calendar(options);
		calendar.show();
		calendar.on('ok', function(hide) {
			var val = calendar.getValue();
			var now = [];
			val.year && now.push(val.year.value);
			val.month && val.month.value + 1 >= 10 ? now.push(val.month.value + 1) : now.push('0' + (val.month.value + 1));
			val.date && val.date.value >= 10 ? now.push(val.date.value) : now.push('0' + (val.date.value));
			$yuyueDate.empty().val(now.join('-'));
			$yuyueTime.removeAttr("readonly");
			calendar.destroy();
		})
		calendar.on('cancel', function(hide) {
			calendar.destroy();
		});

	});
	//限制时间
	$(document).on("tap", "#yuyueTime", function() {
		var isreadyOnly = $(this).prop("readonly");
		if(isreadyOnly) {
			tip.show({
				content: "请先选择日期"
			});
			return;
		}
		var yuyueDateVal = $yuyueDate.val();

	});
	//限制时间选择
	$(document).on("change", "#yuyueTime", function() {
		var yuyueDateVal = $yuyueDate.val();
		
		var _thisVal = $(this).val();
		var transVal=$(this).val().split(":").join("");
		var newdate = new Date();
		var rangTime = ["2359","759"];
		if(yuyueDateVal == currTime) {
			var nowTime = newdate.getHours() +""+ newdate.getMinutes();
			if(parseInt(transVal) < parseInt(nowTime)) {
				tip.show({
					content: "预约时间不能小于当前"
				});
				$(this).val("");
				$showTime.val("")
				return;
			  }
			}
			if(parseInt(transVal) < parseInt(rangTime[0]) && parseInt(transVal) > parseInt(rangTime[1])) {
				$showTime.val(_thisVal);
			} else {
				tip.show({
					content: "24:00到8:00不能预约"
				});
				$(this).val("");
				$showTime.val("");
				return;

		}

	});
	/*添加事项*/
	$(document).on("tap", ".add-matter", function() {
		var datasource = [{
			key: 'matter',
			datasource: [],
			value: 1,
			tag: ''
		}];
		var _datasource = getshixiang();
		for(index in _datasource) {
			var obj = {};
			obj.text = _datasource[index].dictName;
			obj.value = _datasource[index].dictCode;
			datasource[0].datasource.push(obj);
		}
		initPopSelect(datasource, function(val, key) {
			if(val == "请选择") return;
			if(hasval.indexOf(val) != -1) return;
			$matterlist.append("<li><span class='del-item fl'><i></i></span> <span class='item-val fr' data-val=" + key + "> " + val + "</span></li>");
			hasval.push(val);
			$noticeMsg.hide();

		});
	});
	/*删除事项*/
	$(document).on("tap", ".del-item", function() {

		var $thisMsg = $(this).parent().find(".item-val ").html();
		for(var i = 0; i < hasval.length; i++) {
			if($.trim(hasval[i]) == $.trim($thisMsg)) {
				delete hasval[i];
				hasval.length = hasval.length - 1;
			}

		}
		$(this).parent().remove();
		if(hasval.length == 0) $noticeMsg.show();
	});

	/*预约时长*/
	$(document).on("tap", ".js-timeRange", function() {
		var datasource = [{
			key: 'matter',
			datasource: [{
				text: '30分钟',
				value: 0.5
			}, {
				text: '60分钟',
				value: 1
			}, {
				text: '90分钟',
				value: 1.5
			}, {
				text: '120分钟',
				value: 2
			}, ],
			value: 1,
			tag: ''
		}];
		initPopSelect(datasource, function(val, key) {
			$timeRangeVal.empty().html(val).attr("data-val", key);
		});

	});
	/*选择医生*/
	$(document).on("tap", ".doctorName", function() {
		var $type = $(this).attr("data-val");
		userlist = getUserByJob($type);
		var datasource = [{
			key: 'matter',
			datasource: [],
			value: 1,
			tag: ''
		}];
		for(user in userlist) {
			var obj = {};
			obj.text = userlist[user].xm;
			obj.value = userlist[user].yh_id;
			datasource[0].datasource.push(obj);
			obj = null;
		};
		console.log("医生");
		console.log(userlist);
		//初始化滑动框
		initPopSelect(datasource, function(val,id) {
			//获取值
			$(".doctorName").val(val).attr("data-id",id);

		});
	});
	//预约类型
	/*$(document).on("tap", ".yuyueType", function() {
		var datasource = [{
			key: 'matter',
			datasource: [{
				text: '初诊',
				value: 0
			}, {
				text: '复诊',
				value: 1
			}, ],
			value: 1,
			tag: ''
		}];
		initPopSelect(datasource, function(val) {
			$yuyueVal.empty().html(val);
		});

	});*/
	/*选择性别*/
	$(document).on("tap", ".js-sex", function() {
		var datasource = [{
			key: 'matter',
			datasource: [{
				text: '男',
				value: 0
			}, {
				text: '女',
				value: 1
			}, ],
			value: 1,
			tag: ''
		}];
		initPopSelect(datasource, function(val) {
			$sexVal.empty().val(val);
		});

	});
	/*返回*/
	$(document).on("tap", ".js-back", function(e) {
         e.preventDefault();
         var contentMsg=["编辑","新增"]
         var _content= apptId ? contentMsg[0] : contentMsg[1];
		//判断是否已输入过内容
		confirm.show({
			content: "确认退出"+_content+"预约?",
			okText: '是',
			cancelText: '否',
			stylesObj: {},
			extraClass: 'yo-dialog-confirm',
			onok: function() {
				 if(apptId){
				 	window.location.href = "/webapp/html/orderdetail.html?appid="+apptId
				 }else{
				 	window.history.back();
				 }
			},
			oncancel: function() {
				confirm.hide();
			}
		});

	});

	/*选择年龄*/
	$(document).on("tap", ".js-patientAge", function() {
    var val = $(this).find("input").val();
		var _datasource = (function() {
			var arr = []
			for(var i = 1; i <= 100; i++) {
				var obj = null;
				obj = {
					text: i,
					value: i
				};
				arr.push(obj);
			}
			return arr;
		})();
		var datasource = [{
			key: 'matter',
			datasource: _datasource,
			value: val || 1,
			tag: ''
		}];
		initPopSelect(datasource, function(val) {
			$ageVal.empty().val(val);
		});
	});

	function initPopSelect(datasource, callback) {
		var okvalueTxt, okey;
		var options = {
			extraClass: 'yo-dialog-select',
			displayCount: 5,
			title: '',
			effect: false,
			datasource: datasource,
			infinite: false,
		}
		var popselect = new Popselect(options);
		popselect.show();
		popselect.on('ok', function(hide) {
			var _val = this.getValue();
			okvalueTxt = _val.matter.text;
			okey = _val.matter.value;
			callback && callback(okvalueTxt, okey);
			this.destroy();
		});
		popselect.on('cancel', function(hide) {
			this.destroy();
		});
	}
	/*转换编辑预约的数据*/
	function transfromEditData(data) {
		console.log("编辑");
		console.log(data);
		data.patientGender = data.patientGender == "1" ? "男" : "女 ";
		data.apptDate = data.apptTimeBegin.split(" ")[0].split("/").join("-");
		data.apptTime = data.apptTimeBegin.split(" ")[1];
		data.durationKey=data.duration;
        data.duration=(data.duration*60)+"分钟";
		return data;
	}
	/*转换添加预约的数据*/
	function transfromData(data) {
		data.xb = data.xb == "1" ? "男" : "女";
		data.age = (new Date()).getFullYear() - (data.csrq && data.csrq.substr(0, 4)) || 0;
		return data;
	}
	//获取事项
	function getshixiang() {
		var _data = {},
			shixiangData;
		http.post({
			url: "/server/appointWx/findYyItemWx",
			data: JSON.stringify(_data),
			async: false,
			success: function(res) {
				res.data && (shixiangData = res.data);
				!res.data && tip.show({
					content: res.desc
				});
			},
			error: function(error) {

			}
		});
		return shixiangData;
	}
	//获取相关人员信息
	function getUserByJob(pos) {
		var _data = {
				"zw": pos
			},
			usersData;
		http.post({
			url: "/server/wxcharge/findPositionUser",
			data: JSON.stringify(_data),
			async: false,
			success: function(res) {
				res.data && (usersData = res.data);
				!res.data && tip.show({
					content: res.desc
				});

			},
			error: function(err) {

			}
		});
		return usersData;
	}
});
