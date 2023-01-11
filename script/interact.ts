import {Address, TonClient, TupleSlice} from "ton";


const client = new TonClient({
    endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
    apiKey: "b6ce846ebcf5b8be74236bc24ed5a326f461ec2e1519688d78681ba5417ab79e"
});

const exampleContractAddress = "EQCRVVDJjOR78-kFpTd5aNzA-X_Nad4XdfhouiWW_ud_zh55";
async function callGetter() {
    const call = await client.callGetMethod(
        Address.parseFriendly(exampleContractAddress).address, "counter");
    const counterValue = new TupleSlice(call.stack).readBigNumber();
    console.log(`counter value is ${counterValue.toString()}`)
}

callGetter().catch((reason) => console.log(reason));