import { merge } from "../helpers"

// Generated by CoffeeScript 1.7.1
export default function(name, options) {
  var propOptions;
  if (options == null) {
    options = {};
  }
  if (!options.from) {
    throw new Error("must specify `from` option");
  }
  propOptions = merge(options, {
    get: function() {
      var current, key, value;
      current = this[options.from];
      for (key in options) {
        value = options[key];
        if (key === "filter" || key === "map") {
          current = current[key](function(item) {
            if (typeof options[key] === "string") {
              return item[options[key]];
            } else {
              return options[key](item);
            }
          });
        }
      }
      return current;
    },
    dependsOn: ["" + options.from + ":" + options.filter, "" + options.from + ":" + options.map]
  });
  this.property(name, propOptions);
  return this.property(name + 'Count', {
    get: function() {
      return this[name].length;
    },
    dependsOn: name
  });
};