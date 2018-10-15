import { Component } from "@angular/core";
import { NavParams } from "ionic-angular";
import { DatabaseProvider, Word } from "../../providers/database/database";

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  words: Word[] = [];

  constructor(
    private db: DatabaseProvider,
    private navParams: NavParams) {
  }

  find(word: String) {
    word = word.trim();
    if (word === '') return;

    this.words = [];
    this.db.fts(word).subscribe(res => {
      this.words.push(res);
    });
  }

  ionViewDidEnter() {
    const words: String[] = this.navParams.get('words');
    if (!words) return;

    this.words = [];
    this.db.findAll(words).subscribe(res => {
      if (res.hasOwnProperty('notFound')) {
        // TODO: create another list of unfound words and display on the page
        console.log(`Not Found: ${res['notFound']}`);
      }
      else {
        this.words.push(<Word>res);
      }
    });

  }
}
