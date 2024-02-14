// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC4626.sol";

contract StrandsSFP is ERC4626 {

  constructor(IERC20 depositToken) ERC4626(depositToken) ERC20("Strands Segregated Fund Proxy", "Strands.sfp") {}

  function getSharePrice() external view returns (uint) {
    return _convertToAssets(1 ether, Math.Rounding.Floor);
  }

}