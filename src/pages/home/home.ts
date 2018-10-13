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
  words: Word[] = [];

  constructor(public navCtrl: NavController, public db: DatabaseProvider) {
    this.find("A");
  }

  find(word) {
    this.db.fts(word).subscribe(res => {
      res.then(matches => {
        this.words = matches.filter(val => val !== null);
      });
    });
  }
}
