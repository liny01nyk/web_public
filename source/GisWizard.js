enyo.kind({
  name: "GisWizard",
  kind: "FittableRows",
  classes: "onyx wide",
  state_machine: "start",
  trac_info: null,
  components: [
    {name: "requester", kind: "WebService", url: "/api/v1/items", method: "POST", onResponse: "process_response"},
    {name: "checker", kind: "navi.ResultChecker", baseUrl: "/api/v1/items", onReady: "result"},
    {kind: "onyx.Toolbar", components: [
      {kind: "onyx.InputDecorator", components: [
        {name: "args", kind: "onyx.Input", classes: "enyo-selectable", placeholder: "Trac Number"},
			]},
      {kind: "onyx.Button", ontap: "deploy_gis_start", classes: "enyo-selectable", content: "Deploy GIS"},
    ]},
    {name: "main", kind: "enyo.Scroller", fit: true, touch: true, components: []},
  ],
  check_version_result: function(inSender, inEvent) {
    console.log(inEvent);

    if(inEvent.return_value == 0 || inEvent.return_code == 0) {
      console.log("Version checked.")
      inEvent.stdout = inEvent.name + " " + inEvent.version + " " + "version checked.";
      this.trac_info.items[inEvent.name].cc_checked = true;
    } else {
      inEvent.stdout = inEvent.name + " " + inEvent.version + " " + "version checked. (Not match)";
      this.trac_info.items[inEvent.name].cc_checked = false;
    }

    this.show_result(inSender, inEvent);
  },
  check_deployment: function(inSender, inEvent) {
    this.show_result(inSender, inEvent);
  },
  result: function(inSender, inEvent) {
    if (!this.trac_info) {
      this.trac_info = JSON.parse(inEvent.stdout);
      this.trac_info.trac = this.$.args.getValue();
    }
    this.show_result(inSender, inEvent);
  },
  update_checksum: function(inSender, inEvent) {
    console.log(inEvent);
    this.trac_info.items[inEvent.name].checksum = inEvent.return_value;
    inEvent.stdout = inEvent.name + " " + this.trac_info.items[inEvent.name].version + " checksum checked.";
    this.show_result(inSender, inEvent);
  },
  show_result: function(inSender, inEvent) {
    console.log("Rendering the results:")
    var newComponent = this.$.main.createComponent({tag: "pre", classes: "enyo-selectable nice-padding", content: inEvent.stdout}, {owner: this});
    newComponent.render();
    if (!this.trac_info._toolbar_rendered) {
      var newComponent1 = this.$.main.createComponent({kind: "onyx.Toolbar", components: [
        {kind: "onyx.Button", content: "Check Versions", ontap: "deploy_gis_check_cc_version"},
        {kind: "onyx.Button", content: "Get Checksum", ontap: "deploy_gis_get_checksum"},
        {kind: "onyx.Button", content: "Deploy", ontap: "deploy_gis_deploy"},
        {kind: "onyx.Button", content: "Check Deploy", ontap: "deploy_gis_check_deploy"},
        {kind: "onyx.Button", content: "Close Trac", ontap: "deploy_gis_close_trac"},
      ]}, {owner: this});
      newComponent1.render();
      this.trac_info._toolbar_rendered = true;
    }
  },
  process_response: function(inSender, inEvent) {
    console.log(inEvent.data.id);

    var t = this.$.checker.getRequests();
    t.push(inEvent.data.id);
    this.$.checker.setRequests(t);

  },
  deploy_gis_start: function() {
    var postBody = {
      action: "cmd",
      cmd: "casperjs utils/gis_trac.coffee " + this.$.args.getValue(),
    };
    this.$.requester.postBody = postBody;
    this.$.requester.send();
  },
  deploy_gis_check_cc_version: function() {
    this.$.checker.onReady = "check_version_result";

    for (var env in this.trac_info) {
      // console.log(this.trac_info[env].items);
      if (env == 'items') continue;
      for (var item_name in this.trac_info[env]) {
        item = this.trac_info.items[item_name];
        if (!item) continue;

        console.log(item_name);
        console.log(item);

        is_prod = false;
        if (env == 'prd')
          is_prod = true;

        this.$.requester.postBody = {
          action: "nyk_cm_tasks.deploy.gis.check_item_version_in_cc",
          name: item.item,
          itype: item.type,
          version: item.version,
          is_prod: is_prod,
        };

        // this.$.requester.postBody = postBody;
        this.$.requester.send();

      }
    }
  },
  deploy_gis_deploy: function() {
    this.$.checker.onReady = "update_deploy";

    for (var env in this.trac_info) {
      // console.log(this.trac_info[env].items);
      if (env == 'items') continue;
      for (var item_name in this.trac_info[env]) {
        item = this.trac_info.items[item_name];
        if (!item) continue;

        console.log(item_name);
        console.log(item);

        is_prod = false;
        if (env == 'prd')
          is_prod = true;

        postBody = {}
        if (item.type == 'map') {
          postBody.action = "nyk_cm_tasks.deploy.gis.import_map";
          postBody.map_name = item.item;
          postBody.map_deploy_comment = item.version;
        } else if (item.type == "env") {
          postBody.action = "nyk_cm_tasks.deploy.gis.import_resource";
          postBody.res_name = item.item;
        }
        postBody.deploy_env = env;
        // this.$.requester.postBody = {
        //   // action: "nyk_cm_tasks.deploy.gis.import_map",
        //   action: action,
        //   map_name: item.item,
        //   // itype: item.type,
        //   map_deploy_comment: item.version,
        //   deploy_env: env,
        //   // is_prod: is_prod,
        // };

        this.$.requester.postBody = postBody;
        this.$.requester.send();

      }
    }

  },
  deploy_gis_get_checksum: function() {
    this.$.checker.onReady = "update_checksum";

    for (var env in this.trac_info) {
      // console.log(this.trac_info[env].items);
      if (env == 'items') continue;
      for (var item_name in this.trac_info[env]) {
        item = this.trac_info.items[item_name];
        if (!item) continue;

        console.log(item_name);
        console.log(item);

        if (env == 'prd')
          is_prod = 'True';

        this.$.requester.postBody = {
          action: "nyk_cm_tasks.deploy.gis.get_checksum",
          name: item.item,
          itype: item.type,
          is_prod: is_prod,
        };

        // this.$.requester.postBody = postBody;
        this.$.requester.send();

      }
    }
  },
  deploy_gis_check_deploy: function() {
    this.$.checker.onReady = "show_result";

    for (var env in this.trac_info) {
      if (env == 'items') continue;
      for (var item_name in this.trac_info[env]) {
        item = this.trac_info.items[item_name];
        if (!item) continue;

        this.$.requester.postBody = {
          action: "nyk_cm_tasks.deploy.gis.check_deployment",
          name: item.item,
          itype: item.type,
          version: item.version,
          checksum: item.checksum,
          env: env,
          fab_bash: true,
        };

        this.$.requester.send();

      }
    }
  },
  deploy_gis_close_trac: function() {
    this.$.checker.onReady = "result";

    var postBody = {
      action: "cmd",
      cmd: "casperjs utils/gis_trac_close.coffee " + this.trac_info.trac,
    };
    this.$.requester.postBody = postBody;
    this.$.requester.send();
  }
});

enyo.kind({
  name: "navi.ResultChecker",
  kind: "WebService",
  events: {
    onReady: "",
  },
  published: {
    requests: [],
  },
  handlers: {
    onResponse: "checkResponse",
  },
  components: [
    {name: "nTimer", kind: "navi.Timer", onTriggered: "check"},
  ],
  index: 0,
  setRequests: function(requests) {
    this.requests = requests;
    this.requestsChanged();
  },
  requestsChanged: function(inOldValue) {
    if (this.requests.length != 0) {
      this.$.nTimer.start();
    }
  },
  checkResponse: function(inSender, inEvent) {
    var a = inEvent.data;
    if (a.state == "Done") {
      var index = this.requests.indexOf(a.id);
      this.requests.splice(index, 1);
      this.doReady(a);
    }

    if (this.requests.length == 0) {
      this.$.nTimer.stop();
    }
  },
  check: function(inSender, inEvent) {
    if (this.index >= this.requests.length) {
      this.index = 0;
    }

    this.setUrl(this.baseUrl + "/" + this.requests[this.index]);
    this.send();
    this.index += 1;
  }
});

enyo.kind({
  name: "navi.Timer",
  kind: enyo.Component,
  interval: 1500,
  events: {
    onTriggered: "",
  },
  started: false,
  create: function() {
    this.inherited(arguments);
  },
  destory: function() {
    this.stop();
    this.inherited(arguments);
  },
  start: function() {
    if (!this.started) {
      this.job = window.setInterval(enyo.bind(this, "timer"), this.interval);
      this.started = true;
    }
  },
  stop: function() {
    window.clearInterval(this.job);
    this.started = false;
  },
  timer: function() {
    this.doTriggered();
  },
  intervalChanged: function(inOldValue) {
    this.stop();
    this.start();
  }
})
