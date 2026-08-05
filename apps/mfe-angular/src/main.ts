// Import first: captures the ?board= URL param before the hash router
// rewrites location and drops the query string.
import './app/board-id';
import { initFederation } from '@angular-architects/native-federation';

initFederation({ 'mfe-angular': './remoteEntry.json' })
  .catch((err) => console.error(err))
  .then((_) => import('./bootstrap'))
  .catch((err) => console.error(err));
