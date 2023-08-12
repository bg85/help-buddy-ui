import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { TranslateService } from '@ngx-translate/core';
import { Gender, Note } from 'src/app/models/note';
import { Service } from 'src/app/models/service';
import { ServiceLookup } from 'src/app/models/service-lookup';
import { PlaceOfService, Step } from 'src/app/models/step';
import { StepLookup } from 'src/app/models/step-lookup';
import { NotesService } from 'src/app/services/notes.service';
import { PersonalizerService } from 'src/app/services/personalizer.service';
import { PrinterService } from 'src/app/services/printer.service';
import { FlatTreeNode, SummaryNode } from './notes.tree-helpers.model';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class NotesComponent implements OnInit {

  isLinear = false;
  firstFormGroup: FormGroup;

  genderEnum = Gender;
  genderKeys: number[] = [];
  placeOfServiceKeys: number[] = [];
  placeOfServiceEnum = PlaceOfService;

  serviceLookups: ServiceLookup[] = [];
  stepLookups: StepLookup[] = [];

  currentService: Service;
  note: Note;
  summary: SummaryNode[] = [];
  isEditingSevice: boolean = false;
  private currentWording: number;
  
  constructor(
    private formBuilder: FormBuilder, 
    private snackBar: MatSnackBar, 
    private readonly notesService: NotesService,
    private readonly printerService: PrinterService,
    public readonly translate: TranslateService,
    public readonly personalizerService: PersonalizerService) {
      this.genderKeys = Gender.getKeys();
      this.placeOfServiceKeys = PlaceOfService.getKeys();
      this.currentWording = -1;
   }

  ngOnInit(): void {
    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: [''/*, Validators.required*/]
    });
    this.note = new Note();
    this.currentService = new Service();
    this.notesService.getServiceLookups().subscribe(data => this.serviceLookups = data);
  }

  async goForwardStep(stepper: MatStepper) {
    if (!this.note.clientName) {
      this.displayMessage(await this.translate.get("notes.selectClient").toPromise());
    } else if (!this.note.gender) {
      this.displayMessage(await this.translate.get("notes.selectGender").toPromise());
    } else {
      stepper.next();
    }
  }

  async addService() {
    if (!this.currentService.lookup || !this.currentService.steps || this.currentService.steps.length === 0) {
      this.displayMessage(await this.translate.get("notes.enterService").toPromise());
    } else {
      this.note.services.push(this.currentService);
      this.summary.push(new SummaryNode({service: this.currentService}));
      this.currentService = new Service();
    }
  }

  resetService(){
    this.currentService = new Service();
  }

  async addStep() {
    if (!this.currentService.lookup) {
      this.displayMessage(await this.translate.get("notes.selectCategory").toPromise());
    } else {
      this.notesService.getStepLookups(this.currentService.lookup.id).subscribe(data => this.stepLookups = data);
      this.currentService.steps.push(new Step({expanded: true}));
    }
  }

  hasSteps(): boolean {
    return this.currentService.steps.length > 0;
  }

  async generateWording(step: Step) {
    if (!step.lookup) {
      this.displayMessage(await this.translate.get("notes.selectStep").toPromise());
    }
    else {
      this.notesService.getRandomWording(step.lookup?.id ?? "").subscribe(wordings => {
        this.currentWording += wordings.length === this.currentWording + 1 ? -this.currentWording : 1;
        step.wording = this.personalizerService.personalize(this.note.clientName, this.note.gender, wordings[this.currentWording].text);
      });
    }
  }

  hasChild = (_: number, node: FlatTreeNode) => node.expandable;

  getDateOfService(): string {
    const dateParts = this.note.dateOfService.split("-");
    return new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])).toLocaleDateString();
  }

  deleteService(service: Service, event: { stopPropagation: () => void; }): void {
    this.note.services = this.note.services.filter(s => s !== service);
    this.summary = this.summary.filter(s => s.service !== service);
    event.stopPropagation();
  }

  editService(service: Service, event: { stopPropagation: () => void; }): void {
    this.currentService = service;
    this.isEditingSevice = true;
    event.stopPropagation();
  }

  updateService(): void {
    this.isEditingSevice = false;
    this.currentService = {lookup: this.serviceLookups[0], steps: []};
    this.summary.forEach(s => s.refreshTree());
  }

  async saveStep(step: Step) {
    if (!step.lookup || !step.placeOfService || !step.duration || !step.placeOfService || !step.startTime) {
      this.displayMessage(await this.translate.get("notes.enterStep").toPromise());
    }
    else {
      step.expanded = false;
      this.summary.forEach(s => s.refreshTree());
    }
  }

  async addNote() {
    this.displayMessage(await this.translate.get("notes.warning").toPromise());
    this.notesService.addNote(this.note);
    this.note = new Note();
    this.currentService = new Service();
    this.summary = [];
  }

  displayMessage(message: string) {
    this.snackBar.open(message, '', {
      horizontalPosition: 'end',
      verticalPosition: 'top',
      duration: 5000
    });
  }

  printNote(){
    this.printerService.printNote(this.note);
  }
}