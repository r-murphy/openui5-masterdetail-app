
import JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "demo/masterdetail/controller/BaseController";

/**
 * @name demo.masterdetail.controller.App
 * @controller
 */
export default class AppController extends BaseController {

  onInit() {
    const oListSelector = this.getThisComponent().oListSelector;
    const iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

    const oViewModel = new JSONModel({
      busy : true,
      delay : 0
    });
    this.setModel(oViewModel, "appView");

    this.getThisComponent().getModel().metadataLoaded()
      .then(() => {
        oViewModel.setProperty("/busy", false);
        oViewModel.setProperty("/delay", iOriginalBusyDelay);
      });

    // Makes sure that master view is hidden in split app
    // after a new list entry has been selected.
    oListSelector.attachListSelectionChange(() => {
      (this.byId("idAppControl") as sap.m.SplitApp).hideMaster();
    });

    // apply content density mode to root view
    this.getView().addStyleClass(this.getThisComponent().getContentDensityClass());
  }

}
