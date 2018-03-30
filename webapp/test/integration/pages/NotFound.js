sap.ui.define([
  "sap/ui/test/Opa5",
  "sap/ui/test/actions/Press",
  "sap/ui/test/matchers/PropertyStrictEquals",
  "sap/ui/Device",
  "demo/masterdetail/test/integration/pages/Common"
], function(Opa5, Press, PropertyStrictEquals, Device, Common) {
  "use strict";

  var sNotFoundPageId = "page",
    sNotFoundView = "NotFound",
    sDetailNotFoundView = "DetailObjectNotFound";

  Opa5.createPageObjects({
    onTheNotFoundPage : {
      baseClass : Common,

      actions : {

        iPressTheBackButton(sViewName) {
          return this.waitFor({
            viewName : sViewName,
            controlType : "sap.m.Button",
            matchers: new PropertyStrictEquals({name : "type", value : (Device.os.android ? "Up" : "Back")}),
            actions : new Press(),
            errorMessage : "Did not find the back button"
          });
        }

      },

      assertions : {

        iShouldSeeTheNotFoundGeneralPage(sPageId, sPageViewName) {
          return this.waitFor({
            controlType : "sap.m.MessagePage",
            viewName : sPageViewName,
            success() {
              Opa5.assert.ok(true, "Shows the message page");
            },
            errorMessage : "Did not reach the empty page"
          });
        },

        iShouldSeeTheNotFoundPage() {
          return this.iShouldSeeTheNotFoundGeneralPage(sNotFoundPageId, sNotFoundView);
        },

        iShouldSeeTheObjectNotFoundPage() {
          return this.iShouldSeeTheNotFoundGeneralPage(sNotFoundPageId, sDetailNotFoundView);
        },

        theNotFoundPageShouldSayResourceNotFound() {
          return this.waitFor({
            id : sNotFoundPageId,
            viewName : sNotFoundView,
            success(oPage) {
              Opa5.assert.strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("notFoundTitle"), "The not found text is shown as title");
              Opa5.assert.strictEqual(oPage.getText(), oPage.getModel("i18n").getProperty("notFoundText"), "The resource not found text is shown");
            },
            errorMessage : "Did not display the resource not found text"
          });
        },

        theNotFoundPageShouldSayObjectNotFound() {
          return this.waitFor({
            id : sNotFoundPageId,
            viewName : sDetailNotFoundView,
            success(oPage) {
              Opa5.assert.strictEqual(oPage.getTitle(), oPage.getModel("i18n").getProperty("detailTitle"), "The object text is shown as title");
              Opa5.assert.strictEqual(oPage.getText(), oPage.getModel("i18n").getProperty("noObjectFoundText"), "The object not found text is shown");
            },
            errorMessage : "Did not display the object not found text"
          });
        }

      }

    }

  });

});
