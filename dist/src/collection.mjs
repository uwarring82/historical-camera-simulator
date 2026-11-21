import apollo from './collection/apollo.mjs?v=fde86c21ec6991c7';
import leica from './collection/leica.mjs?v=fde86c21ec6991c7';
import rolleiflex from './collection/rolleiflex.mjs?v=fde86c21ec6991c7';
import sx70 from './collection/sx70.mjs?v=fde86c21ec6991c7';

export const collection = {apollo,leica,rolleiflex,sx70};
export function bodyPhoto(id) {
  return collection[id].figures.find(figure => figure.role === 'body');
}
