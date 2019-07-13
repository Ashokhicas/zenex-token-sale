pragma solidity >=0.4.21 <0.6.0;

import "./ZenexToken.sol";

contract ZenexTokenSale {
    address admin;
    ZenexToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);

    //constructor
    constructor(ZenexToken _tokenContract, uint256 _tokenPrice) public {
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;
    }

    //Calculate wei price is not lesser than the actual value
    //Referenced from ds-math sapphub library gtihub
    function calculatePrice(uint x, uint y) internal pure returns (uint z){
        require(y == 0 || (z = x * y) / y == x);
    }


    function buyTokens(uint256 _numberOfTokens) public payable {
        require(msg.value == calculatePrice(_numberOfTokens, tokenPrice));
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        tokensSold += _numberOfTokens;
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        require(msg.sender == admin, 'only admin can end the sale');
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
        selfdestruct(msg.sender);
    }
}