import { produce } from 'immer';
import { buildMatchIndicator, computeFilteredMovies } from './movies.filters';
import { MovieItem, MovieState } from './movies.model';

enum ActionType {
  searchMovies = 'searchMovies',
  filterMovies = 'filterMovies'
}

interface Action {
  type: ActionType;
}

export interface movieSearchAction extends Action {
  type: ActionType.searchMovies;
  searchBy: string;
  allMovies: MovieItem[];
}

export interface filterMoviesAction extends Action {
  type: ActionType.filterMovies;
  filterBy: string;
}

export type MovieAction = movieSearchAction | filterMoviesAction;

export const actions = {
  searchMovies(searchBy: string, allMovies: MovieItem[]): movieSearchAction {
    return { type: ActionType.searchMovies, searchBy, allMovies };
  },
  filterMovies(filterBy: string): filterMoviesAction {
    return { type: ActionType.filterMovies, filterBy };
  }
}

export function moviesReducer(state: MovieState, action: MovieAction) {
  return produce<MovieState>(state, draft => {
    switch (action.type) {
      case ActionType.searchMovies:
        draft.allMovies = action.allMovies;
        draft.searchBy = action.searchBy;

        break;

      case ActionType.filterMovies:
        const movies = computeFilteredMovies(draft);
        const matchInOverview = buildMatchIndicator(action.filterBy);

        draft.filterBy = action.filterBy
        draft.filteredMovies = matchInOverview(movies);

        break;

    }
  });
}
