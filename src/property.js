import { merge } from "./helpers"
import Channel from "./channel"
import AttributeChannel from "./channel/attribute_channel"

export function defineChannel(object, name, options = {}) {
  let privateChannelName = "@" + name;
  let getter = options.channel || function() { return new Channel() };

  Object.defineProperty(object, name, {
    get: function() {
      if(!this.hasOwnProperty(privateChannelName)) {
        let channel = getter.call(this);
        Object.defineProperty(this, privateChannelName, {
          value: channel,
          configurable: true,
        });
      }
      return this[privateChannelName];
    },
    configurable: true
  })
}

export function defineAttribute(object, name, options) {
  options = merge({ channelName: "@" + name }, options)

  defineChannel(object, options.channelName, {
    channel() {
      if(options.channel) {
        return options.channel.call(this, options);
      } else {
        return new AttributeChannel(this, options, options.value);
      }
    }
  });

  function define(object) {
    Object.defineProperty(object, name, {
      get: function() {
        if(options.get) {
          return options.get.call(this);
        } else {
          return this[options.channelName].value
        }
      },
      set: function(value) {
        define(this);
        if(options.set) {
          options.set.call(this, value);
        } else {
          this[options.channelName].emit(value);
        }
      },
      enumerable: ("enumerable" in options) ? options.enumerable : true,
      configurable: true,
    })
  };

  define(object);
};

export function defineProperty(object, name, options) {
  options = merge({ channelName: "@" + name }, options)

  let deps = [].concat(options.dependsOn || []);
  let getter = options.get || function() {};

  defineChannel(object, options.channelName, { channel() {
    let channel;

    if(deps.length) {
      let dependentChannels = deps.map((d) => Channel.pluck(this, d));
      channel = Channel.all(dependentChannels).map((args) => getter.apply(this, args));
    } else {
      channel = Channel.static(this).map((val) => getter.call(val)).static();
    }

    if(options.cache) {
      channel = channel.cache();
    }

    channel = channel.async("property");

    if(options.set) {
      channel.emit = options.set.bind(this)
    }

    return channel;
  }});

  let descriptor = {
    get() {
      return this[options.channelName].value
    },
    set(value) {
      this[options.channelName].emit(value)
    },
    configurable: true,
    enumerable: options.enumerable || false,
  }

  if(options.returnDescriptor) {
    return descriptor;
  } else {
    Object.defineProperty(object, name, descriptor);
  }
};
