import { $auth, $firestore } from '../src/firebase_admin';

export default defineEventHandler(async (event) => {
  // Only run for /api/cars/* routes
  const path = event.path || '';
  if (!path.startsWith('/api/cars/')) {
    return;
  }
  
  // Verify token and populate user in context
  const authHeader = getHeader(event, 'authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    event.context.authenticatedUser = null;
    event.context.userRoles = [];
    return;
  }

  const idToken = authHeader.substring(7);
  
  try {
    const decodedToken = await $auth.verifyIdToken(idToken);
    event.context.authenticatedUser = decodedToken;
    
    // Fetch user roles from Firestore
    const rolesDoc = await $firestore.collection('users').doc(decodedToken.uid).collection('settings').doc('roles').get();
    
    if (rolesDoc.exists) {
      const rolesData = rolesDoc.data();
      if (rolesData) {
        // Convert boolean fields to array of role strings
        event.context.userRoles = Object.keys(rolesData).filter(key => rolesData[key] === true);
      } else {
        event.context.userRoles = [];
      }
    } else {
      event.context.userRoles = [];
    }
  } catch (error) {
    console.error('Error verifying ID token:', error);
    event.context.authenticatedUser = null;
    event.context.userRoles = [];
  }
});
