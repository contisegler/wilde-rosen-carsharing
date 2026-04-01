export default defineEventHandler(async (event) => {
  // Only protect /api/calendar routes
  const path = getRequestURL(event).pathname
  if (!path.startsWith('/api/calendar')) {
    return
  }

  // Skip authentication check in development mode
  if (process.env.NODE_ENV !== 'production') {
    return
  }

  // Test if getCurrentUser() works in server middleware
  try {
    const user = await getCurrentUser()
    console.log('getCurrentUser() in server middleware:', user)
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Authentication required',
      })
    }
  } catch (error) {
    console.error('Error calling getCurrentUser() in server middleware:', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Authentication required',
    })
  }
})
