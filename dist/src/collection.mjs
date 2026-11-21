import apollo from './collection/apollo.mjs';
import leica from './collection/leica.mjs';
import rolleiflex from './collection/rolleiflex.mjs';
import sx70 from './collection/sx70.mjs';

export const collection = {apollo,leica,rolleiflex,sx70};
export function bodyPhoto(id) {
  return collection[id].figures.find(figure => figure.role === 'body');
}
