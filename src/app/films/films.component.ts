import { AfterViewInit, Component, computed, inject, signal, viewChild } from '@angular/core';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import { Film } from '../../entities/film';
import { FilmsService } from '../../services/films.service';
import { UsersService } from '../../services/users.service';
import { MaterialModule } from '../../modules/material.module';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { switchMap, tap } from 'rxjs';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ConfirmService } from '../../services/confirm.service';

@Component({
  selector: 'app-films',
  standalone: true,
  imports: [MaterialModule,RouterLink,CommonModule],
  templateUrl: './films.component.html',
  styleUrl: './films.component.css',
})
export class FilmsComponent implements AfterViewInit {
[x: string]: any;
  filmsService = inject(FilmsService);
  usersService = inject(UsersService);
  confirmService = inject(ConfirmService)
  userNameS = this.usersService.loggedUserSignal;

  columnsToDisplayS = computed(() => this.userNameS() 
                                   ? ['id', 'nazov', 'rok', 'slovenskyNazov', 'afi1998', 'afi2007','reziser','postava','actions']
                                   : ['id', 'nazov', 'rok']);
  paginatorS = viewChild.required<MatPaginator>(MatPaginator);
  sortS = viewChild.required<MatSort>(MatSort);

  orderByS = signal<string | undefined>(undefined);
  descendingS = signal<boolean | undefined>(undefined);
  indexFromS = signal<number | undefined>(0);
  indexToS = signal<number | undefined>(5);
  searchS = signal<string | undefined>(undefined);

  queryS = computed(() => new Query(this.orderByS(),this.descendingS(),this.indexFromS(), this.indexToS(), this.searchS()));
  
  request$ = toObservable(this.queryS).pipe(
    tap(query => console.log("request: " , query)),
    switchMap(query => this.filmsService.getFilms(query.orderBy, query.descending, query.indexFrom, query.indexTo, query.search))
  );
  
  responseS = toSignal(this.request$);
  filmsS = computed(() => this.responseS()?.items || []);
  

  ngAfterViewInit(): void {
    this.paginatorS().page.subscribe(pageEvent => {
      console.log('page event:', pageEvent);
      this.indexFromS.set(pageEvent.pageIndex * pageEvent.pageSize);
      this.indexToS.set(Math.min((pageEvent.pageIndex+1) * pageEvent.pageSize, pageEvent.length))
    });
    this.sortS().sortChange.subscribe(sortEvent => {
      console.log('sort event:', sortEvent);
      if (sortEvent.direction === '') {
        this.orderByS.set(undefined);
        this.descendingS.set(undefined);
        return;
      }
      this.descendingS.set(sortEvent.direction === 'desc');
      let column = sortEvent.active;
      if (column === 'afi1998') column = 'poradieVRebricku.AFI 1998';
      if (column === 'afi2007') column = 'poradieVRebricku.AFI 2007';
      this.orderByS.set(column);
      this.paginatorS().firstPage();
    });
  }

  onFilter(event:any) {
    const filter = (event.target.value as string).trim().toLowerCase();
    this.searchS.set(filter);
    this.paginatorS().firstPage();
  }

  onDelete(film: Film) {
    this.confirmService.confirm({
      title: 'Deleting film',
      question: 'Do you really wish to delete film ' + film.nazov + "?"
    }).subscribe(answer => {
      if(answer){
        this.filmsService.deleteFilm(film.id!)
      }
    })
  }
}

class Query {
  constructor(
    public orderBy?:string, 
    public descending?: boolean, 
    public indexFrom?: number, 
    public indexTo?: number, 
    public search?: string
  ){}
}