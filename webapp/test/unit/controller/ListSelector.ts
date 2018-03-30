
import ListSelector, { WhenListLoadingIsDoneResult } from "demo/masterdetail/controller/ListSelector";
import "sap/ui/thirdparty/sinon";
import "sap/ui/thirdparty/sinon-qunit";
import { SinonQUnit } from "demo/masterdetail/test/types";

declare var sinon: {
  config: sinon.SinonTestConfig;
};

interface ListSelectorModule extends SinonQUnit {
  oListSelector: ListSelector;
}

QUnit.module("Initialization", {
  beforeEach(this: ListSelectorModule) {
    sinon.config.useFakeTimers = false;
    this.oListSelector = new ListSelector();
  },
  afterEach(this: ListSelectorModule) {
    this.oListSelector.destroy();
  }
});

QUnit.test("Should initialize the List loading promise", function(this: ListSelectorModule, assert) {
  // Arrange
  const done = assert.async();
  const fnRejectSpy = this.spy();
  const fnResolveSpy = this.spy();

  // Act
  this.oListSelector.oWhenListLoadingIsDone.then(fnResolveSpy, fnRejectSpy);

  // Assert
  setTimeout(() => {
    assert.strictEqual(fnResolveSpy.callCount, 0, "Did not resolve the promise");
    assert.strictEqual(fnRejectSpy.callCount, 0, "Did not reject the promise");
    done();
  }, 0);
});

QUnit.module("List loading", {
  beforeEach(this: ListSelectorModule) {
    sinon.config.useFakeTimers = false;
    this.oListSelector = new ListSelector();
  },
  afterEach(this: ListSelectorModule) {
    this.oListSelector.destroy();
  }
});

function createListStub(this: ListSelectorModule, bCreateListItem: boolean, sBindingPath: string) {
  const fnGetParameter = () => true;
  const oDataStub = {
    getParameter : fnGetParameter
  };
  const fnAttachEventOnce = (_sEventName: string, fnCallback: Function) => {
    fnCallback(oDataStub);
  };
  const fnGetBinding = this.stub().returns({
    attachEventOnce : fnAttachEventOnce
  });
  const fnAttachEvent = (_sEventName: string, fnCallback: Function, oContext: any) => {
    fnCallback.apply(oContext);
  };
  const oListItemStub = {
    getBindingContext : this.stub().returns({
      getPath : this.stub().returns(sBindingPath)
    })
  };
  const aListItems = [];

  if (bCreateListItem) {
    aListItems.push(oListItemStub);
  }

  return {
    attachEvent : fnAttachEvent,
    attachEventOnce : fnAttachEventOnce,
    getBinding : fnGetBinding,
    getItems : this.stub().returns(aListItems)
  };
}

QUnit.test("Should resolve the list loading promise, if the list has items", function(this: ListSelectorModule, assert) {
  // Arrange
  const done = assert.async();
  const fnRejectSpy = this.spy();
  const fnResolveSpy = (sBindingPath: WhenListLoadingIsDoneResult) => {
    // Assert
    assert.strictEqual(sBindingPath, sBindingPath, "Did pass the binding path");
    assert.strictEqual(fnRejectSpy.callCount, 0, "Did not reject the promise");
    done();
  };

  // Act
  this.oListSelector.oWhenListLoadingIsDone.then(fnResolveSpy, fnRejectSpy);
  this.oListSelector.setBoundMasterList(createListStub.call(this, true, "anything"));
});

QUnit.test("Should reject the list loading promise, if the list has no items", function(this: ListSelectorModule, assert) {
  // Arrange
  const done = assert.async();
  const fnResolveSpy = this.spy();
  const fnRejectSpy = () => {
    // Assert
    assert.strictEqual(fnResolveSpy.callCount, 0, "Did not resolve the promise");
    done();
  };

  // Act
  this.oListSelector.oWhenListLoadingIsDone.then(fnResolveSpy, fnRejectSpy);
  this.oListSelector.setBoundMasterList(createListStub.call(this, false));
});

interface SelectItemInTheListModule extends ListSelectorModule {
  fnAct: Function;
}

QUnit.module("Selecting item in the list", {
  beforeEach(this: SelectItemInTheListModule) {
    sinon.config.useFakeTimers = false;
    this.oListSelector = new ListSelector();
    (<any>this.oListSelector).oWhenListLoadingIsDone = {
      then: (fnAct: Function) => {
        this.fnAct = fnAct;
      }
    };
  },
  afterEach(this: SelectItemInTheListModule) {
    this.oListSelector.destroy();
  }
});

function createStubbedListItem(this: SelectItemInTheListModule, sBindingPath: string) {
  return {
    getBindingContext : this.stub().returns({
      getPath : this.stub().returns(sBindingPath)
    })
  };
}

QUnit.test("Should select an Item of the list when it is loaded and the binding contexts match", function(this: SelectItemInTheListModule, assert) {
  // Arrange
  const sBindingPath = "anything";
  const oListItemToSelect = createStubbedListItem.call(this, sBindingPath);
  const oSelectedListItemStub = createStubbedListItem.call(this, "a different binding path");

  (<any>this.oListSelector)._oList = {
    getMode : this.stub().returns("SingleSelectMaster"),
    getSelectedItem : this.stub().returns(oSelectedListItemStub),
    getItems : this.stub().returns([ oSelectedListItemStub, oListItemToSelect, createListStub.call(this, "yet another list binding") ]),
    setSelectedItem(oItem: any) {
      // Assert
      assert.strictEqual(oItem, oListItemToSelect, "Did select the list item with a matching binding context");
    }
  };

  // Act
  this.oListSelector.selectAListItem(sBindingPath);
  // Resolve list loading
  this.fnAct();
});

QUnit.test("Should not select an Item of the list when it is already selected", function(this: SelectItemInTheListModule, assert) {
  // Arrange
  const sBindingPath = "anything";
  const oSelectedListItemStub = createStubbedListItem.call(this, sBindingPath);

  (<any>this.oListSelector)._oList = {
    getMode:  this.stub().returns("SingleSelectMaster"),
    getSelectedItem : this.stub().returns(oSelectedListItemStub)
  };

  // Act
  this.oListSelector.selectAListItem(sBindingPath);
  // Resolve list loading
  this.fnAct();

  // Assert
  assert.ok(true, "did not fail");
});

QUnit.test("Should not select an item of the list when the list has the selection mode none", function(this: SelectItemInTheListModule, assert) {
  // Arrange
  const sBindingPath = "anything";

  (<any>this.oListSelector)._oList = {
    getMode : this.stub().returns("None")
  };

  // Act
  this.oListSelector.selectAListItem(sBindingPath);
  // Resolve list loading
  this.fnAct();

  // Assert
  assert.ok(true, "did not fail");
});
