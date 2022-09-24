import { run } from "hardhat"

export const verify = async function (contractAddress: string, args: any[]) {
  console.log("Verifying contract ...")

  try {
    await run("verify:verify", {
      address: contractAddress,
      constructorArguments: args,
    })

    console.log("Contract Verified Successfully")
  } catch (e: any) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log("Already Verified!")
    } else {
      console.log(e)
    }
  }
}
