var $ = require('zepto');
var http = require('ajax');
var popcalendar = require('kami/popcalendar');
var confirm = require("kami/confirm");
var popselect = require("kami/popselect");
var tip = require("kami/tip");
var query = require('query');
var config = require('../config.js');
var store = require('store');
var picupload = require("picupload");
var validate = require("validate");

var tpl = require('./addpatient.hbs');
var headerTpl = require('./header.hbs');

var url = '/server/patient/findPatientById';
var listUrl = '/server/patient/getDictionarys';
var userListUrl = '/server/wxcharge/findPositionUser';
var avatarUrl = '/server/patient/uploadImg';
var submitUrl = '/server/patient/savePatient';

var hzId = query.get().id || '';
var isUpdateHis = query.get().newhistory ? true : false;
var isUpdataOther = query.get().other ? true : false;
var gmain = $(".g-main").get(0);

var $form = $('#form'),$dom;
var patientData = {};
var newData = {};

var hasChange = false;

var _tapTimer = null;
function stopPop(evt) {
  evt.stopPropagation();
}
$form.on("scroll", function() {
  if (_tapTimer) {
    clearTimeout(_tapTimer);
    _tapTimer = null;
  }
  $form.find("input").blur();
  $form.find("textarea").blur();
});

function lazyTap(cb) {
  var me = this;
  if (_tapTimer) {
    clearTimeout(_tapTimer);
    _tapTimer = null;
  }
  var args = [].slice.call(arguments, 1);
  _tapTimer = setTimeout(function() {
    cb && cb.apply(me,args);
  },400);
}

if (hzId) {
    $('header').html(headerTpl({
        title: '编辑患者'
    }));
    newData = store.get('newData') || {};
    newData['hzId'] = hzId;
    store.set('returnUrl', 'patientlist.html');
    if (store.get('patient')) {
        patientData = store.get('patient');
        newData['id'] = patientData.id;
        $form.html(tpl(dataProcess(patientData)));
    } else {
        setList();
    }

} else if (store.get('newData')) {
    $('header').html(headerTpl({
        title: '新增患者'
    }));
    newData = store.get('newData');
    patientData = store.get('patient');

    $form.html(tpl(dataProcess(newData)));
    hasChange = true;
} else {
    $('header').html(headerTpl({
        title: '新增患者'
    }));
    newData['xb'] = '1';
    setNum();
    $form.html(tpl({
        avatar : config.defaultAvatarMale
    }));
}


// 生成病历号
function setNum() {
    http.post({
		url: '/server/patient/findNewestNo',
		data: JSON.stringify({}),
		success: function(res) {
			if (res.status == '0') {
				var data = res.data;
				if (data) {
					$('input[name="mzblh"]').val(data);
                    patientData['mzblh'] = data;
                    newData['mzblh'] = data;
				}
			}
		}
	});
}

// 上传头像
picupload.init({
	doms: ['avatar'],
	domain: avatarUrl,
	end: function(ImgUrl, imgPath) {
		$("#uploadAvatar").attr("src", ImgUrl).show();
		patientData.hztx = imgPath;
        patientData['avatar'] = ImgUrl;
        newData['avatar'] = ImgUrl;
        newData['hztx'] = imgPath;
        hasChange = true;
	}
});

// 获取患者基本信息
function setList() {
	http.post({
		url: url,
		data: JSON.stringify({
			"hzId": hzId
		}),
		success: function(res) {
			if (res.status == '0') {
				var data = res.data;
				if (data) {
					patientData = data;
					store.set('patient', patientData);
                    newData['id'] = patientData.id;
					$form.html(tpl(dataProcess(data)));
				}
			}
		}
	});
}

// 保存修改
function submit() {
	http.post({
		url: submitUrl,
		data: JSON.stringify(newData),
		success: function(res) {
			if (res.status == '0') {
                isSubmit = false;
                var id = hzId ? hzId : res.data;
                store.remove('patient');
                store.remove('newData');
                store.remove('returnUrl');
				window.location.href = 'patientinfo.html?id=' + id;
			}
		}
	});
}

// 表单验证
function validForm() {
    if (!$.trim($('input[name="mzblh"]').val())) {
        tip.show({
            content: "请填写病例号"
        });
        return false;
    }
    if (!$.trim($('input[name="xm"]').val())) {
        tip.show({
            content: "请填写姓名"
        });
        return false;
    }
    if (!$.trim($('input[name="szys"]').val())) {
        tip.show({
            content: "请选择首诊医生"
        });
        return false;
    }
    if($.trim($('input[name="sjh"]').val()) && !validate.isMobile($('input[name="sjh"]').val())) {
        tip.show({
            content: "请填写正确格式的手机号"
        });
        return false;
    }
    return true;
}

// 患者数据处理
function dataProcess(data) {
	var dateBirth = data.csrq || '2016';
    var temp = data.jws && (data.jws.indexOf('other:') != -1) ? ' ' + data.jws.substr(data.jws.indexOf('other:')+6) : '';

	data['avatar'] = data.avatar ? data.avatar : (data.hztx || (data.xb == '1' ? config.defaultAvatarMale : config.defaultAvatarFemale));
	data['sex'] = data.xb == '1' ? '男' : data.xb == '2' ? '女' : '';
	data['age'] = new Date().getFullYear() - dateBirth.substr(0, 4);
	data['zhzlrq'] = data.zhzlrq ? data.zhzlrq.substr(0, 4) + '.' + data.zhzlrq.substr(4, 2) + '.' + data.zhzlrq.substr(6, 2) : '';
	data['jwsStr'] = data.jws ? $.trim(data.jws.replace(/[a-zA-Z:,;{}]+/g, ' ')) : '' ;
  data['jwsStr'] += temp;
	data['dateBirth'] = data.csrq ? data.csrq.substr(0, 4) + '.' + data.csrq.substr(4, 2) + '.' + data.csrq.substr(6, 2) : '';

	return data;
}

var isSubmit = false;

$('body').on('tap', '.js-date', function() {
  lazyTap.call(this, function () {
	  initcalendar($(this).find('input'));
  });
}).on('tap', '.js-sex', function(e) {
  lazyTap.call(this, function () {
	  initSexSelect();
  });
}).on('tap', '.js-submit',  function(e) {
  e.preventDefault();
  if (validForm()) {
    confirm.show({
      content: "是否保存已修改内容",
      okText: '是',
      cancelText: '否',
      stylesObj: {},
      extraClass: 'yo-dialog-confirm',
      onok: function() {
        if (!isSubmit) {
          isSubmit = true;
          submit();
        }
      },
      oncancel: function() {
        confirm.destroy();
      }
    });
  }
}).on('input', 'input[type="text"], input[type="tel"], textarea', function() {
  lazyTap.call(this, function () {
    var name = $(this).attr('name');
    var value = $(this).val();
    // filteremoji($(this));
    newData[name] = value;
    patientData[name] = value;
    $.trim(value) && (hasChange = true);
  });
}).on('tap', '.js-othercase', function() {
    store.set('patient', patientData);
    store.set('newData', newData);
  lazyTap.call(this, function () {
    store.set('url', window.location.href);
	  window.location.href = 'othercases.html?id=' + hzId;
  });
}).on("tap", ".js-doctorName", function() {
  lazyTap.call(this, function () {
	  setDoctorList($(this));
  });
}).on("tap", ".js-zxs", function() {
  lazyTap.call(this, function () {
	  setDoctorList($(this));
  });
}).on("tap", ".js-grade", function() {
  lazyTap.call(this, function () {
	  setDoctorList($(this));
  });
}).on("tap", ".js-catalag", function() {
  lazyTap.call(this, function () {
	  setDoctorList($(this));
  });
}).on("tap", ".js-source", function() {
  lazyTap.call(this, function () {
	  setDoctorList($(this));
  });
}).on('tap', '.js-past', function(e) {
  e.preventDefault();
  store.set('patient', patientData);
  store.set('newData', newData);
  lazyTap.call(this, function () {
    var href = $(this).attr('data-href');
    window.location.href = href;
  },e);
}).on('tap', '.js-return', function(e) {
  e.preventDefault();
  lazyTap.call(this, function () {
    var returnUrl = store.get('returnUrl') || 'index.html';
    if (hasChange) {
        confirm.show({
            content:"确定退出此次编辑？",
            okText: '是',
            cancelText: '否',
            stylesObj:{},
            extraClass: 'yo-dialog-confirm',
            onok: function() {

                store.remove('patient');
                store.remove('newData');
                store.remove('returnUrl');
                window.location.href = returnUrl;
            },
            oncancel: function() {
                confirm.destroy();
            }
        });
    } else {
        store.remove('patient');
        store.remove('newData');
        store.remove('returnUrl');
        window.location.href = returnUrl;
    }
  },e);
});


// todo 过滤emoji
function filteremoji($input) {
    var ranges = [
        '\ud83c[\udf00-\udfff]',
        '\ud83d[\udc00-\ude4f]',
        '\ud83d[\ude80-\udeff]'
    ];
    var emojireg = $input.val();
    $input.val(emojireg.replace(new RegExp(ranges.join('|'), 'g'), ''));
}

// 医生，咨询师字典序获取接口
function setDoctorList($dom) {
	var $input = $dom.find('input');
	var type = $input.attr("data-val");
    var url;
    var obj;
    var isList = false;
    if (type == 'hzfl') {
        url = listUrl;
        data = {
    		"scbz":"0",
    		"zdlxBm":"hzfl",
    	};
        isList = true;
    } else if (type == 'hydj') {
        url = listUrl;
        data = {
    		"scbz":"0",
    		"zdlxBm": "hydj",
    	};
        isList = true;
    } else if (type == 'hzly'){
        url = listUrl;
        data = {
    		"scbz":"0",
    		"zdlxBm": "hzly",
    	};
        isList = true;
    } else {
        url = userListUrl;
        data = { "zw": type };
    }

	var userlist = getUserByJob(data, url);
    var datasource = [{
        key: 'matter',
        datasource: [],
        value: 1,
        tag: ''
    }];

    if (userlist.length) {

    	for (user in userlist) {
    		var obj = {};

            if (isList) {
                obj.text = userlist[user].mc;
                obj.value = userlist[user].zdbm;
            } else {
                obj.text = userlist[user].xm;
                obj.value = userlist[user].yh_id;
            }
    		datasource[0].datasource.push(obj);
    		obj = null;
    	}

    	var options = {
    			extraClass: 'yo-dialog-select',
    			displayCount: 5,
    			container: '#container',
    			effect: false,
                infinite: false,
    			datasource: datasource
    		}
    		//初始化滑动框
    	var pselect = new popselect(options);
    	pselect.render();

    	pselect.on('ok', function(close) {
    		var value = pselect.getValue().matter.text;
    		$input.val(value);
            var name = $input.attr('name');
        	newData[name] = pselect.getValue().matter.value;
            newData[name + 'Str'] = value;
            patientData[name + 'Str'] = value;
    		pselect.destroy();
            hasChange = true;

    	});
    	pselect.on('cancel', function(close) {
    		pselect.destroy();
    	});
    }

}

// 初始性别选项
function initSexSelect() {
    var defaultSex = patientData.xb || '1';
	var datasource = [{
		key: 'sex',
		datasource: [{
			text: '男',
			value: 1
		}, {
			text: '女',
			value: 2
		}],
		value: defaultSex,
		infinite: false
	}, ];
	var options = {
		extraClass: 'yo-dialog-select',
		displayCount: 5,
		container: '#container',
		effect: false,
		datasource: datasource
	}

	var pselect = new popselect(options);
	pselect.render();
	pselect.on('ok', function(close) {
		var value = pselect.getValue().sex;
		$('.js-sex input').val(value.text);
		patientData.xb = value.value;
        patientData.sex = value.text;
        newData['xb'] = value.value;

		pselect.destroy();
        hasChange = true;

	});
	pselect.on('cancel', function(close) {
		pselect.destroy();
	});

}

// 初始日历
function initcalendar($dom) {
	var date = new Date();
    var nowStr = date.getFullYear() + '-' + toTwoDigit(date.getMonth() + 1) + '-' + toTwoDigit(date.getDate());
	var dateStr = $('input[name="csrq"]').val() ? $('input[name="csrq"]').val().replace(/\./g, '-') : nowStr;
	var options = {
		container: '#container',
		extraClass: 'yo-dialog-select',
		duration: .2,
		displayCount: 5,
		frmateKey: "date",
		now: dateStr, // 非必填，默认当前时间
		dateRange: ['1920-01-01', nowStr] // 非必填，默认当前日期至10年后
	};

	var calendar = new popcalendar(options);

	calendar.show();

	calendar.on('ok', function(hide) {
		var val = calendar.getValue();
		$dom.val(val.year.value + '.' + toTwoDigit(val.month.value+1) + '.' + toTwoDigit(val.date.value));
		patientData.csrq = val.year.value + toTwoDigit(val.month.value+1) + toTwoDigit(val.date.value);
        newData['csrq'] = patientData.csrq + '000000';
        calendar.destroy();
        hasChange = true;
	});
	calendar.on('cancel', function(hide) {
		calendar.destroy();
	});

}

// 把数字转换成两位数的字符串
function toTwoDigit(num) {
	return num < 10 ? "0" + num : num;
}

//获取相关人员信息
function getUserByJob(_data, url) {
	var usersData;
	http.post({
		url: url,
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
