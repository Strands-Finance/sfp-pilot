import hre from "hardhat";
import "dotenv/config";
import { ethers } from "hardhat";
// Types
import { StrandsAPI, StrandsSFP } from "../typechain-types";
import apiABI from '../artifacts/contracts/StrandsAPI.sol/StrandsAPI.json'
import sfpABI from '../artifacts/contracts/StrandsSFP.sol/StrandsSFP.json'


async function main() {
  let api: StrandsAPI;
  let sfp: StrandsSFP;

  const adminWallet = process.env.ADMIN_ADDRESS as string;;

  const [deployer, ,] = await ethers.getSigners();
  console.log("deployer=", deployer.address);

  api = (await (
    await ethers.deployContract("StrandsAPI", [adminWallet, adminWallet])
  ).waitForDeployment()) as any as StrandsAPI;
  sfp = (await (
    await ethers.deployContract("StrandsSFP", [await api.getAddress()])
  ).waitForDeployment()) as any as StrandsSFP;

  const apiAddress = await api.getAddress();
  console.log("api address=%s", apiAddress);
  const sfpAddress = await sfp.getAddress();
  console.log("SFP address=%s", await sfp.getAddress());

  await hre.run("verify:verify", {
    address: apiAddress,
    constructorArguments: [adminWallet, adminWallet],
  });
  await hre.run("verify:verify", {
    address: sfpAddress,
    constructorArguments: [apiAddress],
  });
}

main().then((response) => console.log(response));
