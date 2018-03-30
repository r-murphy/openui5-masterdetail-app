/*global QUnit*/

jQuery.sap.require("sap.ui.qunit.qunit-css");
jQuery.sap.require("sap.ui.thirdparty.qunit");
jQuery.sap.require("sap.ui.qunit.qunit-junit");
QUnit.config.autostart = false;

// We cannot provide stable mock data out of the template.
// If you introduce mock data, by adding .json files in your webapp/localService/mockdata folder you have to provide the following minimum data:
// * At least 3 Objects in the list
// * All 3 Objects have at least one LineItems

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
    "demo/masterdetail/test/integration/MasterJourney",
    "demo/masterdetail/test/integration/NavigationJourney",
    "demo/masterdetail/test/integration/NotFoundJourney"
  ], function() {
    QUnit.start();
  });
});
