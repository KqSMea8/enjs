/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * 文档：http://tapd.oa.com/TencentWPW/markdown_wikis/#1020381432007615753
 * 
 * Created by steephenliu on 2018/08/14.
 */

if (false) {}

var Detect = __webpack_require__(1);
var ajax = __webpack_require__(4);

var appIdMatcher = /\bappId=(\d+)/;
var detector = new Detect();
var domain = /https/i.test(location.protocol) ? 'https://ssl.captcha.qq.com' : 'http://captcha.qq.com';
var maxLoop = 5;
var duration = 3000;

var Kepler = {
    eye: '',
    init: function init() {
        var scripts = document.getElementsByTagName('script');
        for (var i = 0; i < scripts.length; i++) {
            var element = scripts[i];
            var idGroup = appIdMatcher.exec(element.src);
            if (idGroup) {
                this.appId = idGroup[1];
                break;
            }
        }
        this.appId = this.appId || '1234';
    },
    refresh: function refresh() {
        detector.reload();
    },
    ticket: function ticket(callback) {
        detector.fillLast();

        if (false) { var i, pad; }

        this.lastUpdate = new Date();
        if (callback || maxLoop >= 0) {
            var xhr = new ajax(domain + '/getwt?aid=' + this.appId, this.eye, function () {
                callback && callback(Kepler._ticket_);
            });
            xhr.saver = this;
            xhr.post();
        }

        if (maxLoop < 0) duration = 5000;
        this.refresh();
    }
};

window['TencentKepler'] = window['TencentKepler'] || Kepler;
detector.work(Kepler);

var requestAnimationFrame = function () {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 10);
    };
}();

// 以下部分为循环发送事件
function loop() {
    var current = new Date();
    detector.saver.lastUpdate = detector.saver.lastUpdate || current;

    if (current - detector.saver.lastUpdate > duration) {
        maxLoop--;
        detector.saver.ticket();
    }
    requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

/**
 *  采集行为的逻辑
 * Created by steephenliu on 2018/08/14.
 */
var Struct = __webpack_require__(2);
var util = __webpack_require__(3);

var jsDetail = '';
var jsError = toByteArr([], 32); // 32位，执行错误
var debugTime = 3000;

function Detect() {
    this.MAX_DOM_LENGTH = 63;
    this.startTime = new Date();
    this.requestId = 1;

    this.__cache = {};
    this.eventFlow = [];
    this.domInfo = [''];
    this.domMap = { index: 0 };
    this.init();
    this.bindEvent();
}

Detect.prototype = {
    /**
     * 初始化
     */
    init: function init() {
        try {
            this.stuct = new Struct();
        } catch (e) {
            util.log(e);
            jsDetail += util.perfectStack(e);
        }
    },


    /**
     * 刷新数据
     */
    reload: function reload() {
        try {
            jsDetail = '';
            this.eventFlow = [];
            this.domInfo = [''];
            this.domMap = { index: 0 };
            this.requestId = this.requestId + 1 & 0xff;
            this.init();
            this.work(this.saver);
        } catch (e) {
            util.log(e);
            jsDetail += util.perfectStack(e);
        }
    },


    /**
     * 运行`detectArr`数组中的所有检查器，并判断执行时间是否超过`debugTime`
     * 
     * @param {number} errorIndex 当前`detectArr`数组在`jsError`的偏移
     */
    runner: function runner(errorIndex) {
        var inTime = Date.now();

        for (var index = 0; index < this.detectArr.length; index++) {
            var detector = this.detectArr[index];

            try {
                if ("none" !== 'development' && Date.now() - inTime > debugTime) {
                    detector(); // 错误语句
                } else {
                    detector.call(this);
                }
            } catch (e) {
                util.log(e);
                jsError[errorIndex + index] = 1;
                jsDetail += util.perfectStack(e);
            }
        }

        this.detectArr = null;
    },


    /**
     * 执行初始采集
     * 
     * @param {Shield} saver 保存数据的对象
     */
    work: function work(saver) {
        this.saver = saver; // Shield
        this.saver.init();
        console.time('base');
        this.detectArr = [getUrl, getRefer, getCreateTime, getRequestTime, getRequestId, getUserAgent, getOs, getLanguage, getTimeZone, getFeature, getPtcz, getPluginNumber, simulatorDetect, nodeDetect, getWinSize];

        this.runner(0);
        console.timeEnd('base');
    },


    /**
     * 填充剩余的部分
     */
    fillLast: function fillLast() {
        this.detectArr = [getDomInfo, getEventFlow];

        this.runner(15);
        this.stuct.fixed();

        var errorOffset = Math.floor(this.stuct.segmentOffset / 8) - this.stuct.HEAD_LENGTH;

        jsErrDetect.call(this);
        jsErrDetail.call(this);
        this.stuct.setSeg(util.toByteArray(errorOffset, 32, 0), 6);

        this.stuct.save();
    },


    /**
     * 监听事件
     * @param {HTMLElement} element 监听的dom
     * @param {string} eventName 事件名
     * @param {function} listener 回调
     */
    addEvent: function addEvent(element, eventName, listener) {
        if (element.addEventListener) {
            element.addEventListener(eventName, listener, true);
        } else if (element.attachEvent) {
            element.attachEvent('on' + eventName, listener);
        } else {
            var oldEvent = element['on' + eventName];
            element['on' + eventName] = function (event) {
                try {
                    listener(event);
                } catch (ignore) {}
                if (oldEvent) {
                    oldEvent(event);
                }
            };
        }
    },
    domInfoIndex: function domInfoIndex(dom) {
        if (!dom) return 0;

        // 计算dom的层高和层深
        var depth = 0,
            width = 0;
        var parent = dom;
        while (parent && parent !== document) {
            parent = parent.parentNode;
            depth++;
        }

        for (var j = 0; j < dom.parentNode.children.length; j++) {
            var child = dom.parentNode.children[j];
            if (child === dom) {
                width = j + 1;
                break;
            }
        }

        // 生成一个domId
        var id = dom.id || 'null';
        var className = dom.className || 'null';

        var domKey = depth + ',' + width + ',' + id + ',' + className;
        var index = this.domMap[domKey] || ++this.domMap.index;
        // dom数量限制
        if (index > this.MAX_DOM_LENGTH) {
            this.domMap.index--;
            return 0;
        }

        this.domInfo[index] = domKey;
        this.domMap[domKey] = index;

        return index;
    },


    /**
     * 获取事件的坐标
     * @param {Event} e 事件
     */
    eventPosition: function eventPosition(e) {
        var isTouch = /^touch/.test(e.type);

        if (isTouch) {
            var touches = e.touches;

            if (touches && touches.length) {
                return [e.touches[0].pageX, e.touches[0].pageY];
            }
        } else {
            return [e.clientX, e.clientY];
        }

        return [0, 0];
    },
    eventProcessor: function eventProcessor(eventType, needDom, e) {
        e = e || window.event;
        if (!e) return;

        var record = [
        // 事件类型
        eventType,
        // dom映射
        needDom ? this.domInfoIndex(e.target) : 0,
        // 是否为脚本触发的
        'hasOwnProperty' in e ? e.hasOwnProperty('isTrusted') ? e.isTrusted === false ? 2 : 3 : 0 : 0,
        // 触发时间
        new Date().getTime()];

        if (eventType < 16) {
            var pos = this.eventPosition(e);
            record[4] = pos[0];
            record[5] = pos[1];
        }

        this.eventFlow[this.eventFlow.length] = record;
        // console.log(this.domMap[record[1]], record);
    },


    /**
     * 绑定几个关键的事件
     */
    bindEvent: function bindEvent() {
        var _this = this;

        try {
            var _ret = function () {
                if (!document) {
                    return {
                        v: setTimeout(function () {
                            throw new Error('脚本需要引入在body里面');
                        }, 0)
                    };
                }

                /**
                 * mousedown(0,带坐标)
                 * mouseup(1,带坐标)
                 * mousemove(2,带坐标)
                 * mousewheel(3,带坐标)
                 * click(4,带坐标)
                 * touchstart(5,带坐标)
                 * touchend(6,带坐标)
                 * touchmove(7,带坐标)
                 * focus(16,不带坐标)
                 * input(17,不带坐标)
                 * keydown(18,不带坐标)
                 * keyup(19,不带坐标)
                 */
                var events = ['mousedown', 'mouseup', 'mousemove', 'mousewheel', 'click', 'touchstart', 'touchend', 'touchmove'];
                // 稀疏数组
                events[16] = 'focus';
                events[17] = 'input';
                events[18] = 'keydown';
                events[19] = 'keyup';

                var self = _this;

                var _loop = function _loop(index) {
                    // 稀疏数组
                    if (!events[index]) return 'continue';

                    var event = events[index];
                    var needDom = !/move$/.test(event);
                    _this.addEvent(document, event, function (e) {
                        self.eventProcessor(index, needDom, e);
                    });
                };

                for (var index = 0; index < events.length; index++) {
                    var _ret2 = _loop(index);

                    if (_ret2 === 'continue') continue;
                }
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
        } catch (e) {
            util.log(e);
        }
    }
};

function safeHref() {
    try {
        return document.location.href;
    } catch (e) {
        try {
            return document.URL;
        } catch (e) {}
    }

    return '';
}

function getUrl() {
    var uriWithHash = util.uriWithHash(safeHref());
    getData.call(this, uriWithHash);
}

function getRefer() {
    var uriWithHash = util.uriWithHash(document.referrer);
    getData.call(this, uriWithHash);
}

function getCreateTime() {
    getData.call(this, this.startTime.getTime(), 64);
}

function getRequestTime() {
    getData.call(this, new Date().getTime(), 64);
}

function getRequestId() {
    getData.call(this, this.requestId, 8);
}

function getUserAgent() {
    getData.call(this, navigator.userAgent);
}

function getOsString() {
    var ua = navigator.userAgent;

    var isWin = navigator.platform == "Win32" || navigator.platform == "Windows";
    var isMac = navigator.platform == "Mac68K" || navigator.platform == "MacPPC" || navigator.platform == "Macintosh" || navigator.platform == "MacIntel";
    if (isMac) return "Mac";
    var isUnix = navigator.platform == "X11" && !isWin && !isMac;
    if (isUnix) return "Unix";
    var isLinux = String(navigator.platform).indexOf("Linux") > -1;

    var bIsAndroid = ua.toLowerCase().match(/android/i) == "android";
    if (isLinux) {
        if (bIsAndroid) return "Android";else return "Linux";
    }

    if (ua.toLowerCase().indexOf("like mac os x") > -1) return "iOS";

    if (isWin) {
        var isWin2K = ua.indexOf("Windows NT 5.0") > -1 || ua.indexOf("Windows 2000") > -1;
        if (isWin2K) return "Win2000";
        var isWinXP = ua.indexOf("Windows NT 5.1") > -1 || ua.indexOf("Windows XP") > -1;
        if (isWinXP) return "WinXP";
        var isWin2003 = ua.indexOf("Windows NT 5.2") > -1 || ua.indexOf("Windows 2003") > -1;
        if (isWin2003) return "Win2003";
        var isWinVista = ua.indexOf("Windows NT 6.0") > -1 || ua.indexOf("Windows Vista") > -1;
        if (isWinVista) return "WinVista";
        var isWin7 = ua.indexOf("Windows NT 6.1") > -1 || ua.indexOf("Windows 7") > -1;
        if (isWin7) return "Win7";
    }
    return "other";
}

function getOs() {
    getData.call(this, getOsString(), 4);
}

function getLanguage() {
    var lang = navigator.language || navigator.userLanguage || '';
    getData.call(this, lang, 4);
}

function getTimeZone() {
    var offset = 720 + Number(this.startTime.getTimezoneOffset()); // 东八区为 +8

    getData.call(this, offset, 11);
}

function getFeature() {
    var result = void 0,
        intResult = void 0;

    try {
        result = [getSupportJava(), // 获取JAVA支持情况
        getSupportCookie.call(this), // 获取cookie支持情况
        getSupportLocalStorage.call(this), // 获取localstorage支持情况
        getSupportTouch(), // 获取touch支持情况
        getSupportZH(), // 是否支持中文
        getSupportFlash.call(this), // 获取Flash支持情况
        getSupportPdf.call(this), // 获取pdf支持情况
        getSupportUserMedia(), // 获取用户媒体信息
        getSupportStandAlone(), // 是否webview
        getSupportMaxTouchPoints(), // 是否支持多点触控
        getSupportBattery(), // 是否支持获取电量
        getSupportPostMessage(), // 是否支持postmessage
        getSupportAddEventListener(), // 是否支持AddeventListener
        getSupportUint8array(), // 是否支持unit8
        getSupportWeakmap(), // 是否支持weakmap
        getSupportMaxheight(), // 是否支持maxheight
        getSupportGoogle(), // 是否支持 google
        getSupportApple(), // 是否支持苹果
        getSupportUC(), // 是否支持UC
        getSupportISO() // 是否支持ISO
        ];
        intResult = parseInt(result.reverse().join(''), 2);
    } catch (e) {
        util.log(e);
        intResult = 0;
        jsDetail += util.perfectStack(e);
    }

    getData.call(this, intResult, 32);
}

function getPtcz() {
    getData.call(this, util.getCookie('ptcz'), 7);
}

function getPluginNumber() {
    getData.call(this, navigator.plugins.length, 6);
}

function getSupportTouch() {
    var touch_capable = 'ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch || navigator.maxTouchPoints > 0 || window.navigator.msMaxTouchPoints > 0;

    return touch_capable ? 1 : 0;
}

function getSupportZH() {
    var supportZH = navigator.language || navigator.systemLanguage;

    return (/zh-CN/i.test(supportZH) ? 1 : 0
    );
}

function getSupportUserMedia() {
    return 'webkitGetUserMedia' in navigator ? 1 : 0;
}

function getSupportStandAlone() {
    return 'standalone' in navigator ? 1 : 0;
}

function getSupportMaxTouchPoints() {
    return navigator.maxTouchPoints > 0 ? 1 : 0;
}

function getSupportBattery() {
    return 'getBattery' in navigator ? 1 : 0;
}

function getSupportPostMessage() {
    return "postMessage" in window ? 1 : 0;
}

function getSupportAddEventListener() {
    return window.addEventListener ? 1 : 0;
}

function getSupportUint8array() {
    return window.Uint8Array ? 1 : 0;
}

function getSupportWeakmap() {
    return window.WeakMap ? 1 : 0;
}

function getSupportMaxheight() {
    var head = document.getElementsByTagName("head")[0];

    return "maxHeight" in head.style ? 1 : 0;
}

function getSupportGoogle() {
    return "Google Inc." === navigator.vendor ? 1 : 0;
}

function getSupportApple() {
    return "Apple Computer, Inc." === navigator.vendor ? 1 : 0;
}

function getSupportUC() {
    return "UCWEB" === navigator.vendor ? 1 : 0;
}

function getSupportISO() {
    return "iso-8859-1" === document.defaultCharset ? 1 : 0;
}

function getSupportJava() {
    return navigator.javaEnabled() ? 1 : 0;
}

function getSupportFlash() {
    var hasFlash = 0;

    if (this.__cache['flash']) {
        hasFlash = this.__cache.flash;
    } else {
        try {
            hasFlash = new window.ActiveXObject('ShockwaveFlash.ShockwaveFlash') ? 1 : 0;
        } catch (e) {
            util.log(e);
            hasFlash = 'undefined' !== typeof navigator.mimeTypes['application/x-shockwave-flash'] ? 1 : 0;
        }
        this.__cache.flash = hasFlash;
    }
    return hasFlash;
}

function getSupportCookie() {
    var cookieEnabled = 0;

    if (this.__cache['cookie']) {
        cookieEnabled = this.__cache.cookie;
    } else {
        cookieEnabled = navigator.cookieEnabled ? 1 : 0;
        if (typeof navigator.cookieEnabled === "undefined" && !cookieEnabled) {
            document.cookie = "tcapshield__t";
            cookieEnabled = document.cookie.indexOf("tcapshield__t") !== -1 ? 1 : 0;
        }
        this.__cache.cookie = cookieEnabled;
    }
    return cookieEnabled;
}

function getSupportLocalStorage() {
    var supportLocalStorage = 0;

    if (this.__cache['localStorage']) {
        supportLocalStorage = this.__cache.localStorage;
    } else {
        if (window.localStorage) {
            try {
                localStorage.setItem('tcapshield__t', 't');
                if (localStorage.getItem('tcapshield__t')) {
                    supportLocalStorage = 1;
                }
            } catch (e) {
                util.log(e);
                supportLocalStorage = 0;
            }
        }
        this.__cache.localStorage = supportLocalStorage;
    }
    return supportLocalStorage;
}

function getSupportPdf() {
    var supportPdf = 0;
    var plugins = navigator.plugins;

    if (this.__cache['pdf']) {
        supportPdf = this.__cache.pdf;
    } else {
        for (var index in plugins) {
            if (plugins[index] && plugins[index].name && /PDF|Acrobat/i.test(plugins[index].name)) {
                supportPdf = 1;
            }
            this.__cache.pdf = supportPdf;
        }
    }
    return supportPdf;
}

function getData(data, bits) {
    console.info(data);

    if (typeof data === 'string') {
        var maxLength = Math.min((1 << (bits || 8)) - 1, data.length);
        this.stuct.addSeg(util.toByteArray(maxLength, bits || 8, this.stuct.segmentOffset), this.saver);

        for (var index = 0; index < maxLength; index++) {
            var ch = data.charCodeAt(index);

            var byteArr = util.toByteArray(ch, 7, this.stuct.segmentOffset);
            this.stuct.addSeg(byteArr, this.saver);
        }
    } else if (typeof data === 'number') {
        this.stuct.addSeg(util.toByteArray(data, bits, this.stuct.segmentOffset), this.saver);
    }
}

function simulatorDetect() {
    // 检测js的runtime
    var driver = '';
    try {
        // IE67 某些情况下访问getAttribute直接报错
        driver = document.documentElement.getAttribute && document.documentElement.getAttribute('webdriver');
    } catch (e) {
        util.log(e);
    }
    var testArr = [// 16-31 位 , 从高到低
    window.spawn, window.emit, window.Buffer, window.domAutomation, window.webdriver, document.__webdriver_script_fn, document.$cdc_asdjflasutopfhvcZLmcfl_, driver, window.fxdriver_id, window.__fxdriver_unwrapped, window.ClientUtils, window._phantom, window.callPhantom, window.phantom, eval('typeof require !== "undefined"') && typeof process !== "undefined"];
    for (var i = 0; i < testArr.length; i++) {
        testArr[i] = testArr[i] === false || null === testArr[i] || undefined === testArr[i] ? 0 : 1;
    }
    var data = parseInt(testArr.join(''), 2);
    getData.call(this, data, 32);
}

function nodeDetect() {
    getData.call(this, 0, 4);
}

function getWinSize() {
    getData.call(this, window.innerWidth || 0, 13);
    getData.call(this, window.innerHeight || 0, 13);
    getData.call(this, window.outerWidth || 0, 13);
    getData.call(this, window.outerHeight || 0, 13);

    var screen = window.screen || {};
    getData.call(this, screen.width || 0, 13);
    getData.call(this, screen.height || 0, 13);
    getData.call(this, screen.availWidth || 0, 13);
    getData.call(this, screen.availHeight || 0, 13);
}

function jsErrDetect() {
    var data = parseInt(jsError.concat().reverse().join(''), 2);
    getData.call(this, data, 32);
}

function jsErrDetail() {
    getData.call(this, jsDetail, 11);
}

function getDomInfo() {
    getData.call(this, this.domInfo.join('|'), 11);
}

function getEventFlow() {
    var start = Math.max(0, this.eventFlow.length - util.maxEventCount); // 限制最多`maxEventCount`个
    var length = Math.min(util.maxEventCount, this.eventFlow.length);
    getData.call(this, length, 9);

    for (var index = start; index < this.eventFlow.length; index++) {
        var event = this.eventFlow[index];

        getData.call(this, event[0], 6);
        getData.call(this, event[1], 6);
        getData.call(this, event[2], 2);
        if (index === start) {
            getData.call(this, 3, 2);
            getData.call(this, event[3], 64);
        } else {
            var duration = event[3] - this.eventFlow[0][3];
            if (duration > 255) {
                getData.call(this, 1, 2);
                getData.call(this, duration, 16);
            } else {
                getData.call(this, 0, 2);
                getData.call(this, duration, 8);
            }
        }

        if (event.length > 4) {
            getData.call(this, event[4], 13);
            getData.call(this, event[5], 13);
        }
    }
}

function toByteArr(arr, length) {
    for (var i = 0; i < length; i++) {
        arr[i] = arr[i] ? 1 : 0;
    }
    return arr;
}

module.exports = Detect;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Created by steephenliu on 18/10/08.
 * 密文结构体
 */
var util = __webpack_require__(3);

function Struct() {
    this.VERSION = 1; // 版本
    this.HEAD_LENGTH = 2; // 密文头长度

    this.messageBody = [this.VERSION, 0]; // 密文
    this.randomToken = Math.floor(Math.random() * 1000000000);
    this.randomByte = this.randomToken & 0xff;
    this.segmentOffset = 80; // 从80开始,10个字节
    this.init();
}

Struct.prototype = {
    /*
    * 初始化密文头
    * */
    init: function init() {
        this.messageBody[2] = this.randomToken & 0xff;
        this.messageBody[3] = this.randomToken >> 8 & 0xff;
        this.messageBody[4] = this.randomToken >> 16 & 0xff;
        this.messageBody[5] = this.randomToken >> 24 & 0xff;
        this.messageBody.length = 10;
        console.info(this.randomToken);
        console.info(this.randomByte);
    },


    /*
    * 增加密文段
    * */
    addSeg: function addSeg(body) {
        this.messageBody[this.messageBody.length - 1] = this.messageBody[this.messageBody.length - 1] ^ this.randomByte ^ body[0] ^ this.randomByte;
        for (var index = 1, end = body.length - 1; index < end; index++) {
            this.messageBody[this.messageBody.length] = body[index] ^ this.randomByte;
        }

        // this.messageBody[this.messageBody.length - 1] = this.messageBody[this.messageBody.length - 1] ^ body[0];
        // for (let index = 1, end = body.length - 1; index < end; index++) {
        //     this.messageBody[this.messageBody.length] = body[index];
        // }

        this.segmentOffset += body[body.length - 1];
    },


    /*
    * 设置密文段
    * */
    setSeg: function setSeg(body, offset) {
        for (var index = 1, end = body.length - 1; index < end; index++) {
            this.messageBody[offset + index - 1] = body[index] ^ this.randomByte;
        }

        // for (let index = 1, end = body.length - 1; index < end; index++) {
        //     this.messageBody[offset + index - 1] = body[index];
        // }
    },


    /*
    * 存储密文
    * */
    save: function save(saver) {
        this.checkSum();
        var result = util.base64Encode(util.toStr(this.messageBody));

        saver = saver || window['TencentKepler'] || {};
        saver.eye = result;
        if (false) {}
    },


    /*
    * 校验和算法
    * */
    checkSum: function checkSum() {
        var sum = 0;
        var len = this.messageBody.length;

        var pad = function pad(num) {
            num = num.toString(2);
            var i = num.length;
            while (i++ < 8) {
                num = '0' + num;
            }
            return num.split('').reverse().join('');
        };

        for (var i = this.HEAD_LENGTH; i < len; i++) {
            sum = sum + ~(this.messageBody[i] & 0xff) & 0xff ^ this.messageBody[i];
            if (false) {}
        }
        sum = sum & 0xff ^ 0xff;
        if (false) {}

        this.messageBody[1] = sum;
    },


    /**
     * 字节填充
     */
    fixed: function fixed() {
        var left = this.segmentOffset % 8;
        if (left !== 0) {
            this.segmentOffset += 8 - left;
        }
    }
};

module.exports = Struct;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/**
 * Created by steephenliu on 2018/08/14
 */

var b64Char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_*';
var xhrSupport = 'XMLHttpRequest' in window;
var corsSupport = xhrSupport && 'withCredentials' in window.XMLHttpRequest.prototype;

var util = {
    xhrSupport: xhrSupport,
    corsSupport: corsSupport,
    maxEventCount: corsSupport ? 250 : 511,
    /**
     * 获取number经过拆分的字节数组
     * 
     * @param {Number} number 需要转换的数字
     * @param {Number} length 数字占的长度
     * @param {Number} offset 当前队列已经占用的长度（为了计算剩余长度可以容纳的bit）
     * 
     * @returns {Array} 
     *              length-1: 长度
     */
    toByteArray: function toByteArray(number, length, offset) {
        var byteArr = [0];
        var left = offset % 8;

        var bitIndex = length;
        if (left > 0) {
            byteArr[0] = number << left & 0xff;

            var mod = 8 - left;
            for (var i = 0; i < mod; i++) {
                number = Math.floor(number / 2);
            }bitIndex -= mod;
        }

        if (bitIndex > 32) {
            byteArr[byteArr.length] = number & 255;
            byteArr[byteArr.length] = number >> 8 & 255;
            byteArr[byteArr.length] = number >> 16 & 255;
            byteArr[byteArr.length] = number >> 24 & 255;

            bitIndex = bitIndex - 32;
            for (var _i = 0; _i < 32; _i++) {
                number = Math.floor(number / 2);
            }
        }

        while (bitIndex > 0) {
            byteArr[byteArr.length] = number & 255;
            number >>= 8;
            bitIndex -= 8;
        }

        byteArr[byteArr.length] = length;
        return byteArr;
    },
    uriWithHash: function uriWithHash(url) {
        var path = url.replace(/(\?|#).*/g, '');
        var hash = (url.split('#')[1] || '').replace(/\?.*/g, '');

        return path + (hash ? '#' + hash : '');
    },


    /*
     * base64
     * */
    base64Encode: function base64Encode(input) {
        var BASE64_STR = b64Char;

        // http://www.webtoolkit.info/javascript-base64.html
        if (!input) {
            return '';
        }

        var output = '';
        var chr1 = void 0,
            chr2 = void 0,
            chr3 = void 0,
            enc1 = void 0,
            enc2 = void 0,
            enc3 = void 0,
            enc4 = void 0;
        var i = 0;

        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            // 第一个字符前6位
            enc1 = chr1 >> 2;
            // 第一个字符后两位加第二个字符前4位
            enc2 = (chr1 & 3) << 4 | chr2 >> 4;
            // 第二个字符后四位加第三个字符前两位
            enc3 = (chr2 & 15) << 2 | chr3 >> 6;
            // 第三个字符后六位
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + BASE64_STR.charAt(enc1) + BASE64_STR.charAt(enc2) + BASE64_STR.charAt(enc3) + BASE64_STR.charAt(enc4);
        }

        // 版本固定三位
        // 对1000取模

        return output;
    },


    /*
     * unicode arr to str
     * */
    toStr: function toStr(arr) {
        var result = '';

        for (var i = 0; i < arr.length; i++) {
            result += String.fromCharCode(arr[i]);
        }
        return result;
    },


    /*
     * str to unicode
     * */
    toCodeArr: function toCodeArr(str) {
        str = str + '';
        var ret = [];

        for (var i = 0; i < str.length; i++) {
            ret.push(str.charCodeAt(i));
        }
        return ret;
    },


    /*
    * cookie 算法
    * */
    setCookie: function setCookie(c_name, value, expiredays) {
        var exdate = new Date();

        exdate.setDate(exdate.getDate() + expiredays);
        document.cookie = c_name + "=" + value + (expiredays === null ? "" : ";expires=" + exdate.toGMTString());
    },

    /*
    * cookie 算法
    * */
    getCookie: function getCookie(c_name) {
        if (document.cookie.length > 0) {
            var c_start = document.cookie.indexOf(c_name + "=");

            if (c_start !== -1) {
                c_start = c_start + c_name.length + 1;
                var c_end = document.cookie.indexOf(";", c_start);

                if (c_end === -1) {
                    c_end = document.cookie.length;
                }
                return document.cookie.substring(c_start, c_end);
            }
        }
        return "";
    },
    /**
     * 栈信息美化
     */
    perfectStack: function perfectStack(error) {
        if (error.stack) {
            var stack = error.stack.replace(/\n/gi, "").split(/\bat\b/).slice(0, 9).join("\n").replace(/\?[^:]+/gi, "");
            var msg = error.toString();
            if (stack.indexOf(msg) < 0) {
                stack = msg + "@" + stack;
            }

            return stack + '\n\n';
        } else if (error.message) {
            var _msg = error.message;
            if (error.description) {
                _msg += ' | ' + error.description;
            }

            return _msg + '\n\n';
        }

        return '';
    },
    log: function log(text) {
        if (false) {}
    }
};

module.exports = util;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var util = __webpack_require__(3);
var MAX_RETRY = 3;

function ajax(url, saver, callback) {
    var self = this;
    this.url = url;
    this.saver = saver;
    this.callback = function (res) {
        self.saver._ticket_ = res.web_ticket || '';
        setTimeout(callback, 0);
        self.callback = null;
    };

    this.trying = 0;
};

ajax.prototype = {
    jsonp: function jsonp() {
        this.trying++;
        if (this.trying > MAX_RETRY) {
            return this.callback({});
        }

        var self = this;
        var ref = window.document.getElementsByTagName("script")[0];
        var script = window.document.createElement("script");
        var callback = this.callback;
        var cbStr = "_aq_" + Math.floor(1000000000 * Math.random());
        window[cbStr] = function (data) {
            try {
                delete window[cbStr];
            } catch (ignore) {}

            callback(data);
        };
        script.async = true;
        script.src = this.url + '&callback=' + cbStr + '&data=' + this.saver.eye;
        script.onload = function () {
            script && ref.parentNode && ref.parentNode.removeChild(script);
        };
        script.onerror = function () {
            self.jsonp();
        };
        ref.parentNode.insertBefore(script, ref);
    },
    xhrPost: function xhrPost() {
        this.trying++;
        if (this.trying > MAX_RETRY) {
            return this.callback({});
        }

        var self = this;
        var xhr = new XMLHttpRequest();
        xhr.open('POST', this.url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = xhr.onload = function (e) {
            if (e.type === 'load' || xhr.readyState === 4) {
                var resText = xhr.responseText || '{}';
                self.callback && self.callback(JSON.parse(resText));
            }
        };
        xhr.onerror = function () {
            self.xhrPost();
        };

        var data = 'aid=' + this.saver.appId + '&data=' + this.saver.eye;
        xhr.send(data);
    },
    post: function post() {
        if (util.corsSupport) {
            this.xhrPost();
        } else {
            this.jsonp();
        }
    }
};

module.exports = ajax;

/***/ })
/******/ ]);