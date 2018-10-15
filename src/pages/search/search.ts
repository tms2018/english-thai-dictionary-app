// TODO: remove punctuation from search terms
// TODO: display loading spinner while searching for words
// TODO: convert plural words to singular

import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import { HomePage } from '../home/home';

@Component({
  selector: "page-search",
  templateUrl: "search.html"
})
export class SearchPage {
  constructor(public navCtrl: NavController) {
  }

  find(text) {
    if (text === '') return;

    const words: String[] = text.split(/\s+/);

    this.navCtrl.setRoot(HomePage, { words });
  }
}
