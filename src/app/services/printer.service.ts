import { Injectable } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { Note } from '../models/note';

@Injectable({
  providedIn: 'root'
})
export class PrinterService {

  constructor(private analytics: AngularFireAnalytics) { }

  printNote(note: Note) {
    this.analytics.logEvent("print-note") //TODO: maybe add here the email of the current user
    console.log(`printing note for: ${note.clientName}-${note.dateOfService}`);
  }
}
