import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { SellerLevel } from '@/types'

// ── CLASS NAMES ───────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── CURRENCY ──────────────────────────────────────────────────
export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function calculateNolanceFee(amount: number, rate = 0.15): number {
  return parseFloat((amount * rate).toFixed(2))
}

export function calculateSellerEarnings(amount: number, rate = 0.15): number {
  return parseFloat((amount * (1 - rate)).toFixed(2))
}

// ── DATES ─────────────────────────────────────────────────────
export function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy')
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDeadline(deadline: string): string {
  const d = new Date(deadline)
  const now = new Date()
  const diff = d.getTime() - now.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  if (diff < 0) return 'Overdue'
  if (hours < 24) return `${hours}h remaining`
  return `${days}d remaining`
}

// ── CLEARANCE DAYS BY LEVEL ───────────────────────────────────
export function getClearanceDays(level: SellerLevel, isPlus: boolean): number {
  if (isPlus) return 5
  const map: Record<SellerLevel, number> = {
    new: 10,
    level1: 7,
    level2: 3,
    top_rated: 1,
    pro_verified: 1,
  }
  return map[level]
}

// ── COMMISSION ────────────────────────────────────────────────
export function getCommissionRate(section: string): number {
  const rates: Record<string, number> = {
    gigs: 0.15,
    scout: 0.15,
    marketplace: 0.05,
    scout_to_business: 0.10,
    managed: 0.25,
  }
  return rates[section] ?? 0.15
}

// ── SLUGIFY ───────────────────────────────────────────────────
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── ORDER NUMBER ──────────────────────────────────────────────
export function generateOrderNumber(id: string): string {
  const date = format(new Date(), 'yyyyMMdd')
  return `NL-${date}-${id.substring(0, 6).toUpperCase()}`
}

// ── VALIDATION ────────────────────────────────────────────────
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,50}$/.test(username)
}

export function isValidPhone(phone: string): boolean {
  return /^\+?[1-9]\d{6,14}$/.test(phone.replace(/\s/g, ''))
}

// ── GIG TAG VALIDATION ────────────────────────────────────────
export function isValidGigTag(tag: string): { valid: boolean; error?: string } {
  if (tag.length > 20) return { valid: false, error: 'Tag must be 20 characters or less' }
  const words = tag.trim().split(/\s+/)
  if (words.length > 3) return { valid: false, error: 'Tag must be 3 words or less' }
  return { valid: true }
}

// ── SELLER LEVEL LABELS ───────────────────────────────────────
export function getLevelLabel(level: SellerLevel): string {
  const labels: Record<SellerLevel, string> = {
    new: 'New Seller',
    level1: 'Level 1',
    level2: 'Level 2',
    top_rated: 'Top Rated',
    pro_verified: 'Pro Verified',
  }
  return labels[level]
}

export function getLevelColor(level: SellerLevel): string {
  const colors: Record<SellerLevel, string> = {
    new: 'bg-gray-100 text-gray-600',
    level1: 'bg-blue-50 text-blue-700',
    level2: 'bg-purple-50 text-purple-700',
    top_rated: 'bg-green-50 text-green-700',
    pro_verified: 'bg-navy-50 text-navy-700',
  }
  return colors[level]
}

// ── NEXT LEVEL REQUIREMENTS ───────────────────────────────────
export function getNextLevelRequirements(level: SellerLevel) {
  const requirements = {
    new: { orders: 5, clients: 3, earnings: 300, rating: 4.7, days: 30, label: 'Level 1' },
    level1: { orders: 15, clients: 10, earnings: 2000, rating: 4.8, days: 90, label: 'Level 2' },
    level2: { orders: 30, clients: 20, earnings: 10000, rating: 4.9, days: 180, label: 'Top Rated' },
    top_rated: null,
    pro_verified: null,
  }
  return requirements[level]
}

// ── FILE HELPERS ──────────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

export function isImageFile(filename: string): boolean {
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(getFileExtension(filename))
}

// ── TRUNCATE ──────────────────────────────────────────────────
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

// ── INITIALS ──────────────────────────────────────────────────
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

// ── RATING ────────────────────────────────────────────────────
export function renderStars(rating: number): string {
  return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating))
}

// ── URL HELPERS ───────────────────────────────────────────────
export function getGigUrl(slug: string): string {
  return `/gig/${slug}`
}

export function getSellerUrl(username: string): string {
  return `/seller/${username}`
}

export function getOrderUrl(orderNumber: string): string {
  return `/orders/${orderNumber}`
}

export function getScoutJobUrl(jobId: string): string {
  return `/scout/jobs/${jobId}`
}

export function getMarketplaceListingUrl(slug: string): string {
  return `/marketplace/listing/${slug}`
}

export function getCommunityUrl(slug: string): string {
  return `/community/${slug}`
}

export function getBusinessUrl(slug: string): string {
  return `/directory/${slug}`
}
