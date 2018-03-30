
import Opa5 from "sap/ui/test/Opa5";
import Common from "demo/masterdetail/test/integration/pages/Common";

Opa5.createPageObjects({
  onTheBrowserPage : {
    baseClass : Common,

    actions : {

      iChangeTheHashToObjectN(this: Common, iObjIndex: number) {
        return this.waitFor(this.createAWaitForAnEntitySet({
          entitySet : "Objects",
          success(aEntitySet: Entity[]) {
            Opa5.getHashChanger().setHash("/Objects/" + aEntitySet[iObjIndex].ObjectID);
          }
        }));
      },

      iChangeTheHashToTheRememberedItem(this: Common) {
        return this.waitFor({
          success() {
            const sObjectId = this.getContext().currentItem.id;
            Opa5.getHashChanger().setHash("/Objects/" + sObjectId);
          }
        });
      },

      iChangeTheHashToSomethingInvalid(this: Common) {
        return this.waitFor({
          success() {
            Opa5.getHashChanger().setHash("/somethingInvalid");
          }
        });
      }

    },

    assertions : {

      iShouldSeeTheHashForObjectN(this: Common, iObjIndex: number) {
        return this.waitFor(this.createAWaitForAnEntitySet({
          entitySet : "Objects",
          success(aEntitySet: Entity[]) {
            const oHashChanger = Opa5.getHashChanger();
            const sHash = oHashChanger.getHash();
            Opa5.assert.strictEqual(sHash, `Objects/${aEntitySet[iObjIndex].ObjectID}`, "The Hash is not correct");
          }
        }));
      },

      iShouldSeeTheHashForTheRememberedObject(this: Common) {
        return this.waitFor({
          success() {
            const sObjectId = this.getContext().currentItem.id;
            const oHashChanger = Opa5.getHashChanger();
            const sHash = oHashChanger.getHash();
            Opa5.assert.strictEqual(sHash, `Objects/${sObjectId}`, "The Hash is not correct");
          }
        });
      },

      iShouldSeeAnEmptyHash(this: Common) {
        return this.waitFor({
          success() {
            const oHashChanger = Opa5.getHashChanger();
            const sHash = oHashChanger.getHash();
            Opa5.assert.strictEqual(sHash, "", "The Hash should be empty");
          },
          errorMessage : "The Hash is not Correct!"
        });
      }

    }

  }

});
