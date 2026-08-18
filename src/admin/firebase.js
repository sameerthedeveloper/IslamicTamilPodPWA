// The admin (CMS) module shares the same Firebase project/app as the
// rest of the site — re-export it so admin/api and admin/store keep
// their existing relative `../firebase` imports unchanged.
export { app, auth, db, storage } from '../firebase'
