import { Time } from '@angular/common';
import { StepLookup } from './step-lookup';

export class Step {
    public startTime: Time | null;
    public duration: number;
    public placeOfService: PlaceOfService;
    public lookup: StepLookup | null;
    public wording: string;
    public expanded: boolean;

    constructor(init?: Partial<Step>) {
        const defaultStep: Partial<Step> = {
            duration: 0,
            placeOfService: PlaceOfService.Unknown,
            wording: "",
            expanded: false 
        };
        Object.assign(this, defaultStep, init);
    }
}

export enum PlaceOfService {
    Unknown = 0,
    School = 3,
    Office = 11,
    Home = 12,
    ALF = 13,
    CMHC = 53,
    Other = 99
}

export namespace PlaceOfService {
    export function getKeys(): number[] {
        return Object.keys(PlaceOfService).filter(g => (!isNaN(Number(g)) && Number(g) !== 0)).map(k => parseInt(k));
    }
}