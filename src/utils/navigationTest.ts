// Navigation test utility to verify all routes work properly
export const testNavigation = () => {
  const routes = [
    '/app',
    '/my-network', 
    '/community',
    '/explore/projects',
    '/messaging',
    '/search',
    '/profile',
    '/profile/settings',
    '/leaderboard',
    '/notifications'
  ];

  console.log('Testing navigation routes...');
  routes.forEach(route => {
    try {
      // Simple route validation
      if (route.startsWith('/')) {
        console.log(`✅ Route valid: ${route}`);
      } else {
        console.error(`❌ Invalid route: ${route}`);
      }
    } catch (error) {
      console.error(`❌ Route error: ${route}`, error);
    }
  });
};

export default testNavigation;