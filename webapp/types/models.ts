
interface Entity {
  ObjectID: string;
  Name: string;
  Attribute1: string;
  Attribute2: string;
  UnitOfMeasure: string;
  UnitNumber: number;
}

interface LineItems {
  LineItemID: string;
  ObjectID: string;
  Name: string;
  Attribute: string;
  UnitOfMeasure: string;
  UnitNumber: number;
}
