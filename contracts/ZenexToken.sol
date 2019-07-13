pragma solidity >=0.4.21 <0.6.0;

contract ZenexToken {
  string public name = 'Zenex Token';
  string public symbol = 'ZENT';
  string public standard = 'Zenex Token v1.0';

  //transfer event

  uint256 public totalSupply;
  mapping(address => uint256) public balanceOf;
  mapping(address => mapping (address => uint256)) public allowance;


  event Transfer(  
      address indexed _from,
      address indexed _to,
      uint256 _value
  );

  event Approval(  
      address indexed _owner,
      address indexed _spender,
      uint256 _value
  );

  constructor(uint256 _initialSupply) public {
    balanceOf[msg.sender] = _initialSupply;
    totalSupply = _initialSupply;
    //allocate initial supply
  }

  //transfer function
  //exception if not enough token
  //event emit
  //return a boolean value

  function transfer(address _to, uint256 _value) public returns (bool success) {
      require(balanceOf[msg.sender] >= _value);
      balanceOf[msg.sender] -= _value;
      balanceOf[_to] += _value;

      emit Transfer(msg.sender, _to, _value);
      return true;
  }

  //approve function
  function approve(address _spender, uint256 _value) public returns (bool success) {
      allowance[msg.sender][_spender] = _value;
      emit Approval(msg.sender, _spender, _value);
      return true;
  }
  //transfer from
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
      require(_value <= balanceOf[_from]);
      require(_value <= allowance[_from][msg.sender]);
      balanceOf[_from] -= _value;
      balanceOf[_to] += _value;
      allowance[_from][msg.sender] -= _value;
      emit Transfer(_from, _to, _value);
      return true;
  }
  //

}