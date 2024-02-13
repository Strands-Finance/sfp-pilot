import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
import { expect } from "chai";
import "@nomicfoundation/hardhat-ethers";

import { StrandsAPI, StrandsSFP } from "../typechain-types";
import { restoreSnapshot, takeSnapshot } from "../scripts/utils/evm";
import { toBN } from "../scripts/utils/web3utils";

describe.only("pilot contract testing", function () {
  let deployer: SignerWithAddress;
  let minter: SignerWithAddress;
  let minter2: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let depositToken: StrandsAPI;
  let notDepositToken: StrandsAPI;
  let sfp: StrandsSFP;
  let sfpAddr: string;
  let snapshotId: number;
  let minterRole: string;

  before(async () => {
    [deployer, minter, minter2, alice, bob] = await ethers.getSigners();

    depositToken = (await (
      await ethers.deployContract(
        "StrandsAPI",
        [deployer.address, minter.address],
        deployer
      )
    ).waitForDeployment()) as any as StrandsAPI;

    notDepositToken = (await (
      await ethers.deployContract(
        "StrandsAPI",
        [deployer.address, minter.address],
        deployer
      )
    ).waitForDeployment()) as any as StrandsAPI;

    sfp = (await (
      await ethers.deployContract(
        "StrandsSFP",
        [await depositToken.getAddress()],
        deployer
      )
    ).waitForDeployment()) as any as StrandsSFP;
    sfpAddr = await sfp.getAddress();

    snapshotId = await takeSnapshot();

    minterRole = ethers.id("MINTER_ROLE");
  });

  beforeEach(async () => {
    await restoreSnapshot(snapshotId);
    snapshotId = await takeSnapshot();
  });

  it("should be able to deposit", async () => {
    const amount = toBN("1000");
    await depositToken.connect(minter).mint(alice.address, 2n * amount);
    await depositToken.connect(alice).approve(sfpAddr, 2n * amount);
    expect(await sfp.getSharePrice()).to.equal(toBN("1"));
    await sfp.connect(alice).deposit(amount, alice.address);
    await sfp.connect(alice).deposit(amount, bob.address);
    expect(await depositToken.balanceOf(alice.address)).to.equal(0);
    expect(await depositToken.balanceOf(sfpAddr)).to.equal(2n * amount);
    expect(await sfp.getSharePrice()).to.equal(toBN("1"));
    expect(await sfp.balanceOf(alice.address)).to.equal(amount);
    expect(await sfp.balanceOf(bob.address)).to.equal(amount);
    expect(await sfp.totalSupply()).to.equal(2n * amount);
  });

  it("should be able to mint", async () => {
    const amount = toBN("1000");
    await depositToken.connect(minter).mint(alice.address, 2n * amount);
    await depositToken.connect(alice).approve(sfpAddr, 2n * amount);
    expect(await sfp.getSharePrice()).to.equal(toBN("1"));
    await sfp.connect(alice).mint(amount, alice.address);
    await sfp.connect(alice).mint(amount, bob.address);
    expect(await depositToken.balanceOf(alice.address)).to.equal(0);
    expect(await depositToken.balanceOf(sfpAddr)).to.equal(2n * amount);
    expect(await sfp.getSharePrice()).to.equal(toBN("1"));
    expect(await sfp.balanceOf(alice.address)).to.equal(amount);
    expect(await sfp.balanceOf(alice.address)).to.equal(amount);
    expect(await sfp.totalSupply()).to.equal(2n * amount);
  });

  it("should be able to redeem", async () => {
    const amount = toBN("1000");
    await depositToken.connect(minter).mint(alice.address, 2n * amount);
    await depositToken.connect(alice).approve(sfpAddr, 2n * amount);
    expect(await sfp.getSharePrice()).to.equal(toBN("1"));
    await sfp.connect(alice).deposit(2n * amount, alice.address);
    expect(await depositToken.balanceOf(alice.address)).to.equal(0);
    expect(await sfp.totalSupply()).to.equal(2n * amount);
    await sfp.connect(alice).redeem(amount, alice.address, alice.address);
    await sfp.connect(alice).redeem(amount, bob.address, alice.address);
    expect(await sfp.getSharePrice()).to.equal(toBN("1"));
    expect(await sfp.balanceOf(alice.address)).to.equal(0);
    expect(await sfp.totalSupply()).to.equal(0);
    expect(await depositToken.balanceOf(alice.address)).to.equal(amount);
    expect(await depositToken.balanceOf(bob.address)).to.equal(amount);
  });

  it("should be able to withdraw", async () => {
    const amount = toBN("1000");
    await depositToken.connect(minter).mint(alice.address, 2n * amount);
    await depositToken.connect(alice).approve(sfpAddr, 2n * amount);
    expect(await sfp.getSharePrice()).to.equal(toBN("1"));
    await sfp.connect(alice).deposit(2n * amount, alice.address);
    expect(await depositToken.balanceOf(alice.address)).to.equal(0);
    expect(await sfp.totalSupply()).to.equal(2n * amount);
    await sfp.connect(alice).withdraw(amount, alice.address, alice.address);
    await sfp.connect(alice).withdraw(amount, bob.address, alice.address);
    expect(await sfp.getSharePrice()).to.equal(toBN("1"));
    expect(await sfp.balanceOf(alice.address)).to.equal(0);
    expect(await sfp.totalSupply()).to.equal(0);
    expect(await depositToken.balanceOf(alice.address)).to.equal(amount);
    expect(await depositToken.balanceOf(bob.address)).to.equal(amount);
  });

  it("should be able to transfer", async () => {
    const amount = toBN("1000");
    await depositToken.connect(minter).mint(alice.address, amount);
    await depositToken.connect(alice).approve(sfpAddr, amount);
    await sfp.connect(alice).deposit(amount, alice.address);
    await sfp.connect(alice).transfer(bob.address, amount);
    expect(await sfp.balanceOf(alice.address)).to.equal(0);
    expect(await sfp.balanceOf(bob.address)).to.equal(amount);
  });

  it("sfp should be able to transferFrom", async () => {
    const amount = toBN("1000");
    await depositToken.connect(minter).mint(alice.address, amount);
    await depositToken.connect(alice).approve(sfpAddr, amount);
    await sfp.connect(alice).deposit(amount, bob.address);
    await sfp.connect(bob).approve(alice.address, amount);
    await sfp.connect(alice).transferFrom(bob.address, alice.address, amount);
    expect(await sfp.balanceOf(alice.address)).to.equal(amount);
    expect(await sfp.balanceOf(bob.address)).to.equal(0);
  });

  it("sfp shouldnt be able to transferFrom without approval", async () => {
    const amount = toBN("1000");
    await depositToken.connect(minter).mint(alice.address, amount);
    await depositToken.connect(alice).approve(sfpAddr, amount);
    await sfp.connect(alice).deposit(amount, bob.address);
    await expect(
      sfp.connect(alice).transferFrom(bob.address, alice.address, amount)
    ).to.be.reverted;
  });

  it("transfered sfp should be redeemable", async () => {
    const amount = toBN("1000");
    await depositToken.connect(minter).mint(alice.address, amount);
    await depositToken.connect(alice).approve(sfpAddr, amount);
    await sfp.connect(alice).deposit(amount, alice.address);
    await sfp.connect(alice).transfer(bob.address, amount);
    await sfp.connect(bob).redeem(amount, bob.address, bob.address);
    expect(await depositToken.balanceOf(bob.address)).to.equal(amount);
  });

  it("should increase the number of the sfp shares with additional deposit", async () => {
    const amount = toBN("1000");
    await depositToken.connect(minter).mint(alice.address, amount);
    await depositToken.connect(alice).approve(sfpAddr, amount);
    await sfp.connect(alice).deposit(amount, alice.address);
    await depositToken.connect(minter).mint(alice.address, amount);
    await depositToken.connect(alice).approve(sfpAddr, amount);
    await sfp.connect(alice).deposit(amount, alice.address);
    expect(await sfp.balanceOf(alice.address)).to.equal(amount * 2n);
  });

  it("should increase the price of the sfp shares with direct transfer", async () => {
    const amount = toBN("100");
    await depositToken.connect(minter).mint(alice.address, 4n * amount);
    await depositToken.connect(alice).approve(sfpAddr, 4n * amount);
    await sfp.connect(alice).deposit(amount, alice.address);
    expect(await sfp.getSharePrice()).to.equal(toBN("1"));
    //mint 5% interest
    await depositToken.connect(minter).mint(sfpAddr, toBN("5"));
    expect(await sfp.getSharePrice()).to.be.closeTo(toBN("1.05"), toBN("0.01"));
    await sfp.connect(alice).deposit(amount, alice.address);
    let newShares = toBN((100 + 100 / 1.05).toString());
    expect(await sfp.balanceOf(alice.address)).to.be.closeTo(
      newShares,
      toBN("0.01")
    );
    expect(await depositToken.balanceOf(alice.address)).to.equal(2n * amount);
    await sfp.connect(alice).mint(amount, alice.address);
    newShares = toBN((100 + 100 / 1.05 + 100).toString());
    expect(await sfp.balanceOf(alice.address)).to.be.closeTo(
      newShares,
      toBN("0.01")
    );
    let newBalance = toBN((400 - 100 - 100 - 100 * 1.05).toString());
    expect(await depositToken.balanceOf(alice.address)).to.closeTo(
      newBalance,
      toBN("0.01")
    );
  });

  it("transfer notDeposit token shouldnt increase the price of the sfp shares", async () => {
    const amount = toBN("100");
    await depositToken.connect(minter).mint(alice.address, amount);
    await depositToken.connect(alice).approve(sfpAddr, amount);
    await sfp.connect(alice).deposit(amount, alice.address);
    expect(await sfp.getSharePrice()).to.equal(toBN("1"));
    await notDepositToken.connect(minter).mint(sfpAddr, toBN("1"));
    expect(await sfp.getSharePrice()).to.equal(toBN("1"));
  });

  it("newly granted minter can mint depositToken", async () => {
    const amount = toBN("1000");
    await depositToken.connect(deployer).grantRole(minterRole, minter2);
    expect(await depositToken.hasRole(minterRole, minter2)).to.be.true;
    await depositToken.connect(minter).mint(alice.address, amount);
    expect(await depositToken.balanceOf(alice.address)).to.equal(amount);
    await depositToken.connect(minter2).mint(alice.address, amount);
    expect(await depositToken.balanceOf(alice.address)).to.equal(amount * 2n);
  });

  it("non minter cant mint depositToken", async () => {
    const amount = toBN("1000");
    await expect(depositToken.connect(alice).mint(alice.address, amount)).to.be
      .reverted;
    //revoke minter role
    await depositToken.connect(deployer).revokeRole(minterRole, minter);
    expect(await depositToken.hasRole(minterRole, minter)).to.be.false;
    await expect(depositToken.connect(minter).mint(alice.address, amount)).to.be
      .reverted;
  });

  it("non minter cant burn depositToken", async () => {
    const amount = toBN("1000");
    await depositToken.connect(minter).mint(alice.address, amount);
    await expect(depositToken.connect(alice).burn(amount)).to.be.reverted;
  });

  it("minter can burn depositToken", async () => {
    const amount = toBN("1000");
    await depositToken.connect(minter).mint(alice.address, amount);
    await depositToken.connect(alice).transfer(minter, amount);
    await depositToken.connect(minter).approve(sfpAddr, amount);
    await depositToken.connect(minter).burn(amount);
  });

  // it("inflation attack", async () => {
  //   const amount = toBN('1');
  //   await depositToken.connect(minter).mint(alice.address, amount);
  //   await depositToken.connect(minter).mint(bob.address, amount);
  //   await depositToken.connect(minter).mint(bob.address, 1);
  //   await depositToken.connect(alice).approve(sfpAddr, amount);
  //   await depositToken.connect(bob).approve(sfpAddr, amount);
  //   await sfp.connect(bob).deposit(1, bob.address);
  //   await depositToken.connect(bob).transfer(sfpAddr, amount);
  //   console.log("price before alice deposit=",await sfp.getSharePrice())
  //   await sfp.connect(alice).deposit(amount, alice.address);
  //   console.log("alice sfp shares=",await sfp.balanceOf(alice.address))
  //   console.log("price after alice deposit=",await sfp.getSharePrice())
  //   await sfp.connect(bob).redeem(1, bob.address, bob.address);
  //   console.log("bobs deposit token bal after=",await depositToken.balanceOf(bob.address))
  //   console.log("contract deposit token bal after=",await depositToken.balanceOf(sfpAddr))
  // });
});
