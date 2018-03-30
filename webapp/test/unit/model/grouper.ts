/*global QUnit*/

import Grouper from "demo/masterdetail/model/grouper";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import jQuery from "jquery.sap.global";

interface This {
  _oResourceModel: ResourceModel;
}

function createResourceModel() {
  return new ResourceModel({
    bundleUrl : [jQuery.sap.getModulePath("demo.masterdetail"), "i18n/i18n.properties"].join("/")
  });
}

QUnit.module("Sorter - Grouping functions", {
  beforeEach(this: This) {
    this._oResourceModel = createResourceModel();
  },
  afterEach(this: This) {
    this._oResourceModel.destroy();
  }
});

function createContextObject(vValue: any) {
  return {
    getProperty() {
      return vValue;
    }
  } as sap.ui.model.Context;
}

QUnit.test("Should group a price lesser equal 20", async function(this: This, assert) {
  // Arrange
  const oContextObject = createContextObject(17.2);
  const resourceBundle = await this._oResourceModel.getResourceBundle();

  // System under test
  const fnGroup = Grouper.groupUnitNumber(resourceBundle);

  // Assert
  const oGrouperReturn = fnGroup(oContextObject);
  assert.strictEqual(oGrouperReturn.key, "LE20", "The key is as expected for a low value");
  assert.strictEqual(oGrouperReturn.text, resourceBundle.getText("masterGroup1Header1"), "The group header is as expected for a low value");
});

QUnit.test("Should group the price", async function(this: This, assert) {
  // Arrange
  const oContextObject = createContextObject(55.5);
  const resourceBundle = await this._oResourceModel.getResourceBundle();

  // System under test
  const fnGroup = Grouper.groupUnitNumber(resourceBundle);

  // Assert
  const oGrouperReturn = fnGroup(oContextObject);
  assert.strictEqual(oGrouperReturn.key, "GT20", "The key is as expected for a high value");
  assert.strictEqual(oGrouperReturn.text, resourceBundle.getText("masterGroup1Header2"), "The group header is as expected for a high value");
});
