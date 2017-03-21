// 解析url
var search  = window.location.search,
    decode = decodeURIComponent;
var S= {} , cache;
function parse(is_now){
  var _s , params = {} ;
  if (cache) {
      return cache;
  }
  _s = window.location.search;
  _s =  _s.replace(/^\?/,"").split("&");
  if (_s.forEach) {
    _s.forEach(function(s,i){
      var t = s.split("=");
      params[t[0]] = decode(t[1]);
    });
  } else {
    for (var i = 0, l = _s.length; i < l; i++) {
      var t = _s[i].split("=");
      params[t[0]] = decode(t[1]);
    }
  }
  cache = params;
  return params;
}

S.get = function(key){
  return key ? parse()[key] : parse();
}

module.exports = S;
