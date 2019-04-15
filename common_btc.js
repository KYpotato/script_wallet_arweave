const bitcoin = require('bitcoinjs-lib');
const request = require('sync-request');
const settings = require('./settings');

const network = settings.network;

exports.get_utxos = function(address){
    let ret_utxos;

    if(settings.api == settings.API.CAHIN_SO){
        // chain.so
        let target_network;
        if(network == bitcoin.networks.bitcoin){
            target_network = "BTC";
        }
        else{
            target_network = "BTCTEST";
        }
        const url = 'https://chain.so/api/v2/get_tx_unspent/' + target_network + '/' + address;
        let responce = request('GET', url);

        if(responce.statusCode == 200){
            let body = JSON.parse(responce.body);
            console.log(body.data.txs);
            ret_utxos = new Array();
            for(let i = 0; i < body.data.txs.length; i++){
                ret_utxos[i] = {
                    txid: body.data.txs[i].txid,
                    output_idx: body.data.txs[i].output_no,
                    value_satoshi: Number(body.data.txs[i].value.replace('.', ''))
                };
            }
        }
        else{
            ret_utxos = null;
            console.log('error: ' + responce.statusCode);
        }
    }
    else if(settings.api == settings.API.BLOCK_CYPHER){
        // block cypher
        let target_network;
        if(network == bitcoin.networks.bitcoin){
            target_network = "main";
        }
        else{
            target_network = "test3";
        }
        const url = 'https://api.blockcypher.com/v1/btc/' + target_network + '/addrs/' + address;
        let responce = request('GET', url, {flags: {'unspentOnly': 'true'}});

        if(responce.statusCode == 200){
            let body = JSON.parse(responce.body);
            console.log(body.txrefs);
            ret_utxos = new Array();
            let i = 0;
            for(let utxo of body.txrefs){
                if(utxo.spent != undefined && utxo.spent != true){
                    ret_utxos[i++] = {
                        txid: utxo.tx_hash,
                        output_idx: utxo.tx_output_n,
                        value_satoshi: utxo.value
                    }
                }
            }
        }
        else{
            ret_utxos = null;
            console.log('error: ' + responce.statusCode);
            //{"error": "Address tb1qt0arta2hdeh34hfjksza3u3fvxwksrl9mt5ny5 is invalid: Address tb1qt0arta2hdeh34hfjksza3u3fvxwksrl9mt5ny5 is of unknown size."}
        }
    }
    return ret_utxos;
}

exports.broadcast = function(rawtx){
    let body;
    let ret;

    // chain.so
    let target_network;
    if(network == bitcoin.networks.bitcoin){
        target_network = "BTC";
    }
    else{
        target_network = "BTCTEST";
    }
    const uri = 'https://chain.so/api/v2/send_tx/' + target_network;
    let responce = request('POST', uri, {json: {tx_hex: rawtx}});
    if(responce.statusCode == 200){
        body = JSON.parse(responce.getBody('utf-8'));
        console.log(body);
        ret = true;
    }
    else{
        console.log('error: '+ responce.statusCode);
        ret = false;
    }

    console.log(body);
    return ret;
}