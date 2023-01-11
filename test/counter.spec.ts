import chai from "chai";
import chaiBN from "chai-bn";
import BN from "bn.js";
import { beforeEach, describe } from "mocha";
import { SmartContract } from "ton-contract-executor";
import { beginCell, Cell } from "ton";
import { compileContract } from "ton-compiler";

chai.use(chaiBN(BN));

const INIT_COUNTER = 3;

function initData(initialCounterValue: number) {
  return beginCell().storeUint(initialCounterValue, 64).endCell();
}

describe("Counter tests", () => {
  let contract: SmartContract;

  beforeEach(async () => {
    const compileResult = await compileContract({
      files: ["contract/counter.fc"],
      stdlib: true,
      version: "latest",
    });
    if (!compileResult.ok) throw new Error("compilation failed");
    const initCodeCell = Cell.fromBoc(compileResult.output)[0];
    const initDataCell = initData(INIT_COUNTER);
    contract = await SmartContract.fromCell(initCodeCell, initDataCell);
  });

  it("should get init counter value", async () => {
    const call = await contract.invokeGetMethod("counter", []);
    const counter = call.result[0];
  });
});
