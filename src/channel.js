import { extend } from "./helpers"

import BaseChannel from "./channel/base_channel"
import Channel from "./channel/channel"
import StaticChannel from "./channel/static_channel"
import DerivedStaticChannel from "./channel/derived_static_channel"
import MappedChannel from "./channel/mapped_channel"
import AsyncChannel from "./channel/async_channel"
import CachedChannel from "./channel/cached_channel"
import PluckedChannel from "./channel/plucked_channel"
import CollectionChannel from "./channel/collection_channel"
import PluckedCollectionChannel from "./channel/plucked_collection_channel"
import CompositeChannel from "./channel/composite_channel"
import FilteredChannel from "./channel/filtered_channel"

export default Channel
