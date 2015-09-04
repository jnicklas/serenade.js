import Channel from "./channel"
import StaticChannel from "./static_channel"
import { deleteItem } from "../helpers"

export default class CollectionChannel extends StaticChannel {
  constructor(parent) {
    var oldCollection;
    super(undefined);
    this.parent = parent;
    this.subscribers = [];
    this.appliedHandler = () => {
      this.subscribers.forEach((cb) => cb(this.value));
    };
    this.handler = (collection) => {
      if(oldCollection && oldCollection.change) {
        oldCollection.change.unsubscribe(this.handler);
      }
      if(collection) {
        if(collection.change) {
          collection.change.subscribe(this.handler);
        }
        this.appliedHandler();
      }
      oldCollection = collection;
    };
  }

  subscribe(cb) {
    if(!this.subscribers.length) {
      this.parent.bind(this.handler);
    }
    this.subscribers.push(cb);
  }

  unsubscribe(cb) {
    deleteItem(this.subscribers, cb);
    if(!this.subscribers.length) {
      this.parent.unsubscribe(this.handler);
      this.handler(undefined);
    }
  }

  get value() {
    return this.parent.value
  }

  set value(value) {
    // No op
  }
}

StaticChannel.prototype.collection = function() {
  return new CollectionChannel(this);
}
