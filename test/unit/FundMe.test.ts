import { ethers, deployments, getNamedAccounts, network } from "hardhat"
import { assert, expect } from "chai"
import { FundMe } from "../../typechain-types"
import { developementChains } from "../../helper-hardhat-config"

!developementChains.includes(network.name)
  ? describe.skip
  : describe("FundMe", async function () {
      let fundMe: FundMe, deployer: string, mockV3Aggregator: any

      const sendValue = ethers.utils.parseEther("1")

      beforeEach(async function () {
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract(
          "MockV3Aggregator",
          deployer
        )
      })

      describe("constructor", async function () {
        it("sets the aggregator address correctly", async function () {
          const response = await fundMe.s_priceFeed()
          assert.equal(response, mockV3Aggregator.address)
        })
      })

      describe("fund", async function () {
        it("fails if you don't send enough ETH", async function () {
          await expect(fundMe.fund()).to.be.revertedWith(
            "You need to spend more ETH!"
          )
        })

        it("updates the amount funded data structure", async function () {
          await fundMe.fund({ value: sendValue })
          const response = await fundMe.s_addressToAmountFunded(deployer)
          assert.equal(response.toString(), sendValue.toString())
        })

        it("adds funder to array of funders", async function () {
          await fundMe.fund({ value: sendValue })
          const response = await fundMe.s_funders(0)
          assert.equal(response.toString(), deployer.toString())
        })
      })

      describe("withdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue })
        })

        it("withdraw ETH from a single founder", async function () {
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          assert.equal(endingFundMeBalance.toString(), "0")
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })

        it("allows as to withdraw with multiple funders", async function () {
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          const transactionResponse = await fundMe.withdraw()
          const transactionReceipt = await transactionResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          await expect(fundMe.s_funders(0)).to.be.reverted

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await (
                await fundMe.s_addressToAmountFunded(accounts[i].address)
              ).toString(),
              "0"
            )
          }
        })

        it("only allows the owner to withdraw", async function () {
          const accounts = await ethers.getSigners()
          const attackerConnectedContract = await fundMe.connect(accounts[1])
          await expect(
            attackerConnectedContract.withdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
        })
      })

      describe("cheaperWithdraw", async function () {
        beforeEach(async function () {
          await fundMe.fund({ value: sendValue })
        })

        it("withdraw ETH from a single founder", async function () {
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          const transactionResponse = await fundMe.cheaperWithdraw()
          const transactionReceipt = await transactionResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          const endingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const endingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          assert.equal(endingFundMeBalance.toString(), "0")
          assert.equal(
            startingFundMeBalance.add(startingDeployerBalance).toString(),
            endingDeployerBalance.add(gasCost).toString()
          )
        })

        it("allows as to withdraw with multiple funders", async function () {
          const accounts = await ethers.getSigners()
          for (let i = 1; i < 6; i++) {
            const fundMeConnectedContract = await fundMe.connect(accounts[i])
            await fundMeConnectedContract.fund({ value: sendValue })
          }
          const startingFundMeBalance = await fundMe.provider.getBalance(
            fundMe.address
          )
          const startingDeployerBalance = await fundMe.provider.getBalance(
            deployer
          )

          const transactionResponse = await fundMe.cheaperWithdraw()
          const transactionReceipt = await transactionResponse.wait(1)

          const { gasUsed, effectiveGasPrice } = transactionReceipt
          const gasCost = gasUsed.mul(effectiveGasPrice)

          await expect(fundMe.s_funders(0)).to.be.reverted

          for (let i = 1; i < 6; i++) {
            assert.equal(
              await (
                await fundMe.s_addressToAmountFunded(accounts[i].address)
              ).toString(),
              "0"
            )
          }
        })

        it("only allows the owner to withdraw", async function () {
          const accounts = await ethers.getSigners()
          const attackerConnectedContract = await fundMe.connect(accounts[1])
          await expect(
            attackerConnectedContract.cheaperWithdraw()
          ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
        })
      })
    })
