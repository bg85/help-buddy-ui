import { FlatTreeControl } from "@angular/cdk/tree";
import { Time } from "@angular/common";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { Service } from "src/app/models/service";
import { PlaceOfService, Step } from "src/app/models/step";

export interface StepNode {
    name: string;
    startTime: Time | null;
    duration: number;
    placeOfService: PlaceOfService;
    children?: StepNode[];
}
  
export interface FlatTreeNode {
    expandable: boolean;
    name: string;
    startTime: Time | null;
    duration: number;
    placeOfService: PlaceOfService;
    level: number;
}
  
export class SummaryNode {
    service: Service;
    treeControl: FlatTreeControl<FlatTreeNode>;
    dataSource: MatTreeFlatDataSource<StepNode, FlatTreeNode>;
  
    constructor(init: Partial<SummaryNode>) {
      this.treeControl = new FlatTreeControl<FlatTreeNode>(node => node.level, node => node.expandable);
      this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
      
      if (init?.service) {
        this.service = init.service;
        this.dataSource.data = this.service.steps.map(s => this.getStepNode(s));
      }
    }
  
    refreshTree() {
      this.dataSource.data = [];
      this.dataSource.data = this.service.steps.map(s => this.getStepNode(s));
    }
  
    getStepNode(step: Step): StepNode {
      return {name: step.lookup?.name ?? "", startTime: step.startTime, duration: step.duration, placeOfService: step.placeOfService, children: [{ name: step.wording, startTime: step.startTime, duration: step.duration, placeOfService: step.placeOfService }]};
    }
  
    private transformer = (node: StepNode, level: number) => {
      return {
        expandable: !!node.children && node.children.length > 0,
        name: node.name,
        level: level,
        startTime: node.startTime,
        duration: node.duration,
        placeOfService: node.placeOfService
      };
    }
  
    treeFlattener = new MatTreeFlattener(this.transformer, node => node.level, node => node.expandable, node => node.children);
}