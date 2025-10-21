export const BANNER_GRADIENTS = {
  dna: {
    name: 'DNA Brand',
    css: 'linear-gradient(135deg, hsl(151, 75%, 50%) 0%, hsl(151, 75%, 30%) 100%)',
    tailwind: 'bg-gradient-to-br from-[hsl(151,75%,50%)] to-[hsl(151,75%,30%)]'
  },
  cultural: {
    name: 'Cultural Warmth',
    css: 'linear-gradient(135deg, hsl(18, 60%, 55%) 0%, hsl(38, 70%, 60%) 100%)',
    tailwind: 'bg-gradient-to-br from-[hsl(18,60%,55%)] to-[hsl(38,70%,60%)]'
  },
  sunset: {
    name: 'Afro-Futuristic',
    css: 'linear-gradient(135deg, hsl(25, 85%, 60%) 0%, hsl(270, 60%, 55%) 100%)',
    tailwind: 'bg-gradient-to-br from-[hsl(25,85%,60%)] to-[hsl(270,60%,55%)]'
  },
  ocean: {
    name: 'Professional Ocean',
    css: 'linear-gradient(135deg, hsl(200, 80%, 50%) 0%, hsl(220, 70%, 40%) 100%)',
    tailwind: 'bg-gradient-to-br from-blue-400 to-blue-700'
  },
  earth: {
    name: 'Earth Tones',
    css: 'linear-gradient(180deg, hsl(18, 60%, 35%) 0%, hsl(151, 75%, 30%) 100%)',
    tailwind: 'bg-gradient-to-b from-[hsl(18,60%,35%)] to-[hsl(151,75%,30%)]'
  },
  night: {
    name: 'Night Sky',
    css: 'linear-gradient(135deg, hsl(230, 30%, 20%) 0%, hsl(250, 40%, 15%) 100%)',
    tailwind: 'bg-gradient-to-br from-slate-700 to-slate-900'
  },
  gold: {
    name: 'Golden Hour',
    css: 'linear-gradient(135deg, hsl(38, 70%, 50%) 0%, hsl(45, 85%, 60%) 100%)',
    tailwind: 'bg-gradient-to-br from-yellow-600 to-yellow-400'
  },
  ruby: {
    name: 'Ruby Passion',
    css: 'linear-gradient(135deg, hsl(350, 70%, 45%) 0%, hsl(25, 85%, 55%) 100%)',
    tailwind: 'bg-gradient-to-br from-red-600 to-[hsl(25,85%,55%)]'
  },
};

export type BannerGradientKey = keyof typeof BANNER_GRADIENTS;
