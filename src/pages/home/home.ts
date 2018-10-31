import { Component } from "@angular/core";
import { DatabaseProvider, Word, WordNotFound } from "../../providers/database/database";
import { NlpProvider } from '../../providers/nlp/nlp';

@Component({
  selector: "page-home",
  templateUrl: "home.html"
})
export class HomePage {
  words: Word[] = [];
  notFound: String[] = [];
  searchType: String = 'fts';

  constructor(
    private db: DatabaseProvider,
    private nlp: NlpProvider) {
  }

  fts(word: String) {
    if (!word) return;

    // remove punctuation and numbers
    word = this.nlp.tokenize(word).join(' ').trim();
    if (word === '') return;

    this.db.fts(word).subscribe(res => {
      this.words = res;
      this.notFound = [];
    });
  }

  find(text: String) {
    const words: String[] = this.nlp.tokenize(text);
    if (!words) return;

    this.db.findAll(words).subscribe(results => {
      this.words = <Word[]>results.filter(word => !word.hasOwnProperty('notFound'));
      this.notFound = results
        .filter(word => word.hasOwnProperty('notFound'))
        .map(({ notFound }: WordNotFound) => notFound)
    });

  }
}
