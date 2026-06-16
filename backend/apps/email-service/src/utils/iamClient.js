const config = require('../config');

/**
 * Fetch user information from IAM service by userId
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User object with email, username, etc. or null if not found
 */
async function getUserById(userId) {
  if (!userId) {
    console.warn('⚠️ getUserById called with empty userId');
    return null;
  }

  try {
    const iamBaseUrl = config.iam?.baseUrl || process.env.IAM_BASE_URL || 'http://iam-service:3001';
    const url = `${iamBaseUrl}/users/${userId}`;
    
    console.log(`🔍 Fetching user info from IAM: ${userId}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.warn(`⚠️ IAM returned ${response.status} for user ${userId}`);
      return null;
    }
    
    const data = await response.json();
    const user = data?.data || null;
    
    if (!user || !user.id) {
      console.warn(`⚠️ Invalid user data from IAM for ${userId}`);
      return null;
    }
    
    console.log(`✅ Fetched user from IAM: ${user.username} (${user.email})`);
    
    return {
      id: user.id,
      username: user.username || null,
      email: user.email || null,
      role: user.role || null
    };
  } catch (error) {
    console.error(`❌ Failed to fetch user from IAM (${userId}):`, error.message);
    return null;
  }
}

module.exports = {
  getUserById
};
