import { isObject, isFunction, isNumber} from '@/utils/index'

function CancellationToken(canceled) {
  this.cancel = function() {
    canceled = true;
  };
  this.getCanceled = function() {
    return canceled || false;
  };
}

function InterceptorContext(data, pos, sd) {
  var originalData = null;
  try {
    originalData = JSON.parse(JSON.stringify(data || null));
  } catch (e) {
    sdLog(e);
  }
  this.getOriginalData = function() {
    return originalData;
  };
  this.getPosition = function() {
    return pos;
  };
  this.cancellationToken = new CancellationToken();
  this.sensors = sd;
}

function Stage(processDef) {
  if (!isObject(processDef)) {
    throw 'error: Stage constructor requires arguments.';
  }
  this.processDef = processDef;
  this.registeredInterceptors = {};
}

Stage.prototype.process = function(proc, data) {
  if (!proc || !(proc in this.processDef)) {
    sdLog('process [' + proc + '] is not supported');
    return;
  }

  var itcptrs = this.registeredInterceptors[proc];
  if (itcptrs && isArray(itcptrs) && itcptrs.length > 0) {
    var pos = {
      current: 0,
      total: itcptrs.length
    };
    var context = new InterceptorContext(data, pos, sd);

    for (var i = 0; i < itcptrs.length; i++) {
      try {
        pos.current = i + 1;
        data = itcptrs[i].call(null, data, context) || data;
        if (context.cancellationToken.getCanceled()) {
          break;
        }
      } catch (e) {
        sdLog('interceptor error:' + e);
      }
    }
  }

  if (this.processDef[proc] && this.processDef[proc] in this.processDef) {
    data = this.process(this.processDef[proc], data);
  }
  return data;
};

Stage.prototype.registerStageImplementation = function(stageImpl) {
  if (!stageImpl || !stageImpl.init || !isFunction(stageImpl.init)) {
    return;
  }
  stageImpl.init(this);
  stageImpl.interceptor && this.registerInterceptor(stageImpl.interceptor);
};

Stage.prototype.registerInterceptor = function(interceptor) {
  if (!interceptor) {
    return;
  }
  for (var i in interceptor) {
    var itcptr = interceptor[i];
    if (!itcptr || !isObject(itcptr) || !isFunction(itcptr.entry)) {
      continue;
    }

    if (!isNumber(itcptr.priority)) {
      itcptr.priority = Number.MAX_VALUE;
    }

    if (!this.registeredInterceptors[i]) {
      this.registeredInterceptors[i] = [];
    }

    var curIts = this.registeredInterceptors[i];
    itcptr.entry.priority = itcptr.priority;
    curIts.push(itcptr.entry);

    curIts.sort(function(ita, itb) {
      return ita.priority - itb.priority;
    });
  }
};

export default Stage