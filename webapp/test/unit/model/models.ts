/*global QUnit*/

import models from "demo/masterdetail/model/models";
import "sap/ui/thirdparty/sinon";
import "sap/ui/thirdparty/sinon-qunit";

QUnit.module("createDeviceModel", {
  afterEach(this: any) {
    this.oDeviceModel.destroy();
  }
});

function getIsPhoneTestCase(bIsPhone: boolean) {
  return function(this: any, assert: Assert) {
    // Arrange
    this.stub(sap.ui.Device, "system", { phone : bIsPhone });

    // System under test
    this.oDeviceModel = models.createDeviceModel();

    // Assert
    assert.strictEqual(this.oDeviceModel.getData().system.phone, bIsPhone, "IsPhone property is correct");
  };
}

QUnit.test("Should initialize a device model for desktop", getIsPhoneTestCase(false));

QUnit.test("Should initialize a device model for phone", getIsPhoneTestCase(true));

function getIsTouchTestCase(bIsTouch: boolean) {
  return function(this: any, assert: Assert) {
    // Arrange
    this.stub(sap.ui.Device, "support", { touch : bIsTouch });

    // System under test
    this.oDeviceModel = models.createDeviceModel();

    // Assert
    assert.strictEqual(this.oDeviceModel.getData().support.touch, bIsTouch, "IsTouch property is correct");
  };
}

QUnit.test("Should initialize a device model for non touch devices", getIsTouchTestCase(false));

QUnit.test("Should initialize a device model for touch devices", getIsTouchTestCase(true));

QUnit.test("The binding mode of the device model should be one way", function(this: any, assert) {
  // System under test
  this.oDeviceModel = models.createDeviceModel();

  // Assert
  assert.strictEqual(this.oDeviceModel.getDefaultBindingMode(), "OneWay", "Binding mode is correct");
});
