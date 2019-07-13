var ZenexTokenSale = artifacts.require("./ZenexTokenSale.sol");
var ZenexToken = artifacts.require("./ZenexToken.sol");

contract ("ZenexTokenSale", function(accounts){
    var tokenSaleInstance;
    var tokenInstance;
    var tokenPrice = 1000000000000000; //in wei ; in ether = 0.001 ether //use https://etherconverter.online/ to calculate the same
    var buyer = accounts[1];
    var admin = accounts[0];
    var tokensAvailable = 750000;
    var numberOfTokens;
    it('initializes the contract with correct values', function() {
        return ZenexTokenSale.deployed().then((i) => {
            tokenSaleInstance = i;
            return tokenSaleInstance.address;
        }).then((address) => {
            assert.notEqual(address, 0x0, 'has contract address');
            return tokenSaleInstance.tokenContract();
        }).then((address) => {
            assert.notEqual(address, 0x0, 'has token contract address');
            return tokenSaleInstance.tokenPrice();
        }).then((price) => {
            assert.equal(price, tokenPrice, 'token price is correct');
        });
    });

    it('facilitates token buying', function() {
        return ZenexToken.deployed().then((i) => {
            //Grabbing token contract
            tokenInstance = i;
            return ZenexTokenSale.deployed();
        }).then((i) => {
            //Grabbing token sale contract
            tokenSaleInstance = i;
            //Provision 75% of all tokes to token sale
            return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, {from: admin});
        }).then((receipt) => {
            numberOfTokens = 10;
            var value = numberOfTokens * tokenPrice;
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: value});
        }).then((receipt) => {
            assert.equal(receipt.logs.length, 1, 'triggers event');
            assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
            assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased tokens');
            assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
            return tokenSaleInstance.tokensSold();
        }).then((amount) => {
            assert.equal(amount, numberOfTokens, 'increments the number of tokens sold');
            return tokenInstance.balanceOf(buyer);
        }).then((balance) => {
            assert.equal(balance, numberOfTokens, 'balance is updated in buyers wallet');
            return tokenInstance.balanceOf(tokenSaleInstance.address);
        }).then((balance) => {
            assert.equal(balance, tokensAvailable - numberOfTokens, 'balance is deducted from sender wallet');
            //Try to buy tokens different from the ether value
            return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'msg.value must be equal to the tokens of wei');
            return tokenSaleInstance.buyTokens(800000, {from: buyer, value: numberOfTokens * tokenPrice});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot buy tokens larger than the tokens available');
        });
    });

    it('ends token sale', function() {
        return ZenexToken.deployed().then((i) => {
            tokenInstance = i;
            return tokenSaleInstance.deployed();
        }).then((i) => {
            tokenSaleInstance = i;
            return tokenSaleInstance.endSale({from: buyer});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert' >= 0), 'must be admin in order to end the token sale');
            return tokenSaleInstance.endSale({ from: admin});
        }).then((receipt) => {
            //console.log(receipt);
            return tokenInstance.balanceOf(admin);
        }).then((balance) => {
            //console.log(balance);
            assert.equal(balance.toNumber(), 999990, 'returns all unsold tokens to admin');
            //Check tokenPrice was reset when selfdistruct called
        //     return tokenSaleInstance.tokenPrice();
        // }).then((price) => {
        //     //console.log(price.toNumber());
        //     assert.equal(price.toNumber(), 0, 'token price was reset')
        });
    });
});