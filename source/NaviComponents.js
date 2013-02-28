// This kind is not used.
enyo.kind({
  name: "navi.Label",
  tag: "label",
  content: "MM",
  published: {
    content: "MM"
  }
});

// This kind is not used.
enyo.kind({
  name: "navi.ItemWebService",
  kind: "enyo.WebService",
  baseUrl: "",
  published: {
    id: "",
  },
  idChanged: function(inOldId) {
    this.setUrl(this.baseUrl + "/" + this.id);
  },
  sendRequest: function(id) {
    if (id) {
      this.setUrl(this.baseUrl + "/" + id);
    }
    this.send();
  },
});

// This kind is not used.
enyo.kind({
  name: "navi.TaskList",
  kind: "FittableRows",
  classes: "enyo-fit enyo-unselectable",
  components: [
    {kind: "onyx.Toolbar", classes: "enyo-fit", style: "background-color: #555;", components: [
      {kind: "onyx.Grabber"},
      {content: "TaskList"},
    ]},
    {kind: "List", classes: "enyo-fit list", fit: true, touch: true, count: 3, onSetupItem: "setupItem", item: "item2", components: [
      {name: "item2", classes: "item enyo-border-box"}
    ]},
  ],
  setupItem: function(inSender, inEvent) {
    this.$.item2.setContent("This is row number: " + inEvent.index);
  }
});

enyo.kind({
  name: "navi.ItemView",
  kind: "FittableRows",
  classes: "enyo-fit nice-padding",
  published: {
    item: {}
  },
  components: [
    {name: "item_id", kind: "onyx.Toolbar", components: [
      {kind: "onyx.Grabber"},
      {content: "id"}
    ]},
    {kind: "List", fit: true, touch: true, onSetupItem: "setupItem", components: [
      {kind: "onyx.Groupbox", style: "padding: 15px;", components: [
        {name: "key", kind: "onyx.GroupboxHeader", content: ""},
        {name: "value", tag: "pre", style: "padding: 8px;"}
      ]}
    ]}
  ],
  itemChanged: function(inOldItem) {
    this.$.list.setCount(Object.keys(this.item).length);
    this.$.list.refresh();
  },
  setupItem: function(inSender, inEvent) {
    var i = inEvent.index;
    var keys = Object.keys(this.item);
    // console.log(i);
    // console.log(keys);

    this.$.key.setContent(keys[i]);
    // console.log(keys[i]);
    this.$.value.setContent(this.item[keys[i]]);

    return true;
  },
});

enyo.kind({
  name: "navi.List",
  kind: "FittableRows",
  classes: "enyo-fit",
  published: {
    jobs: []
  },
  events: {
    onTap: ""
  },
  handlers: {
    onTap: "selectTapped",
  },
  components: [
    {kind: "onyx.Toolbar", style: "background-color: #555;", components: [
      {kind: "onyx.Grabber"},
      {name: "title", content: "TaskList"},
    ]},
    {kind: "List", classes: "list", fit: true, touch: true, item: "item2",
     onSetupItem: "setupItem",
     components: [
      {name: "item2", classes: "item enyo-border-box"}
    ]},
  ],
  selectTapped: function(inSender, inEvent) {

    return false;
  },
  jobsChanged: function(inOldJobs) {
    this.$.list.setCount(this.jobs.length);
    this.$.list.refresh();
  },
  create: function() {
    this.inherited(arguments);
    this.$.list.setCount(this.jobs.length);
  },
  setupItem: function(inSender, inEvent) {
    this.$.item2.setContent(this.jobs[inEvent.index]);
  }
});
