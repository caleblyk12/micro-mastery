import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import router from './helpers/Router';
import { RouterProvider } from 'react-router-dom';
import { supabase } from './helpers/supabaseClient'; 


supabase.auth.startAutoRefresh();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="font-sans">
      <RouterProvider router={router} />
    </div>
  </StrictMode>
);