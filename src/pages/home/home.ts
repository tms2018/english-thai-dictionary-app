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
    this.words = [];
    this.db.fts(word).subscribe(res => {
      this.words.push(res);
    });
  }
}
