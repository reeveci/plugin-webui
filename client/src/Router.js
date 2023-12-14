import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import App from "./App";
import Error from "./Error";
import Actions from "./routes/Actions";
import Index from "./routes/Index";
import Pipeline from "./routes/Pipeline";
import WorkerGroup from "./routes/WorkerGroup";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} errorElement={<Error />}>
      <Route errorElement={<Error />}>
        <Route index element={<Index />} />
        <Route path="workergroups/:workerGroup" element={<WorkerGroup />} />
        <Route
          path="workergroups/:workerGroup/pipelines/:pipelineID"
          element={<Pipeline />}
        />
        <Route path="actions" element={<Actions />} />
      </Route>
    </Route>
  )
);

function Router({ children }) {
  return <RouterProvider router={router}>{children}</RouterProvider>;
}

export default Router;
