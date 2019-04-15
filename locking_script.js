const common_btc = require('./common_btc');
const settings = require('./settings');

const network = settings.network;

window.gen_address = gen_address;

function gen_address(script_string){

    try{
        let address = common_btc.gen_script_address(script_string);
        
        document.getElementById('address').innerText = address;
        
        document.getElementById('address_qr').src = "https://chart.googleapis.com/chart?cht=qr&chs=200x200&chco=000000&chl=bitcoin:" + address;
        document.getElementById('address_qr').style.visibility = "visible";
    }
    catch(error){
        document.getElementById('address').innerText = '';
    
        document.getElementById('address_qr').src = '';
        document.getElementById('address_qr').style.visibility = "hidden";
        alert(error);
    }

}
