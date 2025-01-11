import React from 'react';
import { Unit } from '../lib/gameLogic';
import { HealthBar } from './HealthBar';
import { theme } from '../lib/theme';

interface UnitDetailsProps {
  unit: Unit;
}

const UnitDetails: React.FC<UnitDetailsProps> = ({ unit }) => {
  const getUnitImage = (unitType: string) => {
    if (unitType.includes('TR')) return theme.images.trader;
    if (unitType.includes('H')) return theme.images.hunter;
    if (unitType.includes('KT')) return theme.images.kingThief;
    if (unitType.includes('TH')) return theme.images.thief;
    return '';
  };

  return (
    <div className="p-1 rounded-lg bg-opacity-80 bg-gray-800 text-white text-xs">
      <div className="flex items-center mb-1">
        <div className="w-8 h-8 relative flex items-center justify-center mr-1">
          <img 
            src={getUnitImage(unit.type)} 
            alt={unit.type} 
            className={`w-full h-full object-contain ${unit.type.includes('TH') ? 'scale-90' : ''}`}
            style={unit.type.includes('TH') ? { filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' } : undefined}
          />
        </div>
        <div>
          <h4 className="font-bold text-xs">{unit.type}</h4>
          <HealthBar currentHp={unit.hp} maxHp={unit.maxHp} showPercentage />
        </div>
      </div>
      <p>HP: {unit.hp} / {unit.maxHp}</p>
      <p>Damage: {unit.type === 'KT' ? '2 (1 vs Hunter)' : '1'}</p>
      <p className="truncate">Abilities: {unit.abilities.join(', ')}</p>
      {unit.hasGold && <p className="text-yellow-400">Carrying Gold</p>}
    </div>
  );
};

export default UnitDetails;

