/**
 * Responsive Design System Utilities
 * Provides consistent breakpoints and responsive helpers
 */

// Breakpoint values (in pixels)
export const breakpoints = {
  xs: 375,   // Mobile S
  sm: 640,   // Mobile L / Tablet
  md: 768,   // Tablet
  lg: 1024,  // Desktop
  xl: 1280,  // Desktop L
  '2xl': 1536 // Desktop XL
} as const

// Media query helpers
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  '2xl': `@media (min-width: ${breakpoints['2xl']}px)`,
  // Special queries
  mobile: `@media (max-width: ${breakpoints.md - 1}px)`,
  tablet: `@media (min-width: ${breakpoints.md}px) and (max-width: ${breakpoints.lg - 1}px)`,
  desktop: `@media (min-width: ${breakpoints.lg}px)`,
  touch: `@media (hover: none) and (pointer: coarse)`,
} as const

// Responsive container classes
export const containerClasses = {
  base: 'w-full mx-auto px-4 sm:px-6 lg:px-8',
  fluid: 'w-full px-4 sm:px-6 lg:px-8',
  tight: 'w-full mx-auto px-4 sm:px-6 max-w-7xl',
  wide: 'w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16',
} as const

// Responsive grid classes
export const gridClasses = {
  cols1: 'grid grid-cols-1',
  cols2: 'grid grid-cols-1 sm:grid-cols-2',
  cols3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  cols4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  cols5: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
  cols6: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
  dashboard: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  cards: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
} as const

// Responsive spacing classes
export const spacingClasses = {
  section: 'py-8 sm:py-12 lg:py-16',
  sectionTight: 'py-4 sm:py-6 lg:py-8',
  sectionWide: 'py-12 sm:py-16 lg:py-20',
  gap: 'gap-4 sm:gap-6 lg:gap-8',
  gapTight: 'gap-2 sm:gap-3 lg:gap-4',
  gapWide: 'gap-6 sm:gap-8 lg:gap-10',
} as const

// Responsive text classes
export const textClasses = {
  h1: 'text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold',
  h2: 'text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold',
  h3: 'text-lg sm:text-xl lg:text-2xl font-semibold',
  h4: 'text-base sm:text-lg lg:text-xl font-semibold',
  body: 'text-sm sm:text-base',
  small: 'text-xs sm:text-sm',
  tiny: 'text-xs',
} as const

// Table responsive wrapper
export const tableWrapper = 'overflow-x-auto -mx-4 sm:mx-0'
export const tableContainer = 'inline-block min-w-full align-middle'
export const tableMobile = 'min-w-[640px]' // Forces horizontal scroll on small screens

// Hook to detect current breakpoint
export function useBreakpoint() {
  if (typeof window === 'undefined') return 'lg'
  
  const width = window.innerWidth
  
  if (width < breakpoints.sm) return 'xs'
  if (width < breakpoints.md) return 'sm'
  if (width < breakpoints.lg) return 'md'
  if (width < breakpoints.xl) return 'lg'
  if (width < breakpoints['2xl']) return 'xl'
  return '2xl'
}

// Hook to detect if mobile
export function isMobile() {
  if (typeof window === 'undefined') return false
  return window.innerWidth < breakpoints.md
}

// Hook to detect if tablet
export function isTablet() {
  if (typeof window === 'undefined') return false
  const width = window.innerWidth
  return width >= breakpoints.md && width < breakpoints.lg
}

// Hook to detect if desktop
export function isDesktop() {
  if (typeof window === 'undefined') return true
  return window.innerWidth >= breakpoints.lg
}

// Touch device detection
export function isTouchDevice() {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Responsive button classes
export const buttonClasses = {
  base: 'px-3 py-2 sm:px-4 sm:py-2.5 text-sm sm:text-base touch-manipulation',
  small: 'px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm touch-manipulation',
  large: 'px-4 py-2.5 sm:px-6 sm:py-3 text-base sm:text-lg touch-manipulation',
  icon: 'p-2 sm:p-2.5',
  iconSmall: 'p-1.5 sm:p-2',
  iconLarge: 'p-2.5 sm:p-3',
} as const

// Responsive modal sizes
export const modalSizes = {
  sm: 'w-full max-w-sm mx-4 sm:mx-auto',
  md: 'w-full max-w-md mx-4 sm:mx-auto',
  lg: 'w-full max-w-lg mx-4 sm:mx-auto',
  xl: 'w-full max-w-xl mx-4 sm:mx-auto',
  '2xl': 'w-full max-w-2xl mx-4 sm:mx-auto',
  '3xl': 'w-full max-w-3xl mx-4 sm:mx-auto',
  '4xl': 'w-full max-w-4xl mx-4 sm:mx-auto',
  full: 'w-full max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-4rem)] mx-4 sm:mx-auto',
} as const

// Responsive card padding
export const cardPadding = {
  base: 'p-4 sm:p-6',
  tight: 'p-3 sm:p-4',
  wide: 'p-6 sm:p-8',
} as const

// Responsive navigation height
export const navHeight = {
  mobile: 'h-14',
  desktop: 'h-16',
} as const

// Sidebar width
export const sidebarWidth = {
  mobile: 'w-72',
  desktop: 'w-64',
  collapsed: 'w-16',
} as const

// Helper to combine responsive classes
export function responsiveClasses(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ')
}