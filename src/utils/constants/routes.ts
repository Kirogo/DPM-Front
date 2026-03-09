export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    DASHBOARD: '/dashboard',

    // RM Routes
    RM_DASHBOARD: '/rm/dashboard',
    REPORTS: '/rm/reports',
    CREATE_REPORT: '/rm/new-report',
    EDIT_REPORT: '/rm/reports/edit/:id',
    REPORT_DETAILS: '/rm/reports/:id',
    REPORT_PRINT: '/rm/reports/:id/print',

    // QS Routes
    QS_DASHBOARD: '/qs/dashboard',
    REVIEW_QUEUE: '/qs/reviews',
    REVIEW_DETAILS: '/qs/reviews/:id',
    SITE_VISITS: '/qs/site-visits',

    // Admin Routes
    CLIENTS: '/admin/clients',
    SETTINGS: '/settings',
    PROFILE: '/profile',
}
