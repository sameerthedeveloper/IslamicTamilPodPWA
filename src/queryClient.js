import { QueryClient } from '@tanstack/react-query'

// Switching tabs unmounts the page (React Router only renders the active
// route), so plain useState+useEffect fetching re-ran on every single
// visit — Home, Browse, Scholars etc. all reloaded from Firestore each
// time you tabbed back in. TanStack Query's cache lives outside the
// component tree, so a remounted page reads the cached result instantly
// instead of showing a spinner again; staleTime just controls how long
// before it also quietly refetches in the background for freshness.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})
