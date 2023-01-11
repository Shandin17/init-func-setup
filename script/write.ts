import {
    Address, beginCell,
    CellMessage,
    CommonMessageInfo,
    InternalMessage, SendMode,
    toNano,
    TonClient,
    WalletContract,
    WalletV3R2Source
} from "ton";
import {mnemonicToWalletKey} from "ton-crypto";


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

const exampleContractAddress = "EQCRVVDJjOR78-kFpTd5aNzA-X_Nad4XdfhouiWW_ud_zh55";
async function sendMessage() {
    const messageBody = beginCell().storeUint(1, 32).storeUint(0, 64).endCell();
    const wallet = await initWallet();
    const key = await mnemonicToWalletKey(mnemonic.split(" "));

    const transfer = wallet.createTransfer({
        secretKey: key.secretKey, // from the secret mnemonic of the sender wallet
        seqno: await wallet.getSeqNo(),
        sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
        order: new InternalMessage({
            to: Address.parseFriendly(exampleContractAddress).address, // newContractAddress from deploy
            value: toNano(0.02), // pay 0.02 TON as gas
            bounce: false,
            body: new CommonMessageInfo({
                body: new CellMessage(messageBody),
            }),
        }),
    });
    await client.sendExternalMessage(wallet, transfer);
}

sendMessage();