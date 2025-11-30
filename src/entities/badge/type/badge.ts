export enum ConditionType {
  OrderCount = 0,
  TotalSpent = 1,
  ReviewCount = 2,
  Custom = 3
}

export interface UserBadgeWalletItem {
  userBadgeId: string
  badgeId: string
  name: string
  description?: string
  iconUrl?: string
  discountPercentage: number
  earnedDate: string
  isEquipped: boolean
  isActive: boolean
  isTimeLimited: boolean
  activatedFrom?: string
  activatedTo?: string
  isExpired: boolean
  status: string
  benefit: string
  conditionType: ConditionType
  conditionValue: string
}

export interface BadgeProgressItem {
  badgeId: string
  name: string
  description?: string
  iconUrl?: string
  discountPercentage: number
  status: string
  progress?: string
  currentValue: number
  targetValue: number
  conditionType: ConditionType
  conditionValue: string
  isUnlocked: boolean
}

export interface NewlyAwardedBadge {
  userBadgeId: string
  badgeId: string
  name: string
  description?: string
  iconUrl?: string
  discountPercentage: number
  earnedDate: string
}

export interface BadgeWalletResponse {
  unlocked?: UserBadgeWalletItem[]
  locked?: BadgeProgressItem[]
}

export interface BadgeState {
  // State
  unlockedBadges: UserBadgeWalletItem[]
  lockedBadges: BadgeProgressItem[]
  isLoading: boolean
  error: string | null
  currentFilter: "unlocked" | "all"

  // Actions
  fetchMyBadges: (filter?: "unlocked" | "all") => Promise<void>
  fetchUserBadges: (userId: string) => Promise<void>
  equipBadge: (badgeId: string) => Promise<{ success: boolean; error?: string }>
  processBadgeEligibility: () => Promise<{ success: boolean; newBadges?: NewlyAwardedBadge[]; error?: string }>
  clearError: () => void
}
