import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Inject, Injectable, inject } from '@angular/core';
import { Observable, catchError, map, tap } from 'rxjs';
import { Film } from '../entities/film';
import { UsersService } from './users.service';
import { environment } from '../environments/environment';
import { MessageService } from './message.service';
import { Router } from '@angular/router';
import { Person } from '../entities/person';
import { observableToBeFn } from 'rxjs/internal/testing/TestScheduler';

export interface FilmsResponse {
  items: Film[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class FilmsService {
  usersService = inject(UsersService);
  http = inject(HttpClient);
  url = environment.serverUrl;
  router = inject(Router);
  messageService = inject(MessageService)
  get token() {
    return this.usersService.token;
  }

  getTokenHeader(): {headers?: {[header: string]: string}, 
                     params?: HttpParams} | undefined {
    if (!this.token) {
      return undefined;
    }
    return { headers: {'X-Auth-Token': this.token}};
  }

  getFilms(orderBy?:string, descending?: boolean, indexFrom?: number, indexTo?: number, search?: string): Observable<FilmsResponse> {
    let options = this.getTokenHeader();
    if (orderBy || descending || indexFrom || indexTo || search) {
      options = { ...(options || {}), params: new HttpParams()};
    }
    if (options && options.params) {
      if (orderBy) {
        options.params = options.params.set('orderBy', orderBy);
      }
      if (descending) {
        options.params = options.params.set('descending', descending);
      }
      if (indexFrom) {
        options.params = options.params.set('indexFrom', indexFrom);
      }
      if (indexTo) {
        options.params = options.params.set('indexTo', indexTo);
      }
      if (search) {
        options.params = options.params.set('search', search);
      }
    }
    return this.http.get<FilmsResponse>(this.url + 'films', options).pipe(
      catchError(err => this.usersService.processError(err))
    );
  }

  getPersons(search :string): Observable<Person[]> {
    let options = this.getTokenHeader();
    return this.http.get<Person[]>(this.url+'search-person/'+search ,options)
  }

  getFilm(id: number): Observable<Film> {
    let options = this.getTokenHeader();
    return this.http.get<Film>(this.url + 'films/'+ id , options).pipe(
      map(jsonFilm => Film.clone(jsonFilm)),
      catchError(err => this.usersService.processError(err))
    )
  }

  saveFilm(film: Film) : Observable<Film> {
    let options = this.getTokenHeader();
    return this.http.post<Film>(this.url+'films/' , film, options).pipe(
      
      map(jsonFilm => Film.clone(jsonFilm)),
      tap(film => this.messageService.success("Film " + film.nazov + " saved")),
      tap(film => this.router.navigateByUrl("/films")),
      catchError(err => this.usersService.processError(err))
    )
  }

  deleteFilm(id: Number): Observable<Boolean>{
    let options = this.getTokenHeader();
    return this.http.delete(this.url + "films/" + id,options).pipe(
      map(() => {
        this.messageService.success("Film deleted");
        return true
      }),
      catchError(err => this.usersService.processError(err))
    )
  }

  
}
