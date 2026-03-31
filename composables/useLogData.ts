// Dummy log data for demonstration purposes
// This will be replaced with real Firestore data later

export interface LogEntry {
  id: string
  carId: string
  carName: string
  userId: string
  userName: string
  startTime: Date
  endTime: Date
  startKm: number
  endKm: number
  notes?: string
}

// Generate dummy log entries
function generateDummyLogs(): LogEntry[] {
  const cars = [
    { id: "kangoo", name: "Kangoo" },
    { id: "kona", name: "Kona" },
    { id: "zoe", name: "Zoe" },
    { id: "jogger", name: "Jogger" },
  ]

  const users = [
    { id: "user1", name: "Anna Schmidt" },
    { id: "user2", name: "Max Müller" },
    { id: "user3", name: "Lisa Weber" },
    { id: "BOGhnxnoitdu0sGTbMoegee8iL72", name: "Tom Fischer" },
  ]

  const notes = [
    "Tanken 65 €",
    "",
    "",
    "",
    "Reinigung 11 €",
    "",
    "",
  ]

  // Helper function to round time to nearest 15 minutes
  function roundToQuarterHour(minutes: number): number {
    return Math.floor(minutes / 15) * 15
  }

  const logs: LogEntry[] = []
  let logId = 1

  // Generate logs for the last 60 days
  const now = new Date()
  for (let daysAgo = 0; daysAgo < 60; daysAgo++) {
    const numLogsToday = Math.floor(Math.random() * 3)

    for (let i = 0; i < numLogsToday; i++) {
      const car = cars[Math.floor(Math.random() * cars.length)]
      const user = users[Math.floor(Math.random() * users.length)]
      const note = notes[Math.floor(Math.random() * notes.length)]

      const startDate = new Date(now)
      startDate.setDate(startDate.getDate() - daysAgo)
      const startHour = 8 + Math.floor(Math.random() * 10)
      const startMinute = roundToQuarterHour(Math.floor(Math.random() * 60))
      startDate.setHours(startHour, startMinute, 0, 0)

      const endDate = new Date(startDate)
      const durationHours = Math.floor(Math.random() * 4) + 1
      const durationMinutes = roundToQuarterHour(Math.floor(Math.random() * 60))
      endDate.setHours(startDate.getHours() + durationHours, startDate.getMinutes() + durationMinutes, 0, 0)

      const distance = Math.floor(Math.random() * 150) + 10

      logs.push({
        id: `log-${logId++}`,
        carId: car.id,
        carName: car.name,
        userId: user.id,
        userName: user.name,
        startTime: startDate,
        endTime: endDate,
        distance: distance, // Temporary field for distance driven
        startKm: 0, // Will be calculated
        endKm: 0, // Will be calculated
        notes: note,
      } as any)
    }
  }

  // Add one multi-day log entry
  const multiDayStart = new Date(now)
  multiDayStart.setDate(multiDayStart.getDate() - 30)
  multiDayStart.setHours(14, 0, 0, 0)
  
  const multiDayEnd = new Date(multiDayStart)
  multiDayEnd.setDate(multiDayEnd.getDate() + 2) // 2 days later
  multiDayEnd.setHours(10, 30, 0, 0)
  
  logs.push({
    id: `log-${logId++}`,
    carId: "zoe",
    carName: "Zoe",
    userId: "user1",
    userName: "Anna Schmidt",
    startTime: multiDayStart,
    endTime: multiDayEnd,
    distance: 450, // Longer trip
    startKm: 0, // Will be calculated
    endKm: 0, // Will be calculated
    notes: "Tanken: 55 € + 62 €",
  } as any)

  // Sort by time ascending (oldest first) to calculate km values chronologically
  logs.sort((a, b) => a.startTime.getTime() - b.startTime.getTime())

  // Initial km values for each car (start of very first log entry per car)
  const carKm: Record<string, number> = {
    kangoo: 10000,
    kona: 15000,
    zoe: 8000,
    jogger: 12000,
  }

  // Calculate km values in chronological order per car
  logs.forEach((log: any) => {
    log.startKm = carKm[log.carId]
    log.endKm = log.startKm + log.distance
    carKm[log.carId] = log.endKm
    delete log.distance // Remove temporary field
  })

  // Sort by date descending (newest first) for display
  return logs.sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
}

const dummyLogs = generateDummyLogs()

/**
 * Get log entries for a specific car
 */
export function useCarLogs(carId: string) {
  const logs = computed(() => dummyLogs.filter(log => log.carId === carId))
  return { logs, isLoading: ref(false), error: ref(null) }
}

/**
 * Get log entries for a specific user across all cars
 */
export function useUserLogs(userId: string) {
  const logs = computed(() => dummyLogs.filter(log => log.userId === userId))
  return { logs, isLoading: ref(false), error: ref(null) }
}
