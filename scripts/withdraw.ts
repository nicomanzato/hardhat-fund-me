import { ethers, getNamedAccounts } from "hardhat"
import { FundMe } from "../typechain-types"

async function main() {
  const { deployer } = await getNamedAccounts()
  const fundMe: FundMe = await ethers.getContract("FundMe", deployer)

  console.log("Withdrawing Contract...")

  const transactionResponse = await fundMe.withdraw({})

  await transactionResponse.wait(1)

  console.log("Withdraw!")
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
