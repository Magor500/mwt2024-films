export class Person {
  public static clone(person: Person): Person {
    return new Person(person.id,person.krstneMeno,person.stredneMeno,person.priezvisko);
  }
  
  constructor(
    public id: number,
    public krstneMeno: string,
    public stredneMeno: string,
    public priezvisko: string
  ){}
}