
// import { SinonStatic, SinonSpy } from "node_modules/@types/sinon/index";
declare var sinon: sinon.SinonStatic;

export interface SinonQUnit extends QUnit {
  spy(): sinon.SinonSpy;
  stub(): StubReturner;
}

interface StubReturner {
  returns<T>(t: T): T;
}
