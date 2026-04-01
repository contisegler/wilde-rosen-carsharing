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

  // In production, check for authenticated user (VueFire session cookie)
  const user = event.context.user

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Authentication required',
    })
  }
})
