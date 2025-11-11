/**
 * Tutorial Steps Configuration for Silkroad Fights
 * Defines the complete tutorial flow with 12 engaging steps
 */

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  detailedText: string;
  targetElement?: string; // CSS selector for element to highlight
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  arrowDirection?: 'up' | 'down' | 'left' | 'right';
  requiresAction?: boolean; // User must complete action to continue
  actionType?: 'select' | 'move' | 'attack' | 'pickup' | 'deliver' | 'ability' | 'click';
  actionTarget?: string;
  icon: string; // Emoji icon
  nextButtonText?: string;
  voiceCharacter: 'merchant' | 'trader' | 'thief';
  tipHighlight?: string; // Important tip to highlight
  checkCompletion?: (gameState: any) => boolean; // Function to check if action is completed
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  // Step 1: Welcome
  {
    id: 'welcome',
    title: 'Welcome to the Silkroad!',
    description: 'Learn to master the ancient trade routes',
    detailedText: 'Greetings, traveler! I am Master Chen, your guide on the legendary Silkroad. Here, fortunes are made and lost in epic battles between Traders and Thieves. Will you protect precious cargo or plunder it? Let me show you the way!',
    position: 'center',
    icon: '🏺',
    nextButtonText: 'Begin Journey',
    voiceCharacter: 'merchant',
    tipHighlight: 'Complete the tutorial to unlock all game features!',
  },

  // Step 2: Game Objective
  {
    id: 'objective',
    title: 'Your Sacred Mission',
    description: 'Understand the path to victory',
    detailedText: 'The goal is simple but challenging: **Traders** must deliver 2 gold pieces to their base to win. **Thieves** must steal that gold or eliminate all traders. Choose your path wisely - each faction has unique strategies!',
    targetElement: '[data-tutorial="victory-conditions"]',
    position: 'bottom',
    arrowDirection: 'up',
    icon: '🎯',
    nextButtonText: 'Understood!',
    voiceCharacter: 'merchant',
    tipHighlight: 'Traders win by delivering gold, Thieves win by preventing it!',
  },

  // Step 3: The Game Board
  {
    id: 'board',
    title: 'The Battlefield Awaits',
    description: 'Understand the terrain',
    detailedText: 'This is your battlefield - a 10x10 grid where strategy meets action. Gold spawns randomly, Silk appears periodically, and fearsome bosses emerge to challenge both sides. Learn to navigate this terrain, and victory will be yours!',
    targetElement: '[data-tutorial="game-board"]',
    position: 'right',
    arrowDirection: 'left',
    icon: '🗺️',
    nextButtonText: 'Show Me More',
    voiceCharacter: 'merchant',
    tipHighlight: 'Watch for glowing cells - they indicate important items!',
  },

  // Step 4: Selecting Units
  {
    id: 'select-unit',
    title: 'Command Your Forces',
    description: 'Learn to select units',
    detailedText: 'To command your forces, simply click on any of your units. You\'ll see them highlighted with a golden glow. A selected unit can move, attack, or use special abilities. Try selecting one of your units now!',
    targetElement: '[data-tutorial="your-units"]',
    position: 'right',
    arrowDirection: 'left',
    requiresAction: true,
    actionType: 'select',
    icon: '👆',
    nextButtonText: 'Select a Unit',
    voiceCharacter: 'trader',
    tipHighlight: 'Your units have a blue/gold border. Enemy units are red!',
    checkCompletion: (gameState) => gameState?.selectedUnit !== null,
  },

  // Step 5: Moving Units
  {
    id: 'move-unit',
    title: 'Master of Movement',
    description: 'Navigate the battlefield',
    detailedText: 'Excellent! Now let\'s move your unit. With a unit selected, click on an empty adjacent cell to move there. Movement is strategic - position your units to grab gold, ambush enemies, or retreat to safety. Give it a try!',
    targetElement: '[data-tutorial="game-board"]',
    position: 'top',
    arrowDirection: 'down',
    requiresAction: true,
    actionType: 'move',
    icon: '🏃',
    nextButtonText: 'Move Your Unit',
    voiceCharacter: 'trader',
    tipHighlight: 'Green cells show where you can move!',
    checkCompletion: (gameState) => {
      // Check if unit has moved from original position
      return true; // Implementation will handle this
    },
  },

  // Step 6: Gold - The Prize
  {
    id: 'gold-mechanics',
    title: 'The Golden Prize',
    description: 'Learn about gold collection',
    detailedText: 'Behold the gold! This precious metal is your ticket to victory. Move any unit onto a gold piece to pick it up. The unit will carry it (shown by a gold icon). But beware - if that unit dies, the gold drops and anyone can claim it!',
    targetElement: '[data-tutorial="gold-display"]',
    position: 'bottom',
    arrowDirection: 'up',
    icon: '💰',
    nextButtonText: 'I Want Gold!',
    voiceCharacter: 'merchant',
    tipHighlight: 'Gold carriers move slower - protect them!',
  },

  // Step 7: Picking Up Gold
  {
    id: 'pickup-gold',
    title: 'Claim Your Fortune',
    description: 'Collect the gold',
    detailedText: 'Now for the exciting part! Move one of your units onto a gold piece to collect it. Watch as your unit picks it up and carries it. This gold is now yours... unless an enemy defeats your carrier!',
    targetElement: '[data-tutorial="gold-spawn"]',
    position: 'left',
    arrowDirection: 'right',
    requiresAction: true,
    actionType: 'pickup',
    icon: '💎',
    nextButtonText: 'Grab the Gold!',
    voiceCharacter: 'trader',
    tipHighlight: 'Units carrying gold show a golden aura!',
    checkCompletion: (gameState) => {
      return gameState?.traderUnits?.some((unit: any) => unit.hasGold) || false;
    },
  },

  // Step 8: Combat Basics
  {
    id: 'combat',
    title: 'The Art of Battle',
    description: 'Engage your enemies',
    detailedText: 'Combat is inevitable on the Silkroad! To attack an enemy, select your unit and click on an adjacent enemy. Both units will roll dice - higher roll wins! Damage is dealt based on the difference. Victory requires both luck and strategy!',
    targetElement: '[data-tutorial="enemy-units"]',
    position: 'left',
    arrowDirection: 'right',
    icon: '⚔️',
    nextButtonText: 'Ready for Battle!',
    voiceCharacter: 'trader',
    tipHighlight: 'Combat uses dice rolls - watch the rolls appear during battle!',
  },

  // Step 9: Abilities System
  {
    id: 'abilities',
    title: 'Unleash Special Powers',
    description: 'Master your abilities',
    detailedText: 'Your units possess special abilities! From Dash (quick movement) to Shield Wall (extra defense), these powers can turn the tide of battle. Abilities cost Silk to use. Click the ability buttons at the bottom to activate them!',
    targetElement: '[data-tutorial="ability-bar"]',
    position: 'top',
    arrowDirection: 'down',
    icon: '✨',
    nextButtonText: 'Show Me Abilities',
    voiceCharacter: 'merchant',
    tipHighlight: 'Abilities have cooldowns - use them wisely!',
  },

  // Step 10: Silk Collection
  {
    id: 'silk',
    title: 'The Precious Silk',
    description: 'Gather resources for abilities',
    detailedText: 'Silk is the currency of power! It spawns periodically on the battlefield. Collect silk to fuel your special abilities. The more silk you have, the more abilities you can unleash. Bosses also drop valuable silk when defeated!',
    targetElement: '[data-tutorial="silk-display"]',
    position: 'bottom',
    arrowDirection: 'up',
    icon: '🧵',
    nextButtonText: 'I Need Silk!',
    voiceCharacter: 'merchant',
    tipHighlight: 'Silk appears every 30 seconds - race to collect it!',
  },

  // Step 11: Boss Monsters
  {
    id: 'bosses',
    title: 'Beware the Bosses',
    description: 'Face legendary monsters',
    detailedText: 'Three legendary bosses roam the Silkroad: Tiger Giry, Skeleto King, and Murucha. They spawn every 2 minutes and attack both sides! Defeat them for massive silk rewards and powerful buffs. But be careful - they are formidable foes!',
    icon: '👹',
    position: 'center',
    nextButtonText: 'I\'m Ready!',
    voiceCharacter: 'merchant',
    tipHighlight: 'Boss buffs last 30 seconds - use them strategically!',
  },

  // Step 12: Delivering Gold (Victory)
  {
    id: 'deliver-gold',
    title: 'The Path to Victory',
    description: 'Deliver gold to win',
    detailedText: 'The final lesson! Traders must move their gold-carrying units to their base (marked with a special icon). Deliver 2 gold pieces to achieve victory! Thieves, your job is to stop them at all costs. May the best faction win!',
    targetElement: '[data-tutorial="trader-base"]',
    position: 'right',
    arrowDirection: 'left',
    icon: '🏆',
    nextButtonText: 'Complete Tutorial',
    voiceCharacter: 'merchant',
    tipHighlight: 'First to 2 gold deliveries wins the game!',
  },
];

// Tutorial progress tracking
export interface TutorialProgress {
  currentStepIndex: number;
  completedSteps: string[];
  skipped: boolean;
  completed: boolean;
  lastPlayedDate: string;
}

// Default tutorial progress
export const DEFAULT_TUTORIAL_PROGRESS: TutorialProgress = {
  currentStepIndex: 0,
  completedSteps: [],
  skipped: false,
  completed: false,
  lastPlayedDate: new Date().toISOString(),
};

// Character voice tones
export const CHARACTER_VOICES = {
  merchant: {
    name: 'Master Chen',
    color: '#FFD700',
    avatar: '🧙‍♂️',
    personality: 'wise and friendly',
  },
  trader: {
    name: 'Captain Zhao',
    color: '#4169E1',
    avatar: '🛡️',
    personality: 'brave and strategic',
  },
  thief: {
    name: 'Shadow Master',
    color: '#8B0000',
    avatar: '🗡️',
    personality: 'cunning and quick',
  },
};

// Tutorial completion rewards (for motivation)
export const TUTORIAL_REWARDS = {
  silk: 100,
  achievement: 'Silkroad Scholar',
  unlocks: ['Advanced Mode', 'Custom Games', 'All Abilities'],
};

// Helper function to get step by ID
export function getTutorialStepById(id: string): TutorialStep | undefined {
  return TUTORIAL_STEPS.find(step => step.id === id);
}

// Helper function to get next step
export function getNextStep(currentIndex: number): TutorialStep | null {
  if (currentIndex < TUTORIAL_STEPS.length - 1) {
    return TUTORIAL_STEPS[currentIndex + 1];
  }
  return null;
}

// Helper function to get previous step
export function getPreviousStep(currentIndex: number): TutorialStep | null {
  if (currentIndex > 0) {
    return TUTORIAL_STEPS[currentIndex - 1];
  }
  return null;
}
