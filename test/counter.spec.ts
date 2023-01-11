import chai, { expect } from "chai";
import chaiBN from "chai-bn";
import BN from "bn.js";
import { beforeEach, describe } from "mocha";
import { SmartContract } from "ton-contract-executor";
import {
  Address,
  beginCell,
  Cell,
  CellMessage,
  CommonMessageInfo,
  InternalMessage,
} from "ton";
import { compileContract } from "ton-compiler";

chai.use(chaiBN(BN));

const INIT_COUNTER = 3;

const zeroAddress = Address.parseRaw(
  "0:0000000000000000000000000000000000000000000000000000000000000000"
);

function initData(initialCounterValue: number) {
  return beginCell().storeUint(initialCounterValue, 64).endCell();
}

function encodeIncrementMessage() {
  const op = 1;
  return beginCell().storeUint(op, 32).storeUint(0, 64).endCell();
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
    contract = await SmartContract.fromCell(initCodeCell, initDataCell, {
      debug: true,
    });
  });

  it("should get init counter value", async () => {
    const call = await contract.invokeGetMethod("counter", []);
    expect(call.result[0]).to.be.bignumber.equal(new BN(INIT_COUNTER));
  });

  it("should increment counter", async () => {
    const message = encodeIncrementMessage();
    const send = await contract.sendInternalMessage(
      new InternalMessage({
        from: Address.parse("EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t"), // address of the sender of the message
        to: zeroAddress, // ignored, this is assumed to be our contract instance
        value: 0, // are we sending any TON coins with this message
        bounce: true, // do we allow this message to bounce back on error
        body: new CommonMessageInfo({
          body: new CellMessage(message),
        }),
      })
    );
    expect(send.type).to.equal("success");
    console.log(send.logs);
    const call = await contract.invokeGetMethod("counter", []);
    expect(call.result[0]).to.be.bignumber.equal(new BN(INIT_COUNTER + 1));
  });
});
