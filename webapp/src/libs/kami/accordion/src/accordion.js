/**
 * @category primary
 * @return {[type]} [description]
 */
;(function(){
	var $ = require('../../util/index.js'),
		Widget = require('../../core/index.js'),
		accordionStr = require('./accordion.string'),
		Template = require('../../template/index.js');

	$.getHideEleStyle = function(ele, type){
		if($(ele).css('display') == 'none'){
			$(ele).addClass('getHideEleStyle');
			result = $(ele).offset()[type];
			$(ele).removeClass('getHideEleStyle');
		}else{
			result = $(ele).offset()[type];
		}
		return result
	}

	var Accordion = Widget.extend({
		options:{
			//当前accordion组
			container: 'body',
			//设置为false将允许多个区别同时展开。
			exclusive : true,
			//默认展开项
			defaultopen : 0,
			duration : .5,
			eventTarget: '[data-role="accordion-main"]',
			eventType:'tap',
			onbeforechange:function(e){
			},
			onafterchange:function(e){
			}
		},
		render:function(){
			var self = this;
			Accordion.superClass.render.call(this);
			this._scan();
			this.get('defaultopen') != -1 && this._open(this.detailsList.eq(this.get('defaultopen')));
			this.duration = this.get('duration');
			$(this.get('container')+'>'+this.get('eventTarget')).on(this.get('eventType'),function(e){
				self.handler(e);
			});
		},
		handler:function(e){
			e.preventDefault();
			e.stopPropagation();
			var self = this;
			$(e.target).is('[data-role="accordion-main"]') ? self.target = $(e.target).next('[data-role="accordion-detail"]') : self.target = $(e.target).parent('[data-role="accordion-main"]').next('[data-role="accordion-detail"]');
			self.target.hasClass('active') ? self.targetState = true : self.targetState = false;
			self.trigger('beforechange');
			if(self.get('exclusive')){
				self._exclusive(self.target.attr('data-index'));
			}else{
				self.target.hasClass('active') ? self._close(self.target) : self._open(self.target);
			}
			self.trigger('afterchange');
		},
		_scan:function(){
			this.detailsList = $(this.get('container') +' [data-role="accordion-detail"]');
			this.detailsList.each(function(index,item){
				var hei = $.getHideEleStyle(item,'height');
				$(item).attr({
					'data-height': hei,
					'data-index' : index
				}).addClass('ready');
			});
		},
		_exclusive:function(index){
			var pre = this.detailsList.eq(this.exclusiveFlag),
				now = this.detailsList.eq(index);
			if(this.exclusiveFlag == index){
				now.hasClass('active') ? this._close(now) : this._open(now);
			}else{
				this._close(pre);
				this._open(now);
			}
		},
		_open:function(ele){
			$(ele).css({
				'height' : $(ele).attr('data-height')+'px',
				'-webkit-transition': 'height '+ this.duration +'s ease',
				'transition': 'height '+ this.duration +'s ease'		

			}).addClass('active');
			this.exclusiveFlag = $(ele).attr('data-index');
			this.trigger('open');
		},
		_close:function(ele){
			$(ele).css({
				'height' : '0px',
				'-webkit-transition': 'height '+ this.duration +'s ease',
				'transition': 'height '+ this.duration +'s ease'
			}).removeClass('active');
			this.exclusiveFlag = -1;
			this.trigger('close');
		},
		parseTemplate:function(){
		},
		destory:function(){
			$(this.get('container')+'>'+this.get('eventTarget')).off();
		}
	})
	module.exports = Accordion;
}())