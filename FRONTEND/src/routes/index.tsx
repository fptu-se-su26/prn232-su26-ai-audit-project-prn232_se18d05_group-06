// Routes configuration
// Define your application routes here using React Router

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ROUTE_PATHS } from '@constants/index'

// Example route structure:
/*
const Routes = [
  {
    path: ROUTE_PATHS.LOGIN,
    component: LoginPage,
    layout: AuthLayout,
  },
  {
    path: ROUTE_PATHS.ADMIN_DASHBOARD,
    component: AdminDashboard,
    layout: AdminLayout,
    protected: true,
    roles: ['admin'],
  },
]
*/

export default Router
