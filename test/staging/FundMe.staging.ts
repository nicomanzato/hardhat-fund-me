import { assert } from "chai"
import { ethers, network } from "hardhat"
import { developementChains } from "../../helper-hardhat-config"
import { FundMe } from "../../typechain-types"

developementChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      const { getNamedAccounts } = require("hardhat")

      describe("FundMe", async function () {
        let fundMe: FundMe, deployer
        const sendValue = ethers.utils.parseEther("1")

        beforeEach(async () => {
          deployer = (await getNamedAccounts()).deployer
          fundMe = await ethers.getContract("FundMe", deployer)
        })

        it("allows people to fund and withdraw", async function () {
          await fundMe.fund({ value: sendValue })
          await fundMe.withdraw()
          const endingBalance = await fundMe.provider.getBalance(fundMe.address)
          assert.equal(endingBalance.toString(), "0")
        })
      })
    })
