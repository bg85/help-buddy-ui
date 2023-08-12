import { Injectable } from '@angular/core';
import { Note } from '../models/note';
import { ServiceLookup } from '../models/service-lookup';
import { StepLookup } from '../models/step-lookup';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { WordingLookup } from '../models/wording-lookup';
import { environment } from 'src/environments/environment';
import { AngularFireAnalytics } from '@angular/fire/analytics';

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  notes: Note[];

  constructor(private http: HttpClient, private analytics: AngularFireAnalytics) {
    this.notes = [];
  }

  public getServiceLookups() : Observable<ServiceLookup[]> {
    try {
      const url = `${environment.apiUrl}/lookups/services`;
      return this.http.get<ServiceLookup[]>(url);
    } catch (error: any){
      this.analytics.logEvent("exception", { exception: error, message: "Error getting service lookups."});
      return of([]);
    }
  }

  public getStepLookups(serviceLookup: string) : Observable<StepLookup[]> {
    try {
      const url = `${environment.apiUrl}/lookups/steps/service/${serviceLookup}`;
      return this.http.get<StepLookup[]>(url);
    } catch (error: any){
      this.analytics.logEvent("exception", { serviceLoohup: serviceLookup, exception: error, message: "Error getting step lookups."});
      return of([]);
    }
  }

  public getRandomWording(stepLookup: string): Observable<WordingLookup[]> {
    try {
      const url = `${environment.apiUrl}/lookups/wording/step/${stepLookup}`;
      return this.http.get<WordingLookup[]>(url);
    } catch (error: any){
      this.analytics.logEvent("exception", { stepLookup: stepLookup, exception: error, message: "Error getting random wording lookups."});
      return of([]);
    }
  }

  public addNote(note: Note) {
    this.notes.push(note);
  }
}


