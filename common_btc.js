const bitcoin = require('bitcoinjs-lib');
const base58check = require('base58check');
const request = require('sync-request');
const settings = require('./settings');

const network = settings.network;

exports.get_utxos = function(address){
    console.log('--get_utxos--');
    console.log(address);
    let ret_utxos;

    if(settings.api == settings.API.CHAIN_SO){
        // chain.so
        console.log('chain.so');
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
            console.log('error(get utxo): ' + responce.statusCode);
            throw new Error('error(get utxo): ' + responce.statusCode);
        }
    }
    else if(settings.api == settings.API.BLOCK_CYPHER){
        // block cypher
        console.log('block cypher');
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
            console.log('error(get utxo): ' + responce.statusCode);
            throw new Error('error(get utxo): ' + responce.statusCode);
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
        console.log('error(broadcast): '+ responce.statusCode);
        throw new Error('error(broadcast): '+ responce.statusCode);
    }

    console.log(body);
    return ret;
}


exports.gen_script_address = function(script_string){

    // script
    console.log('script');
    let script = bitcoin.script.fromASM(script_string);
    console.log(script_string);
    console.log(script.toString('hex'));
    console.log();

    // payload
    console.log('payload');
    let payload = bitcoin.crypto.hash160(script).toString('hex');
    console.log(payload);
    console.log();

    // version
    console.log('version');
    let version;
    if(network == bitcoin.networks.bitcoin){
        version = '05';
        console.log('mainnet');
    }
    else{
        version = 'c4';
        console.log('testnet');
    }
    console.log(version);
    console.log();

    // base58encode
    console.log('base58encode');
    let base58encode_script = base58check.encode(payload, version, 'hex');
    console.log(base58encode_script);
    console.log();

    // base58decode
    console.log('base58decode');
    console.log(base58check.decode(base58encode_script).prefix.toString('hex'));
    console.log(base58check.decode(base58encode_script).data.toString('hex'));
    console.log();

    return base58encode_script;
}