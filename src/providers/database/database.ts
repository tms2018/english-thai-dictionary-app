// import { HttpClient } from "@angular/common/http";
import { Platform } from "ionic-angular";
import { Injectable } from "@angular/core";
import { SQLite, SQLiteObject } from "@ionic-native/sqlite";
import { BehaviorSubject, Observable } from "rxjs/Rx";
import "rxjs/add/operator/skipWhile";

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

  async find(toFind): Promise<Word> {
    const wordRes = await this.database.executeSql(
      "SELECT * FROM words WHERE word = ?;",
      [toFind]
    );
    if (wordRes.rows.length === 0) return null;

    const { word, pos, word_id }: WordRecord = wordRes.rows.item(0);
    const defRes = await this.database.executeSql(
      "SELECT definition, translation, example FROM definitions WHERE word_id = ?",
      [word_id]
    );

    const definitions: Definition[] = this.extractQueryResults(defRes);
    return { word, pos, definitions };
  }

  findAll(toFind: String[]): Observable<Promise<Word[]>> {
    const uniqueWords = Array.from(new Set(toFind));

    return this.ready().map(_ => {
      return Promise.all(uniqueWords.map(word => this.find(word)));
    });
  }

  fts(toFind: String): Observable<Promise<Word[]>> {
    const query = `
      SELECT DISTINCT *
      FROM english_fts
      WHERE word
      MATCH ?
      ORDER BY rank
      LIMIT 20
    `;

    return this.ready().map(async _ => {
      const res = await this.database.executeSql(query, [`^${toFind}*`]);
      let words: String[] = this.extractQueryResults(res).map(val => val.word);
      return Promise.all(words.map(word => this.find(word)));
    });
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
