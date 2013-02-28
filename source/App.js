enyo.kind({
	name: "App",
	kind: "FittableRows",
	classes: "onyx enyo-fit",
	components: [
    {name: "JobService", kind: "enyo.WebService", baseUrl: "/api/v1/items", url: "/api/v1/items", onResponse: "processJobs"},
    {name: "ItemService", kind: "navi.ItemWebService", baseUrl: "/api/v1/items", url: "/api/v1/itmes", onResponse: "processItem"},
		{kind: "Panels", fit: true, classes: "panels", arrangerKind: "CollapsingArranger", wrap: false, components: [
      {name: "JobView", kind: "navi.List", ontap: "jobTapped"},
      {name: "TaskView", kind: "navi.List", ontap: "jobTapped"},
      {name: "mainView", fit: true, classes: "enyo-fit enyo-selectable", kind: "navi.ItemView"},
		]},
    // {kind: "onyx.Toolbar", components: [
    //   {kind: "onyx.InputDecorator", style: "width: 1000px", components: [
    //     {name: "action", kind: "onyx.Input", style: "width: 1000px", placeholder: "Action"}
		// 	]},
    // ]},
    {kind: "onyx.Toolbar", components: [
      // {kind: "onyx.InputDecorator", style: "width: 1000px", components: [
      //   {name: "args", kind: "onyx.Input", style: "width: 1000px", placeholder: "arguments"}
			// ]},
      {kind: "onyx.Button", ontap: "testEvent", content: "Refresh", ontap: "refresh_job"},
    ]}

	],
  refresh_job: function() {
    this.$.JobService.send();
  },
  rendered: function() {
    this.inherited(arguments);
    this.refresh_job();
  },
  processJobs: function(inSender, inEvent) {
    this.jobs = inEvent.data;
    console.log(this.jobs);
    this.$.JobView.setJobs(this.jobs);
  },
  processItem: function(inSender, inEvent) {
    this.item = inEvent.data;
    this.$.mainView.setItem(this.item);
  },
  testEvent: function(inSender, inEvent) {
    var action = this.$.action.getValue()
    , args = this.$.args.getValue();
    console.log(action);
    console.log(args);
  },
  jobTapped: function(inSender, inEvent) {
    var id = inSender.jobs[inEvent.index];
    console.log(id);
    this.$.TaskView.setJobs([id]);
    this.$.ItemService.sendRequest(id);
  }
});

