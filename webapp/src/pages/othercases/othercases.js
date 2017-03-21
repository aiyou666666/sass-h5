var $=require("zepto");
var store = require('store');
var query = require('query');
var confirm = require("kami/confirm");

var tpl = require("./othercases.hbs");

$(function() {
	var $contaniner = $("#container");

	var returnUrl = store.get('url');
	var isNew = returnUrl.indexOf('?') != -1 ? false : true;
	var patientData = store.get('patient') && (!isNew) ? store.get('patient') : {};
	var newData = store.get('newData');

	var data = dataProcess(patientData);
	data['returnUrl'] = returnUrl;

	if (isNew) {
		date = {
			sfxy: '0',
			sfhy:'0',
			sfbr: '0',
			sfyj:'0',
			cyl: 0
		};
	}

	$contaniner.append(tpl(data));

	$('.m-check').on('tap', function() {
		var $check = $(this);
		var $select = $('.m-select');
		var $parent = $check.parents('.m-case');
		var name = $parent.attr('data-val');
		var value = $check.text();
		$parent.find('.m-checked').removeClass('m-checked');
		$check.addClass('m-checked');
		if (name == 'sfxy') {
			if (value == '否') {
				$select.hide();
				newData['cyl'] = '0';
			} else {
				$select.show();
				newData['cyl'] = $select.find('input').val();
			}
		}
		if (value == '否') {
			newData[name] = '0';
		} else {
			newData[name] = '1';
		}


	});
	$('.m-add').on('tap', function(){
		var $input = $('.m-select input');
		var value = parseInt($input.val());
		$input.val(value + 1);
		newData['cyl'] = value + 1;
	});
	$('.m-sub').on('tap', function(){
		var $input = $('.m-select input');
		var value = parseInt($input.val());
		if (value > 0) {
			$input.val(value - 1);
			newData['cyl'] = value - 1;
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
				store.set('newData', newData);
				if (!isNew) {
					window.location.href = store.get('url') + '&other=1';
				} else {
					window.location.href = store.get('url') + '?other=1';
				}
			},
			oncancel: function(hide) {
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

	function dataProcess(data) {
		var newData = {};
		newData['sfxy'] = data.sfxy ? (data.sfxy == '0' ? false : true) : false;
		newData['sfhy'] = data.sfhy ? (data.sfhy == '0' ? false : true) : false;
		newData['sfbr'] = data.sfbr ? (data.sfbr == '0' ? false : true) : false;
		newData['sfyj'] = data.sfyj ? (data.sfyj == '0' ? false : true) : false;
		newData['cyl'] = data.cyl || 0;
		return newData;
	}

});
