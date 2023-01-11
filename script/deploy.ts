import * as fs from "fs";
import {
    beginCell,
    Cell,
    contractAddress,
    InternalMessage, SendMode,
    StateInit,
    TonClient,
    WalletContract,
    WalletV3R2Source,
    toNano, CommonMessageInfo
} from "ton";
import {mnemonicToWalletKey} from "ton-crypto";


function initData(initialCounterValue: number) {
    return beginCell().storeUint(initialCounterValue, 64).endCell();
}

const initDataCell = initData(3);
const initCodeCell = Cell.fromBoc(fs.readFileSync("./counter.cell"))[0];

const newContractAddress = contractAddress({workchain: 0, initialData: initDataCell, initialCode: initCodeCell});

const client = new TonClient({
    endpoint: "https://testnet.toncenter.com/api/v2/jsonRPC",
    apiKey: "b6ce846ebcf5b8be74236bc24ed5a326f461ec2e1519688d78681ba5417ab79e"
});

const mnemonic = "million jacket stay price tired dwarf sight situate " +
    "receive priority suit identify fork toddler eternal left dog diet parade " +
    "praise primary mammal mutual moment";


async function initWallet() {
    const key = await mnemonicToWalletKey(mnemonic.split(" "));
    return WalletContract.create(client, WalletV3R2Source.create({publicKey: key.publicKey, workchain: 0}));
}
async function deploy() {
    const wallet = await initWallet();
    const key = await mnemonicToWalletKey(mnemonic.split(" "));

    const seqno = await wallet.getSeqNo();
    console.log('sending...');
    const transfer = wallet.createTransfer({
        seqno,
        secretKey: key.secretKey,
        sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
        order: new InternalMessage({
            to: newContractAddress, // calculated before
            value: toNano(0.02), // fund the new contract with 0.02 TON to pay rent
            bounce: false,
            body: new CommonMessageInfo({
                stateInit: new StateInit({data: initDataCell, code: initCodeCell}), // calculated before
                body: null,
            }),
        }),
    });

    await client.sendExternalMessage(wallet, transfer);
}

deploy().catch((reason) => console.log(reason));