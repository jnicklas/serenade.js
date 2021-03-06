"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.callAction = callAction;
exports.instruction = instruction;
exports.parameter = parameter;
exports.toView = toView;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _helpers = require("./helpers");

var _channel = require("./channel");

var _channel2 = _interopRequireDefault(_channel);

var _viewsDynamic_view = require("./views/dynamic_view");

var _viewsDynamic_view2 = _interopRequireDefault(_viewsDynamic_view);

var _viewsView = require("./views/view");

var _viewsView2 = _interopRequireDefault(_viewsView);

var _viewsText_view = require("./views/text_view");

var _viewsText_view2 = _interopRequireDefault(_viewsText_view);

var _context = require("./context");

var _context2 = _interopRequireDefault(_context);

var _template = require("./template");

var _template2 = _interopRequireDefault(_template);

function callAction(context, name, args) {
  var action = context && context[name] || _context2["default"][name];

  if (!action) {
    console.error("No such action in context:", name, context);
    throw new Error("No such action in context: " + name);
  } else if (typeof action !== "function") {
    console.error("Action is not a function:", name, action, context);
    throw new Error("Action is not a function: " + name);
  }

  return action.apply(context, args);
}

function instruction(ast, context) {
  var args = [];
  var options = {};

  if (ast.arguments) {
    args = ast.arguments.map(function (arg) {
      return parameter(arg, context);
    });
  }
  if (ast.options) {
    ast.options.forEach(function (arg) {
      return options[arg.name] = parameter(arg, context);
    });
  }
  if (ast.children && ast.children.length) {
    options["do"] = new _template2["default"](ast.children);
  }
  if (ast["else"] && ast["else"].children.length) {
    options["else"] = new _template2["default"](ast["else"].children);
  }
  if (ast.type === "__element") {
    args.unshift(ast.name);
  }

  options.classes = ast.classes || [];

  args.push(options);

  return toView(callAction(context, ast.type, args));
}

function parameter(ast, context) {
  var channel = undefined;
  if (ast.collection) {
    var args = ast.arguments.map(function (arg) {
      return parameter(arg, context);
    });
    channel = _channel2["default"].all(args);
  } else if (ast.filter) {
    var args = ast.arguments.map(function (arg) {
      return parameter(arg, context);
    });
    channel = callAction(context, ast.filter, args);
  } else if (ast.bound) {
    if (ast.property === "this") {
      channel = _channel2["default"]["static"](context);
    } else {
      var value = context && context[ast.property];
      if (value && value.isChannel) {
        channel = value;
      } else {
        channel = _channel2["default"]["static"](value);
      }
    }
  } else {
    channel = _channel2["default"]["static"](ast.property);
  }

  (0, _helpers.extend)(channel, ast);

  return channel;
}

function toView(object) {
  if (!object) {
    return new _viewsText_view2["default"](object);
  } else if (object.isView) {
    return object;
  } else if (object.isChannel) {
    var _ret = (function () {
      var view = new _viewsDynamic_view2["default"]();
      view.bind(object, function (value) {
        view.replace([toView(value)]);
      });
      return {
        v: view
      };
    })();

    if (typeof _ret === "object") return _ret.v;
  } else if (object.nodeType === 1) {
    return new _viewsView2["default"](object);
  } else if (object.nodeType === 3) {
    return new _viewsText_view2["default"](object.nodeValue);
  } else {
    return new _viewsText_view2["default"](object);
  }
}
