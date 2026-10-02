// Re-export core instances and functions from src/lib/firebase.ts
export {
  app,
  db,
  auth,
  firebaseConfig,
  getFirebaseInstances,
  testFirestoreConnection,
} from '../lib/firebase';

import firebaseDefault from '../lib/firebase';
export default firebaseDefault;
