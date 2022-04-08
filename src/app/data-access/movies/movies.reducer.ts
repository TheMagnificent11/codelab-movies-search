import { produce } from 'immer';

import { MovieState, MovieItem } from './movies.model';
import { buildMatchIndicator, computeFilteredMovies } from './movies.filters';

interface MovieSearchResults {
  searchBy: string;
  allMovies: MovieItem[];
}

export interface MovieAction {
  type: 'searchBy' | 'updateFilter';
  payload?: MovieSearchResults | string;
}

// Redux/Ngrx-like ActionCreator functions

export function searchAction(
  searchBy: string,
  allMovies: MovieItem[]
): MovieAction {
  return { type: 'searchBy', payload: { searchBy, allMovies } };
}

export function updateFilterAction(filterBy: string): MovieAction {
  return { type: 'updateFilter', payload: filterBy };
}

// Redux/Ngrx-like Reducer functions

const isString = (source: unknown) => typeof source === 'string';

export function reduceMovieAction(
  state: MovieState,
  action: MovieAction
): MovieState {
  debugger;
  return produce(state, (draft) => {
    switch (action.type) {
      case 'searchBy':
        const { searchBy, allMovies } = action.payload as MovieSearchResults;
        draft.allMovies = allMovies;
        draft.searchBy = searchBy;
        break;
      case 'updateFilter':
        draft.filterBy = isString(action.payload)
          ? (action.payload as string)
          : '';
        break;
    }
    const movies = computeFilteredMovies(draft);
    const addMatchIndicators = buildMatchIndicator(draft.filterBy);

    draft.filteredMovies = addMatchIndicators(movies);
  });
}
