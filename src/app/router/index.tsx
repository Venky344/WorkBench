import { createBrowserRouter } from 'react-router-dom';
import { TechnicalShell } from '@/components/layout/TechnicalShell';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <TechnicalShell />,
      errorElement: <NotFoundPage />,
      children: [
        {
          index: true,
          element: <HomePage />,
        },
        {
          path: '*',
          element: <NotFoundPage />,
        },
      ],
    },
  ],
  {
    future: {
      v7_relativeSplatPath: true,
    },
  },
);
