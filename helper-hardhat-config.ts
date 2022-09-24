export type ChainID = keyof typeof networkConfig

export const networkConfig: {
  [key: number]: { name: string; ethUsdPriceFeed: string }
} = {
  5: {
    name: "goerli",
    ethUsdPriceFeed: "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
  },
  // 31337
}

export const DECIMALS = 8
export const INITIAL_ANSWER = 2000 * 100000000

export const developementChains = ["hardhat", "localhost"]
