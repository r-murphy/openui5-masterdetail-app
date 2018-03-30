/*global history */

import JSONModel from "sap/ui/model/json/JSONModel";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import GroupHeaderListItem from "sap/m/GroupHeaderListItem";
import Device from "sap/ui/Device";

import BaseController from "demo/masterdetail/controller/BaseController";
import formatter from "demo/masterdetail/model/formatter";
import grouper from "demo/masterdetail/model/grouper";
import GroupSortState from "demo/masterdetail/model/GroupSortState";

// type imports (erased by tsc)
import Component from "demo/masterdetail/Component";
import { Group } from "demo/masterdetail/model/GroupSortState";

// type aliases
type UI5Event = sap.ui.base.Event;
type UI5Filter = sap.ui.model.Filter;

interface SemanticGroupEvent extends sap.ui.base.Event {
  getSource(): any; // sap.m.semantic.MasterPage;
}

/**
 * @name demo.masterdetail.controller.Master
 * @controller
 */
export default class MasterController extends BaseController {

  static formatter = formatter;

  private _oList!: sap.m.List;
  private _oGroupSortState!: GroupSortState;
  private _oViewSettingsDialog?: sap.m.ViewSettingsDialog;

  private readonly _oViewModel = this._createViewModel();

  private readonly _oListFilterState = {
    aFilter : [] as UI5Filter[],
    aSearch : [] as UI5Filter[]
  };

  /* =========================================================== */
  /* lifecycle methods                                           */
  /* =========================================================== */

  /**
   * Called when the master list controller is instantiated. It sets up the event handling for the master/detail communication and other lifecycle tasks.
   * @public
   */
  onInit() {
    // Control state model
    const oList = this.byId("list") as sap.m.List;

    // Put down master list's original value for busy indicator delay,
    // so it can be restored later on. Busy handling on the master list is
    // taken care of by the master list itself.
    const iOriginalBusyDelay = oList.getBusyIndicatorDelay();

    this._oGroupSortState = new GroupSortState(this._oViewModel, grouper.groupUnitNumber(this.getResourceBundle()));

    this._oList = oList;

    this.setModel(this._oViewModel, "masterView");

    // Make sure, busy indication is showing immediately so there is no
    // break after the busy indication for loading the view's meta data is
    // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
    oList.attachEventOnce("updateFinished", () => {
      // Restore original busy indicator delay for the list
      this._oViewModel.setProperty("/delay", iOriginalBusyDelay);
    });

    this.getView().addEventDelegate({
      onBeforeFirstShow: () => {
        (this.getOwnerComponent() as Component).oListSelector.setBoundMasterList(oList);
      }
    });

    this.getRouter().getRoute("master").attachPatternMatched(this._onMasterMatched, this);
    this.getRouter().attachBypassed(this.onBypassed, this);
  }

  /* =========================================================== */
  /* event handlers                                              */
  /* =========================================================== */

  /**
   * After list data is available, this handler method updates the
   * master list counter and hides the pull to refresh control, if
   * necessary.
   * @param {sap.ui.base.Event} oEvent the update finished event
   * @public
   */
  onUpdateFinished(oEvent: UI5Event) {
    // update the master list object counter after new data is loaded
    this._updateListItemCount(oEvent.getParameter("total"));
    // hide pull to refresh if necessary
    (this.byId("pullToRefresh") as sap.m.PullToRefresh).hide();
  }

  /**
   * Event handler for the master search field. Applies current
   * filter value and triggers a new search. If the search field's
   * 'refresh' button has been pressed, no new search is triggered
   * and the list binding is refresh instead.
   * @param {sap.ui.base.Event} oEvent the search event
   * @public
   */
  onSearch(oEvent: UI5Event) {
    if (oEvent.getParameters().refreshButtonPressed) {
      // Search field's 'refresh' button has been pressed.
      // This is visible if you select any master list item.
      // In this case no new search is triggered, we only
      // refresh the list binding.
      this.onRefresh();
      return;
    }

    const sQuery = oEvent.getParameter("query") as (undefined | string);

    if (sQuery) {
      this._oListFilterState.aSearch = [new Filter("Name", FilterOperator.Contains, sQuery)];
    } else {
      this._oListFilterState.aSearch = [];
    }
    this._applyFilterSearch();

  }

  /**
   * Event handler for refresh event. Keeps filter, sort
   * and group settings and refreshes the list binding.
   * @public
   */
  onRefresh() {
    this._oList.getBinding("items").refresh();
  }

  /**
   * Event handler for the sorter selection.
   * @param {sap.ui.base.Event} oEvent the select event
   * @public
   */
  onSort(oEvent: SemanticGroupEvent) {
    const sKey = oEvent.getSource().getSelectedItem().getKey();
    const aSorters = this._oGroupSortState.sort(sKey);
    this._applyGroupSort(aSorters);
  }

  /**
   * Event handler for the grouper selection.
   * @param {sap.ui.base.Event} oEvent the search field event
   * @public
   */
  onGroup(oEvent: SemanticGroupEvent) {
    const sKey = oEvent.getSource().getSelectedItem().getKey();
    const aSorters = this._oGroupSortState.group(sKey);
    this._applyGroupSort(aSorters);
  }

  // private getSelectedKeyFromEvent(oEvent: ListEvent) {
  //   return (oEvent.getSource().getSelectedItem() as sap.m.ObjectListItem).getKey();
  // }

  /**
   * Event handler for the filter button to open the ViewSettingsDialog.
   * which is used to add or remove filters to the master list. This
   * handler method is also called when the filter bar is pressed,
   * which is added to the beginning of the master list when a filter is applied.
   * @public
   */
  onOpenViewSettings() {
    if (!this._oViewSettingsDialog) {
      this._oViewSettingsDialog = sap.ui.xmlfragment("demo.masterdetail.view.ViewSettingsDialog", this) as any as sap.m.ViewSettingsDialog;
      this.getView().addDependent(this._oViewSettingsDialog);
      // forward compact/cozy style into Dialog
      this._oViewSettingsDialog.addStyleClass(this.getThisComponent().getContentDensityClass());
    }
    this._oViewSettingsDialog.open();
  }

  /**
   * Event handler called when ViewSettingsDialog has been confirmed, i.e.
   * has been closed with 'OK'. In the case, the currently chosen filters
   * are applied to the master list, which can also mean that the currently
   * applied filters are removed from the master list, in case the filter
   * settings are removed in the ViewSettingsDialog.
   * @param {sap.ui.base.Event} oEvent the confirm event
   * @public
   */
  onConfirmViewSettingsDialog(oEvent: UI5Event) {
    const aFilterItems: sap.m.ViewSettingsFilterItem[] = oEvent.getParameters().filterItems;
    const aFilters: Filter[] = [];
    const aCaptions: string[] = [];

    // update filter state:
    // combine the filter array and the filter string
    aFilterItems.forEach((oItem) => {
      switch (oItem.getKey()) {
        case "Filter1" :
          aFilters.push(new Filter("UnitNumber", FilterOperator.LE, 100));
          break;
        case "Filter2" :
          aFilters.push(new Filter("UnitNumber", FilterOperator.GT, 100));
          break;
        default :
          break;
      }
      aCaptions.push(oItem.getText());
    });

    this._oListFilterState.aFilter = aFilters;
    this._updateFilterBar(aCaptions.join(", "));
    this._applyFilterSearch();
  }

  /**
   * Event handler for the list selection event
   * @param {sap.ui.base.Event} oEvent the list selectionChange event
   * @public
   */
  onSelectionChange(oEvent: UI5Event) {
    const oList = oEvent.getSource() as sap.m.List;
    const bSelected = oEvent.getParameter("selected");

    // get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
    if (!(oList.getMode() === sap.m.ListMode.MultiSelect && !bSelected)) {
      this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
    }
  }

  /**
   * Event handler for the bypassed event, which is fired when no routing pattern matched.
   * If there was an object selected in the master list, that selection is removed.
   * @public
   */
  onBypassed() {
    this._oList.removeSelections(true);
  }

  /**
   * Used to create GroupHeaders with non-capitalized caption.
   * These headers are inserted into the master list to
   * group the master list's items.
   * @param {Object} oGroup group whose text is to be displayed
   * @public
   * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
   */
  createGroupHeader(oGroup: Group) {
    return new GroupHeaderListItem({
      title : oGroup.text,
      upperCase : false
    });
  }

  /**
   * Event handler for navigating back.
   * We navigate back in the browser history
   * @public
   */
  onNavBack() {
    history.go(-1);
  }

  /* =========================================================== */
  /* begin: internal methods                                     */
  /* =========================================================== */

  private _createViewModel() {
    return new JSONModel({
      isFilterBarVisible: false,
      filterBarLabel: "",
      delay: 0,
      title: this.getResourceBundle().getText("masterTitleCount", [0]),
      noDataText: this.getResourceBundle().getText("masterListNoDataText"),
      sortBy: "Name",
      groupBy: "None"
    });
  }

  /**
   * If the master route was hit (empty hash) we have to set
   * the hash to to the first item in the list as soon as the
   * listLoading is done and the first item in the list is known
   * @private
   */
  private _onMasterMatched() {
    this.getThisComponent().oListSelector.oWhenListLoadingIsDone.then(
      (mParams: any) => { // TODO define the type in oWhenListLoadingIsDone
        if (mParams.list.getMode() === "None") {
          return;
        }
        const sObjectId = mParams.firstListitem.getBindingContext().getProperty("ObjectID");
        this.getRouter().navTo("object", {objectId : sObjectId}, true);
      },
      (mParams) => { // TODO use a real error
        if (mParams.error) {
          return;
        }
        this.getRouter().getTargets().display("detailNoObjectsAvailable");
      }
    );
  }

  /**
   * Shows the selected item on the detail page
   * On phones a additional history entry is created
   * @param {sap.m.ObjectListItem} oItem selected Item
   * @private
   */
  private _showDetail(oItem: sap.m.ObjectListItem) {
    const bReplace = !Device.system.phone;
    this.getRouter().navTo("object", {
      objectId : oItem.getBindingContext().getProperty("ObjectID")
    }, bReplace);
  }

  /**
   * Sets the item count on the master list header
   * @param {integer} iTotalItems the total number of items in the list
   * @private
   */
  private _updateListItemCount(iTotalItems: number) {
    let sTitle;
    // only update the counter if the length is final
    if (this._getListItemsBinding().isLengthFinal()) {
      sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
      this._oViewModel.setProperty("/title", sTitle);
    }
  }

  /**
   * Internal helper method to apply both filter and search state together on the list binding
   * @private
   */
  private _applyFilterSearch() {
    const aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter);
    const oViewModel = this._getViewModel();
    this._getListItemsBinding().filter(aFilters, sap.ui.model.FilterType.Application);
    // changes the noDataText of the list in case there are no filter results
    if (aFilters.length !== 0) {
      oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
    } else if (this._oListFilterState.aSearch.length > 0) {
      // only reset the no data text to default when no new search was triggered
      oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
    }
  }

  /**
   * Internal helper method to apply both group and sort state together on the list binding
   * @param {sap.ui.model.Sorter[]} aSorters an array of sorters
   * @private
   */
  private _applyGroupSort(aSorters: sap.ui.model.Filter[]) {
    this._getListItemsBinding().sort(aSorters);
  }

  /**
   * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
   * @param {string} sFilterBarText the selected filter value
   * @private
   */
  private _updateFilterBar(sFilterBarText: string) {
    const oViewModel = this._getViewModel();
    oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
    oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
  }

  private _getViewModel() {
    return this.getModel("masterView") as sap.ui.model.json.JSONModel;
  }

  private _getListItemsBinding() {
    return this._oList.getBinding("items") as sap.ui.model.ListBinding;
  }

}
