"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import PostCard from "@/components/PostCard"
import Navigation from "@/components/Navigation"
import { useAppKitAccount } from '@reown/appkit/react'
import { JsonRpcProvider, Contract } from 'ethers'

interface Post {
  id: string
  author: string
  authorAddress: string
  achievement: string
  description: string
  timestamp: string
  tips: number
  tipAmount: number
}

interface BlockchainPost {
  id: bigint
  author: string
  achievement: string
  description: string
  timestamp: bigint
  tips: bigint
  tipAmount: bigint
}

// ABI for reading user posts
const READ_POSTS_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "_user", "type": "address"}],
    "name": "getUserPosts",
    "outputs": [{
      "components": [
        {"internalType": "uint256", "name": "id", "type": "uint256"},
        {"internalType": "address", "name": "author", "type": "address"},
        {"internalType": "string", "name": "achievement", "type": "string"},
        {"internalType": "string", "name": "description", "type": "string"},
        {"internalType": "uint256", "name": "timestamp", "type": "uint256"},
        {"internalType": "uint256", "name": "tips", "type": "uint256"},
        {"internalType": "uint256", "name": "tipAmount", "type": "uint256"}
      ],
      "internalType": "struct Tip.Post[]",
      "name": "",
      "type": "tuple[]"
    }],
    "stateMutability": "view",
    "type": "function"
  }
]

const CONTRACT_ADDRESS = "0x501F1ABBFae1f7382cfA54871685eB1E8A845fb6"

export default function MyPostsPage() {
  const [myPosts, setMyPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  
  const { address, isConnected } = useAppKitAccount()

  const fetchMyPosts = useCallback(async () => {
    if (!isConnected || !address) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      // Use read-only provider to avoid ENS issues
      const provider = new JsonRpcProvider('https://polygon-rpc.com/', {
        chainId: 137,
        name: 'polygon',
      })
      const contract = new Contract(CONTRACT_ADDRESS, READ_POSTS_ABI, provider)
        
        const blockchainPosts = await contract.getUserPosts(address)
        
        const formattedPosts: Post[] = blockchainPosts.map((post: BlockchainPost) => ({
          id: post.id.toString(),
          author: "You",
          authorAddress: post.author,
          achievement: post.achievement,
          description: post.description,
          timestamp: new Date(Number(post.timestamp) * 1000).toISOString(),
          tips: Number(post.tips),
          tipAmount: Number(post.tipAmount) / 1e18 // Convert from wei to PC
        }))
        
      setMyPosts(formattedPosts)
    } catch (error) {
      console.error("Failed to fetch posts:", error)
      // Fallback to empty array on error
      setMyPosts([])
    } finally {
      setLoading(false)
    }
  }, [isConnected, address])

  useEffect(() => {
    fetchMyPosts()
  }, [address, isConnected, fetchMyPosts])

  // Add a refresh function for manual refresh
  const handleRefresh = () => {
    fetchMyPosts()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Posts</h1>
            <p className="text-gray-600">Your shared achievements</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Loading..." : "🔄 Refresh"}
            </button>
            <Link
              href="/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Post
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading your posts...</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {myPosts.map((post) => (
                <PostCard key={post.id} post={post} isOwn={true} />
              ))}
            </div>

            {myPosts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  {!isConnected 
                    ? "Connect your wallet to view your posts."
                    : "You haven&apos;t shared any achievements yet."
                  }
                </p>
                {isConnected && (
                  <Link
                    href="/create"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Share Your First Achievement
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
