// Standalone dev entry — lets this MFE run on its own at :5001.
// In production the Vue shell calls mount() via Module Federation instead.
import { mount } from './mount';

const el = document.getElementById('root');
if (el) mount(el);
