// deploy code will go here
const HDWalletProvider = require('@truffle/hdwallet-provider');
const Web3 = require('web3');
const { interface, bytecode } = require('./compile');

//which account to unlock
// what outside api/node connecting to

const provider = new HDWalletProvider(
    'force quit immune security lunch paper sock control inside cheese soda pull', 
    'https://rinkeby.infura.io/v3/7c26a024e9c9431db75fc7ec37bac5cd'
);

//takes provider passes it to constructor
//saving that in an instance of web3

const web3 = new Web3(provider);

const deploy = async () => {
    const accounts =  await web3.eth.getAccounts();
    console.log('attempt deploy', accounts[0]);


    const result = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode})
        .send({ from: accounts[0], gas: '1000000' });

    console.log(interface);
    console.log('Contract deployed to', result.options.address);
};

deploy();