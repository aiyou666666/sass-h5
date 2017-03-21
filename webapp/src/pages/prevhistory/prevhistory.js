var $ = require('zepto');
var store = require('store');
var query = require('query');
var confirm = require("kami/confirm");

var tpl = require('./prevhistory.hbs');

$(function() {
	var $contaniner = $("#container");
	var id = query.get('id');
	var patientData = store.get('patient') || {};
	var newData = store.get('newData') || {};
	var temp = patientData.jws && (patientData.jws.indexOf('other:') != -1) ? patientData.jws.substr(patientData.jws.indexOf('other:')+6) : '';

	var jwsStr = patientData.jws && patientData.jws.length > 0 ? $.trim(patientData.jws.replace(/[a-zA-Z:,;{}]+/g, ' ')) : '' ;
	var jws = query.get('hasHistory') ? jwsStr.split(' ') : [];

	var returnUrl = id ? 'addpatient.html?id=' + id : 'addpatient.html';
    $contaniner.append(tpl());

	var $checkBox = $('.flex-item i');
	for (var i = 0; i < $checkBox.length; i ++) {
		for (var j = 0; j < jws.length; j ++) {
			if ($($checkBox[i]).next().text() == jws[j]) {
				$($checkBox[i]).addClass('pickActive');
			}
		}
	}
	if (temp) {
		$('textarea').text(temp);
	}
	$('.flex-item').on('tap', function() {
		var checkBox = $(this).find('i');
		var hisName = checkBox.next().text();

		if (!checkBox.hasClass('pickActive')) {
			checkBox.addClass('pickActive');
			jwsStr += ' ' + hisName;
		} else {
			var temp;
			checkBox.removeClass('pickActive');
			temp = jwsStr && (jwsStr.indexOf('other:') != -1) ? jwsStr.substr(jwsStr.indexOf('other:')+6) : '';
			jwsStr = $.trim(jwsStr.replace(new RegExp(hisName, 'g'), ''));
			jwsStr += temp;
		}
	});

	$('.js-submit').on('tap', function(e) {
		e.preventDefault();

		confirm.show({
	        content:"是否保存已修改内容",
	        okText: '是',
	        cancelText: '否',
	        stylesObj:{},
	        extraClass: 'yo-dialog-confirm',
	        onok: function() {
				setData();
			},
	        oncancel: function() {
				window.location.href = returnUrl;
			}
	    });
	});

	$('.js-return').on('tap', function(e) {
		e.preventDefault();
		confirm.show({
	        content:"确定退出此次编辑？",
	        okText: '是',
	        cancelText: '否',
	        stylesObj:{},
	        extraClass: 'yo-dialog-confirm',
	        onok: function() {
				window.location.href = returnUrl;
			},
	        oncancel: function() {
				confirm.destroy();
			}
	    });
	});

	function setData() {
		var list = $('.m-systemItem');
		var data = '';
		list.each(function() {
			var str;
			if (!$(this).hasClass('form-col')) {
				str = $(this).attr('data-val') + ':{';
				var checkBox = $(this).find('.pickActive');
				checkBox.each(function() {
					str = str+ $(this).next().text() + ':True,';
				});
				str += '};';

			} else {
				str = $(this).attr('data-val') + ':' + $(this).find('textarea').val();
			}
			data += str;

		});
		data = data.replace(/,}/g, '}').replace(/;$/,'');
		newData['jws'] = data;
		patientData['jws'] = data;
		store.set('newData', newData);
		store.set('patient', patientData);
		if (id) {
			window.location.href = returnUrl + '&newhistory=1';
		} else {
			window.location.href = returnUrl + '?newhistory=1';
		}


	}

});
