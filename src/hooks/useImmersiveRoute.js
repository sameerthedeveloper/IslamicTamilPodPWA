import { useLocation } from 'react-router-dom'

// Episode/scholar/topic detail screens hide the mobile header + bottom
// nav (AppLayout.jsx) since they have their own in-page Back button —
// shared here so anything else that needs to adapt to that (the mini
// players repositioning to sit near the bottom edge instead of above the
// now-gone nav bar) stays in sync with AppLayout's own definition.
export function useImmersiveRoute() {
  const { pathname } = useLocation()
  return pathname.startsWith('/episode/')
    || pathname.startsWith('/topics/')
    || (pathname.startsWith('/scholars/') && pathname !== '/scholars')
}
