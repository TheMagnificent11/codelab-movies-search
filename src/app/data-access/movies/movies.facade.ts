import { Injectable } from '@angular/core';
import { freeze, produce } from 'immer';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MoviesDataService } from './movies.data-service';
import { buildMatchIndicator, computeFilteredMovies } from './movies.filters';
import { initState, MovieItem, MovieState, MovieViewModel } from './movies.model';

/**
 * Load movies and cache results for similar future calls.
 * Architecture:
 *
 */

@Injectable()
export class MoviesFacade {
  public state: MovieState;
  private _emitter: BehaviorSubject<MovieState>;
  public vm$: Observable<MovieViewModel>;

  constructor(private movieAPI: MoviesDataService) {
    const state = freeze(initState());
    const api = {
      loadMovies: (searchBy: string) => this.loadMovies(searchBy),
      updateFilter: (filterBy: string) => this.updateFilter(filterBy),
      clearFilter: () => this.updateFilter(''),
    };
    const addAPI = (s: MovieState): MovieViewModel => ({ ...s, ...api });

    this.state = state;
    this._emitter = new BehaviorSubject<MovieState>(state);
    this.vm$ = this._emitter.asObservable().pipe(map(addAPI));

    this.loadMovies(state.searchBy);
  }

  /**
   * Search movies
   *
   * Use cache to skip remote load
   * Auto-save to cache; based on specified search keys
   */
  loadMovies(searchBy: string, page = 1): Observable<MovieState> {
    this.movieAPI.searchMovies(searchBy, page).subscribe((list: unknown) => {
      const allMovies = list as MovieItem[];

      this.state = produce<MovieState>(this.state, draft => {
        draft.allMovies = allMovies;
        draft.searchBy = searchBy;
      });

      this.updateFilter(this.state.filterBy);
    });

    return this.vm$;
  }

  /**
   * Update the filterBy value used to build the `filteredMovies` list
   */
  updateFilter(filterBy?: string) {
    const movies = computeFilteredMovies(this.state);
    const matchInOverview = buildMatchIndicator(filterBy);

    this.state = produce<MovieState>(this.state, draft => {
      draft.filterBy = filterBy;
      draft.filteredMovies = matchInOverview(movies);
    });

    this._emitter.next(this.state);

    return this.vm$;
  }
}
