enyo.kind({
	name: "App",
	kind: "FittableRows",
	fit: true,
  keys: ['tt', 'pp', 'dd'],
  items: [],
	components:[
		{kind: "onyx.Toolbar", content: "CM Navi"},
		{kind: "enyo.Scroller", fit: true, components: [
      {kind:"Repeater", fit: true, onSetupItem: "setupItem", components: [
        {name: "item", components: [
          {tag: "span", name: "id"},
          {tag: "span", name: "index", style: "float: right;"}
        ]}
      ]}
			// {name: "main", classes: "nice-padding", allowHtml: true}
		]},
		{kind: "onyx.Toolbar", components: [
			{kind: "onyx.Button", content: "Tap me", ontap: "helloWorldTap"},
      {kind: "onyx.Button", content: "loadItems", ontap: "loadItems"}
		]}
	],
  create: function() {
    this.inherited(arguments);
    console.log("In create.");
    new enyo.Ajax({
      url: '/api/v1/items'
    }).go().response(this, 'processResponse');
    this.$.repeater.setCount(this.keys.length);
  },
  loadItems: function() {
    console.log("In loadItems.");
    new enyo.Ajax({
      url: '/api/v1/items'
    }).go().response(this, 'processResponse');
  },
  processResponse: function(inSender, inResponse) {
    console.log("In processResponse.");
    // var data = (inResponse && inResponse.response && inResponse.response.data), i;
    var data = inResponse;
    // console.log(inResponse);
    // console.log(inResponse.response);
    // console.log(inResponse.response.data)

    if (!data) return;
    console.log("data is good.");
    this.keys = data;
    console.log("Set list length.");
    this.$.repeater.setCount(this.keys.length);
  },
  setupItem: function(inSender, inEvent) {
    var index = inEvent.index;
    var item = inEvent.item;
    var id = this.keys[index];

    // console.log(inEvent.index);
    // console.log(this.data);
    // console.log(the_data)

    item.$.id.setContent(id);
    item.$.index.setContent(index);
  },
  itemTap: function(inSender, inEvent) {
    alert("You tapped on row: " + inEvent.index);
  },
	helloWorldTap: function(inSender, inEvent) {
		this.$.main.addContent("The button was tapped.<br/>");
	}
});
