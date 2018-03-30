
import BaseController from "demo/masterdetail/controller/BaseController";
import JSONModel from "sap/ui/model/json/JSONModel";
import formatter from "demo/masterdetail/model/formatter";

/**
 * @name demo.masterdetail.controller.Detail
 * @controller
 */
export default class DetailController extends BaseController {

  protected static readonly formatter = formatter;

  /* =========================================================== */
  /* lifecycle methods                                           */
  /* =========================================================== */

  onInit() {
    // Model used to manipulate control states. The chosen values make sure,
    // detail page is busy indication immediately so there is no break in
    // between the busy indication for loading the view's meta data
    const oViewModel = new JSONModel({
      busy : false,
      delay : 0,
      lineItemListTitle : this.getResourceBundle().getText("detailLineItemTableHeading")
    });

    this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

    this.setModel(oViewModel, "detailView");

    this.getThisComponent().getModel().metadataLoaded().then(this._onMetadataLoaded.bind(this));
  }

  /* =========================================================== */
  /* event handlers                                              */
  /* =========================================================== */

  /**
   * Event handler when the share by E-Mail button has been clicked
   * @public
   */
  onShareEmailPress() {
    const oViewModel = this.getModel("detailView");
    sap.m.URLHelper.triggerEmail(
      undefined,
      oViewModel.getProperty("/shareSendEmailSubject"),
      oViewModel.getProperty("/shareSendEmailMessage")
    );
  }

  /**
   * Updates the item count within the line item table's header
   * @param {object} oEvent an event containing the total number of items in the list
   * @private
   */
  onListUpdateFinished(oEvent: sap.ui.base.Event) {
    let sTitle;
    const iTotalItems = oEvent.getParameter("total");
    const oViewModel = this.getModel("detailView") as JSONModel;

    // only update the counter if the length is final
    const itemsBinding = this.byId("lineItemsList").getBinding("items") as sap.ui.model.ListBinding;
    if (itemsBinding.isLengthFinal()) {
      if (iTotalItems) {
        sTitle = this.getResourceBundle().getText("detailLineItemTableHeadingCount", [iTotalItems]);
      } else {
        // Display 'Line Items' instead of 'Line items (0)'
        sTitle = this.getResourceBundle().getText("detailLineItemTableHeading");
      }
      oViewModel.setProperty("/lineItemListTitle", sTitle);
    }
  }

  /* =========================================================== */
  /* begin: internal methods                                     */
  /* =========================================================== */

  /**
   * Binds the view to the object path and expands the aggregated line items.
   * @function
   * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
   * @private
   */
  _onObjectMatched(oEvent: sap.ui.base.Event) {
    const sObjectId = oEvent.getParameter("arguments").objectId;
    const oODataModel = this.getThisComponent().getModel();
    oODataModel.metadataLoaded().then(() => {
      const sObjectPath = oODataModel.createKey("Objects", {
        ObjectID : sObjectId
      });
      this._bindView("/" + sObjectPath);
    });
  }

  /**
   * Binds the view to the object path. Makes sure that detail view displays
   * a busy indicator while data for the corresponding element binding is loaded.
   * @function
   * @param {string} sObjectPath path to the object to be bound to the view.
   * @private
   */
  _bindView(sObjectPath: string) {
    // Set busy indicator during view binding
    const oViewModel = this.getModel("detailView") as JSONModel;

    // If the view was not bound yet its not busy, only if the binding requests data it is set to busy again
    oViewModel.setProperty("/busy", false);

    this.getView().bindElement({
      path : sObjectPath,
      events: {
        change : this._onBindingChange.bind(this),
        dataRequested() {
          oViewModel.setProperty("/busy", true);
        },
        dataReceived() {
          oViewModel.setProperty("/busy", false);
        }
      }
    });
  }

  _onBindingChange() {
    const oView = this.getView();
    const oElementBinding = oView.getElementBinding();

    // No data for the binding
    if (!oElementBinding.getBoundContext()) {
      this.getRouter().getTargets().display("detailObjectNotFound");
      // if object could not be found, the selection in the master list
      // does not make sense anymore.
      this.getThisComponent().oListSelector.clearMasterListSelection();
      return;
    }

    const sPath = (oElementBinding as any).getPath(); // TODO
    const oResourceBundle = this.getResourceBundle();
    const oObject = oView.getModel().getObject(sPath) as Entity;
    const sObjectId = oObject.ObjectID;
    const sObjectName = oObject.Name;
    const oViewModel = this.getModel("detailView") as JSONModel;

    this.getThisComponent().oListSelector.selectAListItem(sPath);

    oViewModel.setProperty("/shareSendEmailSubject",
      oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId])
    );
    oViewModel.setProperty("/shareSendEmailMessage",
      oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href])
    );
  }

  _onMetadataLoaded() {
    // Store original busy indicator delay for the detail view
    const iOriginalViewBusyDelay = this.getView().getBusyIndicatorDelay();
    const oViewModel = this.getModel("detailView") as JSONModel;
    const oLineItemTable = this.byId("lineItemsList") as sap.m.Table;
    const iOriginalLineItemTableBusyDelay = oLineItemTable.getBusyIndicatorDelay();

    // Make sure busy indicator is displayed immediately when
    // detail view is displayed for the first time
    oViewModel.setProperty("/delay", 0);
    oViewModel.setProperty("/lineItemTableDelay", 0);

    oLineItemTable.attachEventOnce("updateFinished", () => {
      // Restore original busy indicator delay for line item table
      oViewModel.setProperty("/lineItemTableDelay", iOriginalLineItemTableBusyDelay);
    });

    // Binding the view will set it to not busy - so the view is always busy if it is not bound
    oViewModel.setProperty("/busy", true);
    // Restore original busy indicator delay for the detail view
    oViewModel.setProperty("/delay", iOriginalViewBusyDelay);
  }

}
