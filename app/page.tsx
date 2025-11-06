"use client"

import { useState, useEffect } from "react"
import PostCard from "@/components/PostCard"
import Navigation from "@/components/Navigation"
import { useAppKitAccount } from '@reown/appkit/react'
import { Contract, JsonRpcProvider } from 'ethers'

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

// ABI for reading all posts
const READ_ALL_POSTS_ABI = [
  {
    "inputs": [],
    "name": "getAllPosts",
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

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x501F1ABBFae1f7382cfA54871685eB1E8A845fb6"

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  
  // const { walletProvider } = useAppKitProvider('eip155')
  const { address } = useAppKitAccount()

  const fetchAllPosts = async () => {
    setLoading(true)
    try {
      // Use read-only provider to avoid ENS issues
      const provider = new JsonRpcProvider('https://polygon-rpc.com/', {
        chainId: 137,
        name: 'polygon',
      })
      const contract = new Contract(CONTRACT_ADDRESS, READ_ALL_POSTS_ABI, provider)
          
      const blockchainPosts = await contract.getAllPosts()
      
      const formattedPosts: Post[] = blockchainPosts.map((post: BlockchainPost) => ({
        id: post.id.toString(),
        author: `${post.author.slice(0, 6)}...${post.author.slice(-4)}`, // Shortened address as author name
        authorAddress: post.author,
        achievement: post.achievement,
        description: post.description,
        timestamp: new Date(Number(post.timestamp) * 1000).toISOString(),
        tips: Number(post.tips),
        tipAmount: Number(post.tipAmount) / 1e18 // Convert from wei to POL
      }))
      
      // Sort by timestamp, newest first
      formattedPosts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      
      setPosts(formattedPosts)
    } catch (error) {
      console.error("Failed to fetch posts from blockchain:", error)
      // Fallback to mock data on error
      const mockPosts: Post[] = [
            {
              id: "1",
              author: "0x742d...4567",
              authorAddress: "0x742d35Cc6634C0532925a3b8D0f4E6f8b1234567",
              achievement: "Completed my first marathon!",
              description:
                "After 6 months of training, I finally completed the NYC Marathon in 4:15:32. The feeling of crossing that finish line was incredible!",
              timestamp: "2024-01-10T10:30:00Z",
              tips: 12,
              tipAmount: 0.25,
            },
            {
              id: "2",
              author: "0x8ba1...def8",
              authorAddress: "0x8ba1f109551bD432803012645Hac136c8abcdef8",
              achievement: "Launched my startup",
              description:
                "Today marks the official launch of my SaaS platform. It took 2 years of development, but we finally made it to market!",
              timestamp: "2024-01-09T15:45:00Z",
              tips: 8,
              tipAmount: 0.18,
            },
            {
              id: "3",
              author: "0x123a...bcde",
              authorAddress: "0x123a4567890123456789012345678901234abcde",
              achievement: "Lost 30 pounds",
              description:
                "Reached my weight loss goal through consistent diet and exercise. Feeling healthier and more confident than ever!",
              timestamp: "2024-01-08T09:20:00Z",
              tips: 15,
              tipAmount: 0.32,
            },
      ]
      setPosts(mockPosts)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllPosts()
  }, [address]) // Refresh when address changes

  // Add a refresh function for manual refresh
  const handleRefresh = () => {
    fetchAllPosts()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Achievement Feed</h1>
                            <p className="text-gray-600">Celebrate and support others&apos; accomplishments</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Loading..." : "🔄 Refresh"}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading posts...</p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {posts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No posts yet. Be the first to share an achievement!</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
