import { Component } from "@angular/core";
import { NavParams, NavController } from "ionic-angular";
import { DatabaseProvider, Word, WordNotFound } from "../../providers/database/database";
import { NlpProvider } from '../../providers/nlp/nlp';
import { SearchPage } from '../search/search';

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  words: Word[] = [];
  notFound: String[] = [];

  constructor(
    private db: DatabaseProvider,
    private nlp: NlpProvider,
    private navParams: NavParams,
    private navCtrl: NavController) {
  }

  navToDocumentSearchPage() {
    this.navCtrl.push(SearchPage);
  }

  find(word: String) {
    if (!word) return;

    // remove punctuation and numbers
    word = this.nlp.tokenize(word).join(' ').trim();
    if (word === '') return;

    this.words = [];
    this.notFound = [];
    this.db.fts(word).subscribe(res => {
      this.words.push(res);
    });
  }

  ionViewDidEnter() {
    const words: String[] = this.navParams.get('words');
    if (!words) return;

    this.words = [];
    this.notFound = [];
    this.db.findAll(words).subscribe(res => {
      if (res.hasOwnProperty('notFound')) {
        this.notFound.push((<WordNotFound>res).notFound);
      }
      else {
        this.words.push(<Word>res);
      }
    });

  }
}
