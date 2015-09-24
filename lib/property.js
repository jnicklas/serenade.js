"use strict";

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _maybe$extend$defineOptions$safePush$primitiveTypes = require("./helpers");

var _Event = require("./event");

var _Collection = require("./collection");

var _Collection2 = _interopRequireDefault(_Collection);

var PropertyDefinition = (function () {
	function PropertyDefinition(name, options) {
		var _this = this;

		_classCallCheck(this, PropertyDefinition);

		_maybe$extend$defineOptions$safePush$primitiveTypes.extend(this, options);
		this.name = name;
		this.dependencies = [];
		this.localDependencies = [];
		this.globalDependencies = [];

		[].concat(this.dependsOn || []).forEach(function (name) {
			if (_this.dependencies.indexOf(name) === -1) {
				var subname = undefined,
				    type = undefined;
				_this.dependencies.push(name);
				if (name.match(/\./)) {
					type = "singular";

					var _name$split = name.split(".");

					var _name$split2 = _slicedToArray(_name$split, 2);

					name = _name$split2[0];
					subname = _name$split2[1];
				} else if (name.match(/:/)) {
					type = "collection";

					var _name$split3 = name.split(":");

					var _name$split32 = _slicedToArray(_name$split3, 2);

					name = _name$split32[0];
					subname = _name$split32[1];
				}
				_this.localDependencies.push(name);
				if (_this.localDependencies.indexOf(name) === -1) _this.localDependencies.push(name);
				if (type) _this.globalDependencies.push({ subname: subname, name: name, type: type });
			}
		});
	}

	_createClass(PropertyDefinition, [{
		key: "eventOptions",
		get: function () {
			var name = this.name;
			var options = {
				timeout: this.timeout,
				buffer: this.buffer,
				animate: this.animate,
				bind: function bind() {
					this[name + "_property"].registerGlobal();
				},
				optimize: function optimize(queue) {
					return [queue[0][0], queue[queue.length - 1][1]];
				}
			};
			if (this.hasOwnProperty("async")) options.async = this.async;

			return options;
		}
	}]);

	return PropertyDefinition;
})();

var PropertyAccessor = (function () {
	function PropertyAccessor(definition, object) {
		_classCallCheck(this, PropertyAccessor);

		this.trigger = this.trigger.bind(this);
		this.definition = definition;
		this.object = object;
		this.name = this.definition.name;
		this.valueName = "_" + this.name;
		this.event = new _Event.Event(this.object, this.name + "_change", this.definition.eventOptions);
		this._gcQueue = [];
	}

	_createClass(PropertyAccessor, [{
		key: "initialize",
		value: function initialize(value) {
			this.update(value);
			this._oldValue = value;
		}
	}, {
		key: "update",
		value: function update(value) {
			if (this.definition.set) {
				this.definition.set.call(this.object, value);
			} else {
				Object.defineProperty(this.object, this.valueName, { value: value, configurable: true, writable: true });
			}
		}
	}, {
		key: "set",
		value: function set(value) {
			if (typeof value === "function") {
				this.definition.get = value;
			} else {
				this.update(value);
				this.trigger();
			}
		}
	}, {
		key: "format",
		value: function format(val) {
			if (arguments.length === 0) {
				val = this.get();
			}
			if (typeof this.definition.format === "function") {
				return this.definition.format.call(this.object, val);
			} else {
				return val;
			}
		}
	}, {
		key: "get",
		value: function get() {
			if (this.definition.get && !(this.definition.cache && this.valueName in this.object)) {
				var value = this.definition.get.call(this.object);
				if (this.definition.cache) {
					Object.defineProperty(this.object, this.valueName, { value: value, writable: true, configurable: true });
					if (!this._isCached) {
						this._isCached = true;
						this.bind(function () {});
					}
				}
				return value;
			} else {
				return this.object[this.valueName];
			}
		}
	}, {
		key: "registerGlobal",
		value: function registerGlobal(value) {
			var _this2 = this;

			if (this._isRegistered) {
				return;
			}this._isRegistered = true;

			if ("_oldValue" in this) {
				if (arguments.length === 0) value = this.get();
				this._oldValue = value;
			}

			this.definition.globalDependencies.forEach(function (_ref) {
				var name = _ref.name;
				var type = _ref.type;
				var subname = _ref.subname;

				var trigger = _this2.trigger;

				if (type === "singular") {
					(function () {
						var updateItemBinding = function updateItemBinding(before, after) {
							_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(before).prop(subname + "_property").call("unbind", trigger);
							_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(after).prop(subname + "_property").call("bind", trigger);
						};

						_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(_this2.object[name + "_property"]).call("bind", updateItemBinding);
						updateItemBinding(undefined, _this2.object[name]);

						_this2._gcQueue.push(function () {
							updateItemBinding(_this2.object[name], undefined);
							_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(_this2.object[name + "_property"]).call("unbind", updateItemBinding);
						});
					})();
				} else if (type == "collection") {
					(function () {
						var updateItemBindings = function (before, after) {
							_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(before).call("forEach", function (item) {
								_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(item[subname + "_property"]).call("unbind", trigger);
							});
							_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(after).call("forEach", function (item) {
								_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(item[subname + "_property"]).call("bind", trigger);
							});
						};

						var updateCollectionBindings = function (before, after) {
							updateItemBindings(before, after);
							_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(before).prop("change").call("unbind", trigger);
							_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(after).prop("change").call("bind", trigger);
							_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(before).prop("change").call("unbind", updateItemBindings);
							_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(after).prop("change").call("bind", updateItemBindings);
						};

						;

						;

						_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(_this2.object[name + "_property"]).call("bind", updateCollectionBindings);
						updateCollectionBindings(undefined, _this2.object[name]);

						_this2._gcQueue.push(function () {
							updateCollectionBindings(_this2.object[name], undefined);
							_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(_this2.object[name + "_property"]).call("unbind", updateCollectionBindings);
						});
					})();
				};
			});

			this.definition.localDependencies.forEach(function (dependency) {
				_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(_this2.object[dependency + "_property"]).call("registerGlobal");
			});
		}
	}, {
		key: "hasListeners",
		get: function () {
			if (this.listeners.length) {
				return true;
			} else {
				return this.dependentProperties.some(function (prop) {
					return prop.listeners.length;
				});
			}
		}
	}, {
		key: "gc",
		value: function gc() {
			var _this3 = this;

			if (!this.hasListeners) {
				this._gcQueue.forEach(function (fn) {
					return fn();
				});
				this._isRegistered = false;
				this._gcQueue = [];
			}

			this.definition.localDependencies.forEach(function (dependency) {
				_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(_this3.object[dependency + "_property"]).call("gc");
			});
		}
	}, {
		key: "trigger",
		value: function trigger() {
			var _this4 = this;

			this.clearCache();

			var retrievedNewValue = undefined,
			    newValue = undefined;

			if (this.definition.changed === false) {
				return;
			} else if (this.definition.changed !== true) {
				if ("_oldValue" in this) {
					if (this.definition.changed) {
						retrievedNewValue = true;
						newValue = this.get();
						if (!this.definition.changed.call(this.object, this._oldValue, newValue)) {
							return;
						}
					} else {
						retrievedNewValue = true;
						newValue = this.get();
						if (_maybe$extend$defineOptions$safePush$primitiveTypes.primitiveTypes.indexOf(typeof this._oldValue !== -1) && this._oldValue === newValue) {
							return;
						}
					}
				}
			}

			if (!retrievedNewValue) {
				newValue = this.get();
			}

			this.event.trigger(this._oldValue, newValue);

			var changes = {};
			changes[this.name] = newValue;

			_maybe$extend$defineOptions$safePush$primitiveTypes.maybe(this.object).prop("changed").call("trigger", changes);

			this.dependents.forEach(function (name) {
				_this4.object[name + "_property"].trigger();
			});

			this._oldValue = newValue;
		}
	}, {
		key: "bind",
		value: function bind(fn) {
			this.event.bind(fn);
		}
	}, {
		key: "one",
		value: function one(fn) {
			this.event.one(fn);
		}
	}, {
		key: "resolve",
		value: function resolve(fn) {
			this.event.resolve(fn);
		}
	}, {
		key: "unbind",
		value: function unbind(fn) {
			this.event.unbind(fn);
			this.gc();
		}
	}, {
		key: "dependents",
		get: function () {
			var _this5 = this;

			var deps = [];
			var findDependencies = (function (_findDependencies) {
				function findDependencies(_x) {
					return _findDependencies.apply(this, arguments);
				}

				findDependencies.toString = function () {
					return _findDependencies.toString();
				};

				return findDependencies;
			})(function (name) {
				_this5.object._s.properties.forEach(function (property) {
					if (deps.indexOf(property.name) === -1 && property.localDependencies.indexOf(name) !== -1) {
						deps.push(property.name);
						findDependencies(property.name);
					}
				});
			});
			findDependencies(this.name);
			return deps;
		}
	}, {
		key: "listeners",
		get: function () {
			return this.event.listeners;
		}
	}, {
		key: "clearCache",
		value: function clearCache() {
			if (this.definition.cache && this.definition.get) {
				delete this.object[this.valueName];
			}
		}
	}, {
		key: "dependentProperties",
		get: function () {
			var _this6 = this;

			return new _Collection2["default"](this.dependents.map(function (name) {
				return _this6.object[name + "_property"];
			}));
		}
	}]);

	return PropertyAccessor;
})();

function defineProperty(object, name, options) {
	if (!options) options = {};

	var definition = new PropertyDefinition(name, options);

	if (!("_s" in object)) {
		_maybe$extend$defineOptions$safePush$primitiveTypes.defineOptions(object, "_s");
	}

	_maybe$extend$defineOptions$safePush$primitiveTypes.safePush(object._s, "properties", definition);

	function define(object) {
		Object.defineProperty(object, name, {
			get: function get() {
				return this[name + "_property"].get();
			},
			set: function set(value) {
				define(this);
				this[name + "_property"].set(value);
			},
			configurable: true,
			enumerable: "enumerable" in options ? options.enumerable : true
		});
	};

	define(object);

	var accessorName = name + "_property";

	Object.defineProperty(object, accessorName, {
		get: function get() {
			if (!this._s.hasOwnProperty(accessorName)) {
				this._s[accessorName] = new PropertyAccessor(definition, this);
			}
			return this._s[accessorName];
		},
		configurable: true
	});

	if (typeof options.serialize === "string") {
		defineProperty(object, options.serialize, {
			get: function get() {
				return this[name];
			},
			set: function set(v) {
				this[name] = v;
			},
			configurable: true
		});
	}

	if ("value" in options) {
		object[name] = options.value;
	}
};

exports["default"] = defineProperty;
module.exports = exports["default"];