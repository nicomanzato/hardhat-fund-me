import { network } from "hardhat"
import { HardhatRuntimeEnvironment } from "hardhat/types"
import {
  ChainID,
  DECIMALS,
  developementChains,
  INITIAL_ANSWER,
} from "../helper-hardhat-config"

module.exports = async function ({
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()

  if (developementChains.includes(network.name)) {
    log("Local network detected! Deploying mocks ...")
    await deploy("MockV3Aggregator", {
      contract: "MockV3Aggregator",
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_ANSWER],
    })
    log("Mocks deployed!")
    log("---------------------------------------")
  }
}

module.exports.tags = ["all", "mocks"]
