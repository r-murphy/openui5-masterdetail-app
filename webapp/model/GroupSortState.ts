
import BaseObject from "sap/ui/base/Object";
import Sorter from "sap/ui/model/Sorter";
import JSONModel from "sap/ui/model/json//JSONModel";

export interface Group {
  key: string;
  text: any;
}

type GroupFunction = (oContext: any) => Group | undefined;

/**
 * @name demo.masterdetail.model.GroupSortState
 */
export default class GroupSortState extends BaseObject {

  private readonly _oViewModel: JSONModel;
  private readonly _fnGroupFunction: GroupFunction;

  /**
   * Creates sorters and groupers for the master list.
   * Since grouping also means sorting, this class modifies the viewmodel.
   * If a user groups by a field, and there is a corresponding sort option, the option will be chosen.
   * If a user ungroups, the sorting will be reset to the default sorting.
   * @class
   * @public
   * @param {sap.ui.model.json.JSONModel} oViewModel the model of the current view
   * @param {function} fnGroupFunction the grouping function to be applied
   * @alias demo.masterdetail.model.GroupSortState
   */
  constructor(oViewModel: JSONModel, fnGroupFunction: GroupFunction) {
    super();
    this._oViewModel = oViewModel;
    this._fnGroupFunction = fnGroupFunction;
  }

  /**
   * Sorts by Name, or by UnitNumber
   *
   * @param {string} sKey - the key of the field used for grouping
   * @returns {sap.ui.model.Sorter[]} an array of sorters
   */
  sort(sKey: string) {
    const sGroupedBy = this._oViewModel.getProperty("/groupBy");

    if (sGroupedBy !== "None") {
      // If the list is grouped, remove the grouping since the user wants to sort by something different
      // Grouping only works if the list is primary sorted by the grouping - the first sorter contains a grouper function
      this._oViewModel.setProperty("/groupBy", "None");
    }

    return [new Sorter(sKey, false)];
  }

  /**
   * Groups by UnitNumber, or resets the grouping for the key "None"
   *
   * @param {string} sKey - the key of the field used for grouping
   * @returns {sap.ui.model.Sorter[]} an array of sorters
   */
  group(sKey: string) {
    const aSorters: Sorter[] = [];

    if (sKey === "UnitNumber") {
      // Grouping means sorting so we set the select to the same Entity used for grouping
      this._oViewModel.setProperty("/sortBy", "UnitNumber");

      aSorters.push(
        new Sorter("UnitNumber", false,
        this._fnGroupFunction.bind(this))
      );
    } else if (sKey === "None") {
      // select the default sorting again
      this._oViewModel.setProperty("/sortBy", "Name");
    }

    return aSorters;
  }

}
