import { createAppKit } from '@reown/appkit/react'
import { EthersAdapter } from '@reown/appkit-adapter-ethers'

// 1. Get projectId from https://cloud.reown.com
const projectId = "6bf0fb8b46e12e88e7664004567b8ab7"

// 2. Set up the Ethereum Adapter
const ethersAdapter = new EthersAdapter()

// 3. Configure the metadata
const metadata = {
  name: 'TipPOL',
  description: 'A platform to share achievements and receive tips',
  url: '', // origin must match your domain & subdomain
  icons: ['']
}

// 4. Define Polygon
const polygon = {
  id: 137,
  name: 'Polygon',
  nativeCurrency: {
    name: 'POL',
    symbol: 'POL',
    decimals: 18
  },
  rpcUrls: {
    default: { http: ['https://polygon-rpc.com/'] }
  },
  blockExplorers: {
    default: { name: 'Polygon Explorer', url: 'https://polygonscan.com/' }
  }
}

// 5. Create the modal
createAppKit({
  adapters: [ethersAdapter],
  projectId,
  networks: [polygon],
  defaultNetwork: polygon,
  metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

export { polygon }