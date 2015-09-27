"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _base_channel = require("./base_channel");

var _base_channel2 = _interopRequireDefault(_base_channel);

var _static_channel = require("./static_channel");

var _static_channel2 = _interopRequireDefault(_static_channel);

var Channel = (function (_BaseChannel) {
  _inherits(Channel, _BaseChannel);

  _createClass(Channel, null, [{
    key: "of",
    value: function of(value) {
      return new Channel(value);
    }
  }, {
    key: "static",
    value: function _static(value) {
      return new _static_channel2["default"](value);
    }
  }, {
    key: "get",
    value: function get(object, name) {
      var channelName = "@" + name;
      if (!object) {
        return new _static_channel2["default"]();
      } else if (object[channelName]) {
        return object[channelName];
      } else {
        return new _static_channel2["default"](object[name]);
      }
    }
  }, {
    key: "pluck",
    value: function pluck(object, name) {
      var parts = name.split(/[\.:]/);

      if (parts.length == 2) {
        if (name.match(/:/)) {
          return Channel.get(object, parts[0]).pluckAll(parts[1]);
        } else {
          return Channel.get(object, parts[0]).pluck(parts[1]);
        }
      } else if (parts.length == 1) {
        return Channel.get(object, name);
      } else {
        throw new Error("cannot pluck more than one level in depth");
      }
    }
  }]);

  function Channel(value) {
    _classCallCheck(this, Channel);

    _get(Object.getPrototypeOf(Channel.prototype), "constructor", this).call(this);
    this.value = value;
  }

  _createClass(Channel, [{
    key: "emit",
    value: function emit(value) {
      this.value = value;
      this.trigger();
    }
  }]);

  return Channel;
})(_base_channel2["default"]);

exports["default"] = Channel;
module.exports = exports["default"];