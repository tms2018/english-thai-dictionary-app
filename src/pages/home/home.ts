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

    this.db.fts(word).subscribe(res => {
      this.words = res;
      this.notFound = [];
    });
  }

  ionViewDidEnter() {
    const words: String[] = this.navParams.get('words');
    if (!words) return;

    this.db.findAll(words).subscribe(results => {
      this.words = <Word[]>results.filter(word => !word.hasOwnProperty('notFound'));
      this.notFound = results
        .filter(word => word.hasOwnProperty('notFound'))
        .map(({ notFound }: WordNotFound) => notFound)
    });

  }
}
