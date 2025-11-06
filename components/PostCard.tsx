"use client"

import { useState } from "react"
import TipButton from "./TipButton"
import { useAppKitAccount } from '@reown/appkit/react'

interface Post {
  id: string
  author: string
  authorAddress: string
  achievement: string
  description: string
  timestamp: string
  tips: number
  tipAmount: number
  imageUrl?: string
}

interface PostCardProps {
  post: Post
  isOwn?: boolean
}

export default function PostCard({ post, isOwn = false }: PostCardProps) {
  const [currentTips, setCurrentTips] = useState(post.tips)
  const [currentTipAmount, setCurrentTipAmount] = useState(post.tipAmount)
  
  const { address } = useAppKitAccount()
  
  // Check if current user is the author of this post
  const isUserPost = address && post.authorAddress.toLowerCase() === address.toLowerCase()

  // Parse description to separate text and image
  const parseDescription = (description: string) => {
    const separator = '|||IMAGE|||'
    if (description.includes(separator)) {
      const [text, imageData] = description.split(separator)
      return { text, imageData }
    }
    return { text: description, imageData: null }
  }

  const { text: postDescription, imageData } = parseDescription(post.description)

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleTipSuccess = (amount: number) => {
    setCurrentTips((prev) => prev + 1)
    setCurrentTipAmount((prev) => prev + amount)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
            {post.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{post.author}</h3>
            <p className="text-sm text-gray-500">{formatDate(post.timestamp)}</p>
          </div>
        </div>
        {isOwn && <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Your Post</span>}
      </div>

      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">🎉 {post.achievement}</h2>
        <p className="text-gray-700 leading-relaxed">{postDescription}</p>
        {imageData && (
          <div className="mt-3">
            <img
              src={imageData}
              alt="Post image"
              className="w-full rounded-lg border border-gray-200 max-h-96 object-cover"
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center space-x-1">
            <span>💰</span>
            <span>{currentTips} tips</span>
          </span>
          <span className="flex items-center space-x-1">
            <span>💎</span>
            <span>{currentTipAmount.toFixed(3)} POL</span>
          </span>
        </div>

        {!isOwn && !isUserPost && <TipButton postId={post.id} authorName={post.author} authorAddress={post.authorAddress} onTipSuccess={handleTipSuccess} />}
        {(isOwn || isUserPost) && (
          <span className="text-sm text-gray-500 italic">Your post</span>
        )}
      </div>
    </div>
  )
}
