
import Opa5 from "sap/ui/test/Opa5";
import Press from "sap/ui/test/actions/Press";
import Common from "demo/masterdetail/test/integration/pages/Common";
// import AggregationLengthEquals from "sap/ui/test/matchers/AggregationLengthEquals";
import AggregationFilled from "sap/ui/test/matchers/AggregationFilled";
import PropertyStrictEquals from "sap/ui/test/matchers/PropertyStrictEquals";

const sViewName = "Detail";

interface CreatedOpa5 extends Common {
  iShouldBeOnTheObjectNPage(iIndex: number): JQueryPromise<any>;
}

Opa5.createPageObjects({
  onTheDetailPage : {
    baseClass : Common,

    actions : {

      iPressTheBackButton(this: Common) {
        return this.waitFor({
          id : "page",
          viewName : sViewName,
          actions: new Press(),
          errorMessage : "Did not find the nav button on detail page"
        });
      }

    },

    assertions : {

      iShouldSeeTheBusyIndicator(this: Common) {
        return this.waitFor({
          id : "page",
          viewName : sViewName,
          success(oPage: sap.m.Page) {
            // we set the view busy, so we need to query the parent of the app
            Opa5.assert.ok(oPage.getBusy(), "The detail view is busy");
          },
          errorMessage : "The detail view is not busy."
        });
      },

      iShouldSeeNoBusyIndicator(this: Common) {
        return this.waitFor({
          id : "page",
          viewName : sViewName,
          matchers(oPage: sap.ui.core.Control) {
            return !oPage.getBusy();
          },
          success(oPage: sap.ui.core.Control) {
            // we set the view busy, so we need to query the parent of the app
            Opa5.assert.ok(!oPage.getBusy(), "The detail view is not busy");
          },
          errorMessage : "The detail view is busy."
        });
      },

      theObjectPageShowsTheFirstObject(this: CreatedOpa5) {
        return this.iShouldBeOnTheObjectNPage(0);
      },

      iShouldBeOnTheObjectNPage(this: Common, iObjIndex: number) {
        return this.waitFor(this.createAWaitForAnEntitySet({
          entitySet : "Objects",
          success(aEntitySet: Entity[]) {
            const sItemName = aEntitySet[iObjIndex].Name;

            this.waitFor({
              controlType : "sap.m.ObjectHeader",
              viewName : sViewName,
              matchers : new PropertyStrictEquals({name : "title", value: aEntitySet[iObjIndex].Name}),
              success() {
                Opa5.assert.ok(true, "was on the first object page with the name " + sItemName);
              },
              errorMessage : "First object is not shown"
            });
          }
        }));
      },

      iShouldSeeTheRememberedObject(this: Common) {
        return this.waitFor({
          success() {
            const sBindingPath = this.getContext().currentItem.bindingPath;
            this._waitForPageBindingPath(sBindingPath);
          }
        });
      },

      _waitForPageBindingPath(this: Common, sBindingPath: string) {
        return this.waitFor({
          id : "page",
          viewName : sViewName,
          matchers(oPage: sap.m.Page) {
            return oPage.getBindingContext() && oPage.getBindingContext().getPath() === sBindingPath;
          },
          success(oPage: sap.m.Page) {
            Opa5.assert.strictEqual(oPage.getBindingContext().getPath(), sBindingPath, "was on the remembered detail page");
          },
          errorMessage : "Remembered object " + sBindingPath + " is not shown"
        });
      },

      iShouldSeeTheObjectLineItemsList(this: Common) {
        return this.waitFor({
          id : "lineItemsList",
          viewName : sViewName,
          success(oList: sap.ui.core.Control) {
            Opa5.assert.ok(oList, "Found the line items list.");
          }
        });
      },

      theLineItemsListShouldHaveTheCorrectNumberOfItems(this: Common) {
        return this.waitFor(this.createAWaitForAnEntitySet({
          entitySet : "LineItems",
          success(aEntitySet: Entity[]) {

            return this.waitFor({
              id : "lineItemsList",
              viewName : sViewName,
              matchers : new AggregationFilled({name : "items"}),
              check(oList: sap.m.Table) {

                const sObjectID = oList.getBindingContext().getProperty("ObjectID");

                const iLength = aEntitySet
                  .filter((oLineItem) => oLineItem.ObjectID === sObjectID)
                  .length;

                return oList.getItems().length === iLength;
              },
              success() {
                Opa5.assert.ok(true, "The list has the correct number of items");
              },
              errorMessage : "The list does not have the correct number of items."
            });
          }
        }));
      },

      theDetailViewShouldContainOnlyFormattedUnitNumbers(this: Common) {
        return this.theUnitNumbersShouldHaveTwoDecimals("sap.m.ObjectHeader",
          sViewName,
          "Object header are properly formatted",
          "Object view has no entries which can be checked for their formatting");
      },

      theLineItemsTableShouldContainOnlyFormattedUnitNumbers(this: Common) {
        return this.theUnitNumbersShouldHaveTwoDecimals("sap.m.ObjectNumber",
          sViewName,
          "Object numbers are properly formatted",
          "LineItems Table has no entries which can be checked for their formatting");
      },

      theLineItemsHeaderShouldDisplayTheAmountOfEntries(this: Common) {
        return this.waitFor({
          id : "lineItemsList",
          viewName : sViewName,
          matchers : new AggregationFilled({name : "items"}),
          success(oList: sap.m.List) {
            const iNumberOfItems = oList.getItems().length;
            return this.waitFor({
              id : "lineItemsHeader",
              viewName : sViewName,
              matchers : new PropertyStrictEquals({name: "text", value: "Line Items (" + iNumberOfItems + ")"}),
              success() {
                Opa5.assert.ok(true, "The line item list displays " + iNumberOfItems + " items");
              },
              errorMessage : "The line item list does not display " + iNumberOfItems + " items."
            });
          }
        });
      },

      iShouldSeeTheShareEmailButton(this: Common) {
        return this.waitFor({
          id : "shareEmail",
          viewName : sViewName,
          success() {
            Opa5.assert.ok(true, "The E-Mail button is visible");
          },
          errorMessage : "The E-Mail button was not found"
        });
      }
    }

  }

});
