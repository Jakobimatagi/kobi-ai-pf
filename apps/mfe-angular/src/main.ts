import { initFederation } from '@angular-architects/native-federation';

initFederation({ 'mfe-angular': './remoteEntry.json' })
  .catch((err) => console.error(err))
  .then((_) => import('./bootstrap'))
  .catch((err) => console.error(err));
