const bitcoin = require('bitcoinjs-lib');
const base58check = require('base58check');
const settings = require('./settings');
const common_btc = require('./common_btc');

const network = settings.network;

window.publish_tx_from_p2sh = publish_tx_from_p2sh;

exports.get_utxos = function(address){
    let utxos = common_btc.get_utxos(address);

    let total_balance = 0;
    for(utxo of utxos){
        total_balance += utxo.value_satoshi;
    }

    return total_balance;
}

function publish_tx_from_p2sh(txid, output_index, redeem_script, unlocking_script, target_address, value, fee){

    //let utxos = common_btc.get_utxo();
    let rawtx = gen_tx_from_p2sh(txid, output_index, redeem_script, unlocking_script, target_address, value, fee);

    if(common_btc.broadcast(rawtx)){
        document.getElementById('result').innerText = 'unlock success';
    }
    else{
        document.getElementById('result').innerText = 'error';
    }
}

function gen_tx_from_p2sh(txid, output_index, redeem_script, unlocking_script, target_address, value, fee){

    var txb = new bitcoin.TransactionBuilder(network);

    // input
    txb.addInput(txid, output_index);

    // output
    txb.addOutput(target_address, value - fee);

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
    tx.setInputScript(0, redeemScriptSig);
    console.log(tx);
    console.log('tx:');
    console.log(tx.toHex());

    return tx.toHex();
}