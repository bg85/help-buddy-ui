import { Injectable } from '@angular/core';
import { Gender, Note } from '../models/note';

@Injectable({
  providedIn: 'root'
})
export class PersonalizerService {

  constructor() { }

  personalize(clientName: string, gender: Gender, wording: string): string {
    wording.replace("client_name", clientName);
    wording.replace("client_personal_pronun", gender === Gender.Female ? "she": "he");
    return wording;
  }
}
