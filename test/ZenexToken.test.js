var ZenexToken = artifacts.require("./ZenexToken.sol");

contract ("ZenexToken", function(accounts){
    var tokenInstance;
    it('initializes with correct values', function() {
        return ZenexToken.deployed().then((instance) => {
            tokenInstance = instance;
            return tokenInstance.name();
        }).then((name) => {
            assert.equal(name, 'Zenex Token', 'matches with the name provided');
            return tokenInstance.symbol();
        }).then((symbol) => {
            assert.equal(symbol, 'ZENT', 'matches with the symbol provided');
            return tokenInstance.standard();
        }).then(function(standard) {
            assert.equal(standard, 'Zenex Token v1.0', 'Has a correct standard');
        });
    });
    it('allocates the initial supply pon deployment', function() {
        return ZenexToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.totalSupply();
        }).then((totalSupply) => {
            assert.equal(totalSupply.toNumber(), 1000000, 'sets the total supply to 1,000,0000');
            return tokenInstance.balanceOf(accounts[0]);
        }).then((adminBalance) => {
            assert.equal(adminBalance, 1000000, 'it allocates initial supply');
        });
    });

    it('transfers ownership', function() {
        return ZenexToken.deployed().then(function(instance) {
            tokenInstance = instance;
            //test to throw an event if larger amount than the actual balance tried to send
            return tokenInstance.transfer.call(accounts[1], 99999999999999);
        }).then(assert.fail).catch(function(error) {
            //console.log(accounts[1]);
            //console.log(error.message);
            assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
            return tokenInstance.transfer.call(accounts[1], 250000, {from: accounts[0]});
        }).then(function(success) {
            assert.equal(success, true, 'it returns true');
            return tokenInstance.transfer(accounts[1], 250000, {from: accounts[0]});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, accounts[0], 'logs the account of sender');
            assert.equal(receipt.logs[0].args._to, accounts[1], 'logs the account of reciever');
            assert.equal(receipt.logs[0].args._value, 250000, 'logs the transfer amount');
            return tokenInstance.balanceOf(accounts[1]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 250000, 'it adds the amount in recievers account');
            return tokenInstance.balanceOf(accounts[0]);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 750000, 'it deducts the amount from senders account');
        });
    });

    it('approves token for delegates the transfer', function() { 
        return ZenexToken.deployed().then(function(instance) {
            tokenInstance = instance;
            return tokenInstance.approve.call(accounts[1], 100);
        }).then(function(success) {
            assert.equal(success, true, 'it returns true');
            return tokenInstance.approve(accounts[1], 100, {from: accounts[0]});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers event');
            assert.equal(receipt.logs[0].event, 'Approval', 'should be the "Approval" event');
            assert.equal(receipt.logs[0].args._owner, accounts[0], 'logs the account the tokens are authorized by');
            assert.equal(receipt.logs[0].args._spender, accounts[1], 'logs the account the tokens are authorized to');
            assert.equal(receipt.logs[0].args._value, 100, 'logs the transfer amount');
            return tokenInstance.allowance(accounts[0], accounts[1]);
        }).then(function(allowance) {
            assert.equal(allowance.toNumber(), 100, 'stores the allowance for delegated transfer');
        });
    });

    it('it handles delegated transfer', function() {
        return ZenexToken.deployed().then(function(instance) {
            tokenInstance = instance;
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            return tokenInstance.transfer(fromAccount, 100, {from: accounts[0]});
        }).then(function(receipt) {
            //Approve spending account to sepnd 10 tokens
            return tokenInstance.approve(spendingAccount, 10, {from: fromAccount});
        }).then(function(receipt) {
            //Try transfering something larger than spnder's balance
            return tokenInstance.transferFrom(fromAccount, toAccount, 9999, {from: spendingAccount});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer the amount larger than the avaialble balance');
            //Try spending something larger than approved amount
            return tokenInstance.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount});
        }).then(assert.fail).catch(function(error) {
            assert(error.message.indexOf('revert') >= 0, 'cannot transfer the amount larger than the approved amount');
            return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, {from: spendingAccount});
        }).then(function(success) {
            assert.equal(success, true, 'it returns true');
            return tokenInstance.transferFrom(fromAccount, toAccount, 10, {from: spendingAccount});
        }).then(function(receipt) {
            assert.equal(receipt.logs.length, 1, 'triggers event');
            assert.equal(receipt.logs[0].event, 'Transfer', 'should be the "Transfer" event');
            assert.equal(receipt.logs[0].args._from, fromAccount, 'logs the account tokens are transfered from');
            assert.equal(receipt.logs[0].args._to, toAccount, 'logs the account tokens are transfered to');
            assert.equal(receipt.logs[0].args._value, 10, 'logs the transfer amount');
            return tokenInstance.balanceOf(fromAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 90, 'it deducts the amount from senders account');
            return tokenInstance.balanceOf(toAccount);
        }).then(function(balance) {
            assert.equal(balance.toNumber(), 10, 'it adds the amount to recievers account');
            return tokenInstance.allowance(fromAccount, spendingAccount);
        }).then((allowance) => {
            assert.equal(allowance.toNumber(), 0, 'deducts the amount from allowance')
        });
    });

});