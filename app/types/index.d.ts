import type { AvatarProps } from '@nuxt/ui'

export type UserStatus = 'regular' | 'loyal' | 'first-time' | 'vip'
export type SaleStatus = 'paid' | 'failed' | 'refunded'

export interface User {
  id: number
  name: string
  email: string
  avatar?: AvatarProps
  status: UserStatus
  phone: string
}

export interface Member {
  id: number
  name: string
  username: string
  role: 'member' | 'owner'
  avatar: AvatarProps
  specialty: string
  servicesCount: number
}

export interface Stat {
  title: string
  icon: string
  value: number | string
  variation: number
  formatter?: (value: number) => string
}

export interface Sale {
  id: string
  date: string
  status: SaleStatus
  email: string
  amount: number
}

export interface Notification {
  id: number
  unread?: boolean
  sender: User
  body: string
  date: string
}

export type Period = 'daily' | 'weekly' | 'monthly'

export interface Range {
  start: Date
  end: Date
}

export interface Service {
  id: number
  name: string
  description?: string
  duration?: number // в минутах
  price?: number
  assignedMembers: number[] // массив ID сотрудников
  active: boolean
}

export interface Booking {
  id: number
  date: string // ISO date string
  startTime: string // HH:mm format
  endTime: string // HH:mm format
  serviceId: number
  employeeId: number
  customerId: number
  customerName: string
  serviceName: string
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed'
  notes?: string
}

export interface Event {
  id: number
  name: string // название события
  description?: string // описание
  maxParticipants: number // количество мест
  date: string // ISO date string
  startTime: string // HH:mm format
  duration: number // продолжительность в минутах
  bookedSlots: number // количество забронированных мест
}
