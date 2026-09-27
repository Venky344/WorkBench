import { createBrowserRouter } from 'react-router-dom';
import { TechnicalShell } from '@/components/layout/TechnicalShell';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { DesignSystemShowcasePage } from '@/pages/DesignSystemShowcasePage';

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
          path: 'showcase',
          element: <DesignSystemShowcasePage />,
        },
        {
          path: 'design-system',
          element: <DesignSystemShowcasePage />,
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
