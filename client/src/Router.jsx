import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router';
import App from '@/App';
import Error from '@/Error';
import Actions from '@/routes/Actions';
import Environment from '@/routes/Environment';
import Index from '@/routes/Index';
import Pipeline from '@/routes/Pipeline';
import Pipelines from '@/routes/Pipelines';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} errorElement={<Error />}>
      <Route errorElement={<Error />}>
        <Route index element={<Index />} />
        <Route path="pipelines" element={<Pipelines />} />
        <Route path="pipelines/:id" element={<Pipeline />} />
        <Route path="actions" element={<Actions />} />
        <Route path="environment" element={<Environment />} />
      </Route>
    </Route>,
  ),
);

function Router({ children }) {
  return <RouterProvider router={router}>{children}</RouterProvider>;
}

export default Router;
