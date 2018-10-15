import { Platform } from "ionic-angular";
import { Injectable } from "@angular/core";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";
import { BehaviorSubject, Observable } from "rxjs/Rx";

function errorHandler(e) {
  console.error(JSON.stringify(e, Object.getOwnPropertyNames(e)));
}

export interface WordRecord {
  word: String;
  pos: String;
  word_id: Number;
}

export interface Word {
  word: String;
  pos: String;
  definitions: Definition[];
}

export interface DefinitionRecord {
  definition: String;
  translation: String;
  example?: String;
  word_id: Number;
}

export interface Definition {
  definition: String;
  translation: String;
  example?: String;
}

export interface WordNotFound {
  notFound: String;
}

@Injectable()
export class DatabaseProvider {
  database: SQLiteObject;
  private databaseReady: BehaviorSubject<boolean>;

  constructor(platform: Platform, sqlite: SQLite) {
    this.databaseReady = new BehaviorSubject(false);

    platform.ready().then(_ => {
      sqlite
        .create({
          name: "dictionary.db",
          location: "default",
          createFromLocation: 1
        })
        .then((db: SQLiteObject) => {
          this.database = db;
          this.databaseReady.next(true);
        })
        .catch(errorHandler);
    });
  }

  find(toFind: String): Observable<Word | WordNotFound> {
    return Observable
      .fromPromise(this.database.executeSql("SELECT * FROM words WHERE word = ?;", [toFind]))
      .switchMap((wordRes): Observable<Word | WordNotFound> => {
        if (wordRes.rows.length === 0) {
          return Observable.of({ notFound: toFind });
        }

        return Observable
          .of(...extractQueryResults(wordRes))
          .flatMap(({ word, pos, word_id }: WordRecord): Observable<Word> => {
            return Observable
              .fromPromise(
                this.database.executeSql(
                  "SELECT definition, translation, example FROM definitions WHERE word_id = ?",
                  [word_id])
              )
              .switchMap((defRes): Observable<Definition[]> => {
                return Observable.of(extractQueryResults(defRes))
              })
              .map(definitions => ({ word, pos, definitions }));
          });
      });
  }

  findAll(toFind: String[]): Observable<Word | WordNotFound> {
    const uniqueWords = Array.from(new Set(toFind));

    return this.ready()
      .switchMap(_ => Observable.of(...uniqueWords))
      .flatMap(word => this.find(word));
  }

  fts(toFind: String): Observable<Word> {
    const query = `
      SELECT DISTINCT *
      FROM english_fts
      WHERE word
      MATCH ?
      ORDER BY rank
      LIMIT 20
    `;

    return <Observable<Word>> // the full text search guarantees words that are in the db
      this.ready()
        .switchMap(_ =>
          Observable.fromPromise(this.database.executeSql(query, [`^${toFind}*`]))
        )
        .switchMap(queryRes =>
          Observable.of(
            ...extractQueryResults(queryRes).map((val): String => val.word)
          )
        )
        .flatMap(val => this.find(val));
  }

  ready(): Observable<boolean> {
    return this.databaseReady.asObservable().skipWhile(isReady => !isReady);
  }
}

function extractQueryResults(res): any[] {
  const items = [];
  for (let i = 0; i < res.rows.length; i++) {
    items.push(res.rows.item(i));
  }
  return items;
}
