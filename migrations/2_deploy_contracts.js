const ZenexToken = artifacts.require("ZenexToken");
const ZenexTokenSale = artifacts.require("ZenexTokenSale");

module.exports = function(deployer) {
  deployer.deploy(ZenexToken, 1000000).then(() => {
    //Token price is 0.001 Ether
    var tokenPrice = 1000000000000000; //in wei  
    return deployer.deploy(ZenexTokenSale, ZenexToken.address, tokenPrice);
  });
  
};
