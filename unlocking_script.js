const bitcoin = require('bitcoinjs-lib');
const settings = require('./settings');
const common_btc = require('./common_btc');

const network = settings.network;

window.get_utxos = get_utxos;
window.publish_tx_from_p2sh = publish_tx_from_p2sh;

function get_utxos(address){
    let utxos = common_btc.get_utxos(address);

    let total_balance = 0;
    for(utxo of utxos){
        total_balance += utxo.value_satoshi;
    }

    return total_balance;
}

function publish_tx_from_p2sh(txid, output_index, redeem_script, unlocking_script, target_address, value, fee){

    document.getElementById('result').innerText = '';

    if(!redeem_script || !unlocking_script || !target_address){
        alert("redeem script, unlocking script and target address is needed");
    }

    if(fee < 1){
        fee = settings.default_fee;
    }

    try{
        let utxos;
        if(!txid || !output_index || !value){
            utxos = common_btc.get_utxos(common_btc.gen_script_address(redeem_script));
        }
        else{
            utxos = {
                txid: txid,
                output_idx: output_index,
                value_satoshi: value}
        }

        if(utxos.length < 1){
            alert('there are no utxo on the address of the redeem script.');
            return;
        }

        let rawtx = gen_tx_from_p2sh(utxos, redeem_script, unlocking_script, target_address, fee);

        if(common_btc.broadcast(rawtx)){
            document.getElementById('result').innerText = 'unlock success';
        }
        else{
            document.getElementById('result').innerText = 'error';
        }
    }
    catch(error){
        alert(error);
        return;
    }
}

function gen_tx_from_p2sh(utxos, redeem_script, unlocking_script, target_address, fee){

    var txb = new bitcoin.TransactionBuilder(network);

    // input
    let total_balance = 0;
    for(utxo of utxos){
        txb.addInput(utxo.txid, utxo.output_idx);
        total_balance += utxo.value_satoshi;
    }

    // output
    txb.addOutput(target_address, total_balance - fee);

    // set unlocking script to tx
    const tx = txb.buildIncomplete();
    console.log(tx);

    var redeem = bitcoin.script.fromASM(redeem_script);
    var unlocking = bitcoin.script.fromASM(unlocking_script);

    const redeemScriptSig = bitcoin.payments.p2sh({
        redeem: {
            input: unlocking,
            output: redeem
        }
    }).input;
    for(let i = 0; i < utxos.length; i++){
        tx.setInputScript(i, redeemScriptSig);
    }
    console.log(tx);
    console.log('tx:');
    console.log(tx.toHex());

    return tx.toHex();
}