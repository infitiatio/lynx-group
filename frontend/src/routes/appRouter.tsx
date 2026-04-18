import { createBrowserRouter, Navigate, type RouteObject } from 'react-router-dom'
import App from '../App'
import { GroupDetailRoutePage } from './GroupDetailRoutePage'
import { GroupsRoutePage } from './GroupsRoutePage'
import { LoginRoutePage } from './LoginRoutePage'
import { NotFoundRoutePage } from './NotFoundRoutePage'
import { SharedRoutePage } from './SharedRoutePage'

export const appRoutes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/groups" replace /> },
      { path: 'login', element: <LoginRoutePage /> },
      { path: 'groups', element: <GroupsRoutePage /> },
      { path: 'groups/:groupId', element: <GroupDetailRoutePage /> },
      { path: 'shared/:shareToken', element: <SharedRoutePage /> },
      { path: '*', element: <NotFoundRoutePage /> },
    ],
  },
]

export const appRouter = createBrowserRouter(appRoutes)
