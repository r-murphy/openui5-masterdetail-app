
import formatter from "demo/masterdetail/model/formatter";

QUnit.module("formatter - Currency value");

function currencyValueTestCase(assert: Assert, sValue: string, fExpectedNumber: string) {
  // Act
  const fCurrency = formatter.currencyValue(sValue);

  // Assert
  assert.strictEqual(fCurrency, fExpectedNumber, "The rounding was correct");
}

function getCurrencyValueTestCaseAsserter(sValue: string, fExpectedNumber: string) {
  return (assert: Assert) => currencyValueTestCase(assert, sValue, fExpectedNumber);
}

QUnit.test("Should round down a 3 digit number", getCurrencyValueTestCaseAsserter("3.123", "3.12"));

QUnit.test("Should round up a 3 digit number", getCurrencyValueTestCaseAsserter("3.128", "3.13"));

QUnit.test("Should round a negative number", getCurrencyValueTestCaseAsserter("-3", "-3.00"));

QUnit.test("Should round an empty string", getCurrencyValueTestCaseAsserter("", ""));

QUnit.test("Should round a zero", getCurrencyValueTestCaseAsserter("0", "0.00"));
