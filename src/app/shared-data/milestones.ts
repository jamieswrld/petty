export type Milestone = {
  threshold: number // lifetime coins earned needed to unlock
  reward: string // human label for the tier
  tokenPayout?: number // $Petana claimable once tier is reached
}

// Lifetime-earned thresholds. Each tier unlocks a separate $Petana claim.
// Payouts are handled manually by the team using the recorded claim.
export const milestones: Milestone[] = [
  { threshold: 2_500, reward: 'Sprout', tokenPayout: 500 },
  { threshold: 7_500, reward: 'Bronze', tokenPayout: 500 },
  { threshold: 15_000, reward: 'Silver', tokenPayout: 500 },
  { threshold: 40_000, reward: 'Gold', tokenPayout: 1_500 },
  { threshold: 85_000, reward: 'Diamond', tokenPayout: 3_000 },
]

export const levelForEarned = ( totalEarned: number ): number =>
  milestones.filter(( m ) => totalEarned >= m.threshold).length + 1

export const nextMilestone = ( totalEarned: number ): Milestone | undefined =>
  milestones.find(( m ) => totalEarned < m.threshold)

export const claimableMilestones = milestones.filter(( m ) => m.tokenPayout != null )

export const formatThreshold = ( n: number ) => n.toLocaleString()
