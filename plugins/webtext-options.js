var OptionsSync = (function () {
    'use strict';

    const isExtensionContext = typeof chrome === 'object' && chrome && typeof chrome.extension === 'object';
    const globalWindow = typeof window === 'object' ? window : undefined;
    typeof location === 'object' && location.protocol.startsWith('http');
    function isBackgroundPage() {
        var _a, _b;
        return isExtensionContext && (location.pathname === '/_generated_background_page.html' ||
            ((_b = (_a = chrome.extension) === null || _a === void 0 ? void 0 : _a.getBackgroundPage) === null || _b === void 0 ? void 0 : _b.call(_a)) === globalWindow);
    }

    function throttle(delay, noTrailing, callback, debounceMode) {
        var timeoutID;
        var cancelled = false;
        var lastExec = 0;
        function clearExistingTimeout() {
            timeoutID && clearTimeout(timeoutID);
        }
        if ("boolean" != typeof noTrailing) {
            debounceMode = callback;
            callback = noTrailing;
            noTrailing = void 0;
        }
        function wrapper() {
            for (var _len = arguments.length, arguments_ = new Array(_len), _key = 0; _key < _len; _key++) arguments_[_key] = arguments[_key];
            var self = this;
            var elapsed = Date.now() - lastExec;
            if (!cancelled) {
                debounceMode && !timeoutID && exec();
                clearExistingTimeout();
                void 0 === debounceMode && elapsed > delay ? exec() : true !== noTrailing && (timeoutID = setTimeout(debounceMode ? clear : exec, void 0 === debounceMode ? delay - elapsed : delay));
            }
            function exec() {
                lastExec = Date.now();
                callback.apply(self, arguments_);
            }
            function clear() {
                timeoutID = void 0;
            }
        }
        wrapper.cancel = function() {
            clearExistingTimeout();
            cancelled = true;
        };
        return wrapper;
    }
    class TypeRegistry {
        constructor(initial = {}) {
            this.registeredTypes = initial;
        }
        get(type) {
            return void 0 !== this.registeredTypes[type] ? this.registeredTypes[type] : this.registeredTypes.default;
        }
        register(type, item) {
            void 0 === this.registeredTypes[type] && (this.registeredTypes[type] = item);
        }
        registerDefault(item) {
            this.register("default", item);
        }
    }
    class KeyExtractors extends TypeRegistry {
        constructor(options) {
            super(options);
            this.registerDefault((el => el.getAttribute("name") || ""));
        }
    }
    class InputReaders extends TypeRegistry {
        constructor(options) {
            super(options);
            this.registerDefault((el => el.value));
            this.register("checkbox", (el => null !== el.getAttribute("value") ? el.checked ? el.getAttribute("value") : null : el.checked));
            this.register("select", (el => function(elem) {
                var value, option, i;
                var options = elem.options;
                var index = elem.selectedIndex;
                var one = "select-one" === elem.type;
                var values = one ? null : [];
                var max = one ? index + 1 : options.length;
                i = index < 0 ? max : one ? index : 0;
                for (;i < max; i++) if (((option = options[i]).selected || i === index) && !option.disabled && !(option.parentNode.disabled && "optgroup" === option.parentNode.tagName.toLowerCase())) {
                    value = option.value;
                    if (one) return value;
                    values.push(value);
                }
                return values;
            }(el)));
        }
    }
    class KeyAssignmentValidators extends TypeRegistry {
        constructor(options) {
            super(options);
            this.registerDefault((() => true));
            this.register("radio", (el => el.checked));
        }
    }
    function keySplitter(key) {
        let matches = key.match(/[^[\]]+/g);
        let lastKey;
        if (key.length > 1 && key.indexOf("[]") === key.length - 2) {
            lastKey = matches.pop();
            matches.push([ lastKey ]);
        }
        return matches;
    }
    var proto = "undefined" != typeof Element ? Element.prototype : {};
    var vendor = proto.matches || proto.matchesSelector || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector;
    var matchesSelector = function(el, selector) {
        if (!el || 1 !== el.nodeType) return false;
        if (vendor) return vendor.call(el, selector);
        var nodes = el.parentNode.querySelectorAll(selector);
        for (var i = 0; i < nodes.length; i++) if (nodes[i] == el) return true;
        return false;
    };
    function getElementType(el) {
        let typeAttr;
        let tagName = el.tagName;
        let type = tagName;
        if ("input" === tagName.toLowerCase()) {
            typeAttr = el.getAttribute("type");
            type = typeAttr || "text";
        }
        return type.toLowerCase();
    }
    function getInputElements(element, options) {
        return Array.prototype.filter.call(element.querySelectorAll("input,select,textarea"), (el => {
            if ("input" === el.tagName.toLowerCase() && ("submit" === el.type || "reset" === el.type)) return false;
            let myType = getElementType(el);
            let identifier = options.keyExtractors.get(myType)(el);
            let foundInInclude = -1 !== (options.include || []).indexOf(identifier);
            let foundInExclude = -1 !== (options.exclude || []).indexOf(identifier);
            let foundInIgnored = false;
            let reject = false;
            if (options.ignoredTypes) for (let selector of options.ignoredTypes) matchesSelector(el, selector) && (foundInIgnored = true);
            reject = !foundInInclude && (!!options.include || (foundInExclude || foundInIgnored));
            return !reject;
        }));
    }
    function assignKeyValue(obj, keychain, value) {
        if (!keychain) return obj;
        var key = keychain.shift();
        obj[key] || (obj[key] = Array.isArray(key) ? [] : {});
        0 === keychain.length && (Array.isArray(obj[key]) ? null !== value && obj[key].push(value) : obj[key] = value);
        keychain.length > 0 && assignKeyValue(obj[key], keychain, value);
        return obj;
    }
    function serialize(element, options = {}) {
        let data = {};
        options.keySplitter = options.keySplitter || keySplitter;
        options.keyExtractors = new KeyExtractors(options.keyExtractors || {});
        options.inputReaders = new InputReaders(options.inputReaders || {});
        options.keyAssignmentValidators = new KeyAssignmentValidators(options.keyAssignmentValidators || {});
        Array.prototype.forEach.call(getInputElements(element, options), (el => {
            let type = getElementType(el);
            let key = options.keyExtractors.get(type)(el);
            let value = options.inputReaders.get(type)(el);
            if (options.keyAssignmentValidators.get(type)(el, key, value)) {
                let keychain = options.keySplitter(key);
                data = assignKeyValue(data, keychain, value);
            }
        }));
        return data;
    }
    class InputWriters extends TypeRegistry {
        constructor(options) {
            super(options);
            this.registerDefault(((el, value) => {
                el.value = value;
            }));
            this.register("checkbox", ((el, value) => {
                null === value ? el.indeterminate = true : el.checked = Array.isArray(value) ? -1 !== value.indexOf(el.value) : value;
            }));
            this.register("radio", (function(el, value) {
                void 0 !== value && (el.checked = el.value === value.toString());
            }));
            this.register("select", setSelectValue);
        }
    }
    function setSelectValue(elem, value) {
        var optionSet, option;
        var options = elem.options;
        var values = function(arr) {
            var ret = [];
            null !== arr && (Array.isArray(arr) ? ret.push.apply(ret, arr) : ret.push(arr));
            return ret;
        }(value);
        var i = options.length;
        for (;i--; ) {
            option = options[i];
            if (values.indexOf(option.value) > -1) {
                option.setAttribute("selected", true);
                optionSet = true;
            }
        }
        optionSet || (elem.selectedIndex = -1);
    }
    function keyJoiner(parentKey, childKey) {
        return parentKey + "[" + childKey + "]";
    }
    function flattenData(data, parentKey, options = {}) {
        let flatData = {};
        let keyJoiner$1 = options.keyJoiner || keyJoiner;
        for (let keyName in data) {
            if (!data.hasOwnProperty(keyName)) continue;
            let value = data[keyName];
            let hash = {};
            parentKey && (keyName = keyJoiner$1(parentKey, keyName));
            if (Array.isArray(value)) {
                hash[keyName + "[]"] = value;
                hash[keyName] = value;
            } else "object" == typeof value ? hash = flattenData(value, keyName, options) : hash[keyName] = value;
            Object.assign(flatData, hash);
        }
        return flatData;
    }
    function deserialize(form, data, options = {}) {
        let flattenedData = flattenData(data, null, options);
        options.keyExtractors = new KeyExtractors(options.keyExtractors || {});
        options.inputWriters = new InputWriters(options.inputWriters || {});
        Array.prototype.forEach.call(getInputElements(form, options), (el => {
            let type = getElementType(el);
            let key = options.keyExtractors.get(type)(el);
            options.inputWriters.get(type)(el, flattenedData[key]);
        }));
    }
    var lzString = (function(module) {
        var LZString = function() {
            var f = String.fromCharCode;
            var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
            var baseReverseDic = {};
            function getBaseValue(alphabet, character) {
                if (!baseReverseDic[alphabet]) {
                    baseReverseDic[alphabet] = {};
                    for (var i = 0; i < alphabet.length; i++) baseReverseDic[alphabet][alphabet.charAt(i)] = i;
                }
                return baseReverseDic[alphabet][character];
            }
            var LZString = {
                compressToBase64: function(input) {
                    if (null == input) return "";
                    var res = LZString._compress(input, 6, (function(a) {
                        return keyStrBase64.charAt(a);
                    }));
                    switch (res.length % 4) {
                        default:
                        case 0:
                            return res;
                        case 1:
                            return res + "===";
                        case 2:
                            return res + "==";
                        case 3:
                            return res + "=";
                    }
                },
                decompressFromBase64: function(input) {
                    return null == input ? "" : "" == input ? null : LZString._decompress(input.length, 32, (function(index) {
                        return getBaseValue(keyStrBase64, input.charAt(index));
                    }));
                },
                compressToUTF16: function(input) {
                    return null == input ? "" : LZString._compress(input, 15, (function(a) {
                        return f(a + 32);
                    })) + " ";
                },
                decompressFromUTF16: function(compressed) {
                    return null == compressed ? "" : "" == compressed ? null : LZString._decompress(compressed.length, 16384, (function(index) {
                        return compressed.charCodeAt(index) - 32;
                    }));
                },
                compressToUint8Array: function(uncompressed) {
                    var compressed = LZString.compress(uncompressed);
                    var buf = new Uint8Array(2 * compressed.length);
                    for (var i = 0, TotalLen = compressed.length; i < TotalLen; i++) {
                        var current_value = compressed.charCodeAt(i);
                        buf[2 * i] = current_value >>> 8;
                        buf[2 * i + 1] = current_value % 256;
                    }
                    return buf;
                },
                decompressFromUint8Array: function(compressed) {
                    if (null == compressed) return LZString.decompress(compressed);
                    var buf = new Array(compressed.length / 2);
                    for (var i = 0, TotalLen = buf.length; i < TotalLen; i++) buf[i] = 256 * compressed[2 * i] + compressed[2 * i + 1];
                    var result = [];
                    buf.forEach((function(c) {
                        result.push(f(c));
                    }));
                    return LZString.decompress(result.join(""));
                },
                compressToEncodedURIComponent: function(input) {
                    return null == input ? "" : LZString._compress(input, 6, (function(a) {
                        return keyStrUriSafe.charAt(a);
                    }));
                },
                decompressFromEncodedURIComponent: function(input) {
                    if (null == input) return "";
                    if ("" == input) return null;
                    input = input.replace(/ /g, "+");
                    return LZString._decompress(input.length, 32, (function(index) {
                        return getBaseValue(keyStrUriSafe, input.charAt(index));
                    }));
                },
                compress: function(uncompressed) {
                    return LZString._compress(uncompressed, 16, (function(a) {
                        return f(a);
                    }));
                },
                _compress: function(uncompressed, bitsPerChar, getCharFromInt) {
                    if (null == uncompressed) return "";
                    var i, value, ii, context_dictionary = {}, context_dictionaryToCreate = {}, context_c = "", context_wc = "", context_w = "", context_enlargeIn = 2, context_dictSize = 3, context_numBits = 2, context_data = [], context_data_val = 0, context_data_position = 0;
                    for (ii = 0; ii < uncompressed.length; ii += 1) {
                        context_c = uncompressed.charAt(ii);
                        if (!Object.prototype.hasOwnProperty.call(context_dictionary, context_c)) {
                            context_dictionary[context_c] = context_dictSize++;
                            context_dictionaryToCreate[context_c] = true;
                        }
                        context_wc = context_w + context_c;
                        if (Object.prototype.hasOwnProperty.call(context_dictionary, context_wc)) context_w = context_wc; else {
                            if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                                if (context_w.charCodeAt(0) < 256) {
                                    for (i = 0; i < context_numBits; i++) {
                                        context_data_val <<= 1;
                                        if (context_data_position == bitsPerChar - 1) {
                                            context_data_position = 0;
                                            context_data.push(getCharFromInt(context_data_val));
                                            context_data_val = 0;
                                        } else context_data_position++;
                                    }
                                    value = context_w.charCodeAt(0);
                                    for (i = 0; i < 8; i++) {
                                        context_data_val = context_data_val << 1 | 1 & value;
                                        if (context_data_position == bitsPerChar - 1) {
                                            context_data_position = 0;
                                            context_data.push(getCharFromInt(context_data_val));
                                            context_data_val = 0;
                                        } else context_data_position++;
                                        value >>= 1;
                                    }
                                } else {
                                    value = 1;
                                    for (i = 0; i < context_numBits; i++) {
                                        context_data_val = context_data_val << 1 | value;
                                        if (context_data_position == bitsPerChar - 1) {
                                            context_data_position = 0;
                                            context_data.push(getCharFromInt(context_data_val));
                                            context_data_val = 0;
                                        } else context_data_position++;
                                        value = 0;
                                    }
                                    value = context_w.charCodeAt(0);
                                    for (i = 0; i < 16; i++) {
                                        context_data_val = context_data_val << 1 | 1 & value;
                                        if (context_data_position == bitsPerChar - 1) {
                                            context_data_position = 0;
                                            context_data.push(getCharFromInt(context_data_val));
                                            context_data_val = 0;
                                        } else context_data_position++;
                                        value >>= 1;
                                    }
                                }
                                if (0 == --context_enlargeIn) {
                                    context_enlargeIn = Math.pow(2, context_numBits);
                                    context_numBits++;
                                }
                                delete context_dictionaryToCreate[context_w];
                            } else {
                                value = context_dictionary[context_w];
                                for (i = 0; i < context_numBits; i++) {
                                    context_data_val = context_data_val << 1 | 1 & value;
                                    if (context_data_position == bitsPerChar - 1) {
                                        context_data_position = 0;
                                        context_data.push(getCharFromInt(context_data_val));
                                        context_data_val = 0;
                                    } else context_data_position++;
                                    value >>= 1;
                                }
                            }
                            if (0 == --context_enlargeIn) {
                                context_enlargeIn = Math.pow(2, context_numBits);
                                context_numBits++;
                            }
                            context_dictionary[context_wc] = context_dictSize++;
                            context_w = String(context_c);
                        }
                    }
                    if ("" !== context_w) {
                        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate, context_w)) {
                            if (context_w.charCodeAt(0) < 256) {
                                for (i = 0; i < context_numBits; i++) {
                                    context_data_val <<= 1;
                                    if (context_data_position == bitsPerChar - 1) {
                                        context_data_position = 0;
                                        context_data.push(getCharFromInt(context_data_val));
                                        context_data_val = 0;
                                    } else context_data_position++;
                                }
                                value = context_w.charCodeAt(0);
                                for (i = 0; i < 8; i++) {
                                    context_data_val = context_data_val << 1 | 1 & value;
                                    if (context_data_position == bitsPerChar - 1) {
                                        context_data_position = 0;
                                        context_data.push(getCharFromInt(context_data_val));
                                        context_data_val = 0;
                                    } else context_data_position++;
                                    value >>= 1;
                                }
                            } else {
                                value = 1;
                                for (i = 0; i < context_numBits; i++) {
                                    context_data_val = context_data_val << 1 | value;
                                    if (context_data_position == bitsPerChar - 1) {
                                        context_data_position = 0;
                                        context_data.push(getCharFromInt(context_data_val));
                                        context_data_val = 0;
                                    } else context_data_position++;
                                    value = 0;
                                }
                                value = context_w.charCodeAt(0);
                                for (i = 0; i < 16; i++) {
                                    context_data_val = context_data_val << 1 | 1 & value;
                                    if (context_data_position == bitsPerChar - 1) {
                                        context_data_position = 0;
                                        context_data.push(getCharFromInt(context_data_val));
                                        context_data_val = 0;
                                    } else context_data_position++;
                                    value >>= 1;
                                }
                            }
                            if (0 == --context_enlargeIn) {
                                context_enlargeIn = Math.pow(2, context_numBits);
                                context_numBits++;
                            }
                            delete context_dictionaryToCreate[context_w];
                        } else {
                            value = context_dictionary[context_w];
                            for (i = 0; i < context_numBits; i++) {
                                context_data_val = context_data_val << 1 | 1 & value;
                                if (context_data_position == bitsPerChar - 1) {
                                    context_data_position = 0;
                                    context_data.push(getCharFromInt(context_data_val));
                                    context_data_val = 0;
                                } else context_data_position++;
                                value >>= 1;
                            }
                        }
                        if (0 == --context_enlargeIn) {
                            context_enlargeIn = Math.pow(2, context_numBits);
                            context_numBits++;
                        }
                    }
                    value = 2;
                    for (i = 0; i < context_numBits; i++) {
                        context_data_val = context_data_val << 1 | 1 & value;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data_position = 0;
                            context_data.push(getCharFromInt(context_data_val));
                            context_data_val = 0;
                        } else context_data_position++;
                        value >>= 1;
                    }
                    for (;;) {
                        context_data_val <<= 1;
                        if (context_data_position == bitsPerChar - 1) {
                            context_data.push(getCharFromInt(context_data_val));
                            break;
                        }
                        context_data_position++;
                    }
                    return context_data.join("");
                },
                decompress: function(compressed) {
                    return null == compressed ? "" : "" == compressed ? null : LZString._decompress(compressed.length, 32768, (function(index) {
                        return compressed.charCodeAt(index);
                    }));
                },
                _decompress: function(length, resetValue, getNextValue) {
                    var i, w, bits, resb, maxpower, power, c, dictionary = [], enlargeIn = 4, dictSize = 4, numBits = 3, entry = "", result = [], data = {
                        val: getNextValue(0),
                        position: resetValue,
                        index: 1
                    };
                    for (i = 0; i < 3; i += 1) dictionary[i] = i;
                    bits = 0;
                    maxpower = Math.pow(2, 2);
                    power = 1;
                    for (;power != maxpower; ) {
                        resb = data.val & data.position;
                        data.position >>= 1;
                        if (0 == data.position) {
                            data.position = resetValue;
                            data.val = getNextValue(data.index++);
                        }
                        bits |= (resb > 0 ? 1 : 0) * power;
                        power <<= 1;
                    }
                    switch (bits) {
                        case 0:
                            bits = 0;
                            maxpower = Math.pow(2, 8);
                            power = 1;
                            for (;power != maxpower; ) {
                                resb = data.val & data.position;
                                data.position >>= 1;
                                if (0 == data.position) {
                                    data.position = resetValue;
                                    data.val = getNextValue(data.index++);
                                }
                                bits |= (resb > 0 ? 1 : 0) * power;
                                power <<= 1;
                            }
                            c = f(bits);
                            break;
                        case 1:
                            bits = 0;
                            maxpower = Math.pow(2, 16);
                            power = 1;
                            for (;power != maxpower; ) {
                                resb = data.val & data.position;
                                data.position >>= 1;
                                if (0 == data.position) {
                                    data.position = resetValue;
                                    data.val = getNextValue(data.index++);
                                }
                                bits |= (resb > 0 ? 1 : 0) * power;
                                power <<= 1;
                            }
                            c = f(bits);
                            break;
                        case 2:
                            return "";
                    }
                    dictionary[3] = c;
                    w = c;
                    result.push(c);
                    for (;;) {
                        if (data.index > length) return "";
                        bits = 0;
                        maxpower = Math.pow(2, numBits);
                        power = 1;
                        for (;power != maxpower; ) {
                            resb = data.val & data.position;
                            data.position >>= 1;
                            if (0 == data.position) {
                                data.position = resetValue;
                                data.val = getNextValue(data.index++);
                            }
                            bits |= (resb > 0 ? 1 : 0) * power;
                            power <<= 1;
                        }
                        switch (c = bits) {
                            case 0:
                                bits = 0;
                                maxpower = Math.pow(2, 8);
                                power = 1;
                                for (;power != maxpower; ) {
                                    resb = data.val & data.position;
                                    data.position >>= 1;
                                    if (0 == data.position) {
                                        data.position = resetValue;
                                        data.val = getNextValue(data.index++);
                                    }
                                    bits |= (resb > 0 ? 1 : 0) * power;
                                    power <<= 1;
                                }
                                dictionary[dictSize++] = f(bits);
                                c = dictSize - 1;
                                enlargeIn--;
                                break;
                            case 1:
                                bits = 0;
                                maxpower = Math.pow(2, 16);
                                power = 1;
                                for (;power != maxpower; ) {
                                    resb = data.val & data.position;
                                    data.position >>= 1;
                                    if (0 == data.position) {
                                        data.position = resetValue;
                                        data.val = getNextValue(data.index++);
                                    }
                                    bits |= (resb > 0 ? 1 : 0) * power;
                                    power <<= 1;
                                }
                                dictionary[dictSize++] = f(bits);
                                c = dictSize - 1;
                                enlargeIn--;
                                break;
                            case 2:
                                return result.join("");
                        }
                        if (0 == enlargeIn) {
                            enlargeIn = Math.pow(2, numBits);
                            numBits++;
                        }
                        if (dictionary[c]) entry = dictionary[c]; else {
                            if (c !== dictSize) return null;
                            entry = w + w.charAt(0);
                        }
                        result.push(entry);
                        dictionary[dictSize++] = w + entry.charAt(0);
                        w = entry;
                        if (0 == --enlargeIn) {
                            enlargeIn = Math.pow(2, numBits);
                            numBits++;
                        }
                    }
                }
            };
            return LZString;
        }();
        null != module && (module.exports = LZString);
    }(module = {
        exports: {}
    }, module.exports), module.exports);
    var module;
    class OptionsSync {
        constructor({defaults: defaults = {}, storageName: storageName = "options", migrations: migrations = [], logging: logging = true} = {}) {
            Object.defineProperty(this, "storageName", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            Object.defineProperty(this, "defaults", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            Object.defineProperty(this, "_form", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            Object.defineProperty(this, "_migrations", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            this.storageName = storageName;
            this.defaults = defaults;
            this._handleFormInput = (delay = 300, atBegin = this._handleFormInput.bind(this),
                throttle(delay, atBegin, false) );
            var delay, atBegin;
            this._handleStorageChangeOnForm = this._handleStorageChangeOnForm.bind(this);
            logging || (this._log = () => {});
            this._migrations = this._runMigrations(migrations);
        }
        async getAll() {
            await this._migrations;
            return this._getAll();
        }
        async setAll(newOptions) {
            await this._migrations;
            return this._setAll(newOptions);
        }
        async set(newOptions) {
            return this.setAll({
                ...await this.getAll(),
                ...newOptions
            });
        }
        async syncForm(form) {
            this._form = form instanceof HTMLFormElement ? form : document.querySelector(form);
            this._form.addEventListener("input", this._handleFormInput);
            this._form.addEventListener("submit", this._handleFormSubmit);
            chrome.storage.onChanged.addListener(this._handleStorageChangeOnForm);
            this._updateForm(this._form, await this.getAll());
        }
        async stopSyncForm() {
            if (this._form) {
                this._form.removeEventListener("input", this._handleFormInput);
                this._form.removeEventListener("submit", this._handleFormSubmit);
                chrome.storage.onChanged.removeListener(this._handleStorageChangeOnForm);
                delete this._form;
            }
        }
        _log(method, ...args) {
            console[method](...args);
        }
        async _getAll() {
            return new Promise(((resolve, reject) => {
                chrome.storage.sync.get(this.storageName, (result => {
                    chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve(this._decode(result[this.storageName]));
                }));
            }));
        }
        async _setAll(newOptions) {
            this._log("log", "Saving options", newOptions);
            return new Promise(((resolve, reject) => {
                chrome.storage.sync.set({
                    [this.storageName]: this._encode(newOptions)
                }, (() => {
                    chrome.runtime.lastError ? reject(chrome.runtime.lastError) : resolve();
                }));
            }));
        }
        _encode(options) {
            const thinnedOptions = {
                ...options
            };
            for (const [key, value] of Object.entries(thinnedOptions)) this.defaults[key] === value && delete thinnedOptions[key];
            this._log("log", "Without the default values", thinnedOptions);
            return lzString.compressToEncodedURIComponent(JSON.stringify(thinnedOptions));
        }
        _decode(options) {
            let decompressed = options;
            "string" == typeof options && (decompressed = JSON.parse(lzString.decompressFromEncodedURIComponent(options)));
            return {
                ...this.defaults,
                ...decompressed
            };
        }
        async _runMigrations(migrations) {
            if (0 === migrations.length || !isBackgroundPage() || !await async function() {
                return new Promise((resolve => {
                    var _a;
                    const callback = installType => {
                        if ("development" !== installType) {
                            chrome.runtime.onInstalled.addListener((() => resolve(true)));
                            setTimeout(resolve, 500, false);
                        } else resolve(true);
                    };
                    (null === (_a = chrome.management) || void 0 === _a ? void 0 : _a.getSelf) ? chrome.management.getSelf((({installType: installType}) => callback(installType))) : callback("unknown");
                }));
            }()) return;
            const options = await this._getAll();
            const initial = JSON.stringify(options);
            this._log("log", "Found these stored options", {
                ...options
            });
            this._log("info", "Will run", migrations.length, 1 === migrations.length ? "migration" : " migrations");
            migrations.forEach((migrate => migrate(options, this.defaults)));
            initial !== JSON.stringify(options) && await this._setAll(options);
        }
        async _handleFormInput({target: target}) {
            const field = target;
            if (field.name) {
                await this.set(this._parseForm(field.form));
                field.form.dispatchEvent(new CustomEvent("options-sync:form-synced", {
                    bubbles: true
                }));
            }
        }
        _handleFormSubmit(event) {
            event.preventDefault();
        }
        _updateForm(form, options) {
            const currentFormState = this._parseForm(form);
            for (const [key, value] of Object.entries(options)) currentFormState[key] === value && delete options[key];
            const include = Object.keys(options);
            include.length > 0 && deserialize(form, options, {
                include: include
            });
        }
        _parseForm(form) {
            const include = [];
            for (const field of form.querySelectorAll("[name]")) field.validity.valid && !field.disabled && include.push(field.name.replace(/\[.*]/, ""));
            return serialize(form, {
                include: include
            });
        }
        _handleStorageChangeOnForm(changes, areaName) {
            "sync" !== areaName || !changes[this.storageName] || document.hasFocus() && this._form.contains(document.activeElement) || this._updateForm(this._form, this._decode(changes[this.storageName].newValue));
        }
    }
    Object.defineProperty(OptionsSync, "migrations", {
        enumerable: true,
        configurable: true,
        writable: true,
        value: {
            removeUnused(options, defaults) {
                for (const key of Object.keys(options)) key in defaults || delete options[key];
            }
        }
    });

    return OptionsSync;

}());
