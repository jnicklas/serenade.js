require './spec_helper'
Serenade = require('../lib/serenade')

describe "Serenade", ->
  beforeEach -> @setupDom()

  it "can decorate an object with properties", ->
    object = Serenade(name: "Jonas")
    expect(object.name).to.eql("Jonas")
    expect(-> object.name = "John").to.triggerEvent(object.name_property)

  it "can decorate an object which has an enumerable constructor property", ->
    object = Serenade(constructor: "Jonas")
    expect(object.constructor).to.eql("Jonas")
    expect(-> object.constructor = "John").to.triggerEvent(object.constructor_property)

  describe ".view", ->
    it "registers a view object", ->
      Serenade.template("test", "h1#test")
      @body.appendChild Serenade.render("test", {}, {})
      expect(@body).to.have.element("h1#test")

    it "doesn't require context to be given", ->
      Serenade.template("test", "h1#test")
      @body.appendChild Serenade.render("test")
      expect(@body).to.have.element("h1#test")

    it "can be rendered directly", ->
      @body.appendChild Serenade.template("test", "h1#test").render()
      expect(@body).to.have.element("h1#test")

    it "works fine without a name", ->
      @body.appendChild Serenade.template("h1#test").render()
      expect(@body).to.have.element("h1#test")

    it "can take context as parameter", ->
      context = { id: 'test' }
      @body.appendChild Serenade.template("test", "h1[id=@id]").render(context)
      expect(@body).to.have.element("h1#test")
