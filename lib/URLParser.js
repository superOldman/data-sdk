export default function urlParse(url) {
  var URLParser = function(url) {
    this._fields = {
      Username: 4,
      Password: 5,
      Port: 7,
      Protocol: 2,
      Host: 6,
      Path: 8,
      URL: 0,
      QueryString: 9,
      Fragment: 10
    };
    this._values = {};
    this._regex = /^((\w+):\/\/)?((\w+):?(\w+)?@)?([^\/\?:]+):?(\d+)?(\/?[^\?#]+)?\??([^#]+)?#?(\w*)/;

    if (typeof url != 'undefined') {
      this._parse(url);
    }
  };

  URLParser.prototype.setUrl = function(url) {
    this._parse(url);
  };

  URLParser.prototype._initValues = function() {
    for (var a in this._fields) {
      this._values[a] = '';
    }
  };

  URLParser.prototype.addQueryString = function(queryObj) {
    if (typeof queryObj !== 'object') {
      return false;
    }
    var query = this._values.QueryString || '';
    for (var i in queryObj) {
      if (new RegExp(i + '[^&]+').test(query)) {
        query = query.replace(new RegExp(i + '[^&]+'), i + '=' + queryObj[i]);
      } else {
        if (query.slice(-1) === '&') {
          query = query + i + '=' + queryObj[i];
        } else {
          if (query === '') {
            query = i + '=' + queryObj[i];
          } else {
            query = query + '&' + i + '=' + queryObj[i];
          }
        }
      }
    }
    this._values.QueryString = query;
  };

  URLParser.prototype.getUrl = function() {
    var url = '';
    url += this._values.Origin;
    url += this._values.Port ? ':' + this._values.Port : '';
    url += this._values.Path;
    url += this._values.QueryString ? '?' + this._values.QueryString : '';
    url += this._values.Fragment ? '#' + this._values.Fragment : '';
    return url;
  };

  URLParser.prototype._parse = function(url) {
    this._initValues();

    var b = this._regex.exec(url);
    if (!b) {
      logger.log('URLParser::_parse -> Invalid URL');
    }

    var urlTmp = url.split('#');
    var urlPart = urlTmp[0];
    var hashPart = urlTmp.slice(1).join('#');
    b = this._regex.exec(urlPart);
    for (var c in this._fields) {
      if (typeof b[this._fields[c]] != 'undefined') {
        this._values[c] = b[this._fields[c]];
      }
    }
    this._values['Hostname'] = this._values['Host'].replace(/:\d+$/, '');
    this._values['Origin'] = this._values['Protocol'] + '://' + this._values['Hostname'];
    this._values['Fragment'] = hashPart;
  };

  return new URLParser(url);
}