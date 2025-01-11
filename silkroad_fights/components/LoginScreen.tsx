import { useState } from 'react'
import { theme } from '../lib/theme'

interface LoginScreenProps {
  onLogin: () => void
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    onLogin()
  }

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-8 relative"
      style={{
        background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.7)), url(https://hebbkx1anhila5yf.public.blob.vercel-storage.com/wu%CC%88ste.png-jROVC0W501XiwIuImGamlbQ5r3KKNZ.webp)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        <div className="w-full flex justify-center items-center mb-8">
          <img src={theme.images.logo} alt="Silkroad Fights" className="h-48" />
        </div>
        
        <div className="w-full max-w-md p-8 rounded-lg bg-black bg-opacity-50 backdrop-blur-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 bg-[#2a2a2a] border border-[#D4AF37] text-white rounded"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-[#2a2a2a] border border-[#D4AF37] text-white rounded"
              required
            />
            <button
              type="submit"
              className="w-full p-4 text-xl font-bold text-white rounded transform hover:scale-105 transition-transform"
              style={{
                background: theme.gradients.button,
                border: '2px solid #8B4513',
                boxShadow: '0 0 20px rgba(255, 165, 0, 0.3)'
              }}
            >
              Enter the Silkroad
            </button>
          </form>
        </div>

        <div className="mt-8 text-white max-w-2xl text-center">
          <h3 className="text-2xl font-bold mb-4" style={{ color: theme.colors.text.secondary }}>Game Instructions</h3>
          <p className="mb-2">Welcome to Silkroad Fights, where Traders and Thieves battle for control of the ancient trade routes!</p>
          <p className="mb-2">Traders: Move your units to collect silk and reach the golden zone. Protect your Hunter, your most valuable piece.</p>
          <p className="mb-2">Thieves: Intercept the Traders, steal their silk, and eliminate their units. Your King Thief is crucial to victory.</p>
          <p>Use your faction's unique abilities wisely, and may the most cunning player triumph!</p>
        </div>
      </div>
    </div>
  )
}

