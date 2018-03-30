
import Opa5 from "sap/ui/test/Opa5";
import Common from "demo/masterdetail/test/integration/pages/Common";
import PropertyStrictEquals from "sap/ui/test/matchers/PropertyStrictEquals";

const sViewName = "App";
const sAppControl = "idAppControl";

Opa5.createPageObjects({
  onTheAppPage : {
    baseClass : Common,

    actions : {

      iWaitUntilTheBusyIndicatorIsGone(this: Opa5) {
        return this.waitFor({
          id : sAppControl,
          viewName : sViewName,
          // inline-matcher directly as function
          matchers(oRootView: sap.ui.core.mvc.View) {
            // we set the view busy, so we need to query the parent of the app
            return oRootView.getParent().getBusy() === false;
          },
          errorMessage : "The app is still busy."
        });
      }

    },

    assertions : {

      iShouldSeeTheBusyIndicator(this: Opa5) {
        return this.waitFor({
          id : sAppControl,
          viewName : sViewName,
          success(oRootView: sap.ui.core.mvc.View) {
            // we set the view busy, so we need to query the parent of the app
            Opa5.assert.ok(oRootView.getParent().getBusy(), "The app is busy"); // TODO fix Opa5 type
          },
          errorMessage : "The app is not busy."
        });
      },

      iShouldSeeTheMessageBox(this: Opa5) {
        return this.waitFor({
          searchOpenDialogs: true,
          controlType: "sap.m.Dialog",
          matchers : new PropertyStrictEquals({ name: "type", value: "Message"}),
          success() {
            Opa5.assert.ok(true, "The correct MessageBox was shown"); // TODO fix Opa5 type
          }
        });
      }

    }

  }

});
