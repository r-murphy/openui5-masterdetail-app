
import BaseObject from "sap/ui/base/Object";
import GroupHeaderListItem from "sap/m/GroupHeaderListItem";

type EventHandler = (evt: sap.ui.base.Event) => void;

export interface WhenListLoadingIsDoneResult {
  list: sap.m.List;
  firstListitem: any;
}

export interface WhenListLoadingIsDoneRejection {
  list: sap.m.List;
  error: boolean;
}

/**
 * Provides a convenience API for selecting list items.
 * All the functions will wait until the initial load of the a List passed to the instance by the setBoundMasterList function.
 * @name demo.masterdetail.controller.ListSelector
 */
export default class ListSelector extends BaseObject {

  private _oList!: sap.m.List;

  private _fnResolveListHasBeenSet?: Function;

  private readonly _oWhenListHasBeenSet = new Promise<sap.m.List>((fnResolveListHasBeenSet) => {
    this._fnResolveListHasBeenSet = fnResolveListHasBeenSet;
  });

  // This promise needs to be created in the constructor, since it is allowed to
  // invoke selectItem functions before calling setBoundMasterList
  public oWhenListLoadingIsDone = new Promise<WhenListLoadingIsDoneResult>((fnResolve, fnReject) => {
    // Used to wait until the setBound masterList function is invoked
    this._oWhenListHasBeenSet
      .then((oList: sap.m.List) => {
        oList.getBinding("items").attachEventOnce("dataReceived", (oData: sap.ui.base.Event) => {
          if (!oData.getParameter("data")) {
            fnReject({
              list : oList,
              error : true
            });
          }
          const oFirstListItem = this.getFirstListItem();
          if (oFirstListItem) {
            // Have to make sure that first list Item is selected
            // and a select event is triggered. Like that, the corresponding
            // detail page is loaded automatically
            fnResolve({
              list : oList,
              firstListitem : oFirstListItem
            });
          } else {
            // No items in the list
            fnReject({
              list : oList,
              error : false
            });
          }
        }
      );
    });
  });

  /**
   * A bound list should be passed in here. Should be done, before the list has received its initial data from the server.
   * May only be invoked once per ListSelector instance.
   * @param {sap.m.List} oList The list all the select functions will be invoked on.
   * @public
   */
  setBoundMasterList(oList: sap.m.List) {
    this._oList = oList;
    this._fnResolveListHasBeenSet!(oList);
  }

  /**
   * Finds the first list item
   * @return {sap.m.ListItem|null} The first item that is not a group header
   * @public
   */
  getFirstListItem() {
    const aItems = this._oList.getItems();
    return aItems.find(item => !(item instanceof GroupHeaderListItem));
  }

  /**
   * Tries to select and scroll to a list item with a matching binding context. If there are no items matching the binding context or the ListMode is none,
   * no selection/scrolling will happen
   * @param {string} sBindingPath the binding path matching the binding path of a list item
   * @public
   */
  selectAListItem(sBindingPath: string) {
    this.oWhenListLoadingIsDone.then(
      () => {
        const oList = this._oList;
        let oSelectedItem;

        if (oList.getMode() === sap.m.ListMode.None) {
          return;
        }

        oSelectedItem = oList.getSelectedItem();

        // skip update if the current selection is already matching the object path
        if (oSelectedItem && oSelectedItem.getBindingContext().getPath() === sBindingPath) {
          return;
        }

        oList.getItems().some((oItem) => {
          if (oItem.getBindingContext() && oItem.getBindingContext().getPath() === sBindingPath) {
            oList.setSelectedItem(oItem);
            return true;
          }
          else {
            return false;
          }
        });
      },
      () => {
        jQuery.sap.log.warning("Could not select the list item with the path" + sBindingPath + " because the list encountered an error or had no items");
      }
    );
  }

  /* =========================================================== */
  /* Convenience Functions for List Selection Change Event       */
  /* =========================================================== */

  /**
   * Attaches a listener and listener function to the ListSelector's bound master list. By using
   * a promise, the listener is added, even if the list is not available when 'attachListSelectionChange'
   * is called.
   * @param {function} fnFunction the function to be executed when the list fires a selection change event
   * @param {function} oListener the listener object
   * @return {demo.masterdetail.model.ListSelector} the list selector object for method chaining
   * @public
   */
  attachListSelectionChange(fnFunction: EventHandler, oListener?: any) {
    this._oWhenListHasBeenSet.then(() => {
      this._oList.attachSelectionChange(fnFunction, oListener);
    });
    return this;
  }

  /**
   * Detaches a listener and listener function from the ListSelector's bound master list. By using
   * a promise, the listener is removed, even if the list is not available when 'detachListSelectionChange'
   * is called.
   * @param {function} fnFunction the function to be executed when the list fires a selection change event
   * @param {function} oListener the listener object
   * @return {demo.masterdetail.model.ListSelector} the list selector object for method chaining
   * @public
   */
  detachListSelectionChange(fnFunction: EventHandler, oListener: any) {
    this._oWhenListHasBeenSet.then(() => {
      this._oList.detachSelectionChange(fnFunction, oListener);
    });
    return this;
  }

  /**
   * Removes all selections from master list.
   * Does not trigger 'selectionChange' event on master list, though.
   * @public
   */
  clearMasterListSelection() {
    // Use promise to make sure that 'this._oList' is available
    this._oWhenListHasBeenSet.then(() => {
      this._oList.removeSelections(true);
    });
  }

}
