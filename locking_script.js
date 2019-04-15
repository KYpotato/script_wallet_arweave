const bitcoin = require('bitcoinjs-lib');
const base58check = require('base58check');
const settings = require('./settings');

const network = settings.network;

window.gen_address = gen_address;

function gen_address(script_string){

    document.getElementById('address').innerText = '';

    document.getElementById('address_qr').src = '';
    document.getElementById('address_qr').style.visibility = "hidden";

    let address = gen_script_address(script_string);
    
    document.getElementById('address').innerText = address;
    
    document.getElementById('address_qr').src = "https://chart.googleapis.com/chart?cht=qr&chs=200x200&chco=000000&chl=bitcoin:" + address;
    document.getElementById('address_qr').style.visibility = "visible";

}


function gen_script_address(script_string){

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