# script_wallet

## Overview
Play using BTC script. 

## Description
You can generate BTC address(testnet) form your script on locking.html.  
And you can spend BTC from the address on unloking.html.

## Requirement
install npm

## Usage
generate BTC address  
1. Open "locking.html"  
2. Input your locking script on redeem script.  
   Below op_code is not supported.  
   "OP_CODESEPARATOR",  
   "OP_CHECKSIG",  
   "OP_CHECKSIGVERIFY",  
   "OP_CHECKMULTISIG",  
   "OP_CHECKMULTISIGVERIFY",  
   "OP_CHECKLOCKTIMEVERIFY",  
   "OP_NOP2",  
   "OP_CHECKSEQUENCEVERIFY",  
   "OP_NOP3"  
3. Click "generate p2sh address" button  
4. Send BTC(testnet) to the address by your btc wallet.  

spend BTC  
1. Open "unlocking.html"  
2. Input locking script that used for generating the address.  
3. Input unlocking script to unlock the BTC on the address.  
4. Input your BTC address(testnet) to receive the BTC.  
5. Input fee in satoshi.  
6. Click "send" button.
  
  
## install
`git clone https://github.com/KYpotato/script_wallet.git`
`cd script_wallet`
`npm install`   
`browserify ./locking_script.js -o ./locking.js`  
`browserify ./unlocking_script.js -o ./unlocking.js`  
  

