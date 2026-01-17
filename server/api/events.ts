import type { Event } from '~/types'

let events: Event[] = []

export default eventHandler(async (event) => {
  const method = getMethod(event)

  if (method === 'GET') {
    const query = getQuery(event)
    const date = query.date as string | undefined

    let filtered = events

    if (date) {
      filtered = filtered.filter(e => e.date === date)
    }

    return filtered
  }

  if (method === 'POST') {
    const body = await readBody(event)

    const newEvent: Event = {
      id: events.length > 0 ? Math.max(...events.map(e => e.id)) + 1 : 1,
      name: body.name,
      description: body.description || '',
      maxParticipants: body.maxParticipants || 0,
      date: body.date,
      startTime: body.startTime,
      duration: body.duration || 60,
      bookedSlots: 0
    }

    events.push(newEvent)
    return newEvent
  }

  if (method === 'PATCH') {
    const body = await readBody(event)
    const id = body.id as number

    const index = events.findIndex(e => e.id === id)
    if (index !== -1) {
      events[index] = { ...events[index], ...body }
      return events[index]
    }

    throw createError({
      statusCode: 404,
      message: 'Event not found'
    })
  }

  if (method === 'DELETE') {
    const query = getQuery(event)
    const id = Number.parseInt(query.id as string)

    events = events.filter(e => e.id !== id)
    return { success: true }
  }

  return events
})
