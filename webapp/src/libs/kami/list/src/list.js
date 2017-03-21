/**
 * 列表基类，只支持纵向滑动
 * 
 * @author zxiao <jiuhu.zh@gmail.com>
 * @class List
 * @constructor
 * @extends Widget
 * @category primary
 * @demo http://ued.qunar.com/mobile/kami/demo/src/html/list/index.html
 */

var $ = require('../../util/index.js');
var Widget = require('../../core/index.js');
var Template = require('../../template/index.js');
var ListTpl = require('./tpl/list.string');
var ItemTpl = require('./tpl/list-item.string');

var rAF = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    function (callback) { return window.setTimeout(callback, 1000 / 60); };

var clearRAF = window.cancelAnimationFrame ||
    window.webkitCancelAnimationFrame ||
    function (name){ window.clearTimeout(name)}

var Reg = /^(INPUT|TEXTAREA|BUTTON|SELECT)$/;

var List = Widget.extend({

    /**
     * @property {Boolean} isTransition 动画的效果，默认为true使用transition, false使用js动画
     * @property {Boolean} scrollLock 当数据项少于一屏时，是否锁定不允许滚动，默认为false
     * @property {String}  activeClass 激活状态的样式
     * @property {Boolean}  preventDefault 阻止浏览器默认事件，默认为true
     * @property {Boolean}  stopPropagation 阻止touch事件冒泡，默认为false
     * @property {Boolean}  resizable 可调整大小，默认为true
     * @property {Boolean}  canLockY 是否支持锁定Y轴滚动，默认为false， 在与slidermenu的配合使用时，需要设置为true
     * @property {String}  template 模板文件，自定义模板时需要传
     * @property {String}  itemTpl 列表项的模板，自定义模板时需要传
     * @property {Array} datasource @require组件的数据源，数组类型，每个数组项为object
     * @memberOf List
     */
    
    
    /**
     *
     * @template template
     * 组件的外层模板
     * 必须含有 data-role属性，其中
     * data-role="scroller" 指组件的滚动容器,
     * data-role="itemWrap" 指组件的列表容器,itemTpl解析后会放到这里
     * data-role="nodata" 指组件没有数据时的容器，nodataTpl解析后会放到这里
     * 
     * @memberOf List
     * @path ./tpl/list.string
     * 
     */
    
    /**
     *
     * @template itemTpl
     * 列表选项的模板，该模板自定义时，itemTpl的模板
     * 必须含有data-role="list-item" 和 data-index={{dataIndex}}两个属性
     * @memberOf List
     * @path ./tpl/list-item.string
     * 
     */
    options: {
        type: 'list',
        // 动画的效果，默认为true使用transition, false使用js动画
        isTransition: true,
        // 当数据项少于一屏时，是否锁定不允许滚动，默认为false
        scrollLock: false,
        // 激活状态的样式
        activeClass: '',
        // 阻止浏览器默认事件
        preventDefault: true,
        // 阻止touch事件冒泡
        stopPropagation: false,
        // 可调整大小
        resizable: true,
        // 是否支持锁定Y轴滚动
        canLockY: false,
        // tap事件点击间隔时间
        tapInterval: 0,

        // 组件模板
        template: ListTpl,
        // 选项模板
        itemTpl: ItemTpl,
        
        datasource: [],

        // TODO 提供doubleTap、longTap等事件
        // 选项点击事件
        /**
         * 用户点击某项数据时触发的事件
         * @event tap
         * @memberOf List
         * @param  {HTMLEvent} e touch事件的事件对象
         */
        onTap: function (e) {},
        /**
         * 用户选择某项数据时触发的事件
         * @event selectitem
         * @param  {Object} data     当前选择项目的数据
         * @param  {HTMLElement} itemEl   当前选择项目的节点
         * @param  {HTMLElement} targetEl 用户点击的实际节点
         * @memberOf List
         */
        onSelectItem: function (data, itemEl, targetEl) {},

        /**
         * touchstart事件开始前触发的事件
         * @event beforestart
         * @param  {HTMLEvent} e touch事件的事件对象
         * @memberOf List
         */
        onBeforeStart: function (e) {},
        /**
         * touchmove事件开始前触发的事件
         * @event beforemove
         * @param  {HTMLEvent} e touch事件的事件对象
         * @memberOf List
         */
        onBeforeMove: function (e) {},
        /**
         * touchend事件开始前触发的事件
         * @event beforeend
         * @param  {HTMLEvent} e touch事件的事件对象
         * @memberOf List
         */
        onBeforeEnd: function (e) {},

        /**
         * touchmove事件结束后触发的事件
         * @event aftermove
         * @param  {Number} translateY 滚动偏移的translateY
         * @memberOf List
         */
        onAfterMove: function (translateY) {},

        /**
         * 列表滚动时触发的事件
         * @event 
         * @param  {Number} translateY 滚动偏移的translateY
         * @param  {Boolean} stopAnimate 是否停止动画
         * @memberOf List
         */
        onScroll: function (translateY, stopAnimate) {},

        events: {
            'touchstart': '_touchStart',
            'touchmove': '_touchMove',
            'touchend': '_touchEnd',
            'touchcancel': '_touchEnd',
            'webkitTransitionEnd [data-role=scroller]': '_transitionEnd',
            'transitionEnd [data-role=scroller]': '_transitionEnd'
        }
    },
    /**
     * 处理组件数据
     * @function init
     * @memberOf List
     * @private
     */
    init: function () {
        this.initProp();
    },

    /**
     * 将组件渲染到document中
     * @function render
     * @memberOf List
     */
    render: function () {
        List.superClass.render.call(this);
        this._scroller = this.widgetEl.find('[data-role="scroller"]');
        this._itemWrap = this._scroller.find('[data-role="itemwrap"]');
        this.initUI();
        var self = this;
        this.widgetEl.on('tap', '[data-role="list-item"]', function(e) {
            !self._stopAnimate && !self._lockScrollY && self.trigger('tap', e);
            self._stopAnimate = false;
        });
        return this;
    },

    /**
     * 销毁组件
     * @function destroy
     * @memberOf  List
     */
    destroy: function() {
        this.animateTimer && clearRAF(this.animateTimer);
        this._cancelActive();
        List.superClass.destroy.call(this);
    },

    /**
     * 初始化私有属性
     * @function initProp
     * @private
     * @memberOf List
     */
    initProp: function() {
        this._scroller = null; // 列表滑动容器
        this._itemWrap = null; // 列表选项父容器
        this._listHeight = 0; // 列表高度

        this._startY = 0; // 开始滑动时的pageY
        this._lastY = 0; // 上一次滑动事件的pageY
        this._distY = 0; // 一次滑动事件的总距离
        this._translateY = 0; // 当前纵向滑动的总距离
        this._maxY = 0; // 最大滑动距离

        this._lastX = 0;
        this._lockScrollY = false; // 是否锁定Y轴滚动

        this._orientation = ''; // 列表滑动方向（与手势滑动方向相反） up || down
        this._startTime = 0; // 开始滑动时间
        this._endTime = 0; // 结束滑动时间
        this._isMoving = false; // 是否滑动中
        this._isAnimating = false; // 是否动画中
        this._canScroll = true; //是否可以滑动
        this._stopAnimate = false; // 本次点击是否阻止了动画效果（transition || requrestAnimationFrame）
        this._activeTimer = null; // 激活效果定时器
        this._actived = false;

        this._cancelMove = false; // 取消滑动，目前只有一种情况，当pageY小于0
        // TODO 增加支持两个手指滑动的功能
        this._initiated = false; // 是否初始化（touchstart是否正常执行了，主要用来解决多点触发滑动的判断）
    },

    /**
     * 处理组件样式
     * @function initUI
     * @private
     * @memberOf List
     */
    initUI: function () {
        this._renderListItem();
        this.resize();
    },

    /**
     * 容器高度发生变化后的处理
     * @function resize
     * @memberOf List
     */
    resize: function(scrollerHeight) {
        var otherHeight = 0;// 其他容器高度
        this._listHeight = +this.widgetEl[0].clientHeight;

        // 容器里如果有其他非滚动元素，计算最大滑动高度时去掉这些元素的高度
        var child = this.widgetEl.children();
        if(child.length > 1) {
            child.forEach(function(item){
                // 添加不为index-wrap的判断，index-wrap是grouplist右侧的字母部分，一起计算会导致grouplist滚动到最底部依旧可以继续滚动
                item.getAttribute('data-role') != 'scroller' && item.getAttribute('data-role') != 'index-wrap' && (otherHeight += (+item.offsetHeight));
            });
        }

        scrollerHeight = scrollerHeight || +this._scroller[0].clientHeight;
        this._maxY = this._listHeight - scrollerHeight - otherHeight;
        // 滑动容器高度不满外层容器高度时，是否需要滑动
        if(this._maxY >= 0) {
            if(this.get('scrollLock')) {
                this._canScroll = false;
            } else {
                this._canScroll = true;
                this._maxY = 0;
            }
        } else {
            this._canScroll = true;
        }
    },

    /**
     * 重新加载列表数据
     * @function reload
     * @param {Array} ds 重新加载的数据
     * @memberOf List
     */
    reload: function (ds) {
        ds && ds.length ? this.set('datasource', ds) : this.set('datasource', []);
        this.initUI();
    },

    /**
     * 滚动函数
     * @function scrollTo
     * @memberOf List
     * @param {Number} translateY 需要滚动的translateY值
     * @param {Array} time  是transition-duration表示过渡效果需要多少毫秒
     * @param {String | Function} effect transition-timing-function过渡效果的速度曲线
     * @param {Function} callback 执行完滚动动画后的回调
     * @private
     */
    scrollTo: function(translateY, time, effect, callback) {
        if(this.get('isTransition')) {
            effect = effect || 'cubic-bezier(0.1, 0.57, 0.1, 1)';
            setTransitionTimingFunc(this._scroller, effect);
            setTransitionTime(this._scroller, time);
            this._translate(translateY);
        } else {
            effect || (effect = function (k) {
                return Math.sqrt( 1 - ( --k * k ) );
            });
            if(time) {
                this._animate(translateY, time, effect, callback);
            } else {
                this._translate(translateY);
            }
        }
        this._translateY = translateY;
    },

    /**
     * 生成列表选项Html
     * @function createListItem
     * @memberOf List
     * @private
     */
    createListItem: function() {
        var itemHtml = '';
        var ds = this.get('datasource');
        var render = Template(this.get('itemTpl'));
        ds && ds.length && ds.forEach(function(item) {
            itemHtml += render(item);
        });
        return itemHtml;
    },

    /**
     * 停止动画
     * @function stopAnimate
     * @memberOf List
     * @private
     */
    stopAnimate: function() {
        var result = this._isAnimating;
        if(this._isAnimating) {
            this._isAnimating = false;
            this._stopAnimate = true;
            this.get('isTransition') && (this._translateY = getTranslateY(this._scroller));
            this.scrollTo(this._translateY, 0);
            this.animateTimer && clearRAF(this.animateTimer);
        }
        return result;
    },

    /**
     * 获取列表项节点
     * @function getItemNode
     * @memberOf List
     * @private
     */
    getItemNode: function(elem) {
        while(elem.length) {
            if(elem.data('role') == 'list-item') {
                return elem;
            } else {
                elem = elem.parent();
                continue;
            }
        }
        return null;
    },

    /**
     * 获取滚动方向
     * @function getOrientation
     * @memberOf List
     */
    getOrientation: function() {
        return this._orientation;
    },

    /**
     * 创建列表选项
     * @function _renderListItem
     * @private
     * @memberOf List
     */
    _renderListItem: function() {
        this._itemWrap.html(this.createListItem());
    },

    /**
     * 设置scroller的translateY值
     * @function _translate
     * @private
     * @param  {Number} translateY 要给scroller设置的translateY值
     * @memberOf List
     */
    _translate: function (translateY) {
        this._scroller[0].style.webkitTransform = 'translate(0px, ' + translateY + 'px) translateZ(0)';
        this._scroller[0].style.transform = 'translate(0px, ' + translateY + 'px) translateZ(0)';
        this.trigger('scroll', translateY, this._stopAnimate);
    },

 
    /**
     * touchstart事件的处理函数，初始化参数，停止正在进行的动画
     * @function _touchStart
     * @private
     * @param  {HTMLDOMEvent} e touchstart事件的事件对象
     * @memberOf List
     */
    _touchStart: function(e) {

        var target = e.target;
        this.get('preventDefault') && !Reg.test(target.tagName) && e.preventDefault();
        this.get('stopPropagation') && e.stopPropagation();

        if(this._initiated) return;

        if(this.get('activeClass')) {
            var self = this;
            var itemNode = this.getItemNode($(target));
            if(itemNode) {
                self._activeTimer = setTimeout(function() {
                    itemNode.addClass(self.get('activeClass'));
                }, 150);
                this._actived = true;
            }
        }

        this.trigger('beforestart', e);

        setTransitionTime(this._scroller);
        this._isMoving = false;
        this._startTime = +new Date();
        this._stopAnimate = false;
        this.stopAnimate();

        this._startY = this._translateY;
        this._distY = 0;
        this._lastY = e.touches[0].pageY;

        this._lastX = e.touches[0].pageX;
        this._lockScrollY = false;
        this._cancelMove = false;
        this._initiated = true;
    },

    /**
     * touchmove事件的处理函数，处理位移偏移，处理canLockY
     * @function _touchMove
     * @param  {HTMLDOMEvent} e touchmove事件的事件对象
     * @private
     * @memberOf List
     */
    _touchMove: function(e) {
        this.get('preventDefault') && e.preventDefault();
        this.get('stopPropagation') && e.stopPropagation();

        if(!this._initiated) return;

        if(this._actived && this.get('activeClass')) {
            this._cancelActive();
            var itemNode = this.getItemNode($(e.target));
            itemNode && itemNode.removeClass(this.get('activeClass'));
            this._actived = false;
        }

        if (!this.trigger('beforemove', e)) {
            this._initiated = false;
            return;
        };

        var translateY,
            timestamp = +new Date(),
            currY = e.touches[0].pageY,
            offsetY = currY - this._lastY;

        this._distY += offsetY;

        // 当滑动超出屏幕，自动触发touchend事件
        if (currY < 0) {
            this._initiated = false;
            if (this._cancelMove) {
                return;
            }
            this._cancelMove = true;
            this._touchEnd(e);
            return;
        }

        if (this.get('canLockY')) {
            // 横向滚动超过比例，锁定纵向滚动
            if (this._lockScrollY) {
                this._initiated = false;
                return;
            }
            var currX = e.touches[0].pageX;
            var offsetX = currX - this._lastX;
            if(Math.abs(this._distY) < 30 && Math.abs(offsetX) / 3 > Math.abs(this._distY)) {
                this._lockScrollY = true;
                this._initiated = false;
                return;
            }
        }

        // 当前时间大于上一次滑动的结束时间300毫秒，并且滑动距离不超过10像素，不触发move
        // 大于300毫秒的判断是为了能够处理手指在屏幕上快速搓动的效果
        if (timestamp - this._endTime > 300 && Math.abs(this._distY) < 10 ) {
            return;
        }

        this._orientation = offsetY > 0 ? 'up': 'down';
        !this._canScroll && (offsetY = 0);
        translateY = this._translateY + offsetY;
        // 超出滑动容器范围，减少滑动高度
        if (translateY > 0 || translateY < this._maxY) {
            translateY = this._translateY + offsetY / 3;
        }

        this._isMoving = true;
        this._translate(translateY);
        this._translateY = translateY;
        this._lastY = currY;
        if(timestamp - this._startTime > 300) {
            this._startTime = timestamp;
            this._startY = this._translateY;
        }
        this.trigger('aftermove', translateY);
    },

    /**
     * touchend事件的处理函数，添加active样式，处理组件的回弹，滚动到目标位置
     * @function _touchEnd
     * @param  {HTMLDOMEvent} e touchmove事件的事件对象
     * @private
     * @memberOf List
     */
    _touchEnd: function(e) {
        var target = e.target;

        this.get('preventDefault') && !Reg.test(target.tagName) && e.preventDefault();
        this.get('stopPropagation') && e.stopPropagation();

        if(this._actived && this.get('activeClass')) {
            this._cancelActive();
            var itemNode = this.getItemNode($(e.target));
            itemNode && itemNode.removeClass(this.get('activeClass'));
            this._actived = false;
        }

        this._initiated = false;
        this._endTime = +new Date();
        var duration = this._endTime - this._startTime;

        if(!this.trigger('beforeend', e)) {
            return;
        };

        // 1. 判断是否滑动回弹，回弹则return
        if(this.resetPosition()) {
            return;
        }

        // 2. 没有滚动
        if(!this._isMoving ) {
            return;
        }

        // 3. 滑动到目标位置
        this.scrollTo(this._translateY);

        // 4. 是否有惯性滑动，有则滑动到计算后的位置
        this._isMoving = false;
        if (duration < 300 && this._canScroll) {
            var momentumY = momentum(this._translateY, this._startY, duration, this._maxY, this._listHeight);
            var newY = momentumY.destination;
            if (newY != this._translateY ) {
                var effect = null;
                if(newY > 0 || newY < this._maxY) {
                    // 惯性滑动中超出边界回弹回来，切换动画效果函数
                    if(this.get('isTransition')) {
                        effect = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    } else {
                        effect = function (k) {
                            return k * ( 2 - k );
                        };
                    }
                }
                this.scrollTo(newY, momentumY.duration, effect);
            }
            this._isAnimating = true;
        }
    },
    /**
     * 滑动超出最大范围，回弹到终点
     * @function resetPosition
     * @memberOf List
     */
    resetPosition: function () {
        var translateY = this._translateY;
        if(this._canScroll) {
            translateY = translateY> 0 ? 0 : translateY < this._maxY ? this._maxY : translateY;
        }
        if(translateY == this._translateY) {
            return false;
        }
        this._orientation = translateY < 0 ? 'up': 'down';
        this.scrollTo(translateY, 600);
        this._isAnimating = true;
        return true;
    },

    /**
     * transition动画结束后的处理函数
     * @function _transitionEnd
     * @memberOf List
     * @param  {HTMLDOMEvent} e transitionEnd结束时事件对象
     * @private
     */
    _transitionEnd: function(e) {
        if (e.target != this._scroller[0]) {
            return;
        }
        setTransitionTime(this._scroller);
        this._isAnimating = false;
        this.resetPosition();
    },

    /**
     * 不适用transition时的惯性动画函数
     * @function _animate
     * @memberOf List
     * @private
     * @param  {Number} translateY scroller要滚动的目标translateY
     * @param  {Number} time       scorller要滚动到
     * @param  {Function} effect     滚动的效果函数
     */
    _animate: function(translateY, time, effect,callback) {

        this.stopAnimate();
        var self = this,
            startY = this._translateY,
            startTime = +new Date(),
            destTime = startTime + time;

        function step () {
            var now = +new Date(),
                newY,
                easing;

            if ( now >= destTime ) {
                self._isAnimating = false;
                self._translate(translateY);
                self._translateY = translateY;
                self.resetPosition();
                callback && callback();
                return;
            }

            now = ( now - startTime ) / time;
            easing = effect(now);
            newY = ( translateY - startY ) * easing + startY;
            self._translateY = newY;
            self._translate(newY);

            if ( self._isAnimating ) {
                self.animateTimer = rAF(step);
            }
        }
        this._isAnimating = true;
        step();
    },

    /**
     * 取消active的timer，用来防止多次点击
     * @function _cancelActive
     * @memberOf List
     * @private
     */
    _cancelActive: function() {
        this._activeTimer && clearTimeout(this._activeTimer);
        this._activeTimer = null;
    }
});

// 滑动惯性计算
function momentum(current, start, time, lowerMargin, wrapperSize, deceleration) {
    var distance = current - start,
        speed = Math.abs(distance) / time,
        destination,
        duration;

    // 低版本安卓，降低惯性滑动速度
    var defaultDeceleration = 0.0006;
    $.os.android && $.os.version < '4.4' && (defaultDeceleration = 0.006);

    deceleration = deceleration === undefined ? defaultDeceleration : deceleration;

    destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
    duration = speed / deceleration;

    if ( destination < lowerMargin ) {
        destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
        distance = Math.abs(destination - current);
        duration = distance / speed;
    } else if ( destination > 0 ) {
        destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
        distance = Math.abs(current) + destination;
        duration = distance / speed;
    }

    return {
        destination: Math.round(destination),
        duration: duration
    };
};

function setTransitionTime(elem, time) {
    time = time || 0;
    elem[0].style.webkitTransitionDuration = time + 'ms';
    elem[0].style.transitionDuration = time + 'ms';
}
function setTransitionTimingFunc(elem, effect) {
    elem[0].style.webkitTransitionTimingFunction = effect;
    elem[0].style.transitionTimingFunction = effect;
}

// 获取元素的translateY
function getTranslateY(elem) {
    var matrix = window.getComputedStyle(elem[0], null);
    var transform = matrix['webkitTransform'] || matrix['transform'];
    var split = transform.split(')')[0].split(', ');
    return Math.round(+(split[13] || split[5]));
}

module.exports = List;
