// import { HttpClient } from "@angular/common/http";
import { Platform } from "ionic-angular";
import { Injectable } from "@angular/core";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";
import { BehaviorSubject, Observable } from "rxjs/Rx";
/*
  Generated class for the DatabaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/

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

const wordQuery = "SELECT word, pos, word_id FROM words WHERE word = ?;";
const definitionQuery =
  "SELECT definition, translation, example FROM definitions WHERE word_id = ?";

@Injectable()
export class DatabaseProvider {
  database: SQLiteObject;
  private databaseReady: BehaviorSubject<boolean>;

  constructor(platform: Platform, sqlite: SQLite) {
    this.databaseReady = new BehaviorSubject(false);
    this.find = this.find.bind(this);

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

  async find(toFind): Promise<Word> {
    const wordRes = await this.database.executeSql(
      "SELECT * FROM words WHERE word = ?;",
      [toFind]
    );
    if (wordRes.rows.length === 0) return null;

    const { word, pos, word_id }: WordRecord = wordRes.rows.item(0);
    // TODO: convert word_id column on definitions table to int instead of text
    const defRes = await this.database.executeSql(
      "SELECT definition, translation, example FROM definitions WHERE word_id = ?",
      [`${word_id}.0`]
    );

    const definitions: Definition[] = this.extractQueryResults(defRes);
    return { word, pos, definitions };
  }

  fts(toFind): Observable<Promise<Word[]>> {
    const query = `
      SELECT *
      FROM english_fts
      WHERE word
      MATCH '^${toFind}*'
      ORDER BY rank
      LIMIT 20
    `;

    return this.ready().map(async _ => {
      const res = await this.database.executeSql(query, []);

      const words: String[] = this.extractQueryResults(res).map(
        val => val.word
      );
      return Promise.all(words.map(word => this.find(word)));
    });
    //   .subscribe(_ =>
    //   Observable.fromPromise(this.db.fts(word)).subscribe(matches => {
    //     this.words = matches.filter(val => val !== null);
    //   });
    // });
    // const res = await this.database.executeSql(query, []);

    // const words: String[] = this.extractQueryResults(res).map(val => val.word);
    // return Promise.all(words.map(word => this.find(word)));
  }

  executeSql(query, args = []) {
    return this.database.executeSql(query, args);
  }

  ready(): Observable<boolean> {
    return this.databaseReady.asObservable().skipWhile(isReady => !isReady);
  }

  private extractQueryResults(res): any[] {
    const items = [];
    for (let i = 0; i < res.rows.length; i++) {
      items.push(res.rows.item(i));
    }
    return items;
  }
}
