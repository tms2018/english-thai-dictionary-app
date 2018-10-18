import { Component, Input } from '@angular/core';
import { Word } from '../../providers/database/database';

/**
 * Generated class for the CollapsibleSegmentComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'collapsible-card',
  templateUrl: 'collapsible-card.html'
})
export class CollapsibleCardComponent {

  isVisible: Boolean = true;
  @Input() word: Word;

  constructor() {
  }

  toggleHidden() {
    this.isVisible = !this.isVisible;
  }
}
