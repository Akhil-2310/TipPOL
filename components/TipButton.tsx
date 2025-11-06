"use client"

import { useState } from "react"
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { BrowserProvider, Contract, parseEther } from 'ethers'

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

interface TipButtonProps {
  postId: string
  authorName: string
  authorAddress: string
  onTipSuccess: (amount: number) => void
}

// ABI for the TipCit contract functions
const TIP_CONTRACT_ABI = [
  {
    "inputs": [{"internalType": "uint256", "name": "_postId", "type": "uint256"}],
    "name": "tipPost",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  }
]

const CONTRACT_ADDRESS = "0x501F1ABBFae1f7382cfA54871685eB1E8A845fb6"

export default function TipButton({ postId, authorName, onTipSuccess }: TipButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showTipModal, setShowTipModal] = useState(false)
  const [tipAmount, setTipAmount] = useState("0.01")
  
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')

  const handleTip = async () => {
    if (!isConnected) {
      open()
      return
    }

    if (!walletProvider) {
      alert("Wallet provider not available")
      return
    }

    setIsLoading(true)

    try {
      const ethersProvider = new BrowserProvider(walletProvider as unknown as EthereumProvider)
      const signer = await ethersProvider.getSigner()
      
      const contract = new Contract(CONTRACT_ADDRESS, TIP_CONTRACT_ABI, signer)
      
      // Send tip to the specific post
      const tx = await contract.tipPost(postId, {
        value: parseEther(tipAmount)
      })
      
      await tx.wait()

      console.log(`Tipped ${tipAmount} POL to ${authorName} for post ${postId}`)

      onTipSuccess(Number.parseFloat(tipAmount))
      setShowTipModal(false)

      // Show success message
      alert(`Successfully tipped ${tipAmount} POL to ${authorName}!`)
    } catch (error) {
      console.error("Tip failed:", error)
      alert(`Tip failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const predefinedAmounts = ["0.001", "0.01", "0.05", "0.1"]

  return (
    <>
      <button
        onClick={() => isConnected ? setShowTipModal(true) : open()}
        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 font-medium shadow-sm"
      >
        💰 {isConnected ? 'Tip' : 'Connect to Tip'}
      </button>

      {showTipModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Tip {authorName}</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Amount (POL)</label>
              <input
                type="number"
                step="0.001"
                min="0.001"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Quick amounts:</p>
              <div className="flex gap-2">
                {predefinedAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTipAmount(amount)}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    {amount} POL
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowTipModal(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTip}
                disabled={isLoading || !tipAmount || Number.parseFloat(tipAmount) <= 0}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 transition-all duration-200"
              >
                {isLoading ? "Processing..." : `Tip ${tipAmount} POL`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
