import { network } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
  ChainID,
  developementChains,
  networkConfig,
} from "../helper-hardhat-config"
import { verify } from "../utils/verify"

module.exports = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, log, get } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId || 5

  let ethUsdPriceFeedAddress

  if (developementChains.includes(network.name)) {
    const ethUsdAggregator = await get("MockV3Aggregator")
    ethUsdPriceFeedAddress = ethUsdAggregator.address
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainId].ethUsdPriceFeed
  }

  const args = [ethUsdPriceFeedAddress]

  const fundMe = await deploy("FundMe", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  })

  if (
    !developementChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(fundMe.address, args)
  }

  log("--------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
