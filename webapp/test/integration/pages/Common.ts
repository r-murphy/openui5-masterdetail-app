
import Opa5 from "sap/ui/test/Opa5";
import MockServer from "sap/ui/core/util/MockServer";

function getFrameUrl(sHash: string, sUrlParameters?: string) {
  const sUrl = (jQuery.sap as any).getResourcePath("demo/masterdetail/app", ".html"); // TODO add the 2nd param to the type definition
  sHash = sHash || "";
  sUrlParameters = sUrlParameters ? "?" + sUrlParameters : "";

  if (sHash) {
    sHash = "#" + (sHash.indexOf("/") === 0 ? sHash.substring(1) : sHash);
  } else {
    sHash = "";
  }

  return sUrl + sUrlParameters + sHash;
}

/**
 * @name demo.masterdetail.test.integration.pages.Common
 */
export default class Common extends Opa5 {

  iStartTheApp(oOptions: any) {
    oOptions = oOptions || {};
    // Start the app with a minimal delay to make tests run fast but still async to discover basic timing issues
    this.iStartMyAppInAFrame(getFrameUrl(oOptions.hash, "serverDelay=50"));
  }

  iStartTheAppWithDelay(sHash: string, iDelay: number) {
    this.iStartMyAppInAFrame(getFrameUrl(sHash, "serverDelay=" + iDelay));
  }

  iLookAtTheScreen() {
    return this;
  }

  iStartMyAppOnADesktopToTestErrorHandler(sParam: string) {
    this.iStartMyAppInAFrame(getFrameUrl("", sParam));
  }

  createAWaitForAnEntitySet(oOptions: any) {
    return {
      success(this: Common) {
        let bMockServerAvailable = false;
        let aEntitySet: Entity[];

        this.getMockServer().then((oMockServer: MockServer) => {
          aEntitySet = oMockServer.getEntitySetData(oOptions.entitySet);
          bMockServerAvailable = true;
        });

        return this.waitFor({
          check() {
            return bMockServerAvailable;
          },
          success() {
            oOptions.success.call(this, aEntitySet);
          }
        });
      }
    };
  }

  getMockServer() {
    return new Promise<MockServer>((success) => {
      (Opa5.getWindow() as any).sap.ui.require(["demo/masterdetail/localService/mockserver"], (mockServer: any) => {
        success(mockServer.getMockServer());
      });
    });
  }

  theUnitNumbersShouldHaveTwoDecimals(sControlType: string, sViewName: string, sSuccessMsg: string, sErrMsg: string) {
    const rTwoDecimalPlaces =  /^-?\d+\.\d{2}$/;

    return this.waitFor({
      controlType : sControlType,
      viewName : sViewName,
      success(aNumberControls: sap.m.ObjectNumber[]) {
        Opa5.assert.ok(
          aNumberControls.every((oNumberControl) => {
            return rTwoDecimalPlaces.test(oNumberControl.getNumber());
          }),
          sSuccessMsg
        );
      },
      errorMessage : sErrMsg
    });
  }

}
