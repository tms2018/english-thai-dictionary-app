import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import { DatabaseProvider, Word } from "../../providers/database/database";
import { Observable } from "rxjs";
import "rxjs/add/operator/skipWhile";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  words: Word[] = [
    {
      word: "test",
      pos: "test",
      definitions: [
        {
          definition: "test",
          translation: "el testo",
          example: "test"
        }
      ]
    },
    {
      word: "test",
      pos: "test",
      definitions: [
        {
          definition: "test",
          translation: "el testo",
          example: "test"
        }
      ]
    },
    {
      word: "test",
      pos: "test",
      definitions: [
        {
          definition: "test",
          translation: "el testo",
          example: "test"
        }
      ]
    }
  ];

  constructor(public navCtrl: NavController, public db: DatabaseProvider) {
    this.find("A");
  }

  find(word) {
    this.db
      .ready()
      .skipWhile(val => !val)
      .subscribe(_ => {
        Observable.fromPromise(this.db.fts(word)).subscribe(matches => {
          this.words = matches.filter(val => val !== null);
        });
      });
  }
}
