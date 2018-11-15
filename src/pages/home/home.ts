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
  isLoading: Boolean = false;

  constructor(
    private db: DatabaseProvider,
    private nlp: NlpProvider) {
  }

  fts(word: String) {
    if (!word) return;

    // remove punctuation and numbers
    word = this.nlp.tokenize(word).join(' ').trim();
    if (word === '') return;

    this.isLoading = true;
    this.db.fts(word).subscribe(res => {
      this.words = res;
      this.notFound = [];
      this.isLoading = false;
    });
  }

  find(text: String) {
    const words: String[] = this.nlp.tokenizeAndStem(text);
    if (!words) return;

    this.isLoading = true;
    this.db.findAll(words).subscribe(results => {
      this.words = <Word[]>results.filter(word => !word.hasOwnProperty('notFound'));
      this.notFound = results
        .filter(word => word.hasOwnProperty('notFound'))
        .map(({ notFound }: WordNotFound) => notFound)

      this.isLoading = false;
    });

  }
}
