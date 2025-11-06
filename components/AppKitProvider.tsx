'use client'

import { ReactNode } from 'react'
import '../lib/config' // Import the config to initialize AppKit

interface AppKitProviderProps {
  children: ReactNode
}

export default function AppKitProvider({ children }: AppKitProviderProps) {
  return <>{children}</>
}