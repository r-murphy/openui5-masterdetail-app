/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

sap.ui.require([
  "sap/ui/test/Opa5",
  "demo/masterdetail/test/integration/pages/Common",
  "sap/ui/test/opaQunit",
  "demo/masterdetail/test/integration/pages/App",
  "demo/masterdetail/test/integration/pages/Browser",
  "demo/masterdetail/test/integration/pages/Master",
  "demo/masterdetail/test/integration/pages/Detail",
  "demo/masterdetail/test/integration/pages/NotFound"
], function(Opa5, Common) {
  "use strict";
  Opa5.extendConfig({
    arrangements: new Common(),
    viewNamespace: "demo.masterdetail.view."
  });

  sap.ui.require([
    "demo/masterdetail/test/integration/NavigationJourneyPhone",
    "demo/masterdetail/test/integration/NotFoundJourneyPhone",
    "demo/masterdetail/test/integration/BusyJourneyPhone"
  ], function() {
    QUnit.start();
  });
});
