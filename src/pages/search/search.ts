// TODO: display loading spinner while searching for words

import { Component } from "@angular/core";
import { NavController } from "ionic-angular";
import { HomePage } from '../home/home';
import { NlpProvider } from '../../providers/nlp/nlp';

@Component({
  selector: "page-search",
  templateUrl: "search.html"
})
export class SearchPage {
  constructor(public navCtrl: NavController, private nlp: NlpProvider) {
  }

  find(text) {
    if (text === '') return;

    const words: String[] = this.nlp.tokenizeAndStem(text);

    this.navCtrl.setRoot(HomePage, { words });
  }
}
