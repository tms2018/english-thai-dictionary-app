// TODO handle navigation from search page

import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import { DatabaseProvider, Word } from "../../providers/database/database";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  words: Word[] = [];

  constructor(public navCtrl: NavController, public db: DatabaseProvider) {
    this.find("Love");
  }

  find(word) {
    this.db.fts(word).subscribe(res => {
      res.then(matches => {
        this.words = flattenDeep(matches.filter(val => val !== null));
      });
    });
  }
}

function flattenDeep(arr1) {
  return arr1.reduce(
    (acc, val) =>
      Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val),
    []
  );
}
