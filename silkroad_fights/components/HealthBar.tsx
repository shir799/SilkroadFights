import { theme } from '../lib/theme'

interface HealthBarProps {
  currentHp: number
  maxHp: number
  showPercentage?: boolean;
}

export function HealthBar({ currentHp, maxHp, showPercentage }: HealthBarProps) {
  const percentage = (currentHp / maxHp) * 100
  const getColor = () => {
    if (percentage > 66) return theme.colors.health.good
    if (percentage > 33) return theme.colors.health.medium
    return theme.colors.health.low
  }

  return (
    <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden relative">
      <div 
        className="h-full transition-all duration-300 ease-in-out flex items-center justify-center text-[8px] font-bold text-white"
        style={{ 
          width: `${percentage}%`,
          backgroundColor: getColor()
        }}
      >
        {showPercentage && `${Math.round(percentage)}%`}
      </div>
    </div>
  )
}

