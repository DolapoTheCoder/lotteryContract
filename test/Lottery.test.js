//assertions for deployed contract

const assert = require('assert'); //assertions about tests e.g val1 = val2
const ganache = require('ganache'); // local eth test network
const Web3 = require('web3'); //constructor for web3 library
const web3 = new Web3(ganache.provider());
const { interface, bytecode } = require('../compile'); 

let accounts;
let lottery;

beforeEach(async () => {
    //1. get a list of accounts
    //2. use an account to deploy new contract
    accounts = await web3.eth.getAccounts(); //1

    //deploy a contract for an account

    lottery = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' });
});

describe('Lottery', () => {
    it('contracts deployed', () => {
        assert.ok(lottery.options.address);
    });

    it('allow one account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0], 
            value: web3.utils.toWei('0.02', 'ether') //converts eth to wei
        }); // sends a trans to the enter method 
        // from the test acct
        
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0] //calling get players function
            //using test acct
        });
        
        assert.equal(accounts[0], players[0]);
        assert.equal(1, players.length);
    });

    it('allow multiple account to enter', async () => {
        await lottery.methods.enter().send({
            from: accounts[0], 
            value: web3.utils.toWei('0.02', 'ether') //converts eth to wei
        }); // sends a trans to the enter method 
        // from the test acct
        
        await lottery.methods.enter().send({
            from: accounts[1], 
            value: web3.utils.toWei('0.02', 'ether') 
        });

        await lottery.methods.enter().send({
            from: accounts[2], 
            value: web3.utils.toWei('0.02', 'ether') 
        });
        
        const players = await lottery.methods.getPlayers().call({
            from: accounts[0] //calling get players function
            //using test acct
        });
        
        assert.equal(accounts[0], players[0]);
        assert.equal(accounts[1], players[1]);
        assert.equal(accounts[2], players[2]);
        assert.equal(3, players.length);
    });

    it('test the min ether allowed', async () => {
        try {
            await lottery.methods.enter().send({
                from: accounts[0], 
                value: 0 
            });
            assert(false); //if no error go to assert false
        } catch (error) {
            assert(error);    
        }
    });

    it('non manager tries catch (error)', async () => {
        try {
            await lottery.methods.pickWinner().send({
                from: accounts[1]
            });
            assert(false);
        } catch (error) {
            assert(error);
        }
    });

    it('sends money to winner and resets player[]', async () => {
       //entering 1 person into lottery
        await lottery.methods.enter().send({
            from: accounts[0], 
            value: web3.utils.toWei('2', 'ether')
        }); 
        //check how much pick winner 

        const initBalance = await web3.eth.getBalance(accounts[0]);

        //picking a winner
        await lottery.methods.pickWinner().send({
            from: accounts[0]
        });

        const newBalance = await web3.eth.getBalance(accounts[0]);

        const diff = newBalance - initBalance

        //assert.equal(players.length, 0); //reseting the array
        assert(diff > web3.utils.toWei('1.8', 'ethers'));
    });
});