import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from 'sonner'
import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import { queryClient } from './lib/queryClient'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster
        dir="rtl"
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: 'font-sans',
            title: 'font-medium',
            description: 'text-sm opacity-90',
          },
        }}
      />
      {import.meta.env.DEV ? (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      ) : null}
    </QueryClientProvider>
  )
}
