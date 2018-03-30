
import Controller from "sap/ui/core/mvc/Controller";
import History from "sap/ui/core/routing/History";
import Component from "demo/masterdetail/Component";

/**
 * @name demo.masterdetail.controller.BaseController
 * @controller
 */
export default class BaseController extends Controller {

  /**
   * Convenience typed method
   */
  getThisComponent() {
    return this.getOwnerComponent() as Component;
  }

  /**
   * Convenience method for accessing the router in every controller of the application.
   * @public
   * @returns {sap.ui.core.routing.Router} the router for this component
   */
  getRouter() {
    return this.getThisComponent().getRouter();
  }

  /**
   * Convenience method for getting the view model by name in every controller of the application.
   * @public
   * @param {string} sName the model name
   * @returns {sap.ui.model.Model} the model instance
   */
  getModel(sName: string) {
    return this.getView().getModel(sName);
  }

  /**
   * Convenience method for setting the view model in every controller of the application.
   * @public
   * @param {sap.ui.model.Model} oModel the model instance
   * @param {string} sName the model name
   * @returns {sap.ui.core.mvc.View} the view instance
   */
  setModel(oModel: sap.ui.model.Model, sName: string) {
    return this.getView().setModel(oModel, sName) as sap.ui.core.mvc.View;
  }

  /**
   * Convenience method for getting the resource bundle.
   * @public
   * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
   */
  getResourceBundle() {
    return this.getThisComponent().getModel("i18n").getResourceBundle() as typeof jQuery.sap.util.ResourceBundle;
  }

  /**
   * Event handler for navigating back.
   * It there is a history entry we go one step back in the browser history
   * If not, it will replace the current entry of the browser history with the master route.
   * @public
   */
  onNavBack(): void {
    const sPreviousHash = History.getInstance().getPreviousHash();
    if (sPreviousHash !== undefined) {
      history.go(-1);
    } else {
      this.getRouter().navTo("master", {}, true);
    }
  }

}
