
/**
 * 搜索框组件
 * @author zxiao <jiuhu.zh@gmail.com>
 * @class Suggest
 * @constructor
 * @extends Widget
 * @category primary
 * @demo http://ued.qunar.com/mobile/kami/demo/src/html/suggest/index.html
 */
var $ = require('../../util/index.js');
var Widget = require('../../core/index.js');
var List = require('../../list/index.js');
var Template = require('../../template/index.js');
var SuggestTpl = require('./tpl/suggest.string');
var ResultListTpl = require('./tpl/result-list.string');
var ResultItemTpl = require('./tpl/result-item.string');
var NodataTpl = require('./tpl/suggest-nodata.string');

var id_counter = 0;

var Suggest = Widget.extend({

    /**
     * @property {Function} filter 自定义的过滤函数，默认为null，使用内置过滤函数
     * @property {Array} filterBy 过滤数据的字段，默认为['value']
     * @property {Boolean} modal 是否启用独占的模态框模式，默认为false
     * @property {Boolean} async 是否异步加载数据，默认为false，
     * @property {String} resultActiveClass 搜索结果被点击时的样式，默认为空
     * @property {Boolean} resultScrollLock 当数据项少于一屏时，是否锁定不允许滚动，默认为false，允许滚动
     * @property {String} template 组件的模板
     * @property {String} resultListTpl 搜索结果模板
     * @property {String} resultItemTpl 搜索结果选项模板
     * @property {Boolean} enableNoDataTpl 是否允许使用没有数据的模板，默认为false
     * @property {String} nodataTpl 没有结果的模板，需要设置enableNoDataTpl为true
     * @memberOf Suggest
     */

    /**
     *
     * @template resultItemTpl
     * 组件的搜索结果列表项模板
     * 必须含有 data-role 和 data-index属性，其中
     * data-role="list-item" 指该模板是列表项,
     * data-index={{dataIndex}} 指组件的列表项的index
     * {{text}} 对应数据的现实名称，需要与数据一致
     *
     * @memberOf Suggest
     * @path ./tpl/result-item.string
     *
     */

    /**
     *
     * @template resultListTpl
     * 组件的搜索结果列表项模板
     * 必须含有 data-role属性，其中
     * data-role="scroller" 指组件的滚动容器,
     * data-role="itemWrap" 指组件的列表容器,resultItemTpl解析后会放到这里
     *
     * @memberOf Suggest
     * @path ./tpl/result-list.string
     *
     */

    options: {
        type: 'suggest',
        // 自定义的输出过滤
        filter: null,
        // 过滤数据的字段
        filterBy: ['value'],
        // 忽略大小写
        ignorecase: true,
        // 是否启用独占的模态框模式
        modal: false,
        // 是否异步加载数据
        async: false,
        // 搜索结果激活样式
        resultActiveClass: '',
        // 当数据项少于一屏时，是否锁定不允许滚动，默认为false
        resultScrollLock: false,

        // 组件模板
        template: SuggestTpl,
        // 搜索结果模板
        resultListTpl: ResultListTpl,
        // 搜索结果选项模板
        resultItemTpl: ResultItemTpl,

        //
        enableNoDataTpl: false,
        // 没有数据的提示模板
        nodataTpl: NodataTpl,


        /**
         * 用户点击搜索结果时触发的事件
         * @event selectfilteritem
         * @memberOf Suggest
         * @param  {Object} data 点击的搜索结果条目对应的数据
         */
        onSelectFilterItem: function (data) {},

        /**
         * 搜索值改变时触发的事件
         * @event changevalue
         * @param  {String} newVal 搜索的新值
         * @param  {String} oldVal 搜索的旧值
         * @memberOf Suggest
         */
        onChangeValue: function (newVal, oldVal) {},

        /**
         * 点击键盘上的搜索按钮时触发的事件
         * @event changevalue
         * @param  {HTMLEvent} e     当前事件的对象
         * @param  {String} inputVal 当前组件内input的值
         * @memberOf Suggest
         */
        onSearchKeyup: function (e, inputVal) {},

        events: {
            'input [data-role="input"]': function() {
                var newValue = this._inputer.val();
                var oldValue = this._inputValue;
                this._setInputValue(newValue);
                this.trigger('changevalue', newValue, oldValue);
                this._resultView.scrollTo(0);
                if(!this.get('modal')) {
                    newValue === '' ?
                        (this.widgetEl.removeClass(this._focusClass)):
                        this.widgetEl.addClass(this._focusClass);
                }
                newValue === '' && this.get('async') && this.filterData(null);
            },
            'keyup [data-role="input"]': function(e) {
                e.keyCode == 13 && this.trigger('searchkeyup', e, this._inputer.val());
            },
            'focus [data-role="input"]': function() {
                var self = this;
                var result = self.trigger('focus');
                // if (result !== false) {
                 setTimeout(function() {
                    self.get('modal') && self.widgetEl.addClass(self._modalClass);
                    self.widgetEl.addClass(self._focusClass);
                    self._resultView.resize();

                }, 0);
                // }


            },
            // 取消
            'click [data-role="btn-cancel"]': function() {
                this.widgetEl.removeClass(this._focusClass);
                this.get('modal') && this.widgetEl.removeClass(this._modalClass);
                this._inputer.val('');
                this._setInputValue('');
                this.get('async') && this.filterData(null);
            },
            // 清空
            'click [data-role="btn-clear"]': function() {
                var newValue = '';
                var oldValue = this._inputValue;
                this._inputer.val(newValue);
                this._setInputValue(newValue);
                this.trigger('changevalue', newValue, oldValue);
                if(!this.get('modal')) {
                    this.widgetEl.removeClass(this._focusClass);
                }
                this.get('async') && this.filterData(null);
                this._inputer.focus();
            }
        }
    },
    /**
     * 处理组件数据
     * @function init
     * @memberOf Suggest
     * @private
     */

    init: function() {
        this.initProp();
    },
    /**
     * 解析模板
     * @function parseTemplate
     * @memberOf Suggest
     * @private
     * @param  {String} tpl 待解析的模板
     * @return {String}     解析后的模板
     */
    parseTemplate: function (tpl) {
        var html = Template(tpl, {
            id: this._input_id,
        });
        return html;
    },
    /**
     * 将组件渲染到document中
     * @function render
     * @memberOf Suggest
     */
    render: function() {
        Suggest.superClass.render.call(this);
        this.initUI();
        return this;
    },
    /**
     * 销毁组件
     * @function destroy
     * @memberOf Suggest
     */
    destroy: function() {
        this._resultView.destroy();
        Suggest.superClass.destroy.call(this);
    },

    /**
     * 初始化组件的私有参数
     * @function initProp
     * @memberOf Suggest
     */
    initProp: function() {
        this._resultView = null; // 搜索结果列表
        this._start = false; // 开始搜索
        this._queryStr = ''; // 搜索字符
        this._inputer = null; // 真正的搜索框
        this._placeholder = null; // 占位符
        this._inputValue = ''; // 当前输入的值
        this._modalClass = this.getClassName('modal');
        this._focusClass = this.getClassName('on');
        this._compiler = Template;
        this._input_id = 'yo-search-input-' + (id_counter++);
    },

    /**
     * 渲染组件样式
     * @function initUI
     * @memberOf Suggest
     * @private
     */
    initUI: function() {
        var self = this;

        this._inputer = this.widgetEl.find('[data-role="input"]');
        this._placeholder = this.widgetEl.find('[data-role="placeholder"]');
        this._btnClear = this.widgetEl.find('[data-role="btn-clear"]').hide();
        this._btnLoading = this.widgetEl.find('[data-role="btn-loading"]').hide();
        this._resultEl = this.widgetEl.find('[data-role="suggest-result"]');
        this._nodataEl = this.widgetEl.find('[data-role="nodata"]').hide();
        this._nodataRender = this._compiler(this.get('nodataTpl')) || function() {return ''};

        // 创建搜索结果视图
        var _list = this._resultView = new List({
            container: this._resultEl,
            template: this.get('resultListTpl'),
            itemTpl: this.get('resultItemTpl'),
            activeClass: this.get('resultActiveClass'),
            scrollLock: this.get('resultScrollLock'),
            onTap: function(e) {
                var itemNode = this.getItemNode($(e.target));
                if(itemNode) {
                    var index = itemNode.data('index');
                    self.trigger('selectfilteritem', this.get('datasource')[index]);
                } else {
                    // 在没有输入搜索数据的时候，点击空白区域自动隐藏搜索列表
                    if(!self._inputer.val()) {
                        self.widgetEl.removeClass(self._focusClass);
                        self.get('modal') && self.widgetEl.removeClass(self._modalClass);
                        self._inputer.blur();
                    }
                }
            }
        }).render();

        // 重写创建列表选项
        _list.createListItem = function() {
            var itemHtml = '';
            var ds = _list.get('datasource');
            var render = Template(_list.get('itemTpl'));
            ds && ds.length && ds.forEach(function(item, index) {
                var itemData = $.extend(true, {}, item);
                itemData.dataIndex = index;
                itemHtml += render(itemData);
            });
            return itemHtml;
        };
    },

    /**
     * 获取内部的input元素
     * @function getInputEl
     * @memberOf Suggest
     * @return {HTMLElement} 组件内部的input元素
     */
    getInputEl: function() {
        return this._inputer;
    },

    /**
     * 获取当前搜索框输入的值
     * @function getValue
     * @memberOf Suggest
     * @return {String | Number} 返回当前组件的值
     */
    getValue: function() {
        return this._inputValue;
    },

    /**
     * 设置输入值
     * @function _setInputValue
     * @memberOf Suggest
     * @private
     */
    _setInputValue: function(val) {
        this._inputValue = val;
        if(this._placeholder.length) {
            if(val === '') {
                this._placeholder[0].style.display = 'inline';
                this._btnClear.hide();
            } else {
                this._placeholder[0].style.display = 'none';
                this._btnClear.show();
            }
        }

        if(this.get('async')) {
            if(val !== '') {
                this._btnLoading.show();
                this._btnClear.hide();
            } else {
                this._btnLoading.hide();
                this._btnClear.hide();
            }
        } else {
            this.filterData(this.get('datasource'));
        }
    },

    /**
     * 过滤数据
     * @param  {Array} data 需要过滤的数据
     * @function filterData
     * @private
     * @memberOf Suggest
     */
    filterData: function(data) {
        if(this.get('async') && this._inputValue !== '') {
            this._btnLoading.hide();
            this._btnClear.show();
        }
        data && data.length ? this.set('datasource', data) : this.set('datasource', []);

        var result = [];
        var oldQueryValue = this._queryStr;
        this._queryStr = this._inputValue;
        if(this._queryStr !== oldQueryValue) {
            if(this._queryStr !== '') {
                var filter = this.get('filter');
                var ds = this.get('datasource');
                var by = this.get('filterBy');
                var opt = {ignorecase: this.get('ignorecase')};
                if(filter && $.isFunction(filter)) {
                    result = filter.call(this, ds, this._queryStr,by, opt);
                } else {
                    result = defaultFilter(ds, this._queryStr, by, opt);
                }

                //只有有关键词的情况且返回无数据时才显示
                if(result.length === 0){

                    //显示暂无数据结果
                    this._renderNodataView();

                    //直接返回，不绘制列表
                    return;
                }
            }
            this._renderData(result);
        }
    },

    /**
     * 重新渲染没有数据的模板
     * @function _renderNodataView
     * @private
     * @memberOf Suggest
     */
    _renderNodataView: function () {
        this._resultEl.hide();
        if (this.get('enableNoDataTpl')) {
            this._nodataEl.show();
            this._nodataEl.html(this._nodataRender());
        }
        
    },

    /**
     * 渲染搜索结果
     * @param  {Array} data 需要渲染到结果的数据
     * @function _renderData
     * @private
     * @memberOf Suggest
     */
    _renderData: function(data) {
        this._resultEl.show();
        this._nodataEl.hide();
        this._resultView.reload(data);
    }
});

function defaultFilter(ds, queryStr, keys, options) {
    var result = [];

    if (!ds || !ds.length) {
        return result;
    }

    if(!keys) {
        console.warn('options filterBy is empty!');
        return result;
    } else if(!$.isArray(keys)){
        keys = [keys];
    }

    ds.forEach(function(item) {
        keys.forEach(function(key) {
            if(item && item[key] && result.indexOf(item) == -1) {// 排除重复
                if(options.ignorecase) {
                    ~item[key].toUpperCase().indexOf(queryStr.toUpperCase()) && result.push(item);
                } else {
                    ~item[key].indexOf(queryStr) && result.push(item);
                }
            }
        });
    });

    return result;
}

module.exports = Suggest;