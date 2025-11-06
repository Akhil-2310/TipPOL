"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Navigation from "@/components/Navigation"
import { useAppKit, useAppKitAccount, useAppKitProvider } from '@reown/appkit/react'
import { BrowserProvider, Contract } from 'ethers'

interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

// ABI for creating posts
const CREATE_POST_ABI = [
  {
    "inputs": [
      {"internalType": "string", "name": "_achievement", "type": "string"},
      {"internalType": "string", "name": "_description", "type": "string"}
    ],
    "name": "createPost",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const CONTRACT_ADDRESS = "0x501F1ABBFae1f7382cfA54871685eB1E8A845fb6"

export default function CreatePostPage() {
  const [achievement, setAchievement] = useState("")
  const [description, setDescription] = useState("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageData, setImageData] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const { walletProvider } = useAppKitProvider('eip155')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Check file type
    if (!file.type.startsWith('image/')) {
      alert("Please select an image file")
      return
    }

    // Compress and resize the image
    const reader = new FileReader()
    reader.onloadend = () => {
      const img = new Image()
      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Calculate new dimensions (max 400px width/height)
        let width = img.width
        let height = img.height
        const maxSize = 400

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress image
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to base64 with compression (0.6 quality)
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6)
        
        // Check compressed size (limit to ~100KB in base64)
        if (compressedBase64.length > 150000) {
          alert("Image is still too large after compression. Please choose a smaller image.")
          return
        }

        setImagePreview(compressedBase64)
        setImageData(compressedBase64)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImagePreview(null)
    setImageData(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected) {
      open()
      return
    }

    if (!walletProvider) {
      alert("Wallet provider not available")
      return
    }

    setIsSubmitting(true)

    try {
      const ethersProvider = new BrowserProvider(walletProvider as unknown as EthereumProvider)
      const signer = await ethersProvider.getSigner()
      
      const contract = new Contract(CONTRACT_ADDRESS, CREATE_POST_ABI, signer)
      
      // Combine description with image data using a separator
      const fullDescription = imageData 
        ? `${description}|||IMAGE|||${imageData}`
        : description
      
      // Create the post on the blockchain
      const tx = await contract.createPost(achievement, fullDescription)
      const receipt = await tx.wait()
      
      console.log("Post created on blockchain:", receipt)
      
      // Navigate to main feed to see the new post
      router.push("/")
    } catch (error) {
      console.error("Failed to create post:", error)
      alert(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Achievement</h1>
          <p className="text-gray-600">Tell the community about your accomplishment</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border p-6">
          <div className="mb-6">
            <label htmlFor="achievement" className="block text-sm font-medium text-gray-700 mb-2">
              What did you achieve?
            </label>
            <input
              type="text"
              id="achievement"
              value={achievement}
              onChange={(e) => setAchievement(e.target.value)}
              placeholder="e.g., Completed my first marathon, Launched my app, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Tell us more about it
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share the details of your journey, challenges you overcame, or what this achievement means to you..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add an image (optional)
            </label>
            <div className="flex flex-col gap-3">
              {!imagePreview ? (
                <div className="flex items-center gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors text-sm"
                  >
                    📷 Choose Image
                  </label>
                  <span className="text-sm text-gray-500">Auto-compressed to ~100KB</span>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-full h-auto rounded-lg border border-gray-300 max-h-64 object-contain"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !achievement.trim() || !description.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Creating on blockchain..." : isConnected ? "Share Achievement" : "Connect Wallet to Share"}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
