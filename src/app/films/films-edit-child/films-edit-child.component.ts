import { AfterViewInit, Component, EventEmitter, inject, input, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../modules/material.module';
import { Film } from '../../../entities/film';
import { Person } from '../../../entities/person';
import { FilmsService } from '../../../services/films.service'
import { FormArray, FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Postava } from '../../../entities/postava';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-films-edit-child',
  standalone: true,
  imports: [MaterialModule, FormsModule, ReactiveFormsModule],
  templateUrl: './films-edit-child.component.html',
  styleUrl: './films-edit-child.component.css'
})
export class FilmsEditChildComponent implements OnChanges{
  @Input() film: Film = new Film("",0,"","",[],[],{})
  @Input() saveToSever: boolean = false;
  @Output() filmChange = new EventEmitter<Film>();
  filmService  = inject(FilmsService)
  nazov = "";
  rok = 0; 
  slovenskyNazov = "";
  imdbID = "";
  reziser = [] as Person[];
  postava = [] as Postava[];
  poradieVRebricku = {['AFI 1998']:0, ['AFI 2007']:0};
  reziserString = "";
  postavaString = "";
  allPersons = [] as Person[];
  selectedPostava = new Postava("","vedľajšia postava",new Person(0,"","",""));
  indexOfSelePostava = 0;
  allHerec = [] as Person[];
  isChecked = false;
  addDirectorToFilm = false;

  displayedColumnsPerson: string[] = ['krstneMeno','stredneMeno','priezvisko','actions'];
  PersonDataSource = new MatTableDataSource(this.allPersons);

  HerecDataSource = new MatTableDataSource(this.allHerec);
  postavaEdit = false;
  newPostava = false;
  displayedColumnsPostava: string[] = ['postava','dolezitost','herec','actions'];
  postavaDataSource = new MatTableDataSource(this.postava);
  PersonDataSourceInFilm = new MatTableDataSource(this.reziser)

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filmService.getPersons(filterValue).subscribe(persons => this.allPersons = persons);
    
    this.PersonDataSource = new MatTableDataSource(this.allPersons);
    //this.PersonDataSource.filter = filterValue.trim().toLowerCase();
  }

  applyFilterHerec(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.filmService.getPersons(filterValue).subscribe(persons => this.allHerec = persons);
    
    this.HerecDataSource = new MatTableDataSource(this.allHerec);
    //this.HerecDataSource.filter = filterValue.trim().toLowerCase();
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.load();
  }
   
  addPersonToFilm(person: Person){
    this.reziser.push(person);
    this.addDirectorToFilm = false;
    this.PersonDataSourceInFilm = new MatTableDataSource(this.reziser)
  }

  addDirector(){
    this.addDirectorToFilm = true;
  }

  addPersonToCharacter(person : Person){
    this.selectedPostava.herec = person
  }
  
  deletePersonFromFilm(person : Person){
    let index = this.reziser.indexOf(person)
    this.reziser.splice(index,1)
    this.PersonDataSourceInFilm = new MatTableDataSource(this.reziser)
  }

  newCharacter(){
    this.newPostava= true
    this.selectedPostava = new Postava("","vedľajšia postava",new Person(0,"","",""));
  }

  deletePostava(postava : Postava){
    let index = this.postava.indexOf(postava)
    this.postava.splice(index,1)
    this.load()
  }

  editPostava(postava: Postava){
    this.selectedPostava = postava;
    this.indexOfSelePostava = this.postava.indexOf(postava);
    this.postavaEdit = true;
    if(postava.dolezitost == "hlavná postava"){
      this.isChecked = true;
    }else{
      this.isChecked = false
    }
  }

  load(){
    this.nazov = this.film.nazov;
    this.rok = this.film.rok;
    this.slovenskyNazov = this.film.slovenskyNazov;
    this.imdbID = this.film.imdbID;
    this.reziser = this.film.reziser;
    this.postava = this.film.postava;
    this.poradieVRebricku['AFI 1998'] = this.film.poradieVRebricku['AFI 1998']
    this.poradieVRebricku['AFI 2007'] = this.film.poradieVRebricku['AFI 2007']
    this.postavaDataSource = new MatTableDataSource(this.postava)
    this.PersonDataSourceInFilm = new MatTableDataSource(this.reziser)

  }

  submitPostava(){
    if(this.isChecked){
      this.selectedPostava.dolezitost = "hlavná postava"
    }else{
      this.selectedPostava.dolezitost = "vedľajšia postava";
    }
    
    if(this.postavaEdit){
      this.postava[this.indexOfSelePostava] = this.selectedPostava;
      this.selectedPostava = new Postava("","vedľajšia postava",new Person(0,"","",""));
      this.postavaEdit = false;
      this.postavaDataSource = new MatTableDataSource(this.postava)
    }

    if(this.newPostava){
      this.postava.push(this.selectedPostava);
      this.selectedPostava = new Postava("","vedľajšia postava",new Person(0,"","",""));
      this.newPostava = false;
      this.postavaDataSource = new MatTableDataSource(this.postava)
    }
    
  }

  changeDolezitost(){
    this.isChecked = !this.isChecked
  }

  submit(){
  
    const filmToSave = new Film(this.nazov,this.rok, this.slovenskyNazov, this.imdbID,
      this.reziser , this.postava, this.poradieVRebricku, this.film.id);
    if(this.saveToSever) {
      this.filmService.saveFilm(filmToSave).subscribe(savedFilm =>{
        this.filmChange.emit(savedFilm)
      })
    } else {
      this.filmChange.emit(filmToSave)
    }
  }

}
