import '@nomiclabs/hardhat-ethers';
import '@openzeppelin/hardhat-upgrades';
import '@typechain/hardhat';
import '@nomicfoundation/hardhat-chai-matchers';
import { extendEnvironment, HardhatUserConfig, task } from 'hardhat/config';
import 'solidity-coverage';
import 'dotenv/config';
import "@nomicfoundation/hardhat-verify";

const ownerPrivate = process.env.PRIVATE_KEY as string;
console.log("ownerPrivate=",ownerPrivate)
const ArbitrumApiKey = process.env.ARB_ETHERSCAN_KEY as string;
console.log("ArbitrumApiKey=",ArbitrumApiKey)
const OptimismApiKey = process.env.OP_ETHERSCAN_KEY as string;

console.log("OPApiKey=",OptimismApiKey)
const LyraApiKey = process.env.LYRA_SCAN_KEY as string;

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.20',
        settings: {
          outputSelection: {
            '*': {
              '*': ['storageLayout'],
            },
          },
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: '0.8.16',
        settings: {
          outputSelection: {
            '*': {
              '*': ['storageLayout'],
            },
          },
          optimizer: {
            enabled: true,
            runs: 20,
          },
        },
      },
      {
        version: '0.8.13',
        settings: {
          outputSelection: {
            '*': {
              '*': ['storageLayout'],
            },
          },
          optimizer: {
            enabled: true,
            runs: 20,
          },
        },
      }
    ],
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    local: {
      url: 'http://127.0.0.1:8545',
      accounts: {
        mnemonic:
          'test-helpers test-helpers test-helpers test-helpers test-helpers test-helpers test-helpers test-helpers test-helpers test-helpers test-helpers junk',
      },
    },
    lyra: {
      url: 'https://rpc.lyra.finance/',
      accounts: [
        ownerPrivate == undefined
          ? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
          : ownerPrivate,
      ],
      allowUnlimitedContractSize: true,

    },
    lyra_testnet: {
      url: 'https://l2-prod-testnet-0eakp60405.t.conduit.xyz/',
      accounts: [
        ownerPrivate == undefined
          ? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
          : ownerPrivate,
      ],
      allowUnlimitedContractSize: true,
    },
    'mainnet-opti': {
      url:
        process.env.OP_ALCHEMY_KEY == undefined
          ? 'https://mainnet.optimism.io'
          : `https://opt-mainnet.g.alchemy.com/v2/${process.env.OP_ALCHEMY_KEY}`,
      accounts: [
        ownerPrivate == undefined
          ? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
          : ownerPrivate,
      ],
      allowUnlimitedContractSize: true,
    },
    'mainnet-arbi': {
      url:
        process.env.ARB_ALCHEMY_KEY == undefined
          ? 'https://arb1.arbitrum.io/rpc'
          : `https://arb-mainnet.g.alchemy.com/v2/${process.env.ARB_ALCHEMY_KEY}`,
      accounts: [
        ownerPrivate == undefined
          ? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
          : ownerPrivate,
      ],
      allowUnlimitedContractSize: true,
    },
    'sepolia-arbi': {
      url:
        process.env.ARB_SEPOLIA_ALCHEMY_KEYY == undefined
          ? 'https://sepolia-rollup.arbitrum.io/rpc'
          : `https://arb-sepolia.g.alchemy.com/v2/${process.env.ARB_SEPOLIA_ALCHEMY_KEYY}`,
      accounts: [
        ownerPrivate == undefined
          ? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
          : ownerPrivate,
      ],
      allowUnlimitedContractSize: true,
    },
    'sepolia-opti': {
      url:
        process.env.ARB_SEPOLIA_ALCHEMY_KEYY == undefined
          ? 'https://sepolia.optimism.io/rpc'
          : `https://opt-sepolia.g.alchemy.com/v2/${process.env.OP_SEPOLIA_ALCHEMY_KEY}`,
      accounts: [
        ownerPrivate == undefined
          ? '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'
          : ownerPrivate,
      ],
      allowUnlimitedContractSize: true,
    },
  },
  etherscan: {
    apiKey: {
      'mainnet-arbi': ArbitrumApiKey,
      'sepolia-arbi': ArbitrumApiKey,
      'mainnet-opti': OptimismApiKey,
      'sepolia-opti': OptimismApiKey,
      lyra: LyraApiKey,
      'lyra_testnet': LyraApiKey
    },
    customChains: [
      {
        network: 'sepolia-arbi',
        chainId: 421614,
        urls: {
          apiURL: 'https://api-sepolia.arbiscan.io/api',
          browserURL: 'https://sepolia.arbiscan.io/',
        },
      },
      {
        network: 'sepolia-opti',
        chainId: 11155420,
        urls: {
          apiURL: 'https://api-sepolia-optimism.etherscan.io/api',
          browserURL: 'https://sepolia-optimism.etherscan.io/',
        },
      },
      {
        network: 'lyra',
        chainId: 957,
        urls: {
          apiURL: 'https://explorer.lyra.finance/api/v2',
          browserURL: 'https://explorer.lyra.finance/',
        }
      },
      {
        network: 'lyra_testnet',
        chainId: 957,
        urls: {
          apiURL: 'https://explorerl2new-prod-testnet-0eakp60405.t.conduit.xyz/api/v2',
          browserURL: 'https://explorerl2new-prod-testnet-0eakp60405.t.conduit.xyz/',
        }
      }
    ],
  },
  mocha: {
    timeout: 1_000_000,
  }
};

extendEnvironment(hre => {
  (hre as any).f = {
    SC: undefined,
    deploySnap: undefined,
  };
});


export default config;
