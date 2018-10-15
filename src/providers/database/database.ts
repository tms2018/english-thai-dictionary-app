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

  // TODO: return a value to indicate not found so not found words can be displayed
  async find(toFind: String): Promise<Word[]> {
    const wordRes = await this.database.executeSql(
      "SELECT * FROM words WHERE word = ?;",
      [toFind]
    );
    if (wordRes.rows.length === 0) return null;

    const allWords: WordRecord[] = extractQueryResults(wordRes);

    return Promise.all(
      allWords.map(async word => {
        const defRes = await this.database.executeSql(
          "SELECT definition, translation, example FROM definitions WHERE word_id = ?",
          [word.word_id]
        );

        const val = {
          word: word.word,
          pos: word.pos,
          definitions: extractQueryResults(defRes)
        };
        return val;
      })
    );
  }

  findAll(toFind: String[]): any {
    const uniqueWords = Array.from(new Set(toFind));

    return this.ready()
      .switchMap(_ => Observable.of(...uniqueWords))
      .flatMap(word => this.find(word))
      .scan((accumulator, current) => accumulator.concat(current));
  }

  fts(toFind: String): any {
    const query = `
      SELECT DISTINCT *
      FROM english_fts
      WHERE word
      MATCH ?
      ORDER BY rank
      LIMIT 20
    `;

    return this.ready()
      .switchMap(_ =>
        Observable.fromPromise(this.database.executeSql(query, [`^${toFind}*`]))
      )
      .switchMap(queryRes =>
        Observable.of(
          ...extractQueryResults(queryRes).map((val): String => val.word)
        )
      )
      .flatMap(val => Observable.fromPromise(this.find(val)))
      .scan((accumulator, current) => accumulator.concat(current));
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
