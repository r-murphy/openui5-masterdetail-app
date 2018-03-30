/*global QUnit*/

import GroupSortState from "demo/masterdetail/model/GroupSortState";
import JSONModel from "sap/ui/model/json/JSONModel";

interface This {
  oModel: JSONModel;
  oGroupSortState: GroupSortState;
}

QUnit.module("GroupSortState - grouping and sorting", {
  beforeEach(this: This) {
    this.oModel = new JSONModel({});
    // System under test
    this.oGroupSortState = new GroupSortState(this.oModel, (() => undefined));
  }
});

QUnit.test("Should always return a sorter when sorting", function(this: This, assert) {
  // Act + Assert
  assert.strictEqual(this.oGroupSortState.sort("UnitNumber").length, 1, "The sorting by UnitNumber returned a sorter");
  assert.strictEqual(this.oGroupSortState.sort("Name").length, 1, "The sorting by Name returned a sorter");
});

QUnit.test("Should return a grouper when grouping", function(this: This, assert) {
  // Act + Assert
  assert.strictEqual(this.oGroupSortState.group("UnitNumber").length, 1, "The group by UnitNumber returned a sorter");
  assert.strictEqual(this.oGroupSortState.group("None").length, 0, "The sorting by None returned no sorter");
});

QUnit.test("Should set the sorting to UnitNumber if the user groups by UnitNumber", function(this: This, assert) {
  // Act + Assert
  this.oGroupSortState.group("UnitNumber");
  assert.strictEqual(this.oModel.getProperty("/sortBy"), "UnitNumber", "The sorting is the same as the grouping");
});

QUnit.test("Should set the grouping to None if the user sorts by Name and there was a grouping before", function(this: This, assert) {
  // Arrange
  this.oModel.setProperty("/groupBy", "UnitNumber");

  this.oGroupSortState.sort("Name");

  // Assert
  assert.strictEqual(this.oModel.getProperty("/groupBy"), "None", "The grouping got reset");
});
