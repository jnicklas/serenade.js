"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _view = require("./view");

var _view2 = _interopRequireDefault(_view);

var _property = require("../property");

var _helpers = require("../helpers");

var _collection = require("../collection");

var _collection2 = _interopRequireDefault(_collection);

var _channel = require("../channel");

var _channel2 = _interopRequireDefault(_channel);

var Property = {
  style: {
    update: function update(channel, value) {
      (0, _helpers.assignUnlessEqual)(this.node.style, channel.name, value);
    }
  },
  event: {
    setup: function setup(channel) {
      var _this = this;

      this.node.addEventListener(channel.name, function (e) {
        if (channel.preventDefault) {
          e.preventDefault();
        }
        _this.context[channel.property](_this.node, _this.context, e);
      });
    }
  },
  "class": {
    update: function update(channel, value) {
      if (value) {
        if (!this.boundClasses) {
          this.boundClasses = new _collection2["default"]();
        }
        if (!this.boundClasses.includes(channel.name)) {
          this.boundClasses.push(channel.name);
          this._updateClass();
        }
      } else if (this.boundClasses) {
        var index = this.boundClasses.indexOf(channel.name);
        this.boundClasses["delete"](channel.name);
        this._updateClass();
      }
    }
  },
  binding: {
    setup: function setup(channel) {
      var _this2 = this;

      if (this.type !== "input" && this.type !== "textarea" && this.type !== "select") {
        throw SyntaxError("invalid view type " + this.type + " for two way binding");
      }
      if (!channel.property) {
        throw SyntaxError("cannot bind to whole context, please specify an attribute to bind to");
      }
      var setValue = function setValue(newValue) {
        var currentValue = _this2.context[channel.property];
        if (currentValue && currentValue.isChannel) {
          currentValue.emit(newValue);
        } else {
          _this2.context[channel.property] = newValue;
        }
      };
      var domUpdated = function domUpdated() {
        if (_this2.node.type === "checkbox") {
          setValue(_this2.node.checked);
        } else if (_this2.node.type === "radio") {
          if (_this2.node.checked) {
            setValue(_this2.node.value);
          }
        } else {
          setValue(_this2.node.value);
        }
      };
      if (channel.name === "binding") {
        (function () {
          var handler = function handler(e) {
            if (_this2.node.form === (e.target || e.srcElement)) {
              domUpdated();
            }
          };
          _helpers.settings.document.addEventListener("submit", handler, true);
          _this2.unload.subscribe(function () {
            _helpers.settings.document.removeEventListener("submit", handler, true);
          });
        })();
      } else {
        this.node.addEventListener(channel.name, domUpdated);
      }
    },
    update: function update(channel, value) {
      if (this.node.type === "checkbox") {
        return this.node.checked = !!value;
      } else if (this.node.type === "radio") {
        if (value === this.node.value) {
          return this.node.checked = true;
        }
      } else {
        if (value === undefined) {
          value = "";
        }
        return (0, _helpers.assignUnlessEqual)(this.node, "value", value);
      }
    }
  },
  attribute: {
    update: function update(channel, value) {
      if (channel.name === 'value') {
        (0, _helpers.assignUnlessEqual)(this.node, "value", value || '');
      } else if (this.type === 'input' && channel.name === 'checked') {
        (0, _helpers.assignUnlessEqual)(this.node, "checked", !!value);
      } else if (channel.name === 'class') {
        this.attributeClasses = value;
        this._updateClass();
      } else if (value === undefined) {
        if (this.node.hasAttribute(channel.name)) {
          this.node.removeAttribute(channel.name);
        }
      } else {
        if (value === 0) {
          value = "0";
        }
        if (this.node.getAttribute(channel.name) !== value) {
          this.node.setAttribute(channel.name, value);
        }
      }
    }
  },
  on: {
    setup: function setup(channel) {
      var _this3 = this;

      if (channel.name === "load" || channel.name === "unload") {
        this[channel.name].subscribe(function () {
          _this3.context[channel.property](_this3.node, _this3.context);
        });
      } else {
        throw new SyntaxError("unkown lifecycle event '" + channel.name + "'");
      }
    }
  },
  property: {
    update: function update(channel, value) {
      (0, _helpers.assignUnlessEqual)(this.node, channel.name, value);
    }
  }
};

var Element = (function (_View) {
  _inherits(Element, _View);

  function Element(context, type, options) {
    var _this4 = this;

    _classCallCheck(this, Element);

    _get(Object.getPrototypeOf(Element.prototype), "constructor", this).call(this, _helpers.settings.document.createElement(type));

    this.type = type;
    this.context = context;
    this.classes = options.classes;
    this._updateClass();

    if (options["do"]) {
      var view = options["do"].compile(context);
      view.append(this.node);
      this.children = [view];
    } else {
      this.children = [];
    }

    delete options.classes;
    delete options["do"];

    Object.keys(options).forEach(function (key) {
      var channel = options[key];
      var action = undefined;

      if (!channel.scope && channel.name === "binding") {
        action = Property.binding;
      } else {
        action = Property[channel.scope || "attribute"];
      }

      if (!action) {
        throw SyntaxError("" + channel.scope + " is not a valid scope");
      }

      if (action.setup) {
        action.setup.call(_this4, channel);
      }

      if (action.update) {
        _this4.bind(channel, function (value) {
          action.update.call(_this4, channel, value);
        });
      }
    });

    this.load.trigger();
  }

  _createClass(Element, [{
    key: "_updateClass",
    value: function _updateClass() {
      var classes = this.classes;
      if (this.attributeClasses) {
        classes = classes.concat(this.attributeClasses);
      }
      if (this.boundClasses && this.boundClasses.length) {
        classes = classes.concat(this.boundClasses.toArray());
      }
      if (classes.length) {
        (0, _helpers.assignUnlessEqual)(this.node, "className", classes.sort().join(' '));
      } else {
        this.node.removeAttribute("class");
      }
    }
  }, {
    key: "detach",
    value: function detach() {
      this.unload.trigger();
      _get(Object.getPrototypeOf(Element.prototype), "detach", this).call(this);
    }
  }]);

  return Element;
})(_view2["default"]);

(0, _property.defineChannel)(Element.prototype, "load", { async: false });
(0, _property.defineChannel)(Element.prototype, "unload", { async: false });

exports["default"] = Element;
module.exports = exports["default"];
