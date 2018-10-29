// @ts-nocheck
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

  find(toFind: String): Observable<(Word | WordNotFound)[]> {
    return Observable
      .fromPromise(this.database.executeSql("SELECT * FROM words WHERE word = ?", [toFind]))
      .switchMap((wordRes): Observable<(Word | WordNotFound)[]> => {
        if (wordRes.rows.length === 0) {
          return Observable.of([{ notFound: toFind }]);
        }

        return Observable
          .of(extractQueryResults(wordRes))
          .switchMap((wordRecords: WordRecord[]): Observable<Word[]> => {
            return Observable
              .fromPromise(Promise.all(
                wordRecords.map(({ word_id }) =>
                  this.database.executeSql(
                    "SELECT definition, translation, example FROM definitions WHERE word_id = ?",
                    [word_id])
                )
              ))
              .map((defRecords) => {
                return defRecords.map(defRecord => extractQueryResults(defRecord))
              })
              .map((defs: Definition[][]) => {
                const words: Word[] = [];
                for (let i = 0; i < wordRecords.length; i++) {
                  const { word, pos } = wordRecords[i];
                  const definitions = defs[i];
                  words.push({ word, pos, definitions });
                }
                return words
              });
          });
      });
  }

  findAll(toFind: String[]) {
    const uniqueWords = Array.from(new Set(toFind.map(word => word.toLowerCase())));

    return this.ready()
      .switchMap(_ => Promise.all(uniqueWords.map(word => this.find(word).toPromise())))
      .map((words => words.reduce((acc, val) => acc.concat(val), [])));
  }

  fts(toFind: String): Observable<Word[]> {
    const query = `
      SELECT DISTINCT *
      FROM english_fts
      WHERE word
      MATCH ?
      ORDER BY rank
      LIMIT 20
      OFFSET 0
    `;

    return <Observable<Word[]>> // the full text search guarantees words that are in the db
      this.ready()
        .switchMap(_ =>
          Observable.fromPromise(this.database.executeSql(query, [`^${toFind}*`]))
        )
        .map(queryRes => extractQueryResults(queryRes).map((val): String => val.word))
        .switchMap(uniqueWords => Promise.all(uniqueWords.map(word => this.find(word).toPromise())))
        .map((words => words.reduce((acc, val) => acc.concat(val), [])));
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
