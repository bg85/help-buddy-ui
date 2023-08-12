export class StepLookup {
    public id: string;
    public serviceIds: number[];
    public name: string;

    constructor(init?: Partial<StepLookup>) {
        const defaultStep: Partial<StepLookup> = {
            id: "",
            serviceIds: [],
            name: ""
        };
        Object.assign(this, defaultStep, init);
    }
}