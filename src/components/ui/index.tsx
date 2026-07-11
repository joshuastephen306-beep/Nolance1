import { cn, getInitials, getLevelColor, getLevelLabel } from '@/utils'
import { SellerLevel, User } from '@/types'
import Image from 'next/image'

// ── AVATAR ─────────────────────────────────────────────────────
interface AvatarProps {
  user?: Partial<User>
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeMap = { sm: 'w-7 h-7 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-base', xl: 'w-20 h-20 text-xl' }
const pxMap = { sm: 28, md: 40, lg: 56, xl: 80 }

export function Avatar({ user, size = 'md', className }: AvatarProps) {
  const name = user?.display_name || user?.username || 'U'
  const px = pxMap[size]
  if (user?.profile_photo_url) {
    return (
      <div className={cn('rounded-full overflow-hidden flex-shrink-0', sizeMap[size], className)}>
        <Image src={user.profile_photo_url} alt={name} width={px} height={px} className="object-cover w-full h-full" />
      </div>
    )
  }
  return (
    <div className={cn('avatar flex items-center justify-center flex-shrink-0', sizeMap[size], className)}>
      {getInitials(name)}
    </div>
  )
}

// ── LEVEL BADGE ────────────────────────────────────────────────
export function LevelBadge({ level }: { level: SellerLevel }) {
  return (
    <span className={cn('badge text-xs', getLevelColor(level))}>
      {getLevelLabel(level)}
    </span>
  )
}

// ── BADGE ──────────────────────────────────────────────────────
type BadgeVariant = 'green' | 'navy' | 'blue' | 'purple' | 'amber' | 'red' | 'gray'
export function Badge({ children, variant = 'gray' }: { children: React.ReactNode; variant?: BadgeVariant }) {
  return <span className={`badge-${variant} badge`}>{children}</span>
}

// ── STAR RATING ────────────────────────────────────────────────
export function StarRating({ rating, count, size = 'sm' }: { rating: number; count?: number; size?: 'sm' | 'md' }) {
  const stars = Math.round(rating)
  return (
    <div className={cn('flex items-center gap-1', size === 'md' ? 'text-sm' : 'text-xs')}>
      <span className="text-amber-400">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</span>
      <span className="font-medium text-navy-800">{rating.toFixed(1)}</span>
      {count !== undefined && <span className="text-gray-400">({count.toLocaleString()})</span>}
    </div>
  )
}

// ── SKELETON ───────────────────────────────────────────────────
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} />
}

export function GigCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
        <div className="flex justify-between pt-1">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
    </div>
  )
}

// ── ONLINE INDICATOR ───────────────────────────────────────────
export function OnlineIndicator({ isOnline }: { isOnline: boolean }) {
  if (!isOnline) return null
  return (
    <div className="flex items-center gap-1">
      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
      <span className="text-xs text-green-600 font-medium">Online</span>
    </div>
  )
}

// ── PROGRESS BAR ───────────────────────────────────────────────
export function ProgressBar({ value, max = 100, className }: { value: number; max?: number; className?: string }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className={cn('progress-bar', className)}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}

// ── EMPTY STATE ────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <p className="empty-state-title">{title}</p>
      {description && <p className="empty-state-text">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// ── STATUS BADGE ────────────────────────────────────────────────
export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeVariant }> = {
    pending: { label: 'Pending', variant: 'amber' },
    active: { label: 'In Progress', variant: 'blue' },
    delivered: { label: 'Delivered', variant: 'purple' },
    revision: { label: 'Revision', variant: 'amber' },
    completed: { label: 'Completed', variant: 'green' },
    cancelled: { label: 'Cancelled', variant: 'red' },
    disputed: { label: 'Disputed', variant: 'red' },
  }
  const { label, variant } = map[status] || { label: status, variant: 'gray' }
  return <Badge variant={variant}>{label}</Badge>
}
