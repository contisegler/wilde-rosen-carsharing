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
    { id: "user4", name: "Tom Fischer" },
  ]

  const notes = [
    "Einkauf in der Stadt",
    "Fahrt zum Arzt",
    "Ausflug ins Grüne",
    "Besuch bei Freunden",
    "Fahrt zur Arbeit",
    "",
    "",
  ]

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
      startDate.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60))

      const endDate = new Date(startDate)
      endDate.setHours(startDate.getHours() + Math.floor(Math.random() * 4) + 1)

      const kmDriven = Math.floor(Math.random() * 150) + 10
      const startKm = 10000 + Math.floor(Math.random() * 50000)

      logs.push({
        id: `log-${logId++}`,
        carId: car.id,
        carName: car.name,
        userId: user.id,
        userName: user.name,
        startTime: startDate,
        endTime: endDate,
        startKm: startKm,
        endKm: startKm + kmDriven,
        notes: note,
      })
    }
  }

  // Sort by date descending (newest first)
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
