/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  DefaultOptions,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useQueryErrorResetBoundary,
} from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { ErrorBoundary } from 'react-error-boundary';
import { toast, ToastContainer } from 'react-toastify';
import { RecoilRoot } from 'recoil';

import { router } from './router';

import ErrorFallback from '@/widgets/error/ErrorFallback';
import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

const defaultOptions: DefaultOptions = {
  queries: {
    retry: 3,
  },
  mutations: {
    onError: (error: unknown) => {
      console.error('Mutation Error:', error);
    },
  },
};

const queryClient = new QueryClient({
  defaultOptions,
  queryCache: new QueryCache({
    onError: (error) => toast(`Something went wrong: ${error.message}`),
  }),
});

const App = () => {
  const { reset } = useQueryErrorResetBoundary();

  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={reset}>
          <RouterProvider router={router} />
        </ErrorBoundary>
        <ToastContainer />
      </QueryClientProvider>
    </RecoilRoot>
  );
};

export default App;
