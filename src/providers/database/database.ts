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
      [toFind.toLowerCase()]
    );

    if (wordRes.rows.length == 0) return undefined;
    const { word, pos, word_id }: WordRecord = wordRes.rows.item(0);
    const defRes = await this.database.executeSql(
      "SELECT definition, translation, example FROM definitions WHERE word_id = ?",
      [word_id]
    );

    console.log(defRes.rows.length);
    const definitions: Definition[] = [];
    for (let i = 0; i < defRes.rows.length; i++) {
      console.log(defRes.rows.item(i));
      definitions.push(defRes.rows.item(i));
    }

    return { word, pos, definitions };
  }

  executeSql(query, args = []) {
    return this.database.executeSql(query, args);
  }

  ready(): Observable<boolean> {
    return this.databaseReady.asObservable();
  }
}
