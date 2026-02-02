const routes = [
  {
    path: '/login',
    component: () => import('pages/LoginPage.vue'),
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        component: () => import('pages/DashboardPage.vue'),
      },
      {
        path: 'board',
        component: () => import('pages/BoardPage.vue'),
      },
      {
        path: 'calendar',
        component: () => import('pages/CalendarPage.vue'),
      },
      {
        path: 'create',
        component: () => import('pages/CreatePostPage.vue'),
      },
      {
        path: 'post/:id',
        component: () => import('pages/PostDetailPage.vue'),
      },
      {
        path: 'campaigns',
        component: () => import('pages/CampaignsPage.vue'),
      },
      {
        path: 'users',
        component: () => import('pages/UsersPage.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'backoffice/phases',
        component: () => import('pages/PhasesPage.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'backoffice/roles',
        component: () => import('pages/RolesPage.vue'),
        meta: { requiresAdmin: true },
      },
      {
        path: 'debug/session',
        component: () => import('pages/SessionDebugPage.vue'),
        meta: { requiresAdmin: true },
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
