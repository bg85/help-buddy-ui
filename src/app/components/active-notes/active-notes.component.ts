import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject } from 'rxjs';
import { NotesService } from 'src/app/services/notes.service';
import * as _ from "lodash";
import { Note } from 'src/app/models/note';
import { PrinterService } from 'src/app/services/printer.service';

export class ItemNode {
  children: ItemNode[] = [];
  item: string = "";
  data: Note;
}

export class ItemFlatNode {
  item: string = "";
  level: number = 0;
  expandable: boolean = false;
  data: Note;
}

@Injectable()
export class NotesDatabase {
  dataChange = new BehaviorSubject<ItemNode[]>([]);

  get data(): ItemNode[] { return this.dataChange.value; }

  constructor(private noteService: NotesService) {
    this.initialize();
  }

  initialize() {
    let notes = this.getTreeData();
    const data = this.buildFileTree(notes, 0);
    this.dataChange.next(data);
  }

  buildFileTree(obj: {key: string, notes: Note[], data: Note}[], level: number): ItemNode[] {
    return obj.reduce<ItemNode[]>((accumulator, element) => {
      const value = element.notes;
      const node = new ItemNode();
      node.item = element.key;
      node.data = element.data;

      if (value != null && level === 0) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value.map(n => ({key: n.dateOfService, notes: [], data: n})), level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  getTreeData() {
    const groups  = _.groupBy(this.noteService.notes, (n: { clientName: string; }) => n.clientName.toLowerCase().trim()); 
    let notes = [];
    for (let key in groups) {
      notes.push({key: groups[key][0].clientName, notes: groups[key], data: new Note()});
    }
    return notes;
  }
}

@Component({
  selector: 'app-active-notes',
  templateUrl: './active-notes.component.html',
  styleUrls: ['./active-notes.component.css'],
  providers: [NotesDatabase]
})
export class ActiveNotesComponent {

  flatNodeMap = new Map<ItemFlatNode, ItemNode>();

  nestedNodeMap = new Map<ItemNode, ItemFlatNode>();

  selectedParent: ItemFlatNode | null = null;

  newItemName = '';

  treeControl: FlatTreeControl<ItemFlatNode>;

  treeFlattener: MatTreeFlattener<ItemNode, ItemFlatNode>;

  dataSource: MatTreeFlatDataSource<ItemNode, ItemFlatNode>;

  checklistSelection = new SelectionModel<ItemFlatNode>(true /* multiple */);

  constructor(database: NotesDatabase, private printerService: PrinterService) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<ItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    database.dataChange.subscribe((data: ItemNode[]) => {
      this.dataSource.data = data;
    });
  }

  getLevel = (node: ItemFlatNode) => node.level;

  isExpandable = (node: ItemFlatNode) => node.expandable;

  getChildren = (node: ItemNode): ItemNode[] => node.children;

  hasChild = (_: number, _nodeData: ItemFlatNode) => _nodeData.expandable;

  hasNoContent = (_: number, _nodeData: ItemFlatNode) => _nodeData.item === '';

  transformer = (node: ItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.item === node.item
        ? existingNode
        : new ItemFlatNode();
    flatNode.item = node.item;
    flatNode.level = level;
    flatNode.expandable = !!node.children?.length;
    flatNode.data = node.data;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  descendantsAllSelected(node: ItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.checklistSelection.isSelected(child);
    });
    return descAllSelected;
  }

  descendantsPartiallySelected(node: ItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  noteSelectionToggle(node: ItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);

    descendants.forEach(child => this.checklistSelection.isSelected(child));
    this.checkAllParentsSelection(node);
  }

  noteLeafItemSelectionToggle(node: ItemFlatNode): void {
    this.checklistSelection.toggle(node);
    this.checkAllParentsSelection(node);
  }

  checkAllParentsSelection(node: ItemFlatNode): void {
    let parent: ItemFlatNode | null = this.getParentNode(node);
    while (parent) {
      this.checkRootNodeSelection(parent);
      parent = this.getParentNode(parent);
    }
  }

  checkRootNodeSelection(node: ItemFlatNode): void {
    const nodeSelected = this.checklistSelection.isSelected(node);
    const descendants = this.treeControl.getDescendants(node);
    const descAllSelected = descendants.length > 0 && descendants.every(child => {
      return this.checklistSelection.isSelected(child);
    });
    if (nodeSelected && !descAllSelected) {
      this.checklistSelection.deselect(node);
    } else if (!nodeSelected && descAllSelected) {
      this.checklistSelection.select(node);
    }
  }

  getParentNode(node: ItemFlatNode): ItemFlatNode | null {
      const currentLevel = this.getLevel(node);

      if (currentLevel < 1) {
        return null;
      }

      const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

      for (let i = startIndex; i >= 0; i--) {
        const currentNode = this.treeControl.dataNodes[i];

        if (this.getLevel(currentNode) < currentLevel) {
          return currentNode;
        }
      }
      return null;
  }
  
  printNotes() {
    const selectedNodes = this.treeControl.dataNodes.filter(node => this.checklistSelection.isSelected(node) && node.level > 0);
    selectedNodes.forEach(n => this.printerService.printNote(n.data));
  }
}
