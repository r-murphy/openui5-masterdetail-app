
import MockServer from "sap/ui/core/util/MockServer";

let oMockServer: sap.ui.core.util.MockServer;

const _sAppModulePath = "demo/masterdetail/";
const _sJsonFilesModulePath = `${_sAppModulePath}localService/mockdata`;

interface JQuerySapUtilUriParameters {
  get(string: string): undefined | string;
}

export default {
  /**
   * Initializes the mock server.
   * You can configure the delay with the URL parameter "serverDelay".
   * The local mock data in this folder is returned instead of the real data for testing.
   * @public
   */

  init() {
    const oUriParameters = jQuery.sap.getUriParameters() as JQuerySapUtilUriParameters;
    const sJsonFilesUrl = jQuery.sap.getModulePath(_sJsonFilesModulePath);
    const sManifestUrl = jQuery.sap.getModulePath(_sAppModulePath + "manifest", ".json");
    const sEntity = "Objects";
    const sErrorParam = oUriParameters.get("errorType");
    const iErrorCode = sErrorParam === "badRequest" ? 400 : 500;
    const oManifest = jQuery.sap.syncGetJSON(sManifestUrl).data;
    const oMainDataSource = oManifest["sap.app"].dataSources.mainService;
    const sMetadataUrl = jQuery.sap.getModulePath(_sAppModulePath + oMainDataSource.settings.localUri.replace(".xml", ""), ".xml");
    // ensure there is a trailing slash
    const sMockServerUrl = /.*\/$/.test(oMainDataSource.uri) ? oMainDataSource.uri : oMainDataSource.uri + "/";

    oMockServer = new MockServer({
      rootUri : sMockServerUrl
    });

    // configure mock server with a delay of 1s
    MockServer.config({
      autoRespond : true,
      autoRespondAfter : (oUriParameters.get("serverDelay") || 1000)
    });

    oMockServer.simulate(sMetadataUrl, {
      sMockdataBaseUrl : sJsonFilesUrl,
      bGenerateMissingMockData : true
    });

    const aRequests = oMockServer.getRequests();
    const fnResponse = (iErrCode: any, sMessage: string, aRequest: any) => {
      aRequest.response = (oXhr: any) => {
        oXhr.respond(iErrCode, {"Content-Type": "text/plain;charset=utf-8"}, sMessage);
      };
    };

    // handling the metadata error test
    if (oUriParameters.get("metadataError")) {
      aRequests.forEach(( aEntry ) => {
        if (aEntry.path.toString().indexOf("$metadata") > -1) {
          fnResponse(500, "metadata Error", aEntry);
        }
      });
    }

    // Handling request errors
    if (sErrorParam) {
      aRequests.forEach(( aEntry ) => {
        if (aEntry.path.toString().indexOf(sEntity) > -1) {
          fnResponse(iErrorCode, sErrorParam, aEntry);
        }
      });
    }
    oMockServer.start();

    jQuery.sap.log.info("Running the app with mock data");
  },

  /**
   * @public returns the mock server of the app, should be used in integration tests
   * @returns {sap.ui.core.util.MockServer} the mock server instance
   */
  getMockServer() {
    return oMockServer;
  }
};
