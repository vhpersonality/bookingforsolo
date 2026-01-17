import { subDays, addDays } from 'date-fns'
import type { Booking, Event, Service } from '~/types'

const bookings: Booking[] = [{
  id: 1,
  date: new Date().toISOString().split('T')[0],
  startTime: '10:45',
  endTime: '11:45',
  serviceId: 1,
  employeeId: 1,
  customerId: 1,
  customerName: 'Иван Иванов',
  serviceName: 'Стрижка мужская',
  status: 'confirmed',
  notes: 'Новый сеанс'
}, {
  id: 2,
  date: new Date().toISOString().split('T')[0],
  startTime: '14:00',
  endTime: '15:30',
  serviceId: 2,
  employeeId: 3,
  customerId: 2,
  customerName: 'Мария Петрова',
  serviceName: 'Стрижка женская',
  status: 'confirmed'
}, {
  id: 3,
  date: addDays(new Date(), 1).toISOString().split('T')[0],
  startTime: '11:00',
  endTime: '13:00',
  serviceId: 3,
  employeeId: 3,
  customerId: 3,
  customerName: 'Анна Сидорова',
  serviceName: 'Окрашивание',
  status: 'pending'
}, {
  id: 4,
  date: addDays(new Date(), 2).toISOString().split('T')[0],
  startTime: '09:00',
  endTime: '09:45',
  serviceId: 4,
  employeeId: 2,
  customerId: 4,
  customerName: 'Петр Смирнов',
  serviceName: 'Укладка',
  status: 'confirmed'
}, {
  id: 5,
  date: subDays(new Date(), 1).toISOString().split('T')[0],
  startTime: '16:00',
  endTime: '17:00',
  serviceId: 1,
  employeeId: 1,
  customerId: 5,
  customerName: 'Ольга Козлова',
  serviceName: 'Стрижка мужская',
  status: 'completed'
}]

export default eventHandler(async (event) => {
  const method = getMethod(event)

  if (method === 'GET') {
    const query = getQuery(event)
    const date = query.date as string | undefined
    const employeeId = query.employeeId ? Number.parseInt(query.employeeId as string) : undefined

    let filtered = bookings

    if (date) {
      filtered = filtered.filter(b => b.date === date)
    }

    if (employeeId) {
      filtered = filtered.filter(b => b.employeeId === employeeId)
    }

    return filtered
  }

  if (method === 'POST') {
    const body = await readBody(event)

    // Если запись на событие - увеличиваем bookedSlots
    if (body.eventId) {
      try {
        const eventsModule = await import('./events')
        // Обращаемся к массиву events через динамический импорт
        // Для простоты пока создаем бронирование, обновление bookedSlots сделаем через PATCH запрос
      } catch {
        // Если не удалось импортировать, продолжаем без обновления bookedSlots
      }
    }

    // Создаем бронирование
    const serviceName = body.serviceName || 'Услуга'
    const newBooking: Booking = {
      id: bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1,
      date: body.date || new Date().toISOString().split('T')[0],
      startTime: body.startTime || '10:00',
      endTime: body.endTime || (() => {
        const start = body.startTime || '10:00'
        const [hours, minutes] = start.split(':').map(Number)
        const duration = body.duration || 60
        const totalMinutes = hours * 60 + minutes + duration
        const endHours = Math.floor(totalMinutes / 60)
        const endMinutes = totalMinutes % 60
        return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
      })(),
      serviceId: body.serviceId || 1,
      employeeId: body.employeeId || 1,
      customerId: bookings.length > 0 ? Math.max(...bookings.map(b => b.customerId)) + 1 : 1,
      customerName: body.customerName,
      serviceName,
      status: 'pending',
      notes: body.notes
    }

    bookings.push(newBooking)
    
    // Если это запись на событие, обновляем bookedSlots через прямой запрос к событиям
    if (body.eventId) {
      // Обновление bookedSlots будет происходить через PATCH запрос к /api/events
      // Это можно сделать на клиенте после создания бронирования
    }
    
    return newBooking
  }

  return bookings
})

