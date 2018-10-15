// TODO: replace placeholder html with message box to input search text
// TODO: display loading spinner while searching for words
// TODO: pass search results to the home screen to display

import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import { DatabaseProvider, Word } from "../../providers/database/database";

@Component({
  selector: "page-search",
  templateUrl: "search.html"
})
export class SearchPage {
  words: Word[] = [];

  constructor(public navCtrl: NavController, public db: DatabaseProvider) {
    this.find("I love you!");
  }

  find(text) {
    this.words = [];
    const words: String[] = text.split(" ");
    this.db.findAll(words).subscribe(res => {
      if (res.notFound) console.log(`Not Found: ${res.notFound}`);
      this.words.push(res);
    });
  }
}
