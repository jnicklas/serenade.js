import DynamicView from "./view"

// Generated by CoffeeScript 1.7.1
var BoundViewView,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

BoundViewView = (function(_super) {
  __extends(BoundViewView, _super);

  function BoundViewView() {
    BoundViewView.__super__.constructor.apply(this, arguments);
    this._bindToModel(this.ast.argument, (function(_this) {
      return function(value) {
        var view;
        view = Serenade.templates[value].render(_this.context).view;
        return _this.replace([view]);
      };
    })(this));
  }

  return BoundViewView;

})(DynamicView);

export default BoundViewView;
