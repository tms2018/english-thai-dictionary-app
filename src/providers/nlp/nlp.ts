import { Injectable } from '@angular/core';
import * as PosTagger from 'wink-pos-tagger';

@Injectable()
export class NlpProvider {
  tagger: PosTagger;

  constructor() {
    this.tagger = new PosTagger;
  }

  stem(word: String): String {
    const tagged = this.tagger.tagSentence(word)[0]
    return tagged.lemma || tagged.value;
  }

  tokenize(phrase: String): String[] {
    return phrase.split(/[^A-Za-z]+/)
      .filter(token => token !== '')

  }

  tokenizeAndStem(phrase: String): String[] {
    return this.tokenize(phrase)
      .map(word => this.stem(word));
  }
}