/**
 * Created by 柏然 on 14-1-23.
 */

Array.prototype.desInsert = function (item, proName) {
  if (this.indexOf(item) >= 0)return false;
  if (!this.length) {
    this.push(item);
    return true;
  }
  for (var i = 0, it = this[0], index = 0; it; it = this[++i])
    if (item[proName] >= it[proName])break;
    else index++;
  if (!it) this.push(item);
  else  this.splice(index, 0, item);
  return true;
};
Array.prototype.ascInsert = function (item, proName) {
  if (this.indexOf(item) >= 0)return false;
  if (!this.length) {
    this.push(item);
    return true;
  }
  for (var i = 0, it = this[0], index = 0; it; it = this[++i])
    if (item[proName] <= it[proName])break;
    else index++;
  this.splice(index, 0, item);
  return true;
};
Array.prototype.max = function (propertyName) {
  if (typeof propertyName == "function") {
    var m = propertyName(this[0]);
    this.forEach(function (e) {
      var v = propertyName(e);
      if (v > e) m = v;
    });
  }
  else {
    var m = this[0][propertyName];
    this.forEach(function (e) {
      if (e[propertyName] > m)m = e[propertyName];
    });
  }
  return m;
};
Array.prototype.min = function (propertyName) {
  var m;
  if (typeof propertyName == "function") {
    m = propertyName(this[0]);
    this.forEach(function (e) {
      var v = propertyName(e);
      if (v < e) m = v;
    });
  }
  else {
    m = this[0][propertyName];
    this.forEach(function (e) {
      if (e[propertyName] < m)m = e[propertyName];
    });
  }
  return m;
};
Array.prototype.remove = function (item) {
  var i = this.indexOf(item);
  if (i >= 0) {
    this.splice(i, 1);
    return true;
  }
  return false;
};
Array.prototype.add = function (item) {
  if (item.forEach)
    item.forEach(function (i) {
      this.add(i);
    }, this);
  else {
    var i = this.indexOf(item);
    if (i < 0) {
      this.push(item);
      return true;
    }
    return false;
  }
};
Array.prototype.des = function (proName) {
  if (!proName) this.sort(function (a, b) {
    return a > b ? -1 : 1
  });
  this.sort(function (a, b) {
    if (a[proName] > b[proName])
      return -1;
    else
      return 1;
  });
  return this;
};
Array.prototype.asc = function (proName) {
  if (!proName) this.sort(function (a, b) {
    return a < b ? -1 : 1
  });
  else this.sort(function (a, b) {
    if (a[proName] < b[proName])
      return -1;
    else
      return 1;
  });
  return this;
};
Array.prototype.findBy = function (proName, value) {
  for (var i = 0, item = this[0]; item; item = this[++i])
    if (item[proName] === value) return item;
  return null;
};
Array.prototype.mapBy = (function () {
  function addToMap(obj, name, item) {
    var a = obj[name];
    if (!a)a = obj[name] = [];
    a.add(item);
    return a;
  }

  return function (proNameOrFunc) {
    var func = typeof proNameOrFunc == "function" ? proNameOrFunc : function (a) {
      return a[proNameOrFunc];
    };
    for (var i = 0, map = {}, item = this[0]; item; item = this[++i])
      addToMap(map, func(item), item);
    return map;
  };
})();
Array.prototype.groupBy = function (proNameOrFunc) {
  return this.mapBy(proNameOrFunc).getOwnPropertyValues();
};
Array.prototype.paste = function () {
  for (var i = 0, item = this[0], r = []; item; item = this[++i])
    if (item.paste)r.push(item.paste());
    else return null;
  return r;
};
Array.prototype.copy = function (array) {
  for (var i = 0, item = array[0]; item; item = array[++i])
    if (item.copy)this.push(item.copy(item));
    else return null;
  return this;
};
Boolean.prototype.toFloat = function () {
  return this ? 1 : 0;
};
String.prototype.format = function () {
  var res = arguments;
  return this.replace(/\{\d+?\}/g, function (a) {
    return res[parseInt(a.substr(1, a.length - 2))] || (res[parseInt(a.substr(1, a.length - 2))] === '' ? '' : a);
  });
};
Object.prototype.addProperty = function (args, invalid) {
  if (typeof (args) == 'string') args = {privateName: '_' + args, publicName: args};
  else if (!args.privateName) args.privateName = '_' + args.publicName;
  args.invalid = (invalid !== false);
  var options = {enumerable: false, configurable: true};
  if (args.get !== false)
    if (typeof (args.get) != 'function')
      options.get = new Function('return this.' + args.privateName + ';');
    else
      options.get = args.get;
  if (args.set !== false)
    if (typeof (args.set) != "function")
      options.set = new Function('val', ('var o=this.{0};if(o!==val)this.{0}=val;this.notify("{1}",o);'
        .format(args.privateName, args.publicName) + (args.invalid ? 'this.invalid();' : '')));
    else
      options.set = args.set;
  Object.defineProperty(this, args.publicName, options);
  return this;
};
Object.prototype.toInt = function () {
  var i = parseInt(this);
  if (isNaN(i))return undefined;
  else return i;
};
Object.prototype.toFloat = function () {
  var i = parseFloat(this);
  if (isNaN(i))return undefined;
  else return i;
};
Object.prototype.on = function (evtName, handler) {
  if (typeof evtName !== "string" || !evtName || typeof handler != "function")return this;
  var cbs = this._callbacks, hs;
  if (!cbs)this._callbacks = cbs = {};
  hs = cbs[evtName];
  if (!hs)cbs[evtName] = [handler];
  else hs.add(handler);
  return this;
};
Object.prototype.emit = (function () {
  function emit(evtName, argArray, thisObj) {
    var cbs = this._callbacks, hs, r;
    if (!cbs)return true;
    hs = cbs[evtName];
    if (!hs || hs._emitting)return false;
    hs._emitting = true;
    if (!argArray)argArray = [];
    else if (!argArray.forEach) argArray = [argArray];
    thisObj = thisObj || this;
    cbs[evtName] = hs.filter(function (call) {
      try {
        r = call.apply(thisObj, argArray);
      }
      catch (error) {
        r = console.log(error.stack || error);
      }
      return r != -1;
    });
    hs._emitting = false;
    return true;
  }

  return emit;
})();
Object.prototype.getOwnPropertyValues = function () {
  return Object.getOwnPropertyNames(this).map(function (n) {
    return this[n]
  }, this);
};
Object.prototype.toBool = function () {
  return this == true;
};
Object.prototype.allOwnPros = function (f) {
  for (var i = 0, names = Object.getOwnPropertyNames(this), name = names[0]; name; name = names[++i])
    f.apply(this, [this[name], name]);
};
Object.defer = window.Q ? Q.defer : (function () {
  function enqueue(callback) {
    setTimeout(callback, 1);
  }

  function defer() {
    var pending = [], value, d = Object.create(defer.prototype);
    d.resolve = function (_value) {
      if (pending) {
        value = promise(_value);
        for (var i = 0, ii = pending.length; i < ii; i++)
          value.then.apply(value, pending[i]);
        pending = undefined;
      }
    };
    d.reject = function (reason) {
      d.resolve(reject(reason))
    };
    d.promise = {
      then: function (_callback, _errback) {
        var result = defer();
        _callback = _callback || function (value) {
          return value;
        };
        _errback = _errback || function (reason) {
          return reject(reason);
        };
        var callback = function (value) {
          result.resolve(_callback(value));
        };
        var errback = function (reason) {
          result.resolve(_errback(reason));
        };
        if (pending) pending.push([callback, errback]);
        else  enqueue(function () {
          value.then(callback, errback);
        });
        return result.promise;
      }
    };
    return d;
  }

  function promise(value) {
    if (value.then)return value;
    var p = Object.create(promise.prototype);
    p.then = function (callback) {
      var result = defer();
      enqueue(function () {
        result.resolve(callback(value));
      });
      return result.promise;
    };
    return p;
  }

  function reject(reason) {
    var p = Object.create(promise.prototype);
    p.then = function (callback, errback) {
      var result = defer();
      enqueue(function () {
        result.resolve(errback(reason));
      });
      return result.promise;
    };
    return p;
  }

  return defer;
})();
Math.log2 = Math.log2 || function (val) {
  return Math.log(val) * Math.LOG2E;
};

Math.isInt = function (x) {
  var y = parseInt(x, 10);
  return !isNaN(y) && x == y && x.toString() == y.toString();
};
Function.prototype.inherit = function (objPrototype, proArray, baseConstructor) {
  var base = Object.create(baseConstructor ? new baseConstructor() : {});
  for (var p in objPrototype) base[p] = objPrototype[p];
  proArray.forEach(function (p) {
    base.addProperty(p);
  });
  this.prototype = base;
  return this;
};


/**
 * Created by 柏然 on 14-1-23.
 */
CanvasRenderingContext2D.prototype.setClipRect = function (x, y, w, h) {
  this.beginPath();
  if (arguments.length) {
    this.rect(x, y, w, h);
  }
  else {
    var g = this.canvas._global || this.canvas;
    this.rect(0, 0, g._width, g._height);
  }
  this.closePath();
  this.clip();
};
CanvasRenderingContext2D.prototype.clearClipRect = function () {
  var g = this.canvas._global || this.canvas;
  this.clearRect(0, 0, g._width, g._height);
};
window.requestAFrame = (function () {
  return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    function (callback) {
      return window.setTimeout(callback, 1000 / 60); // shoot for 60 fps
    };
})();
var core = {
  Global: function (canvas, maxWidth, maxHeight) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.defaultTask = null;
    this.activeTask = null;
    this._tasks = [];
    this._invalid = true;
    this.scale = 0;
    canvas._global = this;
    this._cvsLeft = 0;
    this._cvsTop = 0;
    this._width = parseInt(maxWidth) || canvas.width;
    this._height = parseInt(maxHeight) || canvas.height;
    this._onAction = false;
    return this;
  },
  Task: function (name) {
    this._name = name;
    this._components = [];
    this._timeline = new animations.TimeLine(this);
    this._updateComponets = [];
    this._updateClocks = [];
    this._onAction = false;
    this._global = null;
    this._activeDrager = null;
    this._isPress = false;
  },
  renderCanvas: function (global) {
    var gat = global.activeTask || global.defaultTask;
    if (!gat)return;
    if (global._invalid || gat._updateClocks.length || gat._updateComponets.length) {
      gat.timeline.move();
      gat._updateComponets.forEach(function (e) {
        if (e.enable)e.update.call(e, gat);
      });
      gat._updateClocks.forEach(function (e) {
        e.update.call(e, gat._timeline);
      });
      gat._updateComponets = gat._updateComponets.filter(function (e) {
        return e._updateFunc.length;
      });
      if (global._invalid) {
        var ctx = global.ctx, cs = gat._components;
        ctx.setClipRect();
        ctx.clearClipRect();
        for (var i = cs.length - 1, c = cs[i]; c; c = cs[--i]) c.render(ctx);
      }
      global._invalid = false;
      global.emit('frameEnd');
    }
  },
  animate: function (global) {
    global.loop = function () {
      core.renderCanvas(this);
      window.requestAFrame(this.loop.bind(this));
    };
    global.loop();
  },
  setCanvasFullScreen: function (canvas, pw, ph) {
    document.body.style.overflow = 'hidden';
    var winw = Math.floor(document.documentElement.clientWidth * 0.98);
    var winh = Math.floor(document.documentElement.clientHeight * 0.98);
    var g = canvas._global;
    if (winw / winh > pw / ph) {
      canvas.height = winh;
      canvas.width = pw / ph * winh;
      g.scale = winh / ph;
      g._cvsTop = canvas.offsetTop;
      g._cvsLeft = Math.round((document.documentElement.clientWidth - canvas.offsetLeft - canvas.width) / 2);
      canvas.style.marginLeft = g._cvsLeft + 'px';
      g._cvsLeft = canvas.offsetLeft;
      canvas.style.marginTop = "0px";
    } else {
      canvas.width = winw;
      canvas.height = ph / pw * winw;
      g.scale = winw / pw;
      g._cvsLeft = canvas.offsetLeft;
      g._cvsTop = Math.round((document.documentElement.clientHeight - canvas.offsetTop - canvas.height) / 2);
      canvas.style.marginTop = g._cvsTop + 'px';
      g._cvsTop = canvas.offsetTop;
      canvas.style.left = "0px";
    }
    g.ctx.scale(g.scale, g.scale);
  },
  mouseArg: function (e, global, invalid) {
    var cvs = global.canvas, ox = e.clientX - cvs.offsetLeft, oy = e.clientY - cvs.offsetTop;
    return {cx: parseInt(ox / global.scale), cy: parseInt(oy / global.scale),
      ox: ox, oy: oy, _invalid: invalid !== false
    }
  },
  addCanvasHandlers: function (cvs) {
    var hs = eventHandlers.canvasHandlers;
    hs.allOwnPros(function (v, n) {
      cvs.addEventListener(n.toLowerCase(), v, true);
    });
    cvs.addEventListener('touchcancel', hs.touchEnd, true);
    cvs.addEventListener("DOMMouseScroll", hs.mouseWheel, true);
  },
  Font: function (s) {
    var match;
    s.replace(/\s{2,}/g, ' ').trim();
    match = ( s.indexOf('px') > -1 ? s.match(/px.+$/) : s.match(/\s?.+$/));
    this.family = match ? match[0].replace(/px\s+/, '') : 'Arial';
    this.style = (s.match(/\b(italic|oblique)\b/) || ['normal'])[0];
    this.weight = (s.match(/\b(bold|lighter|bolder)\b/) || ['normal'])[0];
    match = s.match(/\d+(\.?\d+)(?=px)/i);
    this.size = match ? parseInt(match[0]) : 14;
    return this;
  }
};
core.Font.parseFont = function (font, lineSpace) {
  if (font.size)return Math.ceil(font.size * lineSpace);
  return Math.ceil(parseFloat(font.match(/\d+(\.?\d+)(?=px)/i)[0])) * (lineSpace || 1);
};
core.Font.prototype = {
  type: 'core.Font',
  toString: function () {
    core.helper._ctx.font = '{0} {4} {1} {2}px {3}'.format(this.style, this.weight, this.size, this.family, 'normal');
    return core.helper._ctx.font;
  },
  equals: function (f) {
    if (!f || !f.type || f.type !== core.Font.prototype.type) return false;
    for (var p in this)
      if (this.hasOwnProperty(p))
        if (this[p] != f[p])return false;
    return true;
  },
  get fontString() {
    core.helper._ctx.font = '{0} {4} {1} {2}px {3}'.format(this.style, this.weight, this.size, this.family, 'normal');
    return core.helper._ctx.font;
  }
};
core.helper = {
  _canvas: document.createElement('canvas'),
  _ctx: null,
  _inputElement: null,
  _textareaElement: null,
  createPattern: function (ctrl) {
    var task = ctrl.getTask(), scale = task ? task._global.scale : 1, canvas = task._global.canvas;
    this._canvas.width = ctrl.w;
    this._canvas.height = ctrl.h;
    this._ctx.drawImage(canvas, ctrl.absX * scale, ctrl.absY * scale, ctrl.w * scale, ctrl.h * scale, 0, 0, ctrl.w, ctrl.h);
    return this._ctx.createPattern(this._canvas, 'no-repeat');
  },
  getImageData: function (global, x, y, w, h) {
    var ctx = global.ctx, scale = global.scale, imgdata = ctx.getImageData(scale * x, scale * y, scale * (w || global._width - x), scale * (h || global._height - y));
    imgdata.x = x;
    imgdata.y = y;
    return imgdata;
  }
};
core.Global.prototype = {
  invalid: function () {
    this._invalid = true;
    return this;
  },
  addTask: function (task, isDefault) {
    if (task && task.type == core.Task.prototype.type && this._tasks.add(task)) {
      task._global = this;
      if (isDefault === true || task.name == 'default')
        this.defaultTask = task;
      this.emit('task', [task]);
    }
    return this;
  },
  removeTask: function (taskOrName) {
    var task = typeof (taskOrName) == 'string' ? this._tasks.findBy('_name', taskOrName) : taskOrName;
    if (!task)return null;
    task._global._tasks.remove(task);
    task._global = undefined;
    task._components.forEach(function (e) {
      e.dispose();
    });
    return this;
  },
  switchTask: function (taskOrName) {
    var task = (typeof (taskOrName) == 'string' ? this._tasks.findBy('_name', taskOrName) : taskOrName) || this.defaultTask;
    if (!task || task === this.activeTask) return task;
    this.activeTask.stop();
    this.activeTask = task;
    task.start();
    this.invalid();
    return task;
  },
  absoluteY: function (y) {
    return y * this.scale + this.canvas.offsetTop;
  },
  absoluteX: function (x) {
    return x * this.scale + this.canvas.offsetLeft;
  },
  init: function () {
    if (this._tasks.length) {
      this.defaultTask = this.defaultTask || this._tasks[0];
      this.activeTask = this.activeTask || this.defaultTask;
      this.activeTask.start();
      core.addCanvasHandlers(this.canvas);
      core.animate(this);
      this._onAction = true;
      this.init = function () {
      };
    }
  }
};
core.Task.prototype = {
  get timeline() {
    return this._timeline;
  },
  type: 'core.task',
  removeUIComponents: function () {
    for (var i = 0, component = arguments[0]; component; component = arguments[++i])
      if (this._components.remove(component)) {
        component.task = null;
        component.dispose(this);
      }
    if (this._global)
      this._global.invalid();
  },
  addUIComponents: function () {
    for (var i = 0, component = arguments[0]; component; component = arguments[++i])
      if (this._components.desInsert(component, '_z')) {
        component.task = this;
        if (component.shouldUpdate) this.addUpdateComponent(component);
        if (component.clock && component.clock._waitUpdate) this.addClock(component.clock);
      }
    this.invalid();
  },
  addClock: function (clock) {
    if (clock && !clock.isStopped && this._updateClocks.add(clock)) {
      clock._timeline = this.timeline;
      return true;
    }
    return false;
  },
  removeClock: function (clock) {
    if (clock && this._updateClocks.remove(clock)) {
      clock._timeline = null;
      return true;
    }
    return false;
  },
  addUpdateComponent: function () {
    for (var i = 0, component = arguments[0]; component; component = arguments[++i])
      if (this._updateComponets.add(component) && component.task !== this)
        component.task = this;
  },
  removeUpdateComponent: function () {
    for (var i = 0, component = arguments[0]; component; component = arguments[++i])
      if (this._updateComponets.remove(component) && component.task)
        component.task = null;

  },
  invalid: function () {
    if (this._global)
      this._global.invalid();
  },
  press: function (e) {
    if (this._isPress)
      this._activeDrager.onend(e, this._activeDrager._parent);
    this._isPress = true;
    var drager = e.drager, p;
    if (!drager)return true;
    p = drager.parent;
    drager._onAction = true;
    this._activeDrager = drager;
    p.emit('dragstart', [e, p]);
    return true;
  },
  cancelPress: function (e) {
    var ad = this._activeDrager, p;
    this._isPress = false;
    if (ad) {
      p = ad.parent;
      ad.onend(e, ad._parent);
      p.emit('dragend', [e, p]);
      ad._onAction = false;
      this._activeDrager = null;
      return true;
    }
    return false;
  },
  dragMove: function (e) {
    var ad = this._activeDrager, p;
    if (ad) {
      p = ad.parent;
      this._supressClick = ad.onmouseMove(e, p) !== false | p.emit('dragmove', [e, p]);
      return true;
    }
    return false;
  },
  start: function () {
    this.timeline.start();
  },
  stop: function () {
    this.timeline.stop();
  },
  removeCtrl: function () {
    this.removeUIComponents(arguments);
  },
  addCtrl: function (ctrl) {
    if (ctrl instanceof  Array)
      this.addUIComponents.apply(this, ctrl);
    else this.addUIComponents(ctrl);
  },
  findCtrl: function (name) {
    return this._components.findBy('name', name);
  },
  get name() {
    return this._name;
  }
};
(function () {
  var helper = core.helper;
  helper._ctx = core.helper._canvas.getContext('2d');
  helper.imgPool = (function () {
    var pool = {},base='',exporter={};
    Object.defineProperty(exporter,'baseAddress',{
      get:function(){return base;},set:function(val){base=val;}
    });
    function imgChangeState(img, state, evtName) {
      var ctrls = img._controls;
      img.state = state;
      if (ctrls)
        ctrls.forEach(function (c) {
          c.emit(evtName, [img, c]);
          c.getTask().invalid();
        });
      delete img._controls;
    }

    function onload(e) {
      imgChangeState(e.target, 1, 'load');
    }

    function onunolad(e) {
      imgChangeState(e.target, -1, 'error')
    }

    function getImg(src) {
      src=base+src;
      var img = pool[src];
      if (!img) {
        img = new Image();
        img.crossOrigin = '*';
        img.src = src;
        pool[src] = img;
        img.style.display = 'none';
        document.body.appendChild(img);
        img.state = 0;
        img.onload = onload;
        img.onerror = img.onunload = onunolad;
      }
      return img;
    }

    function injectImg(ctrl) {
      var img = getImg(ctrl.src), ctrls;
      ctrl._img = img;
      if (img.state == 1)
        ctrl.emit('onload', [img, ctrl]);
      else if (img.state == -1)
        ctrl.emit('onerror', [img, ctrl]);
      else {
        ctrls = img._controls;
        if (!ctrls)img._controls = [ctrl];
        else ctrls.add(ctrl);
      }
      return img;
    }
    exporter.getImg=function(srcOrImg) {
      if (typeof srcOrImg == "string")
        return getImg(srcOrImg);
      else if (srcOrImg.src)
        return injectImg(srcOrImg);
    };
    return exporter;
  })();
  helper._inputElement = new (function () {
    var input = document.createElement("input");
    input.autofocus = "true";
    var show = false;
    input.style.zIndex = Number.POSITIVE_INFINITY;
    input.style.position = "absolute";
    this.setValue = function (val) {
      input.value = val;
    };
    this.getValue = function () {
      return input.value;
    };
    this.bind = function (ctrl) {
      if (ctrl && !ctrl.enable)
        return;
      this.unbind();
      this.textbox = ctrl;
      if (ctrl.mask)
        input.type = 'password';
      else
        input.type = 'text';
      ctrl._inputElement = this;
      this.reset(ctrl);
    };
    this.unbind = function () {
      if (this.textbox) {
        this.conceal();
        this.textbox.text = input.value;
        this.textbox._inputElement = undefined;
        this.textbox = undefined;
      }
    };
    this.reset = function (ctrl) {
      if (ctrl.y < 0 || ctrl._parent && ctrl.y + ctrl._h > ctrl.parent._h)
        this.conceal();
      else {
        var global = ctrl.getTask()._global;
        if (!global) this.unbind();
        else {
          input.style.width = ctrl.w * global.scale + "px";
          input.style.height = ctrl.h * global.scale + "px";
          input.style.top = global.absoluteY(ctrl.absY) + "px";
          input.style.left = global.absoluteX(ctrl.absX) + "px";
          input.value = ctrl._txt || '';
          var font = ctrl.font;
          font.size *= global.scale;
          input.style.font = font.fontString;
          input.style.color = ctrl.textColor || 'black';
          this.reveal();
        }
      }
    };
    this.conceal = function () {
      if (show) {
        document.body.removeChild(input);
        show = false;
      }
      if (this.textbox)this.textbox.invalid();
    };
    this.reveal = function () {
      if (!show) {
        document.body.appendChild(input);
        input.focus();
        show = true;
      }
    };
    this.isShow = function () {
      return show;
    };
  })();
  helper._textareaElement = new (function () {
    var c, ele;
    ele = document.createElement('textarea');
    ele.autofocus = 'true';
    ele.style.position = 'absolute';
    this._display = false;
    this.conceal = function () {
      if (this._display) {
        document.body.removeChild(ele);
        this._display = false;
      }
    };
    this.reveal = function () {
      if (!this._display) {
        document.body.appendChild(ele);
        this._display = true;
      }
    };
    this.ctrlUpdate = function (task) {
      var s = ele.style, g = task._global, scale = g.scale;
      ele.value = c.text;
      ele.style.zIndex = g.canvas.style.zIndex + 1;
      var f = new core.Font(c._font);
      f.size = Math.ceil(f.size * scale);
      console.log(f.toString());
      s.font = f.toString();
      s.width = Math.ceil(c._w * scale) + 'px';
      s.height = Math.ceil(c._h * scale) + 'px';
      s.left = g.absoluteX(c.absX) + 'px';
      s.top = g.absoluteY(c.absY) + 'px';
      this.reveal();
    };
    this.bind = function (ctrl) {
      this.unbind();
      if (ctrl && ctrl._textarea != undefined) {
        c = ctrl;
        c._textarea = this;
        var t = c.getTask();
        if (t) this.ctrlUpdate(t);
        else
          c.addUpdateFunc(function (t) {
            if (this._textarea) this._textarea.ctrlUpdate(t);
          });
      }
    };
    this.unbind = function () {
      var r = c;
      if (c) {
        c.text = ele.value;
        this.conceal();
        c = undefined;
      }
      return r;
    };
  })();
}());
function initCanvas(canvasOrID, width, height, ondefaultTaskCreated) {
  var canvas = typeof (canvasOrID) == 'string' ? document.getElementById(canvasOrID) : canvasOrID;
  var g = new core.Global(canvas);
  g.addTask(new core.Task('default'), true);
  g.activeTask = g.defaultTask;
  g.activeTask.timeline.start();
  core.setCanvasFullScreen(canvas, width, height);
  core.addCanvasHandlers(canvas);
  ondefaultTaskCreated(g.defaultTask, g);
  core.animate(g);
  return canvas;
}/**
 * Created by 柏然 on 14-1-23.
 */
var animations = {
  SimpleClock: function (duration, range, direction, offset, timingFunction, infinite, autoDisEvents) {
    this.duration = duration || 0;
    this.direction = direction || 1;
    this.timingFunction = timingFunction || animations.TimingFunctions.linear;
    this.multiplier = range || 1;
    this.offset = offset || 0;
    this._startTime = -1;
    this.d = this.direction;
    this.t = this.d == 1 ? 0 : 1;
    this._stopped = true;
    this.value = this.offset;
    this.infinite = infinite || 0;
    this._timeline = null;
    this.autoDisEvt = autoDisEvents;
    this.autoInvalid = true;
  },
  TimeLine: function (task) {
    this._now = this._stopTime = 0;
    this._startTime = this._lastStop = Date.now();
    this._task = task;
    this._isStop = true;
    return this;
  },
  Animation: function (ntransFun, clock, name) {
    this._name = name || 'animation';
    this._parent = null;
    this._otransFunc = null;
    this._ntransFunc = ntransFun || function (ctx) {
    };
    this._nclock = clock || new animations.SimpleClock();
    this._oclock = null;
    this._applied = false;
  }
};
animations.TimeLine.prototype = {
  get now() {
    return this._now;
  },
  get isStopped() {
    return this._isStop;
  },
  get task() {
    return this._task;
  },
  ticksPerSecond: 1000,
  stop: function () {
    if (!this._isStop) {
      this._isStop = true;
      this._lastStop = Date.now();
    }
  },
  start: function () {
    if (this._isStop) {
      this._isStop = false;
      this._stopTime += Date.now() - this._lastStop;
    }
  },
  move: function () {
    if (!this._isStop) {
      this._now = Date.now() - this._startTime - this._stopTime;
    }
  }
};
animations.SimpleClock.prototype = {
  waitUpdate: function () {
    var p = this._parent;
    if (p) {
      var t = p.getTask();
      if (t)
        t.addClock(this);
      else p.addUpdateFunc(function (task) {
        task.addClock(this.clock);
      });
    }
    else
      this._waitUpdate = true;
  },
  start: function (disableEvent) {
    if (this.t != (this.direction == 1 ? 0 : 1)) return false;
    this._startTime = -1;
    this.d = this.direction;
    this.t = this.d == 1 ? 0 : 1;
    this._stopped = false;
    this.waitUpdate();
    this.autoDisEvt = disableEvent === true;
    return true;
  },
  restart: function (disableEvent) {
    this.reset();
    this.start(disableEvent);
  },
  reset: function (timeline) {
    if (timeline instanceof animations.TimeLine)
      this._timeline = timeline;
    this._startTime = -1;
    this.d = this.direction;
    this.t = (this.d == 1 ? 0 : 1);
    this.value = this.t * this.multiplier + this.offset;
    this._stopped = true;
  },
  end: function (timeline) {
    if (timeline instanceof animations.TimeLine)
      this._timeline = timeline;
    this._startTime = -1;
    this.d = this.direction;
    this.t = (this.d == 1 ? 1 : 0);
    this.value = this.t * this.multiplier + this.offset;
    this._stopped = true;
  },
  reverse: function (disableEvent) {
    if (this.t != ((this.direction == 1 ? 1 : 0))) return false;
    this._startTime = -1;
    this._stopped = false;
    this.d = -this.direction;
    this.t = (this.d == 1 ? 0 : 1);
    this.waitUpdate();
    this.autoDisEvt = disableEvent === true;
    return true;
  },
  toggle: function (disableEvent) {
    if (this.t == 0)
      this.restart(disableEvent);
    else if (this.t == 1)
      this.reverse(disableEvent);
  },
  onchange: function (lastValue, s, parent) {
  },
  get parent() {
    return this._parent;
  },
  set onend(func) {
    this.on('end', func);
  },
  set onreverse(func) {
    this.on('reversed', func);
  },
  set ontick(func) {
    this.on('tick', func);
  },
  get reversing() {
    return this.d == -this.direction;
  },
  get isStopped() {
    return this._stopped;
  },
  update: function (timeline) {
    if (!this._stopped) {
      if (this._startTime == -1) {
        this._startTime = timeline.now;
        if (this.autoDisEvt)eventHandlers.config.enable = false;
        return true;
      }
      var dur = (timeline.now - this._startTime) / timeline.ticksPerSecond;
      if (dur > 0) {
        var ov = this.value, evt, p = this._parent;
        this.t = this.d == 1 ? dur / this.duration : 1 - dur / this.duration;
        if (this.t > 1)this.t = 1; else if (this.t < 0)this.t = 0;
        this.value = this.timingFunction.apply(animations.TimingFunctions, [this.t]) * this.multiplier + this.offset;
        if (ov != this.value) {
          this.emit('tick', [ov, this, p]);
          this.onchange(ov, this, p);
          if (this.autoInvalid) timeline._task.invalid();
        }
        if (this.t == 0) evt = 'reversed';
        else if (this.t == 1) evt = 'end';
        if (evt) {
          this._stopped = true;
          this.emit(evt, [timeline, this, p]);
          if (this.infinite) this.toggle();
          if (this.autoDisEvt) eventHandlers.config.enable = true;
        }
        return true;
      }
    }
    else timeline._task.removeClock(this);
    delete  this._waitUpdate;
    return false;
  }
};
animations.Animation.prototype = {
  apply: function (ctrl) {
    if (!this._applied) {
      this._applied = true;
      this._parent = ctrl;
      this._oclock = ctrl.clock;
      this._otransFunc = ctrl.transform;
      ctrl.clock = this._nclock;
      ctrl._animation = this;
      ctrl.transform = function (ctx) {
        this.animation._otransFunc.apply(this, [ctx]);
        this.animation._ntransFunc.apply(this, [ctx]);
      };
    }
  },
  dispose: function () {
    if (this._applied) {
      this._applied = false;
      var ctrl = this._parent;
      if (ctrl._animation === this) ctrl._animation = null;
      this._parent = null;
      ctrl.clock = this._oclock;
      ctrl.transform = this._otransFunc;
    }
  }, start: function () {
    if (this._nclock._stopped)
      this._nclock.restart();
  },
  restart: function () {
    this._nclock.restart();
  }
};
animations.TimingFunctions = {
  linear: function (t) {
    return t;
  },
  sineEaseIn: function (t) {
    return -Math.cos(t * (Math.PI / 2)) + 1;
  },
  sineEaseOut: function (t) {
    return Math.sin(t * (Math.PI / 2));
  },
  sineEaseInOut: function (t) {
    return -.5 * (Math.cos(Math.PI * t) - 1);
  }, quintEaseIn: function (t) {
    return t * t * t * t * t;
  }, quintEaseOut: function (t) {
    t--;
    return t * t * t * t * t + 1;
  },
  quintEaseInOut: function (t) {
    t /= .5;
    if (t < 1) {
      return .5 * t * t * t * t * t;
    }
    t -= 2;
    return .5 * (t * t * t * t * t + 2);
  }, quartEaseIn: function (t) {
    return t * t * t * t;
  }, quartEaseOut: function (t) {
    t--;
    return -(t * t * t * t - 1);
  }, quartEaseInOut: function (t) {
    t /= .5;
    if (t < 1) {
      return .5 * t * t * t * t;
    }
    t -= 2;
    return -.5 * (t * t * t * t - 2);
  }, circEaseIn: function (t) {
    return -(Math.sqrt(1 - t * t) - 1);
  }, circEaseOut: function (t) {
    t--;
    return Math.sqrt(1 - t * t);
  }, circEaseInOut: function (t) {
    t /= .5;
    if (t < 1) {
      return -.5 * (Math.sqrt(1 - t * t) - 1);
    }
    t -= 2;
    return .5 * (Math.sqrt(1 - t * t) + 1);
  }, quadEaseIn: function (t) {
    return t * t;
  }, quadEaseOut: function (t) {
    return -1 * t * (t - 2);
  }, quadEaseInOut: function (t) {
    t /= .5;
    if (t < 1) {
      return .5 * t * t;
    }
    t--;
    return -.5 * (t * (t - 2) - 1);
  }, cubicEaseIn: function (t) {
    return t * t * t;
  }, cubicEaseOut: function (t) {
    t--;
    return t * t * t + 1;
  }, cubicEaseInOut: function (t) {
    t /= .5;
    if (t < 1) {
      return .5 * t * t * t;
    }
    t -= 2;
    return .5 * (t * t * t + 2);
  }, bounceEaseOut: function (t) {
    if (t < 1 / 2.75) {
      return 7.5625 * t * t;
    } else {
      if (t < 2 / 2.75) {
        t -= 1.5 / 2.75;
        return 7.5625 * t * t + .75;
      } else {
        if (t < 2.5 / 2.75) {
          t -= 2.25 / 2.75;
          return 7.5625 * t * t + .9375;
        } else {
          t -= 2.625 / 2.75;
          return 7.5625 * t * t + .984375;
        }
      }
    }
  }, bounceEaseIn: function (t) {
    return 1 - this.bounceEaseOut(1 - t);
  }, bounceEaseInOut: function (t) {
    if (t < .5) {
      return this.bounceEaseIn(t * 2) * .5;
    } else {
      return this.bounceEaseOut(t * 2 - 1) * .5 + .5;
    }
  }, expoEaseIn: function (t) {
    return t == 0 ? 0 : Math.pow(2, 10 * (t - 1));
  }, expoEaseOut: function (t) {
    return t == 1 ? 1 : -Math.pow(2, -10 * t) + 1;
  }, expoEaseInOut: function (t) {
    if (t == 0)  return 0;
    else if (t == 1) return 1;
    else if (t / .5 < 1) return .5 * Math.pow(2, 10 * (t / .5 - 1));
    else  return .5 * (-Math.pow(2, -10 * (t / .5 - 1)) + 2);
  }, zeroStep: function (t) {
    return t <= 0 ? 0 : 1;
  }, halfStep: function (t) {
    return t < .5 ? 0 : 1;
  }, oneStep: function (t) {
    return t >= 1 ? 1 : 0;
  }, random: function (t) {
    return Math.random();
  }, randomLimit: function (t) {
    return Math.random() * t;
  }
};
animations.util = {
  verticalFlip: function (ctrl, duration, angle, timeFunc, centerX,dir) {
    var ani = ctrl.animation;
    if (!ani) {
      var cx = isNaN(centerX) ? ctrl.w / 2 : centerX, tf = function (ctx) {
        var cos = Math.cos(this.clock.value), sin = Math.sin(this.clock.value);
        ctx.transform(cos, sin, 0, 1, (1 - cos) * cx, -cx * sin);
      };
      var clock = new animations.SimpleClock(duration || 0.7, angle || Math.PI * 2, dir||1, 0, timeFunc || animations.TimingFunctions.quintEaseInOut);
      ctrl.animation = ani = new animations.Animation(tf, clock, 'vcFlip');
      ani.start();
    }
    return ani._name == 'vcFlip' ? ani : null;
  },
  rotate: function (ctrl, duration, angle, timeFunc, centerX, centerY) {
    var ani = ctrl.animation;
    if (!ani) {
      var cx = isNaN(centerX) ? ctrl.w / 2 : centerX, cy = isNaN(centerY) ? ctrl.h / 2 : centerY,
        tf = function (ctx) {
          ctx.translate(cx, cy);
          ctx.rotate(this.clock.value);
        };
      var clock = angle == -1 ? new animations.SimpleClock(duration || 1, Math.PI * 4, 1, 0, null, true) :
        new animations.SimpleClock(duration || 1, angle || Math.PI * 2, 1, 0, timeFunc);
      ctrl.animation = ani = new animations.Animation(tf, clock, 'cRotate');
      ani.start();
    }
    return ani._name == 'cRotate' ? ani : null;
  },
  pop: function (ctrl, dur, timingFunc, cx, cy,dir) {
    var ani = ctrl.animation;
    if (!ani) {
      cx = isNaN(cx) ? ctrl.w / 2 : cx;
      cy = isNaN(cy) ? ctrl.h / 2 : cy;
      var tf = function (ctx) {
          var t = this.clock.value, rt = 1 - t;
          ctx.transform(t, 0, 0, t, rt * cx, rt * cy);
        },
        clock = new animations.SimpleClock(dur || 1, 1, dir||1, 0, timingFunc);
      ctrl.animation = ani = new animations.Animation(tf, clock, 'popOut');
      ani.start();
    }
    return ani._name == 'popOut' ? ani : null;
  },
  translate: function (ctrl, dur, timingFunc, dx, dy, autoReverse) {
    var ani = ctrl.animation, clock;
    clock = new animations.SimpleClock(dur || 0.5, 1, 1, 0, timingFunc || animations.TimingFunctions.sineEaseInOut, autoReverse);
    clock.ontick = function (o) {
      var td = this.value - o, p = this._parent;
      p.x += td * this.data.dx;
      p.y += td * this.data.dy;
    };
    if (!ani) {
      ctrl.animation = ani = new animations.Animation(controls.UIComponent.prototype.translate, clock, 'trans');
      clock.data = { dx: dx || 0, dy: dy || 0 };
    }
    else if (ani._name = 'trans') {
      ani._nclock = clock;
      clock.data = { dx: dx || 0, dy: dy || 0 };
      ctrl.clock = clock;
    }
    return ani._name == 'trans' ? ani : null;
  }
};



/**
 * Created by 柏然 on 14-1-23.
 */
var eventHandlers = {
  EventHandler: function (parent) {
    this._parent = parent || null;
    this._enable = true;
  },
  Clicker: function (parent, enable) {
    this._parent = parent || null;
    this._enable = (enable !== false);
  }, Spotter: function (parent, enable) {
    this._parent = parent || null;
    this._enable = (enable !== false);
    this._onAction = false;
    this.onEnableChanged();
  }, Drager: function (parent, enable) {
    this._parent = parent || null;
    this._enable = (enable !== false);
    this._onAction = false;
  }, Wheeler: function (parent, enable) {
    this._parent = parent || null;
    this._enable = (enable !== false);
  }, ContainerSpotter: function (parent, enable) {
    var spotter = new eventHandlers.Spotter(parent, enable);
    spotter.fire = eventHandlers.config.containerSpotterFire;
    return spotter;
  }
};
eventHandlers.config = {
  _enableClick: true,
  _enableWheel: true,
  _enableMove: true,
  _enableDrag: true,
  set enable(e) {
    var cfg = eventHandlers.config;
    cfg._enableClick = cfg._enableMove = cfg._enableWheel = cfg._enableDrag = !!e;
  },
  get enable() {
    var cfg = eventHandlers.config,
      e = cfg._enableClick && cfg._enableMove && cfg._enableWheel && cfg._enableDrag;
    if (!e) e = cfg._enableClick || cfg._enableMove || cfg._enableWheel || cfg._enableDrag;
    else return true;
    return e ? null : false;
  },
  containerSpotterFire: function (ctx, e) {
    if (!this.enable) return false;
    var p = this._parent;
    this.pathFun(ctx);
    if (ctx.isPointInPath(e.ox, e.oy)) {
      if (!this._onAction) {
        this._onAction = true;
        p.emit('mousein', [e, p]);
        this.onmouseIn(e, p);
      }
      for (var i = 0, ctrls = p._controls, ctrl = ctrls[0]; ctrl; ctrl = ctrls[++i])
        if (ctrl.spotter && p.overlap(ctrl))ctrl.spotter.fire(ctx, e);
      return true;
    } else if (this._onAction) {
      this._onAction = false;
      eventHandlers.config.containerSpotterOut(e, p);
      return true;
    }
    return false;
  },
  containerSpotterOut: function (e, ctrl) {
    ctrl._spotter._onAction = false;
    ctrl.emit('mouseout', [e, ctrl]);
    ctrl._spotter.onmouseOut(e, ctrl);
    if (ctrl._controls)
      for (var i = 0, children = ctrl._controls, fn = eventHandlers.config.containerSpotterOut, child = children[0];
           child; child = children[++i])
        if (child.spotter) fn(e, child);
  }
};
eventHandlers.canvasHandlers = {
  click: function (e) {
    if (e.preventDefault) e.preventDefault();
    if (!eventHandlers.config._enableClick) return false;
    var g = this._global, ac = g.activeTask._components;
    if (g.activeTask._supressClick) {
      g.activeTask._supressClick = false;
      return false;
    }
    e = core.mouseArg(e, g, false);
    core.helper._inputElement.unbind();
    core.helper._textareaElement.unbind();
    for (var i = 0, item = ac[0]; item; item = ac[++i])
      if (item.clicker && item.clicker.fire(g.ctx, e))
        break;
    if (e._invalid) g.invalid();
    return false;
  },
  mouseDown: function (e) {
    var g = this._global, ep = core.mouseArg(e, g, false), at = g.activeTask;
    g._lastMouse = ep;
    if (e.button == 0 && !at._isPress && eventHandlers.config._enableDrag) {
      for (var i = 0, item = at._components[0]; item; item = at._components[++i])
        if (item.drager && item.drager.fire(g.ctx, ep))
          return at.press(ep);
    }
    else if (e.button == 2)
      at.cancelPress(ep);
    if (e._invalid)g.invalid();
    return false;
  },
  mouseUp: function (e) {
    var at = this._global.activeTask;
    at.cancelPress(core.mouseArg(e, at._global));
    if (e._invalid)at._global.invalid();
  },
  mouseMove: function (e) {
    var g = this._global, curMouse = core.mouseArg(e, g, false), at = g.activeTask, lastMouse = g._lastMouse;
    if (!lastMouse)g._lastMouse = lastMouse = curMouse;
    if (Math.abs(lastMouse.ox - curMouse.ox) + Math.abs(lastMouse.oy - curMouse.oy) < 6)return false;
    g._lastMouse = curMouse;
    if (e.preventDefault) e.preventDefault();
    at.dragMove(curMouse);
    if (eventHandlers.config._enableMove)
      for (var i = 0, s = at._components[0]; s; s = at._components[++i])
        if (s.spotter)s.spotter.fire(g.ctx, curMouse);
    if (curMouse._invalid)g.invalid();
    return false;
  },
  mouseLeave: function (e) {
    eventHandlers.canvasHandlers.mouseUp.call(this, e);
  },
  mouseWheel: function (e) {
    e.preventDefault();
    if (!eventHandlers.config._enableWheel)return false;
    var g = this._global;
    var we = core.mouseArg(e, g);
    if (e.wheelDelta)
      we.up = e.wheelDelta > 0;
    else if (e.detail)
      we.up = e.detail < 0;
    for (var i = 0, item = g.activeTask._components[0]; item; item = g.activeTask._components[++i])
      if (item.wheeler && item.wheeler.fire(g.ctx, we)) break;
    if (e._invalid)g.invalid();
    return false;
  },
  touchStart: function (e) {
    var touch = e.changedTouches[0];
    if (touch) {
      e.preventDefault();
      touch.button = 0;
      eventHandlers.canvasHandlers.mouseDown.call(this, touch);
    }
    return false;
  },
  touchEnd: function (e) {
    e.preventDefault();
    eventHandlers.canvasHandlers.mouseUp.apply(this, [e.changedTouches[0]]);
    eventHandlers.canvasHandlers.click.apply(this, [e.changedTouches[0]]);
    return false;
  },
  touchMove: function (e) {
    e.preventDefault();
    var touch = e.changedTouches[0];
    if (touch)
      eventHandlers.canvasHandlers.mouseMove.call(this, e.changedTouches[0]);
    return false;
  },
  touchCancel: function (e) {
    return eventHandlers.canvasHandlers.touchEnd.call(this, e);
  },
  drop: function (e) {
    e.preventDefault();
    // var data = e.dataTransfer;
    // var file = data.files[0];
    // window.backImg.src = window.URL.createObjectURL(file);
    return false;
  },
  dragOver: function (e) {
    e.preventDefault();
    return false;
  }
};
(function () {
  var p = 'prototype', eh = eventHandlers, e = eh.EventHandler, actPro = {publicName: 'onAction', set: function (v) {
    this._onAction = v;
  }, get: function () {
    return this._onAction;
  }};
  e[p] = {
    pathFun: function (ctx) {
      var p = this.parent;
      ctx.beginPath();
      if (p)ctx.rect(p.absX, p.absY, p.w || 0, p.h || 0);
      ctx.closePath();
    },
    get parent() {
      return this._parent;
    },
    set enable(val) {
      this._enable = val;
      if (this.onEnableChanged) this.onEnableChanged();
    },
    get enable() {
      var p = this._parent;
      if (!p)return this._enable;
      else return this._enable && p.enable && p.visibility > 0;
    }
  };
  eh.Clicker[p] = new e();
  eh.Wheeler[p] = new e();
  eh.Spotter[p] = new e();
  eh.Drager[p] = new e();
  e = eh.Clicker[p];
  e.onclick = function (e, p) {
    return true
  };
  e.fire = function (ctx, e) {
    if (!this.enable) return false;
    this.pathFun(ctx);
    if (!ctx.isPointInPath(e.ox, e.oy)) return false;
    var p = this.parent;
    e._invalid = true;
    this.onclick(e, p);
    p.emit('click', [e, p]);
    return true;
  };
  e.dispose = function () {
    var p = this.parent;
    if (p && p._clicker === this)p._clicker = null;
    this._parent = null;
  };
  e = eh.Spotter[p];
  e.onmouseIn = function (e, p) {
  };
  e.onmouseOut = function (e, p) {
  };
  e.fire = function (ctx, e) {
    if (!this.enable) return false;
    this.pathFun(ctx);
    var p = this.parent;
    if (ctx.isPointInPath(e.ox, e.oy)) {
      if (!this._onAction) {
        this._onAction = true;
        e._invalid = true;
        this.onmouseIn(e, p);
        p.emit('mousein', [e, p]);
        return true;
      }
    }
    else if (this._onAction) {
      this._onAction = false;
      e._invalid = true;
      this.onmouseOut(e, p);
      p.emit('mouseout', [e, p]);
      return true;
    }
    return false;
  };
  e.dispose = function () {
    var p = this.parent;
    if (p && p._spotter === this) {
      eventHandlers.config.containerSpotterOut({cx: -1, cy: -1, ox: -1, oy: -1}, p);
      p._spotter = null;
    }
    this._parent = null;
  };
  e.onEnableChanged = function () {
    var p = this._parent;
    if (!p || this._enable || !p._spotter) return;
    eventHandlers.config.containerSpotterOut({ox: -1, oy: -1, cx: -1, cy: -1}, p);
  };
  e.addProperty(actPro);
  e = eh.Drager[p];
  e.addProperty(actPro);
  e.onmouseMove = function (e, p) {
  };
  e.onend = function (e, p) {
  };
  e.fire = function (ctx, e) {
    if (!this.enable) return false;
    this.pathFun(ctx);
    if (!ctx.isPointInPath(e.ox, e.oy)) return false;
    var p = this.parent;
    if (p._controls) {
      if (p._type == 'controls.panel' && p._maxh != p.h)
        e.drager = this;
      for (var ctrls = p._controls, i = ctrls.length - 1, ctrl = ctrls[i]; ctrl; ctrl = ctrls[--i])
        if (ctrl.drager && ctrl.drager.fire(ctx, e)) return true;
    }
    else  e.drager = this;
    return true;
  };
  e.dispose = function (task) {
    var p = this.parent;
    if (!task && p)task = p.getTask();
    if (task && task._activeDrager === this)
      task._activeDrager = null;
    if (p && p._drager === this) p._drager = null;
    this._parent = null;
    this._onAction = false;
  };
  e = eh.Wheeler[p];
  e.onwheelUp = function (e, p) {
    return true;
  };
  e.onwheelDown = function (e, p) {
    return true;
  };
  e.fire = function (ctx, e) {
    if (!this.enable)return false;
    this.pathFun(ctx);
    if (!ctx.isPointInPath(e.ox, e.oy)) return false;
    var p = this.parent;
    e._invalid = true;
    if (p._controls) {
      for (var i = 0, ctrls = p._controls, item = ctrls[i]; item; item = ctrls[++i])
        if (item.wheeler && item.wheeler.fire(ctx, e))return true;
      if (e.up)
        return this.onwheelUp(e, p);
      else
        return this.onwheelDown(e, p);
    }
    else if (e.up) {
      p.emit('wheelup', [e, p]);
      return this.onwheelUp(e, p);
    }
    else {
      p.emit('wheelup', [e, p]);
      return this.onwheelDown(e, p);
    }
  };
  e.dispose = function () {
    var p = this.parent;
    if (p && p._wheeler === this) this._parent._wheeler = null;
    this._parent = null;
  };
}());/**
 * Created by 柏然 on 14-1-23.
 */
var controls = {
  UpdateObject: function () {
    this._enable = true;
    this._callbacks = {};
    this._clock = null;
    this._parent = null;
    this._updateFunc = [];
  },
  /**
   * the base of controls
   * 所有控件的基类
   @constructor
   @param {Number} [x] the distance of left-up corner to parent left side 控件左上角相对于父控件左边界的距离
   @param {Number} [y] the distance of left-up corner to parent top side 控件左上角相对于父控件上边界的距离
   @param {Number} [w] the width of the control
   @param {Number} [h] the height of the control
   */
  UIComponent: function (x, y, w, h) {
    controls.UpdateObject.call(this);
    this._x = x || 0;
    this._y = y || 0;
    this._w = w || 1;
    this._h = h || 1;
    this._z = 0;
    this._visibility = 1;
    this._class = null;
  },
  Rectangle: function (x, y, w, h, backColor, borderColor, radius) {
    controls.UIComponent.call(this, x, y, w, h);
    this._bc = backColor || 'rgba(0,0,0,0)';
    this._bdc = backColor || 'black';
    this._radius = radius || 0;
  },
  /**
   * 显示图片的控件
   @constructor
   @param {Number} [x]
   @param {Number} [y]
   @param {Number} [w]
   @param {Number} [h]
   @param {string|url} [src] the url of the image
   */
  Image: function (x, y, w, h, src, sx, sy, sw, sh) {
    controls.UIComponent.call(this, x, y, w, h);
    var config = controls.config.img;
    this._src = src || '';
    this._img = null;
    this.sx = sx || 0;
    this.sy = sy || 0;
    this.sw = sw || 0;
    this.sh = sh || 0;
    this._callbacks = {src: [config.srcCallback]};
    this._updateFunc = [config.srcUpdateFunc];
  },
  Icon: function (x, y, w, h, onPaint, scaleX, scaleY) {
    controls.UIComponent.call(this, x, y, w, h);
    if (typeof onPaint == "function")
      this.paint = onPaint;
    this._scaleX = scaleX || 1;
    this._scaleY = scaleY || 1;
  },
  Range: function (x, y, w, h, min, max, step, value, backColor, borderColor, lineWidth, vertical) {
    var cfg = controls.config.range;
    controls.UIComponent.call(this, x || cfg.x, y || cfg.y, w || cfg.w, h || cfg.h);
    this._min = min || 0;
    this._max = max || 1;
    this._step = step || 0.1;
    this.lineWidth = lineWidth || (vertical ? this._w : this._h) / 4;
    this._vertical = vertical === true;
    this._val = this._roundValue(value || 0);
    this._bc = backColor || cfg.backColor;
    this._bdc = borderColor || cfg.borderColor;
    this.drager = new eventHandlers.Drager(this);
    this.drager.onmouseMove = cfg.dragerMove;
    this.drager.onend = cfg.dragerEnd;
    this.clicker = new eventHandlers.Clicker(this);
    this.clicker.onclick = cfg.clickerClick;
    this._callbacks = {value: [cfg.valueCallback]};
  },
  /**
   * 显示单行文字的控件，此控件不设置w，h
   * 应用程序会根据控件的font设置相应的高度h，根据文本长度设置相应的宽度w
   @constructor
   @this {Label}
   @param {Number} [x]
   @param {Number} [y]
   @param {string} [text] 要显示的文本，单行
   @param {string} [font] 控件字体
   @param {String|CanvasGradient|CanvasPattern} [textColor] 字体颜色 可以为：'red' 'rgb(120,120,120)' 'rgba(10,10,10,0.5)'
   @param {String|CanvasGradient|CanvasPattern} [backColor] 控件的底色 默认为 'rgba(0,0,0,0)'
   */
  Label: function (x, y, w, h, text, font, textColor, backColor, align) {
    if (typeof arguments[2] == "string") {
      text = arguments[2];
      font = arguments[3];
      textColor = arguments[4];
      backColor = arguments[5];
    }
    var cfg = controls.config.label, cc = controls.config.proCallbacks.cancelChange, min;
    controls.UIComponent.call(this, x || cfg.x, y || cfg.y);
    this._txt = text || '';
    this._font = font || cfg.font;
    min = core.Font.parseFont(this._font, 1.3);
    this._h = (h || 0) > min ? h : min;
    this._callbacks = {font: [cfg.fontCallback]};
    this._tc = textColor || cfg.textColor;
    this._bc = backColor || cfg.backColor;
    this.align = align || 'left';
    var ctx = core.helper._ctx;
    ctx.save();
    ctx.font = this._font;
    min = ctx.measureText(this._txt).width;
    this._w = w || min;
    ctx.restore();
  },
  /**
   * 按钮控件，自带点击事件
   @constructor
   @param {Number} [x]
   @param {Number} [y]
   @param {Number} [w]
   @param {Number} [h]
   @param {string} [text]
   @param {string} [font]
   @param {String|CanvasGradient|CanvasPattern} [textColor]
   @param {String|CanvasGradient|CanvasPattern} [backColor]
   @param {String|CanvasGradient|CanvasPattern} [borderColor] 边框颜色，当鼠标移入时会显示边框颜色
   @param {function} [onclick] 点击时的回调函数，参数为 e，s
   */
  Button: function (x, y, w, h, text, font, onclick, textColor, backColor, borderColor, radius) {
    var cfg = controls.config.button, f = new core.Font(font || cfg.font);
    controls.UIComponent.call(this, x || cfg.x, y || cfg.y, w || cfg.w, h || cfg.h);
    this._txt = text || '';
    if (this._h < f.size * 1.2)
      this._h = f.size * 1.2;
    this._font = f.fontString;
    this.clicker = new eventHandlers.Clicker(this);
    this.spotter = new eventHandlers.Spotter(this);
    this._radius = radius || cfg.radius;
    this._tc = textColor || cfg.textColor;
    this._bc = backColor || cfg.backColor;
    this._bdc = borderColor || cfg.borderColor;
    this._callbacks = {mousein: [cfg.mousein], mouseout: [cfg.mousein]};
    if (typeof onclick == "function") this.onclick = onclick;
  },
  /**
   * 多行文本控件，可以显示大段文本，自带滚动，拖动事件
   @constructor
   @param {Number} [x]
   @param {Number} [y]
   @param {Number} [w]
   @param {Number} [h]
   @param {Number} [lineSpace] 行间距 默认为1.2
   @param {Number} [maxLineNum] 最大正文呈现行数，可以不用设置
   @param {string} [text] 呈现的正文
   @param {string} [titleText] 文本标题，可以不用设置
   @param {string} [font] 正文字体
   @param {string} [titleFont] 标题字体
   @param {String|CanvasGradient|CanvasPattern} [textColor] 正文颜色
   @param {String|CanvasGradient|CanvasPattern} [backColor] 控件底色
   @param {String|CanvasGradient|CanvasPattern} [titleColor] 标题颜色
   */
  Article: function (x, y, w, h, titleText, text, font, textColor, backColor, titleFont, titleColor, lineSpace, maxLineNum) {
    var cfg = controls.config.article, du = controls.config.proCallbacks.defaultUpdate;
    controls.UIComponent.call(this, x || cfg.x, y || cfg.y, w || cfg.w, h || cfg.h);
    this._titleText = titleText || '';
    this._ls = lineSpace || cfg.lineSpace;
    this._bc = backColor || cfg.backColor;
    this._font = font || cfg.font;
    this._tc = textColor || cfg.textColor;
    this._txt = text || '';
    this._lines = controls.Article.prototype.breakText(this._txt, this._w, this._font);
    this._maxLines = maxLineNum || -1;
    this._titleFont = titleFont || cfg.titleFont;
    this._titleColor = titleColor || cfg.titleColor;
    this._mouseY = 0;
    this._curline = 0;
    this._callbacks = {lineSpace: [du], text: [cfg.textCallback], font: [du]};
    this.drager = new eventHandlers.Drager(this);
    this.wheeler = new eventHandlers.Wheeler(this);
    this.wheeler.fire = cfg.wheelerFire;
    this.drager.onmouseMove = cfg.dragerMove;
  },
  /**
   * 提供二项切换的控件，可以通过text属性获取用户选择的文字
   @constructor
   @param {Number} [x]
   @param {Number} [y]
   @param {Number} [w]
   @param {Number} [h]
   @param {string} [leftText] 左边显示的文字
   @param {string} [rightText] 右边显示的文字
   @param {string} [font]
   @param {String|CanvasGradient|CanvasPattern} [textColor]
   @param {String|CanvasGradient|CanvasPattern} [backColor] 控件底色
   @param {String|CanvasGradient|CanvasPattern} [borderColor] 边框和遮盖物的颜色
   @param {function} [onchange] 用户进行点击切换时的事件函数
   @param {Number} [radius] 圆角的半径
   */
  Switch: function (x, y, w, h, leftText, rightText, font, textColor, backColor, borderColor, onchange, radius) {
    var cfg = controls.config.switch, ctx = core.helper._ctx, du = controls.config.proCallbacks.defaultUpdate;
    controls.UIComponent.call(this, x || cfg.x, y || cfg.y, w || cfg.w, h || cfg.h);
    this._callbacks = {leftTxt: [du], rightTxt: [du]};
    this._font = font || cfg.font;
    var _fh = core.Font.parseFont(this._font);
    this._h = (h || -1) > _fh + 6 ? h : _fh + 6;
    this._radius = radius || this._h / 2;
    this._ltxt = leftText || '';
    this._rtxt = this._txt = rightText || '';
    ctx.font = this._font;
    var w1 = ctx.measureText(this._ltxt).width, w2 = ctx.measureText(this._rtxt).width;
    this._w = (w1 > w2 ? w1 * 2 : w2 * 2 ) + this._radius * 2;
    if ((w || -1) > this._w) this._w = w;
    this._onleft = false;
    this._tc = textColor || cfg.textColor;
    this._bc = backColor || cfg.backColor;
    this._bdc = borderColor || cfg.borderColor;
    this.clicker = new eventHandlers.Clicker(this);
    this.clicker.onclick = cfg.onclick;
    if (typeof onchange == "function") this.onchange = onchange;
  },
  /**
   * 容器控件，可以将其他控件装入
   @constructor
   @param {Number} [x]
   @param {Number} [y]
   @param {Number} [w]
   @param {Number} [h]
   @param {String|CanvasGradient|CanvasPattern} [backColor] 控件底色 默认为 'rgba(0,0,0,0)'
   */
  Panel: function (x, y, w, h, backColor) {
    var cfg = controls.config.panel, cbs = controls.config.proCallbacks;
    controls.UIComponent.call(this, x || cfg.x, y || cfg.y, w || cfg.w, h || cfg.h);
    this.drager = new eventHandlers.Drager(this);
    this.clicker = new eventHandlers.Clicker(this);
    this.wheeler = new eventHandlers.Wheeler(this);
    this.spotter = new cfg.PanelSpotter(this);
    this._callbacks = {
      x: [cbs.x],
      y: [cbs.y],
      visibility: [cbs.visibility]
    };
    this._bc = backColor || cfg.backColor;
    this._baseLine = 0;
    this._maxh = this._h;
    this._controls = [];
    this._mouseY = undefined;
    this.drager.onend = cfg.dragerEnd;
    this.drager.onmouseMove = cfg.dragerMove;
    this.clicker.fire = cfg.clickerFire;
    this.wheeler.onwheelDown = cfg.wheelDown;
    this.wheeler.onwheelUp = cfg.wheelUp;
  },
  /**
   * 提供用户输入单行文本的控件，可以进行正则匹配，可通过validText属性获取匹配成功的输入
   * 不设置h，将根据font调节h
   @constructor
   @param {Number} [x]
   @param {Number} [y]
   @param {Number} [w]
   @param {string} [waterMarkText] 在用户没有输入或输入不规则字符时的水印提示文字
   @param {string} [font]
   @param {String|CanvasGradient|CanvasPattern} [textColor]
   @param {String|CanvasGradient|CanvasPattern} [backColor]
   @param {String|CanvasGradient|CanvasPattern} [waterMarkColor] 水印提示文字的颜色
   @param {RegExp} [regExp] 正则表达式
   */
  TextInput: function (x, y, w, h, font, textColor, backColor, waterMarkText, waterMarkColor, regExp, mask) {
    var cfg = controls.config, tif = cfg.textInput, dfc = cfg.proCallbacks.defaultUpdate, f = new core.Font(font || tif.font);
    this._x = x || 0;
    this._y = y || 0;
    if (f.size > (h || 0))h = f.size;
    else f.size = h;
    this._font = f.fontString;
    this._h = h;
    this._wmc = waterMarkColor || tif.waterMarkColor;
    this._tc = textColor || tif.txtColor;
    this._bc = backColor || tif.backColor;
    this._txt = "";
    this._vtxt = null;
    this._wmtxt = waterMarkText || tif.waterMarkTxt;
    this._regExp = regExp || tif.regExp;
    this._callbacks = {text:[tif.ontext],txtColor: [dfc], backColor: [dfc], font: [dfc], x: [dfc], y: [dfc], h: [dfc], regExp: [controls.properties.regExp.textInputCallBack]};
    this._updateFunc = [];
    this.clicker = new eventHandlers.Clicker(this);
    this.clicker.fire = tif.clickerFire;
    if (w)
      this._w = w;
    else {
      var ctx = core.helper._ctx;
      ctx.font = this._font;
      var ww = ctx.measureText(this._wmtxt).width + 10;
      this._w = 180 > ww ? 180 : ww;
    }
    this._mask = mask;
  },
  /**
   * 容器控件，点击头部按钮可以展开或者收缩
   * 不设置h，所有的子控件会由上到下紧密排列，此控件的h取决子控件的数目
   @constructor
   @param {Number} [x]
   @param {Number} [y]
   @param {Number} [w]
   @param {string} [text] 头部按钮的文字
   @param {string} [font] 头部按钮的字体
   @param {String|CanvasGradient|CanvasPattern} [textColor] 头部按钮的字色
   @param {String|CanvasGradient|CanvasPattern} [backColor] 容器部分的底色
   @param {String|CanvasGradient|CanvasPattern} [headerBackColor] 头部按钮的底色
   */
  Drop: function (x, y, w, h, text, font, textColor, backColor, headerBackColor) {
    var cfg = controls.config, d = cfg.drop, hh;
    controls.Panel.call(this, x || d.x, y || d.y, w || d.w, 0, backColor || d.backColor);
    this._font = font || d.font;
    this._headerHeight = cfg.parseFont(this._font);
    hh = Math.round(this._headerHeight * d.headerFHRatio);
    this._h = h && h > hh ? h : hh;
    this._offsetY = this._h;
    this._expanded = false;
    this._offsetX = d.offsetX;
    this._txt = text || '';
    this._headerbc = headerBackColor || d.hbc;
    this._tc = textColor || d.txtColor;
    this._expandTimestamp = d._getTimestamp();
    this.spotter = new d.DropSpotter(this);
    this.clock = new animations.SimpleClock(0.5, 1, 1, 0, animations.TimingFunctions.bounceEaseOut);
    this.clock.onend = d.clockend;
    this.clock.onreverse = d.clockreverse;
    this.clicker = new eventHandlers.Clicker(this);
    this.clicker.pathFun = d.clickerPathFun;
    this.clicker.fire = d.clickerFire;
    this.clock.ontick = d.clockUpdate;
    this._callbacks = {visibility: [cfg.proCallbacks.visibility], font: [d.fontUpdate],
      x: [cfg.proCallbacks.x], y: [cfg.proCallbacks.y], expanded: [d.expandedCallback]};
  },
  /**
   * 单项选择列表
   * @param {Number}[x]
   * @param {Number}[y]
   * @param {Number}[w]
   * @param {Number}[h]
   * @param {Array}[items] 可供选择的项目
   * @param {String}[font]
   * @param {String|CanvasGradient|CanvasPattern} [backColor]
   * @param {String|CanvasGradient|CanvasPattern} [textColor]
   * @param {String}[waterMarkText] 用户未选择时的水印提示文字
   * @param {String|CanvasGradient|CanvasPattern}[borderColor] 控件边框颜色
   * @param {Function}[toStringFun] 如果可选项不是string，提供转化函数，将其转化问要显示的文字
   * @param {function}[onchangeFun] 用户选择发生改变时的回调函数
   * @constructor
   */
  Select: function (x, y, w, h, items, font, backColor, textColor, waterMarkText, borderColor, toStringFun, onchangeFun) {
    var cfg = controls.config, s = cfg.select;
    controls.UIComponent.call(this, x || s.x, y || s.y, w || s.w, h || s.h);
    this._font = font || s.font;
    this._itemHeight = Math.ceil(cfg.parseFont(this._font, 1.2));
    this._h = h || this._itemHeight * 4;
    this._bc = backColor || s.backColor;
    this._tc = textColor || s.textColor;
    this._wmtxt = waterMarkText || s.wmtxt;
    this._bdc = borderColor || s.borderColor;
    this._selectedIndex = -1;
    this._z = this._originalZ = 0;
    this._items = items || [];
    this._baseLine = this._itemHeight;
    this._callbacks = {
      items: [s.itemsChange],
      expanded: [s.expandedChange],
      selectedIndex: [s.callOnchange],
      click: [s.clickerClick],
      wheelup: [s.wheelup],
      wheeldown: [s.wheeldown]
    };
    if (typeof onchangeFun == "function")
      this._callbacks['change'] = [onchangeFun];
    this._expanded = false;
    this.clicker = new eventHandlers.Clicker(this);
    this._toString = toStringFun || s.toString;
    this.drager = new eventHandlers.Drager(this);
    this.drager.fire = s.dragerFire;
    this.drager.onmouseMove = s.mousemove;
    this.wheeler = new eventHandlers.Wheeler(this);

  },
  /**
   * 多行文字的输入控件
   * @param {Number} [x]
   * @param {Number} [y]
   * @param {Number} [w]
   * @param {Number} [h]
   * @param {string}[font]
   * * @param {string}[text]
   * @param {String|CanvasGradient|CanvasPattern}[textColor]
   * @param {String|CanvasGradient|CanvasPattern}[backColor]
   * @constructor
   */
  ArticleInput: function (x, y, w, h, font, text, textColor, backColor) {
    this._textarea = null;
    var cfg = controls.config.articleInput, du = controls.config.proCallbacks.defaultUpdate, ai = cfg.positionCallback;
    this.drager = new eventHandlers.Drager(this);
    this.wheeler = new eventHandlers.Wheeler(this);
    this.clicker = new eventHandlers.Clicker(this);
    controls.UIComponent.call(this, x || cfg.x, y || cfg.y, w || cfg.w, h || cfg.h);
    this._ls = cfg.lineSpace;
    this._bc = backColor || cfg.backColor;
    this._font = font || cfg.font;
    this._tc = textColor || cfg.textColor;
    this._txt = text || '';
    this._lines = controls.Article.prototype.breakText(this._txt, this._w, this._font);
    this._mouseY = 0;
    this._curline = 0;
    this._callbacks = {lineSpace: [du], text: [cfg.textCallback], font: [du], x: [ai], y: [ai]};
    this._updateFunc = [];
    this.wheeler.fire = cfg.wheelerFire;
    this.drager.onmouseMove = cfg.dragerMove;
    this.clicker.fire = cfg.clickerFire;
  },
  /**
   * 可伸缩的panel，正常情况下显示为w，h，当点击右上角的+号展开
   * 展开后的宽度为 w+wIncrement，高度为 h+hIncrement
   * @param {Number} [x]
   * @param {Number} [y]
   * @param {Number} [w]
   * @param {Number} [h]
   * @param {Number} [wIncrement]
   * @param {Number} [hIncrement]
   * @param {String|CanvasGradient|CanvasPattern} [backColor]
   * @param {Number}[iconWidth] 最大化按钮的边长
   * @param {String|CanvasGradient|CanvasPattern}[borderColor] 边框颜色
   * @constructor
   */
  Expand: function (x, y, w, h, wIncrement, hIncrement, backColor, iconWidth, borderColor) {
    var cfg = controls.config.expand;
    controls.Panel.call(this, x || cfg.x, y || cfg.y, w || cfg.w, h || cfg.h, backColor);
    this._x = x || cfg.x;
    this._y = y || cfg.y;
    this._w = w || cfg.w;
    this._h = this._maxh = h || cfg.h;
    this._mouseY = 0;
    this._dw = wIncrement || 0;
    this._dh = hIncrement || cfg.h * 0.3;
    this.clock = new animations.SimpleClock(0.4, 1, 1, 0, animations.TimingFunctions.sineEaseInOut);
    this._iw = iconWidth || cfg.iw;
    this._expanded = false;
    this._bc = backColor || cfg.backColor;
    this._bdc = borderColor || cfg.borderColor;
    this._updateFunc = [];
    this._callbacks = {tick: [cfg.tickCallback], expanded: [cfg.expandedCallback]};
    this.clicker = new eventHandlers.Clicker(this);
    this.drager = new eventHandlers.Drager(this);
    this.wheeler = new eventHandlers.Wheeler(this);
    this.spotter = new cfg.ExpandSpotter(this);
    this.clicker.fire = cfg.clickerFire;
  },
  /**
   * 传说中最牛逼的立方体容器
   * @param {Number} [x]
   * @param {Number} [y]
   * @param {Number} [w]
   * @param {Number} [h]
   * @param {String|CanvasGradient|CanvasPattern} [backColor]
   * @param {Number} [scaleRatio] 动画时的缩放比例
   * @param {Number} [projectAngle] 动画时的投影角度
   * @param {Number} [projectRatio] 动画时的投影缩放比例
   */
  CubicPanel: function (x, y, w, h, backColor, scaleRatio, projectAngle, projectRatio) {
    var cfg = controls.config.cubicPanel, pcfg = controls.config.panel, cbs = controls.config.proCallbacks;
    controls.Panel.call(this, x || cfg.x, y || cfg.y, w || cfg.w, h || cfg.h, backColor || pcfg.backColor);
    this._isAnimating = false;
    this._scaleRatio = parseFloat(scaleRatio) ? (1 - scaleRatio) : cfg.scaleRatio;
    this._projectAngle = parseFloat(projectAngle) || cfg.projectAngle;
    this._projectRatio = parseFloat(projectRatio) || cfg.projectRatio;
    this._paintOrders = cfg.renderOrders[0];
    this._scaleClock = new animations.SimpleClock(0.3, this._projectRatio, 1, 0, animations.TimingFunctions.circEaseInOut);
    this._rotateClock = new animations.SimpleClock(0.4, Math.PI / 2, 1, 0, animations.TimingFunctions.sineEaseInOut);
    this._callbacks = {tick: [cfg.tickCallback], x: [cbs.x], y: [cbs.y],
      visibility: [cbs.visibility], w: [cfg.w], h: [cfg.h], backColor: [cbs.backColor]};
    this.drager = new eventHandlers.Drager(this);
    this.clicker = new eventHandlers.Clicker(this);
    this.wheeler = new eventHandlers.Wheeler(this);
    this.spotter = new pcfg.PanelSpotter(this);
    this.drager.onend = pcfg.dragerEnd;
    this.drager.onmouseMove = pcfg.dragerMove;
    this.clicker.fire = pcfg.clickerFire;
    this.wheeler.onwheelDown = pcfg.wheelDown;
    this.wheeler.onwheelUp = pcfg.wheelUp;
    this.wheeler.fire = function (ctx, e) {
      return this._parent.currentView.wheeler.fire(ctx, e);
    };
    this._scaleClock.onend = cfg.scaleClockEnd;
    this._rotateClock.onend = cfg.rotateClockEnd;
    this._scaleClock.onreverse = cfg.scaleClockReverse;
    this.clock = this._scaleClock;
    this._rotateClock._parent = this;
    for (var i = 0, oof = 0; i < 4; i++, oof += Math.PI / 2) {
      var panel = new controls.Panel(0, 0, this._w, this._h, backColor);
      panel._parent = this;
      panel.visibility = 0;
      panel.offset = panel._oof = oof;
      this._controls[i] = panel;
      panel.transform = cfg.childTransform;
    }
    this.currentView = this._controls[0];
    this.currentView.visibility = true;
    this._callbacks.tick[0](0, this._scaleClock)
  }
};
controls.config = {
  range: {
    x: 0, y: 0, w: 100, h: 50, backColor: '#555', borderColor: '#FFF',
    valueCallback: function (o, s) {
      s._val = s._roundValue(s._val);
    },
    dragerMove: function (e, p) {
      var per = p._vertical ? (e.cy - p.absY) / p._h : (e.cx - p.absX) / p._w;
      p._val = per * (p._max - p._min) + p._min;
      p.invalid();
    },
    dragerEnd: function (e, p) {
      var ov = p.value;
      p.notify('value', p._val, p, '_val');
      p.invalid();
      if (p.value !== ov)
        p.emit('change', [e, p]);
    },
    clickerClick: function (e, p) {
      var drager = p.drager;
      drager.onmouseMove(e, p);
      drager.onend(e, p);
    }
  },
  drop: {
    w: 150, font: '18px Arial', hbc: 'rgba(250,250,250,0.8)',
    txtColor: '#000', backColor: 'rgba(250,250,250,0.7)', offsetX: 5, headerFHRatio: 1.3,
    _timestamp: 0,
    _getTimestamp: function () {
      return 'drop' + (this._timestamp++);
    },
    expandedCallback: function (o, s) {
      if (!s.task)
        s._expanded ? s._clock.end() : s._clock.reset();
      else
        s._expanded ? s.expand() : s.shrink()
    },
    clickerPathFun: function (ctx) {
      ctx.beginPath();
      var p = this._parent;
      p._expanded ? ctx.rect(p.absX, p.absY, p._w, p._h) : ctx.rect(p.absX, p.absY, p._w, p._offsetY);
      ctx.closePath();
    },
    clickerFire: function (ctx, e) {
      if (!this.enable) return false;
      this.pathFun(ctx);
      if (!ctx.isPointInPath(e.ox, e.oy))return false;
      var p = this._parent;
      if (!p.clock.isStopped)return true;
      if (p._expanded) {
        if (e.cy > p.absY + p._offsetY) {
          for (var i = 0, item = p._controls[0]; item; item = p._controls[++i])
            if (item.clicker && item.clicker.fire(ctx, e)) return true;
        }
        else p.expanded = false;
      }
      else p.expanded = true;
      this.onclick(e, this._parent);
      e._invalid = true;
      this.emit('click', [e, p]);
      return true;
    },
    clockUpdate: function (oh) {
      var p = this._parent;
      var dh = (p._h - p._offsetY) * (this.value - oh),
        bottom = p._offsetY + (p._h - p._offsetY) * this.value + p.y;
      for (var i = 0, ctrls = p._collisions, item = ctrls[0]; item; item = ctrls[++i])
        if (item._originalY <= bottom) {
          item._y += dh;
          bottom = Math.max(bottom, item.h + item._y);
        }
    },
    fontUpdate: function (of, sender) {
      var f = new core.Font(this._font), d, dh = 0;
      if (sender._headerHeight != f.size) {
        d = f.size - sender._headerHeight;
        dh = Math.round(controls.config.drop.headerFHRatio * (f.size - sender._headerHeight));
        sender._headerHeight += d;
        sender.h += dh;
        sender._offsetY += dh;
        for (var i = 0, ctrl = this._controls[0]; ctrl; ctrl = this._controls[++i])
          ctrl.y += dh;
      }
    },
    clockend: function () {
      for (var p = this._parent, i = 0, ctrls = p._collisions, item = ctrls[0]; item; item = ctrls[++i])
        item.y = item._originalY + item['_expandY' + p._expandTimestamp];
      if (p.parent && p._parent._resetMaxh) p._parent._resetMaxh();
      p.addUpdateFunc(function () {
        eventHandlers.config.enable = true;
      });
    },
    clockreverse: function () {
      for (var p = this._parent, i = 0, ctrls = p._collisions, item = ctrls[0]; item; item = ctrls[++i]) {
        item.y = item._originalY;
        delete item['_expandY' + p._expandTimestamp];
      }
      p.addUpdateFunc(function () {
        eventHandlers.config.enable = true;
      });
      if (p.parent && p._parent._resetMaxh) p._parent._resetMaxh();
      p._expanded = false;
    },
    DropSpotter: function (parent, enable) {
      var spotter = new eventHandlers.ContainerSpotter(parent, enable);
      spotter.pathFun = controls.config.drop.clickerPathFun;
      return spotter;
    }
  },
  select: {
    ont: '18px Arial', backColor: '#f8f8ff', textColor: '#000', wmtxt: '请选择', borderColor: '#808080', width: 100,
    callOnchange: function (o, s) {
      s.emit('change', [s.selectedItem, s]);
      return true;
    },
    clickerClick: function (e) {
      var p = this, d = e.cy - p.absY, i;
      if (p._expanded && d > p._itemHeight) {
        i = Math.floor((d - p._baseLine) / p._itemHeight);
        if (i < 0)i = 0;
        else if (i >= p._items.length) i = p._items.length - 1;
        p.selectedIndex = i;
      }
      p.expanded = !p._expanded;
      return true;
    },
    toString: function (e) {
      return e.toString();
    },
    expandedChange: function (o, s) {
      s._expanded ? s._originalZ = s._z : s._z = s._originalZ;
      if (s._parent) {
        s._z = s._parent._controls.max('_z') + 1;
        s._parent._controls.des('_z');
      }
      else if (s._task) {
        s._z = s._task._components.max('_z') + 1;
        s._task._components.des('_z');
      }
    },
    itemsChange: function (o, s) {
      s.selectedIndex = -1;
    },
    wheelup: function () {
      if (this.expanded)this._moveBaseline(5);
    },
    wheeldown: function () {
      if (this.expanded)this._moveBaseline(-5);
    },
    dragerFire: function (ctx, e) {
      if (!this._parent._expanded) return false;
      var f = eventHandlers.Drager.prototype.fire.apply(this, [ctx, e]);
      if (f) this.oy = e.cy;
      return f;
    },
    mousemove: function (e, p) {
      p._moveBaseline(Math.round(e.cy - this.oy));
      this.oy = e.cy;
      p.getTask()._supressClick = true;
    }
  },
  panel: {
    w: 200, h: 200,
    backColor: 'rgba(250,250,250,0.7)',
    wheelDown: function (e, p) {
      p.emit('wheeldown', [e, p]);
      var d = p.h - p._maxh;
      if (p._baseLine > d) {
        if (d < -35)
          p._moveBaseline(-35);
        else
          p._moveBaseline(-p._baseLine);
        return true;
      }
      e._invalid = false;
      return false;
    },
    wheelUp: function (e, p) {
      p.emit('wheelup', [e, p]);
      if (p._baseLine < 0) {
        if (p._baseLine < -35)
          p._moveBaseline(35);
        else
          p._moveBaseline(-p._baseLine);
        return true;
      }
      e._invalid = false;
      return false;
    },
    clickerFire: function (ctx, e) {
      if (!this.enable)return false;
      this.pathFun(ctx);
      if (!ctx.isPointInPath(e.ox, e.oy)) return false;
      for (var i = 0, p = this._parent, ctrls = p._controls, item = ctrls[0]; item; item = ctrls[++i])
        if (item.clicker && item.clicker.fire(ctx, e)) return true;
      return p.emit('click', [e, p]);
    },
    dragerMove: function (e, p) {
      p.emit('dragmove', [e, p]);
      if (p._maxh <= p._h) return false;
      if (p._mouseY != undefined) {
        var dy = e.cy - p._mouseY;
        if (dy > 20)
          dy = 20;
        else if (dy < -20)
          dy = -20;
        p._moveBaseline(dy);
        p._mouseY = e.cy;
        return true;
      }
      p._mouseY = e.cy;
      return false;
    },
    dragerEnd: function (e, p) {
      p._mouseY = undefined;
      var b = p._baseLine;
      p.emit('dragend', [e, p]);
      if (p._h >= p._maxh) {
        p._controls.forEach(function (c) {
          c.y -= b;
        });
        p._baseLine = 0;
      } else if (p._baseLine > 0) {
        p._controls.forEach(function (c) {
          c.y -= b;
        });
        p._baseLine = 0;
      } else if (p._h > p._baseLine + p._maxh) {
        var d = p._h - p._maxh - p._baseLine;
        p._controls.forEach(function (c) {
          c.y += d;
        });
        p._baseLine += d;
      }
    },
    PanelSpotter: function (parent, enable) {
      return new eventHandlers.ContainerSpotter(parent, enable);
    },
    childHCallBack: function (e, s) {
      if (s.y + s.h > s.parent._maxh)
        s.parent._maxh = s.y + s.h + 10;
    }
  },
  classPrototype: {
    broadCastAllProperties: function (ctrl) {
      this.allOwnPros(function (v, n) {
        ctrl[n] = v;
      });
      delete ctrl._$objArray$_;
    },
    broadCastProToAll: function (proName) {
      var v = this[proName];
      if (proName !== undefined)
        this._$objArray$_.forEach(function (c) {
          if (c[proName] !== undefined)c[proName] = v;
        });
    },
    changeProperty: function (proName, value) {
      this[proName] = value;
      this.broadCastProToAll(proName);
    }},
  cubicPanel: {
    renderOrders: [
      [2, 3, 1, 0],
      [3, 0, 2, 1],
      [0, 1, 3, 2],
      [1, 2, 0, 3]
    ],
    x: 0, y: 0, w: 300, h: 180, scaleRatio: 0.5, projectAngle: Math.PI / 3,
    projectRatio: 0.3,
    childTransform: function (ctx) {
      ctx.transform(this._arg.x1, this._arg.y1, 0, 1, this._arg.dx, this._arg.dy);
    },
    tickCallback: function (o, clock) {
      var p = clock._parent, ta, c = p._w / 2, panel0 = p._controls[0], pi2 = Math.PI * 2, hpi = Math.PI / 2;
      if (clock === p._scaleClock)
        ta = p.transformArgs(clock.value, -clock.t * p._projectAngle, -panel0.offset);
      else {
        var offset = (panel0.offset += clock.value - o), orders = controls.config.cubicPanel.renderOrders;
        if (offset >= pi2)panel0.offset -= pi2;
        else if (offset < 0)panel0.offset += pi2;
        for (var i = 0, point = hpi - 0.5, offset = panel0.offset; i < 4; i++, point += hpi)
          if (offset < point) {
            p._paintOrders = orders[i];
            break;
          }
        if (i == 4) p._paintOrders = orders[0];
        ta = p.transformArgs(p._projectRatio, -p._projectAngle, -panel0.offset);
      }
      panel0._arg = p.panelArg(ta.px, ta.py, ta.a, ta.b, c);
      p._controls[1]._arg = p.panelArg(ta.px, ta.py, ta.b, -ta.a, c);
      p._controls[2]._arg = p.panelArg(ta.px, ta.py, -ta.a, -ta.b, c);
      p._controls[3]._arg = p.panelArg(ta.px, ta.py, -ta.b, ta.a, c);
    },
    scaleClockEnd: function () {
      var rc = this._parent._rotateClock;
      this._parent._clock = rc;
      rc.restart();
    },
    rotateClockEnd: function () {
      var sc = this._parent._scaleClock;
      this._parent._clock = sc;
      sc.reverse();
    },
    scaleClockReverse: function () {
      var p = this._parent;
      p._isAnimating = false;
      p._controls.forEach(function (p) {
        p.visible = false;
      });
      p.currentView.visible = true;
    },
    wCallBack: function (o, s) {
      for (var i = 0, w = s.w; i < 4; i++)this._controls[i].w = w;
    },
    fCallBack: function (o, s) {
      for (var i = 0, h = s.h; i < 4; i++)this._controls[i].h = h;
    }
  },
  expand: {x: 0, y: 0, w: 200, h: 150, iw: 25, backColor: 'rgba(0,0,0,0)', borderColor: '#808080',
    expandedCallback: function (o, s) {
      o ? s.clock.reverse() : s.clock.start();
    },
    tickCallback: function (o, clock) {
      var p = clock._parent, px = p.x, py = p.y , dt = (clock.value - o), dw = Math.round(p._dw * dt), dh = Math.round(p._dh * dt);
      p.w += dw;
      p.h += dh;
      if (this.siblings) this.siblings.forEach(function (c) {
        if (c.x > px) c.x += dw;
        if (c.y > py) c.y += dh;
      });
    },
    clickerFire: function (ctx, e) {
      if (!this.enable)return false;
      var p = this.parent;
      if (e.cx < p.x || e.cy < p.y)return false;
      ctx.beginPath();
      ctx.rect(p.absX + p._w - p._iw - 5, p.absY + 5, p._iw, p._iw);
      ctx.closePath();
      if (ctx.isPointInPath(e.ox, e.oy)) {
        p.expanded = !p._expanded;
        return true;
      }
      this.pathFun(ctx);
      if (ctx.isPointInPath(e.ox, e.oy)) {
        for (var i = 0, ctrls = p._controls, item = ctrls[0]; item; item = ctrls[++i])
          if (item.clicker && item.clicker.fire(ctx, e)) return true;
        return true;
      }
      return false;
    },
    ExpandSpotter: function (parent, enable) {
      return new eventHandlers.ContainerSpotter(parent, enable);
    }
  },
  article: {x: 0, y: 0, w: 300, h: 160, lineSpace: 1.2, backColor: 'rgba(0,0,0,0)', textColor: '#000', titleColor: 'black',
    font: '16px Arial', titleFont: 'bold 20px Arial',
    dragerMove: function (e, p) {
      var d = p._mouseY - e.cy;
      if (Math.abs(d) > p.font.size) {
        if (d > 0)
          p.moveUp();
        else
          p.moveDown();
        p._mouseY = e.cy;
        e._invalid = true;
        p.getTask()._supressClick = true;
      }
    },
    wheelerFire: function (ctx, e) {
      if (!this.enable) return false;
      if (e.cx < this._parent.x || e.cy < this._parent.y)return false;
      this.pathFun(ctx);
      if (!ctx.isPointInPath(e.ox, e.oy)) return false;
      e._invalid = e.up ? this._parent.moveDown() : this._parent.moveUp();
      return true;
    },
    textCallback: function (o, s) {
      s._lines = controls.Article.prototype.breakText(s._txt, s._w, s._font);
      this.invalid();
    },
    clickerFire: function (ctx, e) {
      if (!this.enable) return false;
      if (e.cx < this._parent.x || e.cy < this._parent.y)return false;
      this.pathFun(ctx);
      if (!ctx.isPointInPath(e.ox, e.oy)) return false;
      e._invalid = true;
      core.helper._textareaElement.bind(this._parent);
      this.onclick(e, this._parent);
      return true;
    }
  },
  articleInput: {x: 0, y: 0, w: 300, h: 160, lineSpace: 1.2, backColor: 'white', textColor: '#000', font: '16px Arial',
    dragerMove: function (e, p) {
      var d = p._mouseY - e.cy;
      if (Math.abs(d) > p._fh) {
        if (d > 0)
          p.moveUp();
        else
          p.moveDown();
        p._mouseY = e.cy;
        e._invalid = true;
        p.emit('dragmove', [e, p])
      }
    },
    wheelerFire: function (ctx, e) {
      if (!this.enable) return false;
      if (e.cx < this._parent.x || e.cy < this._parent.y)return false;
      this.pathFun(ctx);
      if (!ctx.isPointInPath(e.ox, e.oy)) return false;
      e._invalid = e.up ? this._parent.moveDown() : this._parent.moveUp();
      return true;
    },
    textCallback: function (o, s) {
      s._lines = controls.Article.prototype.breakText(s._txt, s._w, s._font);
    },
    clickerFire: function (ctx, e) {
      if (!this.enable) return false;
      var p = this._parent;
      if (e.cx < p.x || e.cy < p.y)return false;
      this.pathFun(ctx);
      if (!ctx.isPointInPath(e.ox, e.oy)) return false;
      e._invalid = true;
      core.helper._textareaElement.bind(p);
      this.onclick(e, p);
      p.emit('click', e);
      return true;
    },
    positionCallback: function (o, s) {
      if (!s._textarea) return;
      if (s._parent)
        s._textarea.display = (s.x + s.w < s._parent.w) && (s.y + s.h < s._parent.h);
      else
        s._textarea.display = (s.x > 0 && s.y > 0);
    }
  },
  label: {
    font: '12px Arial',
    textColor: '#000',
    backColor: 'rgba(0,0,0,0)',
    fontCallback: function (o, s) {
      var ctx = core.helper._ctx, min;
      ctx.save();
      ctx.font = s._font;
      min = controls.config.parseFont(s._font, 1.3);
      if (s.h < min) s.h = min;
      //s._w = ctx.measureText(s._txt).width;
      ctx.restore();
    }
  },
  img: {
    srcUpdateFunc: function (task) {
      if (!this._img)
        core.helper.imgPool.getImg(this);
    },
    srcCallback: function (o, s) {
      s._img = null;
      s.addUpdateFunc(controls.config.img.srcUpdateFunc);
    }
  },
  button: {
    w: 120,
    h: 45,
    radius: 5,
    font: '12px Arial',
    textColor: '#000',
    backColor: 'gray',
    borderColor: 'white',
    mousein: function () {
      this.invalid();
    }
  },
  switch: {
    font: '18px Arial',
    backColor: '#f5f5dc',
    borderColor: '#191970',
    textColor: '#000',
    onclick: function (e, p) {
      if (e.cx - p.absX > p._w / 2) {
        if (!p._onleft) {
          p._onleft = true;
          p._txt = p._ltxt;
          e._invalid = true;
          p.emit('change', [p._rtxt, p]);
        }
      } else if (p._onleft) {
        p._onleft = false;
        p._txt = p._rtxt;
        e._invalid = true;
        p.emit('change', [p._ltxt, p]);
      }
    }
  },
  textInput: {
    waterMarkColor: '#c0c0c0',
    font: '14px Arial',
    backColor: 'white',
    waterMarkTxt: '',
    txtColor: 'black',
    regExp: /^[\S ]+$/,
    ontext:function(ov){
      if(this.validate(this._txt))this.emit('change',[ov,this._txt]);
    },
    clickerFire: function (ctx, e) {
      if (!this.enable)  return false;
      if (e.cx < this._parent.x || e.cy < this._parent.y)return false;
      this.pathFun(ctx);
      if (!ctx.isPointInPath(e.ox, e.oy))  return false;
      var p = this._parent;
      if (!p._inputElement)
        core.helper._inputElement.bind(p);
      e._invalid = true;
      this.onclick(e, p);
      p.emit('click', e);
      return true;
    }
  },
  parseFont: function (font, lineSpace) {
    return Math.ceil(parseFloat(font.match(/\d+(\.?\d+)(?=px)/i)[0])) * (lineSpace || 1);
  },
  proCallbacks: {
    y: function (o, obj) {
      obj._controls.forEach(function (c) {
        c.py = obj.absY;
        c.notify('y');
      })
    },
    x: function (o, obj) {
      obj._controls.forEach(function (c) {
        c.px = obj.absX;
        c.notify('x');
      })
    },
    defaultUpdate: function (o, obj) {
      obj.addUpdateFunc(function () {
        var font = new core.Font(this._font), h = this._h;
        if (h > font.size) {
          font.size = h;
          this._font = font.fontString;
        }
        else {
          this._h = font.size;
        }
        return false;
      });
    },
    cancelChange: function (o, s, p) {
      s[p] = o;
      return -1;
    },
    visibility: function (o, sender) {
    },
    backColor: function (c, sender) {
      for (var i = 0, bc = sender._bc, panels = this._controls, panel = panels[0]; panel; panel = panels[++i])
        panel.backColor = bc;
    }
  }
};
controls.path = {
  roundRect: function (w, h, r, ctx) {
    ctx.beginPath();
    if (r) {
      ctx.moveTo(r, 0);
      ctx.lineTo(w - r, 0);
      ctx.quadraticCurveTo(w, 0, w, r);
      ctx.lineTo(w, h - r);
      ctx.quadraticCurveTo(w, h, w - r, h);
      ctx.lineTo(r, h);
      ctx.quadraticCurveTo(0, h, 0, h - r);
      ctx.lineTo(0, r);
      ctx.quadraticCurveTo(0, 0, r, 0);
      ctx.closePath();
    }
    else
      ctx.rect(0, 0, w, h);
  },
  pointTriangle: function (w, h, ctx, expaned) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    if (expaned) {
      ctx.lineTo(h / 2, w);
      ctx.lineTo(h, 0);
    } else {
      ctx.lineTo(w, h / 2);
      ctx.lineTo(0, h);
    }
  },
  plusInSquare: function (r, ctx, spaceLength) {
    var sl = spaceLength || r / 8, hr = r / 2, l = r - sl;
    ctx.beginPath();
    ctx.rect(0, 0, r, r);
    ctx.moveTo(sl, hr);
    ctx.lineTo(l, hr);
    ctx.moveTo(hr, sl);
    ctx.lineTo(hr, l);
    ctx.closePath();
  },
  minusInSquare: function (r, ctx, spaceLength) {
    var sl = spaceLength || r / 8, hr = r / 2, l = r - sl;
    ctx.beginPath();
    ctx.rect(0, 0, r, r);
    ctx.moveTo(sl, hr);
    ctx.lineTo(l, hr);
    ctx.closePath();
  },
  Rect: function (x, y, w, h) {
    this._x = x || 0;
    this._y = y || 0;
    this._w = w || 0;
    this._h = h || 0;
  }
};
controls.addCtrlToClass = function (obj, ctrl) {
  if (!obj._$objArray$_) {
    obj._$objArray$_ = [ctrl];
    if (Object.setPrototypeOf)Object.setPrototypeOf(obj, controls.config.classPrototype);
    else
      obj.__proto__ = controls.config.classPrototype;
  }
  else
    obj._$objArray$_.add(ctrl);
  ctrl._class = obj;
  return obj;
};
(function () {
  controls.path.Rect.prototype = {
    pointInside: function (x, y) {
      return (x > this.left) && (y > this.top) && (y < this.bottom) && x < this.right;
    },
    get left() {
      return this._x;
    },
    get right() {
      return this._x + this._w;
    },
    get top() {
      return this._y;
    },
    get bottom() {
      return this._y + this._h;
    },
    union: function (rect) {
      var minx = this.left < rect.left ? this.left : rect.left,
        miny = this.top < rect.top ? this.top : rect.top,
        maxx = this.right > rect.right ? this.right : rect.right,
        maxy = this.bottom > rect.bottom ? this.bottom : rect.bottom;
      this._x = minx;
      this._y = miny;
      this._w = maxx - minx;
      this._h = maxy - miny;
    },
    interset: function (rect) {
      var left = this.left > rect.left ? this.left : rect.left,
        top = this.top > rect.top ? this.top : rect.top,
        right = this.right < rect.right ? this.right : rect.right,
        bottom = this.bottom < rect.bottom ? this.bottom : rect.bottom;
      this._x = left;
      this._y = top;
      this._w = right - left;
      this._h = bottom - top;
    },
    overlap: function (rect) {
      var pw = this._x < rect._x ? rect.right - this._x : this.right - rect._x,
        ph = this._y < rect._y ? rect.bottom - this._y : this.bottom - rect._y;
      return (rect._w + this._w) > pw && (rect._h + this._h) > ph;
    }
  };
  controls.path.Rect.fromCtrl = function (ctrl) {
    return new controls.path.Rect(ctrl.x, ctrl.y, ctrl.w, ctrl.h);
  };
  controls.TextBox = controls.TextInput;
})();core.setId = function (id, obj) {
  for (var ns = id.split('.'), container = window, i = 0, n = ns[0]; ns[i + 1]; n = ns[++i]) {
    if (!container[n])container[n] = {};
    container = container[n];
  }
  container[n] = obj;
  return obj;
};
controls.properties = {
  absX: {
    get: function () {
      return this._x + (this.px || 0)
    },
    set: false},
  absY: {
    get: function () {
      return this._y + (this.py || 0)
    },
    set: false
  },
  animation: {
    set: function (a) {
      if (a && !(a instanceof animations.Animation)) return;
      var oa = this._animation;
      if (oa === a)return;
      if (oa) oa.dispose();
      a.apply(this);
      if (!this.notify('animation', oa))
        a.dispose(this);
    }
  },
  backColor: {get: function () {
    return this._bc;
  }, set: function (val) {
    core.helper._ctx.fillStyle = val;
    val = core.helper._ctx.fillStyle;
    var o = this._bc;
    if (o == val) return;
    this._bc = val;
    if (this.notify('backColor', o, this, '_bc'))
      this.invalid();
  }
  },
  binding: {set: function (b) {
    if (!b)this._binding = null;
    else if (b instanceof core.parsers.OneWayBinding && b !== this._binding)
      this._binding = b;
  }},
  borderColor: {
    get: function () {
      return this._bdc;
    }, set: function (val) {
      core.helper._ctx.fillStyle = val;
      val = core.helper._ctx.fillStyle;
      var o = this._bdc;
      if (o == val) return;
      this._bdc = val;
      if (this.notify('borderColor', o, this, '_bdc'))
        this.invalid();
    }
  },
  children: {
    set: false, get: function () {
      return this._controls;
    }
  },
  class: {
    publicName: 'class',
    set: function (obj) {
      var oc = this._class;
      if (oc === obj)return;
      if (oc)oc._$objArray$_.remove(this);
      if (typeof obj == "object")
        controls.addCtrlToClass(obj, this);
      this._class = obj;
      if (this.notify('class', oc) != false && obj)
        obj.__proto__.broadCastAllProperties.apply(obj, [this]);
    }, get: function () {
      return this._class;
    }
  },
  clicker: {set: function (c) {
    var o = this._clicker;
    if (o === c || (c && !(c instanceof eventHandlers.Clicker)))return;
    if (c)c._parent = this;
    if (o) {
      o._parent = null;
      o.dispose();
    }
    this._clicker = c;
    this.notify('clicker', o);
  }},
  clock: {
    set: function (c) {
      if ((c && !(c instanceof animations.SimpleClock)) || oc === c) return;
      var t = this.getTask(), oc = this._clock;
      if (oc) {
        oc._parent = null;
        if (t)t.removeClock(oc);
      }
      this._clock = c;
      if (c) {
        c._parent = this;
        if (c._waitUpdate) {
          if (t) t.addClock(c);
          else this.addUpdateFunc(function (t) {
            t.addClock(this._clock);
          });
        }
      }
      this.notify('clock', oc);
    }
  },
  data: {set: function (val) {
    var o = this._data;
    if (o === val)return;
    this._data = val;
    if (this.notify('data', o))
      this.invalid();
  }},
  drager: {set: function (d) {
    var o = this._drager;
    if (o === d || (d && !(d instanceof eventHandlers.Drager)))return;
    if (d)d._parent = this;
    if (o) {
      o._parent = null;
      o.dispose();
    }
    this._drager = d;
    this.notify('wheeler', o);
  }},
  enable: {set: function (b) {
    b = b.toBool();
    if (b == undefined || b == this._enable) return;
    this._enable = b;
    if (this.notify('enable', !b))
      this.invalid();
  }},
  expanded: {
    set: function (b) {
      if (typeof b != "boolean") return;
      var o = this._expanded;
      if (b == undefined || o == b)return;
      this._expanded = b;
      if (this.notify('expanded', o))
        this.invalid();
    }
  },
  font: {set: function (str) {
    /**
     * @param {string|core.Font} str
     * @type {*}
     */
    var n = (str instanceof core.Font) ? str : new core.Font(str), o = new core.Font(this._font);
    if (n.equals(o)) return;
    this._font = n.toString();
    if (this.notify('font', o.font))
      this.invalid();
  }, get: function () {/**
   @return {core.Font}
   */
    return new core.Font(this._font);
  }},
  h: {set: function (s) {
    var val = s.toInt();
    if (val == undefined || val <= 0) return;
    var o = this._h;
    if (o != val)
      this._h = val;
    if (this.notify('h', o))
      this.invalid();
  }},
  headerBackColor: {
    get: function () {
      return this._headerbc;
    }, set: function (val) {
      core.helper._ctx.fillStyle = val;
      val = core.helper._ctx.fillStyle;
      var o = this._headerbc;
      if (o == val) return;
      this._headerbc = val;
      if (this.notify('headerBackColor', o))
        this.invalid();
    }
  },
  id: {get: function () {
    return this._id;
  }, set: function (val) {
    if (typeof val != "string" || val == this._id)return false;
    var o = this._id;
    if (o)
      delete core.inspectAttribute(o);
    this._id = val;
    if (!this.notify("id", o))return false;
    core.setId(val, this);
    return true;
  }},
  items: {
    set: function (val) {
      if (!(val instanceof Array)) return false;
      var ov = this._items;
      if (ov === val) return false;
      this._items = val;
      if (this.notify('items', val))return false;
      this.invalid();
      return true;
    },
    get: function () {
      return this._items;
    }
  },
  leftText: {
    get: function () {
      return this._ltxt;
    },
    set: function (str) {
      str = str + '';
      if (str == undefined) return false;
      var ot = this._ltxt;
      if (ot == str)return false;
      this._ltxt = str;
      if (!this.notify('leftText', ot))return false;
      this.invalid();
      return true;
    }
  },
  lineSpace: {
    get: function () {
      return this._ls;
    },
    set: function (s) {
      var val = s.toInt();
      if (val == undefined || val <= 0) return false;
      var o = this._ls;
      if (o == val)return false;
      this._ls = val;
      if (!this.notify('lineSpace', o, this, '_ls'))return false;
      this.invalid();
      return true;
    }
  },
  location: {
    get: false,
    set: function (val) {
      if (typeof val != "string")return;
      var s = val.split(','), i, ctrl = this;
      ['x', 'y', 'w', 'h'].forEach(function (p, index) {
        i = parseInt(s[index]);
        if (!isNaN(i))ctrl[p] = i;
      });
    }
  },
  rightText: {
    get: function () {
      return this._rtxt;
    },
    set: function (str) {
      str += '';
      if (str == undefined) return false;
      var ot = this._rtxt;
      if (ot == str)return false;
      this._rtxt = str;
      if (!this.notify('rightText', ot))return false;
      this.invalid();
      return true;
    }
  },
  onchange: {
    get: false,
    set: function (callback) {
      if (typeof callback != "function") return;
      this.on('change', callback);
    }},
  onclick: {
    get: false,
    set: function (f) {
      if (typeof f != "function") return;
      if (!this.clicker)this.clicker = new eventHandlers.Clicker(this);
      this.on('click', f);
    }
  },
  onmousein: {
    get: false,
    set: function (f) {
      if (typeof f != "function") return;
      if (!this.spotter)this.spotter = new eventHandlers.Spotter(this);
      this.on('mousein', f);
    }
  },
  onmouseout: {
    get: false,
    set: function (f) {
      if (typeof f != "function") return;
      if (!this.spotter)this.spotter = new eventHandlers.Spotter(this);
      this.on('mouseout', f);
    }
  },
  ondragmove: {
    get: false,
    set: function (f) {
      if (typeof f != "function") return;
      if (!this.drager)this.drager = new eventHandlers.Drager(this);
      this.on('dragmove', f);
    }
  },
  ondragend: {
    get: false,
    set: function (f) {
      if (typeof f != "function") return;
      if (!this.drager)this.drager = new eventHandlers.Drager(this);
      this.on('dragend', f);
    }
  },
  ondragstart: {
    get: false,
    set: function (f) {
      if (typeof f != "function") return;
      if (!this.drager)this.drager = new eventHandlers.Drager(this);
      this.on('dragstart', f);
    }
  },
  onwheeldown: {
    get: false,
    set: function (f) {
      if (typeof f != "function") return;
      if (!this.wheeler)this.wheeler = new eventHandlers.Wheeler(this);
      this.on('wheeldown', f);
    }
  },
  onwheelup: {
    get: false,
    set: function (f) {
      if (typeof f != "function") return;
      if (!this.wheeler)this.wheeler = new eventHandlers.Wheeler(this);
      this.on('wheelup', f);
    }
  },
  parent: {set: function (p) {
    var o = this._parent;
    if (o === p) return;
    if (!p) {
      this.py = this.px = 0;
      this._parent = null;
    }
    else {
      this._parent = p;
      this.px = p.absX;
      this.py = p.absY;
      if (this.shouldUpdate) {
        var t = p.getTask();
        if (t) t.addUpdateComponent(this);
        else p.addUpdateFunc(function () {
          return false;
        });
      }
      if (this._controls) {
        this.notify('x');
        this.notify('y');
      }
    }
    this.notify('parent', o);
  }},
  regExp: {
    get: function () {
      return this._regExp;
    },
    set: function (val) {
      var o = this._regExp;
      if (!(val instanceof RegExp)) this._regExp = controls.config.textInput.regExp;
      if (o === val) return false;
      if (!this.notify('regExp', o))return false;
      this._regExp = val;
      this.invalid();
      return true;
    }, textInputCallBack: function (o, obj) {
      obj.addUpdateFunc();
    }
  },
  radius: {
    set: function (s) {
      var val = s.toInt();
      if (val == undefined) return;
      var o = this._radius;
      if (o != val)
        this._radius = val;
      if (this.notify('radius', o))
        this.invalid();
    }
  },
  scaleX: {
    set: function (v) {
      v = parseFloat(v);
      if (isNaN(v))return;
      var ov = this._scaleX;
      if (v == ov)return;
      this._scaleX = v;
      if (this.notify('scaleX', ov)) this.invalid();
    }
  },
  scaleY: {
    set: function (v) {
      v = parseFloat(v);
      if (isNaN(v))return;
      var ov = this._scaleY;
      if (v == ov)return;
      this._scaleY = v;
      if (this.notify('scaleY', ov)) this.invalid();
    }
  },
  selectedIndex: {
    set: function (n) {
      if (typeof n != "number") n = parseInt(n);
      if (isNaN(n) && n >= this._items.length)return false;
      var o = this._selectedIndex;
      if (!(n < 0 && o == -1))
        this._selectedIndex = n;
      return this.notify('selectedIndex', o);
    }
  },
  selectedItem: {set: false, get: function () {
    return this._items[this.selectedIndex];
  }},
  siblings: {set: false, get: function () {
    var ctrls, r;
    if (this._task) ctrls = this._task._components;
    else if (this._parent) ctrls = this._parent._controls;
    else return[];
    r = [].concat(ctrls);
    r.remove(this);
    return r;
  }},
  spotter: {set: function (s) {
    var o = this._spotter, t = this.getTask();
    if (o === s || (s && !(s instanceof eventHandlers.Spotter)))return false;
    this._spotter = s;
    if (s)
      s._parent = this;
    if (o)
      o.dispose(t);
    return this.notify('spotter', o);
  }},
  mask: {
    set: function (m) {
      m += '';
      var o = this._mask;
      if (o == m)return;
      this._mask = m;
      if (!this.notify('mask', o)) return;
      this.invalid();
    }
  },
  src: {set: function (s) {
    s += '';
    if (s == undefined)return false;
    var o = this._src;
    if (o == s)return false;
    this._src = s;
    return this.notify('src', o);
  }},
  task: {
    set: function (t) {
      if ((!t && !ot) || (t && t instanceof core.Task && ot === t))return false;
      var ot = this._task;
      this._task = t;
      return this.notify('task', ot);
    },
    get: function () {
      return this.getTask();
    }
  },
  text: {
    set: function (str) {
      str += '';
      if (str == undefined) return;
      var ot = this._txt;
      if (ot == str)return;
      this._txt = str;
      if (this.notify('text', ot, this, '_txt'))
        this.invalid();
    },
    get: function () {
      return this._txt;
    }
  },
  textColor: {get: function () {
    return this._tc;
  }, set: function (val) {
    core.helper._ctx.fillStyle = val;
    val = core.helper._ctx.fillStyle;
    var o = this._tc;
    if (o == val) return false;
    this._tc = val;
    if (this.notify('textColor', o))
      this.invalid();
    return true;
  }},
  titleFont: {set: function (str) {
    /**
     * @param {string|core.Font} str
     * @type {string|core.Font}
     */
    var n = (str instanceof core.Font) ? str : new core.Font(str), o = new core.Font(this._font);
    if (n.equals(o)) return false;
    this._titleFont = n.toString();
    if (!this.notify('titleFont', o.font))return false;
    this.invalid();
    return true;
  }, get: function () {/**
   @return {core.Font}
   */
    return new core.Font(this._font);
  }},
  titleText: {
    set: function (str) {
      str += '';
      if (str == undefined) return false;
      var ot = this._titleText;
      if (ot == str)return false;
      this._titleText = str;
      if (!this.notify('titleText', ot))return false;
      this.invalid();
      return true;
    }},
  validText: {
    set: false, get: function () {
      if (this._regExp)
        if (this._regExp.test(this._txt))return this._txt;
        else return undefined;
      else return this._txt;
    }
  },
  value: {
    get: function () {
      return this._val;
    },
    set: function (val) {
      val = val.toFloat();
      if (val == undefined) return false;
      var o = this._val;
      if (val == o)return false;
      this._val = val;
      if (this.notify('value', o, this, '_val'))
        this.invalid();
    }
  },
  visibility: {set: function (v) {
    v = v.toFloat();
    if (v == this._visibility || v > 1 || v < 0) return false;
    var ov = this._visibility;
    this._visibility = v;
    if (!this.notify('visibility', ov))return false;
    this.invalid();
    return true;
  }},
  w: {set: function (s) {
    var val = s.toInt();
    if (val == undefined || val <= 0) return false;
    var o = this._w;
    if (o != val)
      this._w = val;
    this.notify('w', o);
    this.invalid();
    return true;
  }},
  waterMarkColor: {
    get: function () {
      return this._wmc;
    }, set: function (val) {
      core.helper._ctx.fillStyle = val;
      val = core.helper._ctx.fillStyle;
      var o = this._wmc;
      if (o == val) return false;
      this._wmc = val;
      this.notify('waterMarkColor', o);
      this.invalid();
      return true;
    }
  },
  waterMarkText: {get: function () {
    return this._wmtxt;
  },
    set: function (v) {
      if (typeof v != "string")return false;
      var o = this._wmtxt;
      if (o == v)return false;
      this._wmtxt = v;
      if (!this.notify('waterMarkText', o, this, '_wmtxt')) return false;
      this.invalid();
      return true;
    }},
  wheeler: {set: function (w) {
    var o = this._wheeler;
    if (o === w || (w && !(w instanceof eventHandlers.Wheeler)))return false;
    if (w)w._parent = this;
    if (o) {
      o._parent = null;
      o.dispose();
    }
    this._wheeler = w;
    this.notify('wheeler', o);
    return true;
  }},
  x: {set: function (s) {
    var val = s.toInt();
    if (val == undefined) return false;
    var o = this._x;
    if (o != val)
      this._x = val;
    if (this.notify('x', o))
      this.invalid();
    return true;
  }},
  y: {set: function (s) {
    var val = s.toInt();
    if (val == undefined) return false;
    var o = this._y;
    if (o != val)
      this._y = val;
    this.notify('y', o);
    this.invalid();
    return true;
  }},
  z: {set: function (s) {
    var val = s.toInt();
    if (val == undefined) return false;
    var o = this._z;
    if (o != val)
      this._z = val;
    if (this._task)
      this._task._components.des('_z');
    else if (this._parent)
      this._parent._controls.des('_z');
    this.notify('z', o);
    this.invalid();
    return true;
  }}};
(function () {
  var pros = controls.properties;
  for (var p in pros)
    if (!pros[p].publicName)
      pros[p].publicName = p;
  pros.selectH = {
    publicName: 'h',
    get: function () {
      return this._expanded ? this._x : this._itemHeight;
    },
    set: false
  }
})();
controls.prototypes = {
  updateObject: {
    addNotification: function (pro, callback) {
      return this.on(pro, callback);
    },
    removeNotification: function (pro, callback) {
      if (this._callbacks[pro])
        this._callbacks[pro].remove(callback);
    },
    clearNotification: function (pro) {
      this._callbacks[pro] = undefined;
    },
    notify: function (pro, originalValue, sender, priveatePro) {
      var cbs = this._callbacks[pro];
      if (cbs) {
        if (cbs._notifying)return false;
        cbs._notifying = true;
        if (arguments.length == 1) originalValue = this[pro];
        for (var i = 0, cb = cbs[0]; cb; cb = cbs[++i])
          if (cb.apply(this, [originalValue, sender || this, priveatePro || ('_' + pro)]) == -1) {
            sender[priveatePro || ('_' + pro)] = originalValue;
            return false;
          }
        cbs._notifying = false;
      }
      return true;
    },
    author: function () {
      console.log('Contact me:borian1222@vip.qq.com');
    },
    update: function (task) {
      var self = this;
      this._updateFunc = this._updateFunc.filter(function (f) {
        return f.call(self, task);
      });
      if (this._controls) this._controls.forEach(function (c) {
        c.update(task);
      })
    },
    invalid: function () {
      var t = this.task;
      if (t)t.invalid();
      else this.addUpdateFunc(function (task) {
        task.invalid();
      });
    },
    getTask: function () {
      var ctrl = this;
      while (ctrl._parent)
        ctrl = ctrl._parent;
      return ctrl._task;
    },
    dispose: function (task) {
      task = task || this.getTask();
      if (!task) return;
      task.removeUpdateComponent(this);
      task.removeUIComponents(this);
      task.removeClock(this.clock);
      delete  this._parent;
      delete this._callbacks;
      delete this._binding;
      delete this._task;
      if (this._class)this._class._$objArray$_.remove(this);
      delete this._class;
      if (this._controls) this._controls.forEach(function (c) {
        c.dispose(task);
      });
    },
    changeModel: function (model) {
      console.warn('this method has bugs');
      var b = this.binding;
      if (b) b.applyCtrl(this, model);
    },
    addUpdateFunc: function (callback) {
      if (typeof (callback) == 'function') this._updateFunc.add(callback);
      else if (this._defaultUpdateFun) this._updateFunc.add(this._defaultUpdateFun);
      var t = this.getTask();
      if (t)t._updateComponets.add(this);
      else if (this._parent) this._parent.addUpdateFunc(function () {
        return false;
      });
    }
  },
  ui: {
    /**
     * @param {CanvasRenderingContext2D} ctx
     */
    render: function (ctx) {
      //控件不可见,跳出绘制
      if (!this._visibility) return;
      //保存context状态
      ctx.save();
      //调整透明度
      ctx.globalAlpha *= this._visibility;
      //如果控件被禁用,使其半透明
      if (!this._enable) ctx.globalAlpha *= .4;
      //变形函数,用于动画
      this.transform(ctx);
      //绘制函数,用于具体绘图
      this.paint(ctx);
      //恢复ctx.save()之前的状态
      ctx.restore();
    },
    /**
     * @this {UIComponent}
     * @param {CanvasRenderingContext2D} ctx
     */
    transform: function (ctx) {
      ctx.translate(this.x, this.y);
    },
    /**
     * @param {controls.Panel|controls.Drop} p
     */
    isBottomCtrl: function (p) {
      var p = p || this._parent;
      if (p) {
        if (p instanceof controls.Panel)
          return p._maxh == this.y + this.h + 10;
        else if (p instanceof controls.Drop)
          return p._h == this.y + this.h + 10;
      }
      return false;
    },
    /**
     * @this {UIComponent}
     * @param {CanvasRenderingContext2D} ctx
     */
    paint: function (ctx) {
    },
    intersectClip: function (ctx, x, y, w, h) {
      arguments.length == 1 ? ctx.setClipRect(0, 0, this._w, this._h) : ctx.setClipRect(x, y, w, h);
    },
    overlap: function (ctrl) {
      var x1 = this.absX, x2 = this.absX + this.w, x3 = ctrl.absX, x4 = ctrl.absX + ctrl.w;
      var y1 = this.absY, y2 = this.absY + this.h, y3 = ctrl.absY, y4 = ctrl.absY + ctrl.h;
      return (Math.max(x1, x2, x3, x4) - Math.min(x1, x2, x3, x4)) < (this.w + ctrl.w) &&
        (Math.max(y1, y2, y3, y4) - Math.min(y1, y2, y3, y4)) < (this.h + ctrl.h);
    }
  },
  icon: {
    render: function (ctx) {
      if (!this._visibility) return;
      ctx.save();
      ctx.globalAlpha *= this._visibility;
      if (!this._enable) ctx.globalAlpha *= .4;
      this.transform(ctx);
      ctx.scale(this.scaleX, this.scaleY);
      this.paint(ctx);
      ctx.restore();
    }
  },
  img: {
    paintLoading: function (ctx) {

    },
    paintUnload: function (ctx) {

    },
    paint: function (ctx) {
      var img = this._img;
      if (img)
        if (img.state == 1)
          ctx.drawImage(img, this.sx, this.sy, this.sw || img.width, this.sh || img.height, 0, 0, this.w, this.h);
        else if (img.state == -1) this.paintUnload(ctx);
        else this.paintLoading(ctx);
      else {
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(0, 0, this.w, this.h);
      }
    }
  },
  rectangle: {
    paint: function (ctx) {
      ctx.lineWidth = 0.5;
      ctx.fillStyle = this.backColor;
      ctx.strokeStyle = this.borderColor;
      controls.path.roundRect(this.w, this.h, this.radius, ctx);
      ctx.fill();
      ctx.stroke();
    }
  },
  article: {
    _defaultUpdateFun: function (task) {
      if (this._txt) {
        this._lines = this.breakText(this._txt, this._w, this._font);
        delete this._txt;
      }
      this._fh = controls.config.parseFont(this._font, this._ls);
      this.invalid();
      return false;
    },
    paint: function (ctx) {
      ctx.textBaseline = "top";
      ctx.fillStyle = this._bc;
      ctx.fillRect(-2, -2, this._w + 4, this._h + 4);
      ctx.fillStyle = this._tc;
      this.intersectClip(ctx, 0, 0, this._w + 8, this._h + 2);
      ctx.font = this._font;
      var curh = 0, cfg = controls.config, title = this._titleText,
        _fh = cfg.parseFont(this._font, this._ls), maxh = this._h - (title ? _fh : 0)
        , maxline = this._maxLines >= 0 ? this._maxLines + this._curline : this._lines.length;
      if (title && this._curline === 0) {
        ctx.font = this._titleFont;
        ctx.fillStyle = this._titleColor;
        var left = (this._w - ctx.measureText(title).width) / 2;
        ctx.fillText(title, left < 0 ? 0 : left, 0, this._w);
        ctx.font = this._font;
        curh = cfg.parseFont(this._titleFont, this._ls);
        ctx.fillStyle = this._tc;
      }
      for (var l = this._curline; curh <= maxh && l < maxline; l++, curh += _fh)
        ctx.fillText(this._lines[l], 0, curh);
      if (curh >= maxh) {
        ctx.translate(this._w + 1, this._h * (this._curline / this._lines.length || 0) + 4);
        controls.path.roundRect(4, this._h * ((l - this._curline) / this._lines.length) || 4, 2, ctx);
        ctx.fill();
      }
    },
    breakText: function breakText(text, maxw, font) {
      if (!text)return[];
      var lines = [], i = 0, curw = 0, line = "", ctx = core.helper._ctx;
      ctx.font = font;
      while (i < text.length) {
        while (curw < maxw) {
          if (text[i] == "\n") {
            i++;
            break;
          } else {
            line += text[i];
            curw = ctx.measureText(line).width;
            if (curw >= maxw) {
              line = line.slice(0, line.length - 1);
              break;
            } else
              i++;
          }
          if (i >= text.length)
            break;
        }
        lines.push(line);
        line = "";
        curw = 0;
      }
      return lines;
    },
    moveDown: function () {
      if (this._curline > 0) {
        this.invalid();
        --this._curline;
        return true;
      }
      return false;
    },
    moveUp: function () {
      var cfg = controls.config, _fh = cfg.parseFont(this._font, this._ls),
        texh = (this._lines.length - this._curline) * _fh;
      if (this._titleText && this._curline == 0)
        texh += cfg.parseFont(this._titleFont, this._ls) - _fh;
      if (texh > this._h) {
        this.invalid();
        this._curline++;
        return true;
      }
      return false;
    }
  },
  articleInput: {
    paint: function (ctx) {
      if (this._textarea && this._textarea.display) return;
      ctx.textBaseline = "top";
      ctx.fillStyle = this._bc;
      ctx.fillRect(-2, -2, this._w + 2, this._h + 2);
      ctx.fillStyle = this._tc;
      this.intersectClip(ctx, 0, 0, this._w + 8, this._h);
      ctx.font = this._font;
      var curh = 0, cfg = controls.config, _fh = cfg.parseFont(this._font, this._ls), maxh = this._h - _fh
        , maxline = this._lines.length;
      for (var l = this._curline; curh <= maxh && l < maxline; l++, curh += _fh)
        ctx.fillText(this._lines[l], 0, curh);
      ctx.translate(this._w - 1, this._h * (this._curline / this._lines.length || 0) + 4);
      controls.path.roundRect(4, this._h * ((l - this._curline) / this._lines.length) || 4, 2, ctx);
      ctx.fill();
    }
  },
  button: {
    paint: function (ctx) {
      ctx.font = this._font;
      ctx.fillStyle = this._bc;
      ctx.textBaseline = "hanging";
      var w = ctx.measureText(this._txt).width;
      var fh = core.Font.parseFont(this._font);
      if (fh > this._h) this._h = fh * 1.2;
      controls.path.roundRect(this._w, this._h, this.radius, ctx);
      ctx.fill();
      ctx.fillStyle = this._tc;
      ctx.fillText(this._txt, w > this._w ? 0 : (this._w - w) / 2, (this._h - fh) / 2, this._w);
      if (this._enable && this.spotter._onAction) {
        ctx.strokeStyle = this._bdc;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this._bdc;
        ctx.stroke();
      }
    }},
  label: {
    paint: function (ctx) {
      ctx.textBaseline = "top";
      ctx.font = this._font;
      var fh =this.font.size, y = (this.h - fh) / 2, x = 0;
      ctx.fillStyle = this._bc;
      var txt = this.text, rw = ctx.measureText(txt).width, w = this.w;
      ctx.fillRect(0, 0, w, this.h);
      ctx.fillStyle = this.textColor;
      if (w > rw) {
        if (this.align == 'center') x = (w - rw) / 2;
        else if (this.align == 'right')x = w - rw;
      }
      ctx.fillText(txt, x, y, w);
    }
  },
  range: {
    _roundValue: function (val) {
      if (val >= this._max) return this._max;
      else if (val <= this._min) return this._min;
      var round = Math.round((val - this._min) / this._step);
      return Math.min(round * this._step + this._min, this._max);
    },
    paint: function (ctx) {
      var ver = this._vertical, bh = this.lineWidth, w = this.w, h = this.h,per=(this._val-this._min)/(this._max-this._min);
      if(per>1)per=1;
      else if(per<0)per=0;
      if (ver) {
        ctx.translate(w / 2 - bh, 0);
        controls.path.roundRect(bh + bh, h, this.radius, ctx);
      } else {
        ctx.translate(0, h / 2 - bh);
        controls.path.roundRect(w, bh + bh, this.radius, ctx);
      }
      ctx.strokeStyle = this._bdc;
      ctx.stroke();
      ctx.fillStyle = this.backColor;
      ctx.fill();
      ver ? ctx.translate(bh, Math.round(h * per)) : ctx.translate(Math.round(w * per), bh);
      this.paintButton(ctx);
    },
    paintButton: function (ctx) {
      if(this._max<=this._min) return;
      if (this.drager._onAction) {
        ctx.shadowColor = this._bc;
        ctx.shadowBlur = 20;
      }
      ctx.strokeStyle = this._bdc;
      ctx.beginPath();
      ctx.arc(0, 0, (this._vertical ? this.w : this.h) / 2, 0, Math.PI * 2);
      ctx.linewidth = 2;
      ctx.stroke();
      ctx.fillStyle = this.textColor || this.backColor || this._bdc;
      ctx.fill();
    }
  },
  switch: {
    _defaultUpdateFun: function (task) {
      var cfg = controls.config, ctx = task._global.ctx, h = this._h, r = this._radius, w = this._w;
      var _fh = cfg.parseFont(this._font);
      this._h = h > _fh + 6 ? h : _fh + 6;
      this._radius = r || this._h / 2;
      ctx.font = this._font;
      var w1 = ctx.measureText(this._ltxt).width, w2 = ctx.measureText(this._rtxt).width;
      this._w = (w1 > w2 ? w1 * 2 : w2 * 2 ) + this._radius * 2;
      if (w > this._w) this._w = w;
      this._txt = this._onleft ? this._ltxt : this._rtxt;
    }, _onchange: function (e, sender) {
    },
    paint: function (ctx) {
      var w = this._w, h = this._h, r = this._radius, fh = controls.config.parseFont(this._font), rp = controls.path.roundRect;
      ctx.font = this._font;
      ctx.textBaseline = "top";
      ctx.strokeStyle = this._bdc;
      ctx.fillStyle = this._bc;
      ctx.lineWidth = 2;
      rp(w, h, r, ctx);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = this._tc;
      if (this._onleft) {
        ctx.fillText(this._ltxt, r - 2, (h - fh) / 2, w / 2);
        ctx.translate(w / 2 + 2, 2);
      } else {
        ctx.fillText(this._rtxt, w / 2 + 2, (h - fh) / 2, w / 2);
        ctx.translate(2, 2);
      }
      rp(w / 2 - 4, h - 4, r, ctx);
      ctx.fillStyle = this._bdc;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this._bdc;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;
      ctx.stroke();
      ctx.fill();
    },
    toggle: function (raiseEvent) {
      this._onleft = !this._onleft;
      this._txt = this._onleft ? this._ltxt : this._rtxt;
      if (raiseEvent) {
        var e = {_invalid: true};
        this.onchange(e);
        if (e._invalid) this.invalid();
      }
    }
  },
  select: {
    _moveBaseline: function (x) {
      var ih = this._itemHeight;
      if (x > 0) {
        this._baseLine += x;
        if (this._baseLine > ih) this._baseLine = ih;
        this.invalid();
      }
      else {
        var itemsH = ih * this._items.length, bh = this.h - ih;
        if (this._baseLine + itemsH > bh) {
          this._baseLine += x;
          if (this._baseLine + itemsH < bh)
            this._baseLine = bh - itemsH;
          this.invalid();
        }
      }
    },
    paint: function (ctx) {
      var ih = this._itemHeight, h = this.h;
      this.intersectClip(ctx, -1, -1, this._w + 2, h + 2);
      controls.path.roundRect(this._w, h, 5, ctx);
      ctx.fillStyle = this._bc;
      ctx.strokeStyle = this._bdc;
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = this._tc;
      var d = ih / 4;
      ctx.textBaseline = "top";
      ctx.font = this._font;
      ctx.fillText(this._selectedIndex == -1 ?
        this._wmtxt : this._toString(this.selectedItem), 2, 0, this._w - d * 2);
      ctx.save();
      ctx.translate(this._w - d * 2 - 2, d);
      ctx.beginPath();
      controls.path.pointTriangle(d * 2, d * 2, ctx, this._expanded);
      ctx.fillStyle = this._bdc;
      ctx.fill();
      ctx.restore();
      if (this._expanded) {
        this.intersectClip(ctx, 0, ih, this._w, h - ih);
        for (var call = this._toString, y = this._baseLine, i = 0, cs = this._items, c = cs[0]; c && y < h; c = cs[++i], y += ih)
          if (y > 0) ctx.fillText(call(c), 2, y);
      }

    }
  },
  textInput: {
    _defaultUpdateFun: function (task) {
      if (this._inputElement) this._inputElement.reset(this);
    },
    validate: function (string) {
      return this._regExp.test(string || this._txt);
    },
    paint: function (ctx) {
      if (this._inputElement && this._inputElement.isShow())return;
      var font = new core.Font(this._font), w = this.w, h = this.h;
      ctx.textBaseline = "top";
      ctx.strokeStyle = "black";
      ctx.globalAlpha *= 0.7;
      ctx.strokeRect(-2, 0, w + 2, h + 4);
      ctx.fillStyle = this._bc;
      ctx.fillRect(-2, 0, w + 2, h + 4);
      ctx.globalAlpha = 1;
      if (!this.validText) {
        ctx.fillStyle = this._wmc;
        font.style = "italic";
        font.weight = 'lighter';
        font.size *= 0.8;
        ctx.font = font.fontString;
        ctx.fillText(this._wmtxt, 0, 0, w);
      } else {
        var vt = this.validText, m = this._mask, txt;
        if (m) {
          txt = m + '';
          var len = vt.length, mlen = txt.length;
          while (len !== mlen) {
            if (mlen > len) txt = txt.substr(0, len);
            else txt += m;
            mlen = txt.length;
          }
        }
        else txt = vt;
        ctx.font = font.fontString;
        ctx.fillStyle = this._tc;
        ctx.fillText(txt, 0, 0, w);
      }
    }

  },
  panel: {
    _resetMaxh: function () {
      var my = this._controls.min('y');
      if (my > 0)my = 0;
      return this._maxh = Math.abs(my) + this._controls.max(function (e) {
        return e.y + e.h;
      }) + 10;
    },
    _defaultUpdateFun: function (task) {
      for (var i = 0, ctrls = this._controls, item = ctrls[i]; item; item = ctrls[++i]) {
        item.px = this.absX;
        item.py = this.absY;
        if (item._controls)
          item.addUpdateFunc();
      }
    },
    addCtrl: function (ctrl) {
      if (ctrl.forEach || arguments.length > 1) {
        var array = arguments.length > 1 ? arguments : ctrl, r = true;
        for (var i = 0, c = array[0]; c; c = array[++i])
          r &= this.addCtrl(c);
        return r;
      }
      if (!ctrl || !ctrl.render || !this._controls.desInsert(ctrl, '_z')) return false;
      ctrl.parent = this;
      this.addUpdateFunc();
      this.invalid();
      if (ctrl.y + ctrl.h > this._maxh)
        this._maxh = ctrl.y + ctrl.h + 10;
      else if (ctrl.y < 0)
        this._baseLine = this._resetMaxh();
      this.notify('child', ctrl);
      ctrl.addNotification('h', controls.config.panel.childHCallBack);
      return true;

    },
    findCtrl: function (name) {
      for (var i = 0, c = this._controls[0]; c; c = this._controls[++i])
        if (c.name === name) return c;
      return null;
    },
    removeCtrl: function (ctrl, dispose) {
      this._controls.remove(ctrl);
      if (ctrl) {
        if (this._maxh == ctrl._y + ctrl._h + 10)
          this._maxh -= ctrl._h;
        else if (ctrl.y < 0) {
          var my = this._controls.min('y');
          this._maxh = -my + this._controls.max(function (e) {
            return e.y + e.h;
          }) + 10;
          this._baseLine = my;
        }
        if (dispose)
          ctrl.dispose(this.getTask());
        ctrl.parent = null;
        ctrl.removeNotification('h', controls.config.panel.childHCallBack);
      }
      return ctrl;
    },
    clearCtrls: function () {
      var t = this.getTask();
      for (var i = 0, ctrls = this._controls, ctrl = ctrls[0]; ctrl; ctrl = ctrls[++i]) {
        ctrl.parent = null;
        ctrl.dispose(t);
        ctrl.removeNotification('h', controls.config.panel.childHCallBack);
      }
      this._controls = [];
      if (t)t.invalid();
      this._maxh = this._h + 10;
      this._baseLine = 0;
      return this;
    },
    paint: function (ctx) {
      this.intersectClip(ctx, 0, 0, this._w + 3, this._h);
      ctx.fillStyle = this._bc;
      ctx.fillRect(0, 0, this._w, this._h);
    },
    paintChildren: function (ctx) {
      for (var cs = this._controls, i = cs.length - 1, h = this.h, c = cs[i]; c; c = cs[--i])
        if (this.overlap(c))c.render(ctx);
    },
    render: function (ctx) {
      if (!this._visibility) return;
      ctx.save();
      ctx.globalAlpha *= this._visibility;
      this.transform(ctx);
      if (!this._enable)
        ctx.globalAlpha *= .4;
      if (this._imgCache) {
        ctx.fillStyle = this._imgCache;
        ctx.fillRect(0, 0, this.w, this.h);
      }
      else {
        this.paint(ctx);
        this.paintChildren(ctx);
      }
      ctx.restore();
    },
    _moveBaseline: function (dy) {
      this._controls.forEach(function (c) {
        c.y += dy;
      });
      this._baseLine += dy;
    },
    createImgCache: function (ctx) {
      ctx.save();
      ctx.translate(this.absX, this.absY);
      this.paint(ctx);
      this.paintChildren(ctx);
      this._imgCache = core.helper.createPattern(this);
      ctx.restore();
      return this._imgCache;
    }
  },
  expand: {
    paint: function (ctx) {
      ctx.lineWidth = 2;
      ctx.strokeStyle = this._bdc;
      ctx.fillStyle = this._bc;
      ctx.fillRect(0, 0, this.w, this.h);
      ctx.strokeRect(0, 0, this.w, this.h);
      this.intersectClip(ctx);
      var d = this._w - this._iw - 5;
      ctx.translate(d, 5);
      this._expanded ? controls.path.minusInSquare(this._iw, ctx) : controls.path.plusInSquare(this._iw, ctx);
      ctx.stroke();
      ctx.translate(-d, -5);
    }
  },
  drop: {
    addCtrl: function (ctrl) {
      if (ctrl instanceof  Array || arguments.length > 1) {
        var array = arguments.length > 1 ? arguments : ctrl, r = true;
        for (var i = 0, c = array[0]; c; c = array[++i])
          r &= this.addCtrl(c);
        return r;
      }
      if (!ctrl || !ctrl.render || !this._controls.desInsert(ctrl, '_z')) return false;
      ctrl.parent = this;
      ctrl._originalY = ctrl.y;
      ctrl.y = this._h + ctrl.y;
      ctrl.x += this._offsetX;
      if (this._expanded)
        for (var i = 0, ctrls = this.siblings, sibling = ctrls[0], y = this.y, h = ctrl.h; sibling; sibling = ctrls[++i])
          if (sibling.y > y)sibling.y += h;
      this._h = ctrl.y + ctrl.h + 10;
      this.notify('child', ctrl);
      this.addUpdateFunc();
      this.invalid();
      return true;
    },
    removeCtrl: function (id_or_ctrl, dispose) {
      var index, ctrl, ctrls = this._controls;
      if (typeof id_or_ctrl == 'string')
        for (var i = 0, c = ctrls[0]; c; c = ctrls[++i]) {
          if (c.id === id_or_ctrl) {
            index = i;
            ctrl = c;
          }
        }
      else {
        index = ctrls.indexOf(id_or_ctrl);
        if (index >= 0) ctrl = id_or_ctrl;
      }
      if (ctrl) {
        this._controls.splice(index, 1);
        this._h -= ctrl._h;
        for (var i = 0, ctrls = ctrl.siblings, sibling = ctrls[0], y = ctrl.y, h = ctrl._h; sibling; sibling = ctrls[++i])
          if (sibling.y > y)sibling.y -= h;
        if (this._controls.length == 0)
          this._h = Math.round(this._headerHeight * controls.config.drop.headerFHRatio);
        if (dispose)
          ctrl.dispose(this.getTask());
        ctrl.parent = null;
        ctrl.y = ctrl._originalY;
        delete  ctrl._originalY;
      }
      return ctrl;
    },
    paint: function (ctx) {
      ctx.fillStyle = this._headerbc;
      ctx.fillRect(0, 0, this._w, this._offsetY);
      ctx.fillStyle = this._tc;
      ctx.font = this._font;
      ctx.textBaseline = "top";
      ctx.fillText(this._txt, 3, (this._offsetY - this._headerHeight) / 5, this._w - this._offsetY);
      var d = this._offsetY * .5;
      ctx.translate(this._w - d, d / 2);
      controls.path.pointTriangle(d, d, ctx, this._expanded);
      ctx.fill();
      ctx.translate(d - this._w, -d / 2);
      this.intersectClip(ctx, this._offsetX, this._offsetY, this._w - this._offsetX, (this._h - this._offsetY) * this.clock.value);
      ctx.fillStyle = this._bc;
      ctx.fillRect(this._offsetX, this._offsetY, this._w - this._offsetX, (this._h - this._offsetY) * this.clock.value);
    },
    paintChildren: function (ctx) {
      if (!this.expanded && this.clock.isStopped)return;
      for (var cs = this._controls, i = cs.length - 1, c = cs[i]; c; c = cs[--i])
        if (c._h + c._y > 0) c.render(ctx);
    },
    clearCtrls: function () {
      var t = this.getTask();
      for (var i = 0, ctrls = this._controls, ctrl = ctrls[0]; ctrl; ctrl = ctrls[++i]) {
        ctrl.parent = null;
        ctrl.dispose(t);
      }
      this._controls = [];
      if (t)t.invalid();
      this._maxh = this._h = this._offsetY;//= Math.round(this._headerHeight * controls.config.drop.headerFHRatio);
      this._baseLine = 0;
      return this;
    },
    _getCollections: function () {
      var _collisions = [], rect = new controls.path.Rect(this.x, this.y, this.w, this._h), cRect, zs = this._sameZSiblings(),
        i, ctrl;
      for (i = 0, ctrl = zs[0]; ctrl; ctrl = zs[++i]) {
        cRect = controls.path.Rect.fromCtrl(ctrl);
        if (rect.overlap(cRect)) {
          ctrl._originalY = ctrl.y;
          ctrl['_expandY' + this._expandTimestamp] = rect.bottom - ctrl.y;
          cRect._y = rect.bottom;
          rect.union(cRect);
          _collisions.ascInsert(ctrl, 'y');
        }
      }
      return this._collisions = _collisions;
    },
    _sameZSiblings: function () {
      for (var i = 0, ctrls = this.siblings, ctrl = ctrls[0], z = this.z, zs = []; ctrl; ctrl = ctrls[++i])
        if (ctrl.z == z && ctrl.enable && ctrl.visibility)zs.ascInsert(ctrl, 'y');
      return zs;
    },
    expand: (function () {
      function whenExpand() {
        this._getCollections();
        this.clock.start();
        eventHandlers.config.enable = false;
      }

      return function () {
        this.addUpdateFunc(whenExpand)
      }
    })(),
    shrink: (function () {
      function whenShrink() {
        for (var i = 0, ctrls = this._collisions || this._getCollections(), item = ctrls[0]; item; item = ctrls[++i])
          item._originalY = item.y - item['_expandY' + this._expandTimestamp];
        this.clock.reverse();
        eventHandlers.config.enable = false;
      }

      return function () {
        this.addUpdateFunc(whenShrink)
      }
    })()
  },
  cubitPanel: {
    switchPanel: function (num) {
      if (!this._isAnimating) {
        var to = this._controls[num];
        if (!to || to === this.currentView) return this.currentView;
        var interval = to._oof - this.currentView._oof;
        if (interval < 0)interval += Math.PI * 2;
        this._rotateClock.multiplier = interval;
        this._rotateClock.reset();
        this._scaleClock.start();
        this._isAnimating = true;
        this.currentView = to;
        this.clicker._parent = this.wheeler._parent = this._spotter._parent = to;
        var ctx = this.getTask()._global.ctx;
        if (ctx)
          this._controls.forEach(function (c) {
            c.createImgCache(ctx);
          });
        return to;
      }
      return this.panel;
    },
    transformArgs: function (scale, axis, rotate) {
      var a = Math.sin(rotate);
      var b = Math.cos(rotate);
      var px = scale * Math.cos(axis);
      var py = scale * Math.sin(axis);
      return{px: px, py: py, a: a, b: b};
    },
    panelArg: function (px, py, a, b, c) {
      return{x1: b + a * px, y1: a * py, dx: ((1 - px) * a + (px + 1) * (1 - b)) * c, dy: py * (1 - b - a) * c};
    },
    render: function (ctx) {
      ctx.save();
      this.transform(ctx);
      if (this._isAnimating) {
        for (var i = 0; i < 4; i++)
          this._controls[this._paintOrders[i]].render(ctx);
      }
      else {
        this.currentView.paint(ctx);
        this.currentView.paintChildren(ctx);
      }
      ctx.restore();
    },
    transform: function (ctx) {
      ctx.translate(this.x, this.y);
      if (this._isAnimating) {
        var st = this._scaleClock.t * this._scaleRatio, scale = 1 - st;
        ctx.transform(scale, 0, 0, scale, this.w / 2 * st, this.h / 2 * st);
      }
    },
    _setPanel: function (panel) {
      if (this._controls.indexOf(panel) < 0)return;
      this.currentView = panel;
      for (var i = 0; i < 4; i++)
        this._controls[i].visibility = 0;
      this.currentView.visibility = 1;
    },
    getPanel: function (num) {
      return this._controls[num] || this.currentView;
    },
    replacePanel: function (panel, index) {
      index = parseInt(index);
      if (index < 0 || index > 3 || !(panel instanceof controls.Panel))return false;
      panel.x = panel.y = 0;
      panel.w = this.w;
      panel.h = this.h;
      if (this._controls.indexOf(this.currentView) == index)
        this.currentView = panel;
      panel.parent = this;
      panel.backColor = this.backColor;
      panel.transform = controls.config.cubicPanel.childTransform;
      panel.offset = panel._oof = Math.PI / 2 * index;
      this._controls[index] = panel;
      var ta = this.transformArgs(0, 0, 0), c = this.w / 2;
      switch (index) {
        case 0:
          panel._arg = this.panelArg(ta.px, ta.py, ta.a, ta.b, c);
          break;
        case 1:
          panel._arg = this.panelArg(ta.px, ta.py, ta.b, -ta.a, c);
          break;
        case 2:
          panel._arg = this.panelArg(ta.px, ta.py, -ta.a, -ta.b, c);
          break;
        case 3:
          panel._arg = this.panelArg(ta.px, ta.py, -ta.b, ta.a, c);
          break;
      }
      return true;
    }
  }
};
(function () {
  var cs = controls, gpros = cs.properties, protos = cs.prototypes;
  protos.allOwnPros(function (v, n) {
    v._type = 'controls.' + n;
  });
  function splitProStr(str) {
    function mapPros(name) {
      name = name.replace(/\s*/g, '');
      return gpros[name] || {publicName: name };
    }

    return str.split(',').map(mapPros);
  }

  cs.UpdateObject.inherit(protos.updateObject, splitProStr('binding, task, clock, enable, data, id'), Object);
  cs.UpdateObject.prototype.addProperty({publicName: 'shouldUpdate', get: function () {
    return this._updateFunc.length > 0;
  }, set: false});
  cs.UIComponent.inherit(protos.ui, splitProStr('x, absX, y, absY, w, h, parent,visibility, clicker, wheeler, spotter, drager, z, animation,' +
    'class, siblings, onclick, ondragstart, ondragend, ondragmove, onmousein, onmouseout,onwheeldown, onwheelup, location'), cs.UpdateObject);
  var uiproto = cs.UIComponent;
  cs.Rectangle.inherit(protos.rectangle, splitProStr('backColor,borderColor,radius'), uiproto);
  cs.Icon.inherit(protos.icon, splitProStr('backColor,textColor,borderColor,scaleX,scaleY'), uiproto);
  cs.Image.inherit(protos.img, splitProStr('src'), uiproto);
  cs.Label.inherit(protos.label, splitProStr('text,backColor,textColor,font'), uiproto);
  cs.Range.inherit(protos.range, splitProStr('backColor,borderColor,value,textColor,onchange'), uiproto);
  cs.Button.inherit(protos.button, splitProStr('text,textColor,backColor,borderColor,font,radius'), uiproto);
  cs.Article.inherit(protos.article, splitProStr('textColor,backColor,text,font,lineSpace,titleText,textColor,titleFont'), uiproto);
  cs.Switch.inherit(protos.switch, splitProStr('textColor,backColor,borderColor,onchange,rightText,leftText,validText,radius'), uiproto);
  cs.TextInput.inherit(protos.textInput, splitProStr('onchange,font,textColor,text,validText,regExp,backColor,waterMarkColor,waterMarkText,mask'), uiproto);
  cs.Select.inherit(protos.select, splitProStr('selectH,onchange,expanded,selectedIndex,selectedItem,waterMarkText,items'), uiproto);
  cs.ArticleInput.inherit(protos.articleInput, [], cs.Article);
  cs.Panel.inherit(protos.panel, splitProStr('backColor,children'), uiproto);
  var panelproto = cs.Panel;
  cs.Drop.inherit(protos.drop, splitProStr('textColor,font,backColor,text,headerBackColor,expanded'), panelproto);
  Object.defineProperty(cs.Drop.prototype, 'h', {
    get: function () {
      return this._expanded ? this._h : this._offsetY;
    },
    set: function (val) {
      val = parseInt(val);
      var oh = this._offsetY;
      if (isNaN(val) || val <= this._offsetY)return;
      this._h = this._offsetY = val;
      if (this.notify('h', oh, this, '_offsetY'))this.invalid();
    }
  });
  cs.Expand.inherit(protos.expand, splitProStr('expanded,backColor,borderColor'), panelproto);
  cs.CubicPanel.inherit(protos.cubitPanel, [], panelproto);
  delete controls.prototypes;
}());HTMLElement.prototype.getChildrenByTagName = function (tagName) {
  if (!tagName)return [];
  tagName = tagName.toUpperCase();
  for (var i = 0, r = [], node = this.children[0]; node; node = this.children[++i])
    if (node.tagName == tagName)r.push(node);
  return r;
};
HTMLElement.prototype.getChildByTagName = function (tagName) {
  if (!tagName)return  undefined;
  tagName = tagName.toUpperCase();
  for (var i = 0, node = this.children[0]; node; node = this.children[++i])
    if (node.tagName == tagName) return node;
  return undefined;
};
core.inspectAttribute = function (str, model) {
  if (typeof str != "string")return undefined;
  if (str == '') return model || undefined;
  var keys = str.split('.'), isWin, rex = /\[\d+\]/g, obj;
  if (keys.length == 0) return undefined;
  obj = model || window;
  isWin = (obj == window);
  for (var i = 0, acs, key = keys[0]; key; key = keys[++i]) {
    acs = key.match(rex);
    key = key.replace(rex, '');
    if (obj[key]) {
      obj = obj[key];
      if (acs)
        acs.forEach(function (ac) {
          ac = parseInt(ac.substring(1, ac.length - 1));
          obj = obj[ac];
        });
    }
    else if (isWin)
      return undefined;
    else return core.inspectAttribute(str, window);
  }
  return obj;
};
core.parsers = (function () {

  var ajaxLoad = (function () {
    function collectTemplates(c) {
      if (c.hasAttribute('data-bcf')) getTemplates(c);
    }

    function collectScripts(c) {
      if (c.hasAttribute('data-bcf')) {
        var s = document.createElement('script');
        s.innerHTML = c.innerHTML;
        document.body.appendChild(s);
      }
    }

    return function ajaxLoad(element) {
      var name = element.getAttribute('name'), canvasId = element.getAttribute('canvas') || 'canvas',
        onload = core.inspectAttribute(get1bds(element.getAttribute('onload')), window), xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        switch (this.readyState) {
          case 1:
            return this.responseType = 'document';
          case this.DONE:
            if (this.status == 200) {
              var xml = this.responseXML, scripts = xml.body.getElementsByTagName('script');
              Array.prototype.forEach.apply(xml.body.getElementsByTagName('canvas'), [collectTemplates]);
              if (scripts.length)Array.prototype.forEach.apply(scripts, [collectScripts]);
              else console.warn('no script element for binding in asyn task:' + name);
              for (var i = 0, tes = xml.getElementsByTagName('task'), te = tes[0]; te; te = tes[++i])
                if (te.getAttribute('name') == name) {
                  var t = core.parsers.fromTagName(te), global = core.inspectAttribute(canvasId, window)._global;
                  onload(t, global);
                  t.name = name;
                  global.addTask(t);
                  global.init();
                }
            }
            else {
              console.log(this)
            }
            break;

        }
      };
      xhr.open('get', element.getAttribute('src'));
      xhr.send();
    }
  })();


  function OneWayBinding(modelBindStr) {
    this.bindings = {};
    this.modelBindStr = modelBindStr;
  }

  OneWayBinding.fromElement = function (element) {
    if (element.tagName) {
      var b, attrs = element.attributes, aValue = element.getAttribute('model');
      b = new OneWayBinding(get1bds(aValue));
      for (var i = 0, t = b.bindings, attr = attrs[0]; attr; attr = attrs[++i]) {
        aValue = get1bds(attr.value);
        if (aValue)
          t[attr.name] = aValue;
      }
      delete t.model;
    }
    return b;
  };
  OneWayBinding.REGEXP = /^|(.+)|&/;
  var get1bds = OneWayBinding.getBindStr = function (str) {
    if (!str || !(str[0] == str[str.length - 1] && str[0] == '|')) return undefined;
    return str.slice(1, -1);
  }.bind(OneWayBinding);
  OneWayBinding.prototype = {
    addTargetAttr: function (targetAttr, modelAttrName) {
      if (typeof targetAttr != "string" || typeof modelAttrName != "string")return false;
      this.bindings[targetAttr] = modelAttrName;
      return true;
    },
    applyCtrl: function (ctrl, model) {
      if (typeof  model != "object" || typeof ctrl != "object")return false;
      var taget = this.bindings, mv, cs = ctrl._controls, cb;
      if (this.modelBindStr) model = model[this.modelBindStr] || model;
      taget.allOwnPros(function (value, key) {
        mv = model[value];
        if (mv !== undefined)
          ctrl[key] = mv;
      });
      if (cs)
        cs.forEach(function (c) {
          cb = c.binding;
          if (cb)
            cb.applyCtrl(c, model);
        });
      return true;
    },
    get useful() {
      return(this.modelBindStr || Object.getOwnPropertyNames(this.bindings).length > 0);
    }
  };
  var _ = {
    _$notify: function (element, model, ctrl) {
      var proName = element.getAttribute('for');
      if (!proName)return undefined;
      var f = _._$func(element, model, 'o,s');
      if (typeof f.func == "function")ctrl.addNotification(proName, f.func);
      return f;
    },
    _$func: function (element, model, param) {
      var hs = element.getAttribute('handler'), bds = get1bds(hs), f;
      if (bds !== undefined)
        f = core.inspectAttribute(bds, model);
      else
        try {
          f = new Function(element.getAttribute('param') || param || '',
              hs || element.textContent)
        }
        catch (error) {
          console.log(error);
        }
      return {func: f, binding: bds};
    },
    _$attr: function (element, attrName, type, model) {
      var r = element.getAttribute(attrName), o, bdstr = get1bds(r);
      o = core.inspectAttribute(bdstr, model);
      if (o) return o;
      else if (bdstr && o == undefined)
        return console.log('bind {0} fail:{1}'.format(attrName, r), element);
      else if (r)
        switch (type) {
          case 'i':
            return parseInt(r);
          case 'f':
            return parseFloat(r);
          case 'b':
            return r == 'true' || r == true;
          case 'o':
            return core.inspectAttribute(r);
          default :
            return r;
        }
      return undefined;
    },
    _$attrs: function (element, type, model, shortCuts) {
      if (!shortCuts) return undefined;
      for (var i = 0, $a = _._$attr, v, name = shortCuts[0]; name; name = shortCuts[++i]) {
        v = $a(element, name, type, model);
        if (v !== undefined)
          return v;
      }
      return undefined;
    },
    _$model: function (element, model) {
      var r = element.getAttribute('model');
      if (!r)return model;
      return core.inspectAttribute(get1bds(r), model);
    },
    getAttrContainer: function (element, model, container, tagName) {
      container = container || {};
      var v, tag = core.parsers.tags[tagName.toUpperCase()],
        pros = core.parsers.tags.properties, pro;
      if (element.innerHTML.indexOf('$i') == -1){
        element=element.cloneNode(true);
        exporter.FOREACH.replaceAttrExp(element, null, -1, model);
      }
      tag.attr.forEach(function (proName) {
        pro = pros[proName];
        if (pro)
          v = _._$attrs(element, pro.type, model, pro.shortCuts);
        else
          v = _._$attrs(element, 's', model, [proName]);
        if (v !== undefined) container[proName] = v;
      });
      return container;
    },
    bindFuntions: function (element, model, ctrl, binding) {
      if (!(element.tagName)) return ctrl;
      if (element.tagName !== 'FUNCTION') {
        element = element.getChildByTagName('function');
        if (!element)return ctrl;
      }
      if (!element)return ctrl;
      var funcs = element.attributes, i, name, mName , attr, fun, child, children = element.children;
      for (i = 0, attr = funcs[0]; attr; attr = funcs[++i]) {
        name = attr.localName;
        mName = get1bds(attr.value);
        fun = core.inspectAttribute(mName, model);
        if (typeof fun == "function") {
          ctrl[name] = fun;
          binding.addTargetAttr(name, mName);
        }
      }
      funcs = core.parsers.tags.funcs;
      for (i = 0, child = children[0]; child; child = children[++i]) {
        if (child.tagName == 'NOTIFY')
          _._$notify(child, model, ctrl);
        else {
          name = child.localName;
          fun = _._$func(child, model, funcs[name] || 'e,s');
          if (typeof fun.func == "function") {
            ctrl[name] = fun.func;
            if (fun.binding)
              binding.addTargetAttr(name, fun.binding);
          }
        }
      }
      return ctrl;
    },
    filterBinding: function (ctrl) {
      var b = ctrl.binding, nb = {};
      b.bindings.allOwnPros(function (modelName, cName) {
        if (core.inspectAttribute(modelName, window) !== ctrl[cName])
          nb[cName] = modelName;
      });
      b.bindings = nb;
      if (!b.useful)ctrl.binding = null;
    },
    bindAttrs: function (ctrl, attr) {
      var names = Object.getOwnPropertyNames(attr);
      if (names.indexOf('class') >= 0) {
        controls.addCtrlToClass(attr.class, ctrl);
        names.remove('class')
      }
      for (var i = 0, name = names[0]; name; name = names[++i])
        ctrl[name] = attr[name];
      _.filterBinding(ctrl);
      return ctrl;
    }
  }, templates = {};

  function fromTagName(element, model) {
    var paser = exporter[element.tagName.toUpperCase()], r;
    if (element.hasAttribute('debug'))debugger;
    r = paser ? paser.parse.apply(paser, [element, _._$model(element, model)].concat(Array.prototype.slice.call(arguments, 2))) : undefined;
    element.style.display = 'none';
    if (!paser)throw 'invalid element';
    return r;
  }

  function StdParser(onconstruct) {
    this.onconsutruct = onconstruct;
  }

  StdParser.prototype = {
    parse: function (element, model) {
      var attr = this.attributes(element, model),
        ctrl = this.onconsutruct(attr, element, model);
      return _.bindAttrs(this.functions(element, model, ctrl, OneWayBinding.fromElement(element)), attr);
    },
    attributes: function (element, model, container, tagName) {
      container = container || {};
      var tag = core.parsers.tags[tagName || element.tagName.toUpperCase()];
      if (tag.base) container = core.parsers[tag.base].attributes(element, model, container, tag.base);
      container = _.getAttrContainer(element, model, container, tagName || element.tagName);
      return container;
    },
    functions: function (element, model, ctrl, binding) {
      ctrl.binding = binding;
      return _.bindFuntions(element, model, ctrl, binding);
    },
    onconsutruct: function (attr, element, model) {
      return new controls.UIComponent(attr.x, attr.y, attr.w, attr.h);
    }
  };
  function ContainerParser(onconstruct, onchild) {
    if (onconstruct)
      this.onconsutruct = onconstruct;
    if (onchild)
      this.onchild = onchild;
  }

  ContainerParser.prototype = {
    parse: function (element, model) {
      var attr = this.attributes(element, model),
        ctrl = this.onconsutruct(attr, element, model);
      _.bindAttrs(this.functions(element, model, ctrl, OneWayBinding.fromElement(element)), attr);
      this.parseChildren(element, model, ctrl).forEach(function (c) {
        ctrl.addCtrl(c);
      });
      return ctrl;
    },
    onchild: function (child, childEle, parent, parentEle) {
      return child;
    },
    attributes: function (element, model, container, tagName) {
      container = container || {};
      var tag = core.parsers.tags[tagName || element.tagName.toUpperCase()];
      if (tag.base) container = core.parsers[tag.base].attributes(element, model, container, tag.base);
      container = _.getAttrContainer(element, model, container, tagName || element.tagName);
      return container;
    },
    functions: function (element, model, ctrl, binding) {
      ctrl.binding = binding;
      return _.bindFuntions(element, model, ctrl, binding);
    },
    onconsutruct: function (attr, element, model) {
      return new controls.Panel(attr.x, attr.y, attr.w, attr.h, attr.backColor);
    },
    parseChildren: function (element, model, parent) {
      var ctrlElement = element.getChildByTagName('controls'), r = [];
      if (ctrlElement) {
        model = _._$model(ctrlElement, model);
        for (var i = 0, ces = ctrlElement.children, ctrl, onchild = this.onchild, ce = ces[0]; ce; ce = ces[++i]) {
          ctrl = fromTagName(ce, model);
          if (ctrl.render || ctrl.forEach) r.add(ctrl);
          else throw 'this not a control or control Array';
        }
      }
      return r;
    }
  };
  function parseTemplate(name, model, parent) {
    var element = templates[name], ctrls = [];
    if (element) {
      if (parent && parent._controls) {
        for (var i = 0, ces = element.children, c = ces[0]; c; c = ces[++i])
          parent.addCtrl(fromTagName(c, model));
        return parent;
      }
      else
        for (var i = 0, ces = element.children, c = ces[0]; c; c = ces[++i])
          ctrls.add(fromTagName(c, model));
      return ctrls;
    }
    return null;
  }

  function getTemplates(element) {
    var e = element.getChildByTagName('templates');
    if (e) {
      for (var i = 0, name, ces = e.getChildrenByTagName('template'), d, c = ces[0]; c; c = ces[++i]) {
        name = c.getAttribute('name');
        if (!name) console.log('template no name', c);
        else {
          d = document.createElement('tem');
          d.innerHTML = c.innerHTML;
          Array.prototype.forEach.apply(c.attributes, [function (a) {
            d.setAttribute(a.name, a.value);
          }]);
          templates[name] = d;
        }
      }
    }
  }

  var exporter = {
    initApp: function (canvas, global) {
      global = global || new core.Global(canvas, canvas.getAttribute('data-resolution-width') || 1280,
          canvas.getAttribute('data-resolution-height') || 720);
      var tes = canvas.getChildrenByTagName('task'), i, e, onload = core.inspectAttribute(get1bds(canvas.getAttribute('onload')));
      getTemplates(canvas);
      for (i = 0, e = tes[0]; e; e = tes[++i])
        global.addTask(fromTagName(e, null));
      core.setCanvasFullScreen(canvas, global._width, global._height);
      global.init();
      if (typeof  onload == "function")onload(global);
      return global;
    },
    FOREACH: {
      parse: function (element, model) {
        var itor = element.getAttribute('itor') || '$i', source = _._$attr(element, 'in', 'o', model) || new Array(parseInt(element.getAttribute('in')) || 0),
          res = [], children = element.children,
          self = exporter.FOREACH, i = 0, len = children.length, ctrl, node;
        for (var j = 0, slen = source.length, m; j < slen; j++) {
          m = source[j] || (model ? model[j] : window);
          for (i = 0; i < len; i++) {
            node = self.replaceAttrExp(children[i].cloneNode(true), itor, j, m);
            ctrl = fromTagName(node, m);
            res.add(ctrl);
          }
        }
        return res;
      },
      replaceAttrExp: function (element, itor, index, model) {
        var attrs = element.attributes;
        for (var i = 0, attr = attrs[0]; attr; attr = attrs[++i])
          attr.value = this.replaceExp(attr.value, itor, index, model);
        Array.prototype.forEach.apply(element.children, [function (c) {
          if (c.tagName == 'FOREACH') return;
          this.replaceAttrExp(c, itor, index, model)
        }, this]);
        return element;
      },
      replaceItor: function (str, itor, index) {
        while (str.indexOf(itor) > -1)
          str = str.replace(itor, index);
        return str;
      },
      replaceExp: function (oriStr, itor, index, model) {
        var match, exp, rs, reg = /\{.+?\}/g, lastIndex = 0, sb = [], s;
        if (get1bds(oriStr))
          return this.replaceItor(oriStr, itor, index);
        while ((match = reg.exec(oriStr)) != null) {
          exp = match[0];
          sb.push(oriStr.substring(lastIndex, match.index) + this.evalExp(exp, itor, index, model));
          lastIndex = reg.lastIndex;
        }
        rs = sb.join('') + oriStr.substring(lastIndex, oriStr.length);
        return rs;
      },
      evalWithScope: function (model, str) {
        var $model = model || window;
        return eval(str);
      },
      evalExp: function (oriExp, itor, index, model) {
        var exp = this.replaceItor(oriExp, itor, index);
        try {
          var v = this.evalWithScope(model, exp);
        }
        finally {
        }
        return v + '';
      }
    },
    TASK: {
      parse: function (element, model) {
        if (element.hasAttribute('src')) return ajaxLoad(element);
        var t = new core.Task(element.getAttribute('name') || 'default'),
          ces = element.getChildByTagName('controls'), i, ce,
          onload = core.inspectAttribute(get1bds(element.getAttribute('onload')), model);
        model = model || _._$model(element);
        if (ces)
          for (i = 0, ces = ces.children, ce = ces[0]; ce; ce = ces[++i])
            t.addCtrl(fromTagName(ce, model));
        if (onload) onload(t);
        return t;
      }},
    T: {
      parse: function (element, model) {
        var attrs = element.attributes, temName = element.getAttribute('template'),
          tagName = element.getAttribute('type'), pEle, pCtrl, tEle, tattrs;
        if (!temName)throw 'please set attribute "template" with the name of template to use';
        tEle = templates[temName];
        if (!tEle) throw 'no template';
        tagName = (tagName || tEle.getAttribute('type') || 'PANEL').toUpperCase();
        if (['DROP', "EXPAND", "CUBIC"].indexOf(tagName) < 0)
          tagName = "PANEL";
        element.removeAttribute('type');
        pEle = document.createElement(tagName);
        if (tEle.hasAttribute('model') && !element.hasAttribute('model'))
          model = _._$model(tEle, model);
        tattrs = tEle.attributes;
        for (i = 0, attr = tattrs[0]; attr; attr = tattrs[++i])
          pEle.setAttribute(attr.name, attr.value);
        for (var i = 0, attr = attrs[0]; attr; attr = attrs[++i])
          pEle.setAttribute(attr.name, attr.value);
        pEle.innerHTML = element.innerHTML;
        pEle.removeAttribute('model');
        pCtrl = fromTagName(pEle, model);
        parseTemplate(temName, model).forEach(function (c) {
          pCtrl.addCtrl(c);
        });
        return pCtrl;
      }
    },
    DROP: new ContainerParser(function (attrs) {
      return new controls.Drop(attrs.x, attrs.y, attrs.w, attrs.h, attrs.text, attrs.font, attrs.textColor, attrs.backColor, attrs.headerBackColor);
    }),
    PANEL: new ContainerParser(function (l) {
      return new controls.Panel(l.x, l.y, l.w, l.h, l.backColor);
    }),
    ICON: new StdParser(function (a) {
      return new controls.Icon(a.x, a.y, a.w, a.h, null, a.scaleX, a.scaleY);
    }),
    LABEL: new StdParser(function (attr) {
      return new controls.Label(attr.x, attr.y, attr.w, attr.h, attr.text, attr.font, attr.textColor, attr.backColor);
    }),
    BUTTON: new StdParser(function (c) {
      return new controls.Button(c.x, c.y, c.w, c.h, c.text, c.font, null,
        c.textColor, c.backColor, c.borderColor);
    }),
    IMG: new StdParser(function (attr) {
      return new controls.Image(attr.x, attr.y, attr.w, attr.h, attr.src);
    }),
    IMAGE: new StdParser(function (attr) {
      return new controls.Image(attr.x, attr.y, attr.w, attr.h, attr.src);
    }),
    ARTICLE: new StdParser(function (c) {
      return new controls.Article(c.x, c.y, c.w, c.h, c.titleText, c.text, c.font, c.textColor, c.backColor,
        c.titleFont, c.titleColor, c.lineSpace, c.maxLine);
    }),
    CHOOSE: new StdParser(function (a) {
      return new controls.Select(a.x, a.y, a.w, a.h, a.items, a.font, a.backColor, a.textColor
        , a.waterMarkText, a.borderColor);
    }),
    ARTICLEINPUT: new StdParser(function (c) {
      return new controls.ArticleInput(c.x, c.y, c.w, c.h, c.font, c.text, c.textColor, c.backColor);
    }),
    TEXTINPUT: new StdParser(function (attrs) {
      return new controls.TextInput(attrs.x, attrs.y, attrs.w, attrs.h, attrs.font, attrs.textColor, attrs.backColor,
        attrs.waterMarkText, attrs.waterMarkColor, attrs.regExp, attrs.mask);
    }),
    SWITCH: new StdParser(function (c) {
      return new controls.Switch(c.x, c.y, c.w, c.h, c.leftText, c.rightText, c.font, c.textColor
        , c.backColor, c.borderColor, null, c.radius);
    }),
    RANGE: new StdParser(function (a) {
      return new controls.Range(a.x, a.y, a.w, a.h, a.min, a.max, a.step, a.value, a.backColor, a.borderColor, a.lineWidth, a.vertical);
    }),
    RECT: new StdParser(function (a) {
      return new controls.Rectangle(a.x, a.y, a.w, a.h, a.backColor, a.borderColor, a.radius);
    }),
    UI: {
      parse: function (element, model) {
        var attr = this.attributes(element, model), ctrl = new controls.UIComponent(attr.x, attr.y, attr.w, attr.h);
        return _.bindAttrs(this.functions(element, model, ctrl, OneWayBinding.fromElement(element)), attr);
      },
      functions: function (element, model, ctrl, binding) {
        ctrl.binding = binding;
        return _.bindFuntions(element, model, ctrl, binding);
      },
      attributes: function (element, model, container, tagName) {
        container = _.getAttrContainer(element, model, container, tagName || element.tagName);
        this.setLocation(container);
        this.setClass(container);
        return container;
      },
      setLocation: function (container) {
        var l = container.location;
        if (l && /^-?\d+,-?\d+,\d+,\d+$/.test(l)) {
          l = l.split(',');
          container.x = (typeof container.x == "number") ? container.x : parseInt(l[0]) || 0;
          container.y = (typeof container.y == "number") ? container.y : parseInt(l[1]) || 0;
          container.w = (typeof container.w == "number") ? container.w : parseInt(l[2]) || 0;
          container.h = (typeof container.h == "number") ? container.h : parseInt(l[3]) || 0;
        }
        delete  container.location;
        return container;
      },
      setClass: function (container) {
        var co = container.class;
        if (typeof co == "object") {
          for (var p in co)
            if (co.hasOwnProperty(p) && !container.hasOwnProperty(p)) container[p] = co[p];
          delete container._$objArray$_;
        }
        return container;
      }
    }
  };
  exporter.TEXTBOX = exporter.TEXTINPUT;
  exporter.fromTagName = fromTagName;
  exporter.templates = templates;
  exporter.parseTemplate = parseTemplate;
  exporter.OneWayBinding = OneWayBinding;

  return exporter;
})();
core.parsers.tags = {
  UI: {
    attr: ['enable', 'visibility', 'z', 'id', 'name', 'location', 'class', 'data',
      'x', 'w', 'y', 'h', 'clock']
  },
  ICON: {
    base: 'UI',
    attr: ['backColor', 'borderColor', 'textColor', 'scaleX', 'scaleY', 'text']
  },
  RECT: {
    base: "UI",
    attr: ['backColor', 'borderColor', 'radius']
  },
  IMG: {
    base: 'UI',
    attr: ['src', 'sx', 'sw', 'sy', 'sh']
  },
  IMAGE: {
    base: 'UI',
    attr: ['src', 'sx', 'sw', 'sy', 'sh']
  },
  LABEL: {
    base: 'UI',
    attr: ['backColor', 'font', 'text', 'textColor', 'align']
  },
  BUTTON: {
    base: 'UI',
    attr: ['backColor', 'font', 'text', 'textColor', 'borderColor', 'radius']
  },
  TEXTINPUT: {
    base: 'UI',
    attr: ['backColor', 'font', 'text', 'textColor', 'mask', 'waterMarkText', 'waterMarkColor', 'regExp'],
    func: ['onchange']
  },
  ARTICLE: {
    base: 'UI',
    attr: ['backColor', 'font', 'text', 'textColor', 'titleText', 'titleFont', 'titleColor',
      'lineSpace', 'maxLine']
  },
  PANEL: {
    base: 'UI',
    attr: ['backColor']
  },
  CUBIC: {
    base: 'PANEL',
    attr: ['scaleRatio', 'projectRatio', 'projectAngle']
  },
  SWITCH: {
    base: 'UI',
    attr: ['backColor', 'font', 'leftText', 'rightText', 'textColor', 'borderColor', 'radius']
  },
  EXPAND: {
    base: 'PANEL',
    attr: ['lineWidth', 'maxWidth', 'maxHeight']
  },
  RANGE: {
    base: 'UI',
    attr: ['backColor', 'max', 'min', 'step', 'value', 'vertical', 'borderColor', 'lineWidth', 'textColor'],
    func: ['onchange']
  },
  CHOOSE: {
    base: 'UI',
    attr: ['items', 'backColor', 'waterMarkText', 'borderColor', 'font', 'textColor']
  },
  DROP: {
    base: 'PANEL',
    attr: ['text', 'font', 'backColor', 'textColor', 'headerBackColor', 'expanded']
  },
  ARTICLEINPUT: {
    base: 'UI',
    attr: ['backColor', 'font', 'text', 'textColor']
  },
  properties: {
    backColor: {shortCuts: ['bc']},
    borderColor: {shortCuts: ['bdc']},
    class: {type: 'o'},
    enable: {type: 'b'},
    expanded: {type: 'b'},
    h: {type: 'i'},
    lineWidth: {type: 'i'},
    items: {type: 'o'},
    lineSpace: {type: 'f', shortCuts: ['ls']},
    leftText: {shortCuts: ['ltxt', 'left']},
    rightText: {shortCuts: ['rtxt', 'right']},
    min: {type: 'f'},
    max: {type: 'f'},
    step: {type: 'f'},
    sx: {type: 'i'},
    sw: {type: 'i'},
    sy: {type: 'i'},
    sh: {type: 'i'},
    selectedIndex: {type: 'i'},
    src: {shortCuts: ['s', 'url', 'address']},
    regExp: {type: 'o', shortCuts: ['reg']},
    textColor: {shortCuts: ['tc']},
    titleText: {shortCuts: ['title']},
    titleFont: {shortCuts: ['ttf']},
    visibility: {type: 'f'},
    vertical: {type: 'b'},
    x: {type: 'i'},
    y: {type: 'i'},
    w: {type: 'i'},
    waterMarkText: {shortCuts: ['wmt']},
    z: {type: 'i'},
    radius: {type: 'i'}
  },
  funcs: {
    transform: 'ctx',
    paint: 'ctx',
    render: 'ctx'
  }
};

(function () {
  var tags = core.parsers.tags, pros = tags.properties, names = Object.getOwnPropertyNames(pros);
  for (var i = 0, name = names[0], pro, sc; name; name = names[++i]) {
    pro = pros[name];
    sc = (pro.shortCuts || []);
    pro.shortCuts = sc;
    sc.add(name);
    sc.add(name.toLowerCase());
  }
  document.addEventListener("DOMContentLoaded", function () {
    document.removeEventListener("DOMContentLoaded", arguments.callee, false);
    var cvses = document.body.getElementsByTagName('canvas');
    for (var i = 0, cvs = cvses[0]; cvs; cvs = cvses[++i])
      if (cvs.hasAttribute('data-bcf'))
        core.parsers.initApp(cvs);
    return null;
  }, false);
  tags.TEXTBOX = tags.TEXTINPUT;
})();
