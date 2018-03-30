/*global QUnit,sinon*/

import AppController from "demo/masterdetail/controller/App.controller";
import SplitApp from "sap/m/SplitApp";
import Control from "sap/ui/core/Control";
import JSONModel from "sap/ui/model/json/JSONModel";
import "sap/ui/thirdparty/sinon";
import "sap/ui/thirdparty/sinon-qunit";

import Component from "webapp/Component";

declare var sinon: sinon.SinonStatic;

QUnit.module("AppController - Hide master");

QUnit.test("Should hide the master of a SplitApp when selection in the list changes", function(this: any, assert) {
  // Arrange
  const oViewStub = new Control();
  const oODataModelStub = new JSONModel() as any;
  const oComponentStub = new Control() as any as Component;
  const oSplitApp = new SplitApp();
  const fnHideMasterSpy = sinon.spy(oSplitApp,"hideMaster");
  let fnOnSelectionChange: Function | undefined;

  (<any>oComponentStub).oListSelector = {
    attachListSelectionChange(fnFunctionToCall: Function, oListener?: any) {
      fnOnSelectionChange = fnFunctionToCall.bind(oListener);
    }
  };

  oODataModelStub.metadataLoaded = () => ({ then: jQuery.noop });
  oComponentStub.setModel(oODataModelStub);
  oComponentStub.getContentDensityClass = () => "";

  // System under Test
  const oAppController = new AppController();

  this.stub(oAppController, "byId").withArgs("idAppControl").returns(oSplitApp);
  this.stub(oAppController, "getView").returns(oViewStub);
  this.stub(oAppController, "getOwnerComponent").returns(oComponentStub);

  // Act
  oAppController.onInit();
  assert.ok(fnOnSelectionChange, "Did register to the change event of the ListSelector");
  // Simulate the event of the list
  fnOnSelectionChange!();

  // Assert
  assert.strictEqual(fnHideMasterSpy.callCount, 1, "Did hide the master");
});
