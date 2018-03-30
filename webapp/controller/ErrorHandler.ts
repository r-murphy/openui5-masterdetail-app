
import UI5Object from "sap/ui/base/Object";
import MessageBox from "sap/m/MessageBox";

// type imports (erased by tsc)
import Component from "demo/masterdetail/Component";

// type aliases
type ResourceModel = sap.ui.model.resource.ResourceModel;
type ODataModel = sap.ui.model.odata.v2.ODataModel;
type UI5Event = sap.ui.base.Event;

/**
 * @name demo.masterdetail.controller.ErrorHandler
 */
export default class ErrorHandler extends UI5Object {

  private readonly _oComponent: Component;
  private readonly _oResourceBundle: typeof jQuery.sap.util.ResourceBundle;
  private readonly _oModel: ODataModel;
  private readonly _sErrorText: string;
  private _bMessageOpen = false;

  /**
   * Handles application errors by automatically attaching to the model events and displaying errors when needed.
   * @class
   * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
   * @public
   * @alias demo.masterdetail.controller.ErrorHandler
   */
  constructor(oComponent: Component) {
    super();

    this._oComponent = oComponent;
    this._oResourceBundle = (oComponent.getModel("i18n") as ResourceModel).getResourceBundle() as any;
    this._oModel = oComponent.getModel() as ODataModel;
    this._sErrorText = (this._oResourceBundle as any).getText("errorText");

    this._oModel.attachMetadataFailed((oEvent: UI5Event) => {
      const oParams = oEvent.getParameters();
      this._showServiceError(oParams.response);
    }, this);

    this._oModel.attachRequestFailed((oEvent: UI5Event) => {
      const oParams = oEvent.getParameters();
      // An entity that was not found in the service is also throwing a 404 error in oData.
      // We already cover this case with a notFound target so we skip it here.
      // A request that cannot be sent to the server is a technical error that we have to handle though
      if (oParams.response.statusCode !== "404" || (oParams.response.statusCode === 404 && oParams.response.responseText.indexOf("Cannot POST") === 0)) {
        this._showServiceError(oParams.response);
      }
    }, this);
  }

  /**
   * Shows a {@link sap.m.MessageBox} when a service call has failed.
   * Only the first error message will be display.
   * @param {string} sDetails a technical error to be displayed on request
   * @private
   */
  _showServiceError(sDetails: string) {
    if (this._bMessageOpen) {
      return;
    }
    this._bMessageOpen = true;
    MessageBox.error(
      this._sErrorText,
      {
        id: "serviceErrorMessageBox",
        details: sDetails,
        styleClass: this._oComponent.getContentDensityClass(),
        actions: [MessageBox.Action.CLOSE],
        onClose: () => {
          this._bMessageOpen = false;
        }
      }
    );
  }

}
