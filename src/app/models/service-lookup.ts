export class ServiceLookup {
    public id: string;
    public name: string;
    public description: string;

    constructor(init?: Partial<ServiceLookup>) {
        const defaultServiceLookup: Partial<ServiceLookup> = {
            id: "",
            name: "",
            description: ""
        };
        Object.assign(this, defaultServiceLookup, init);
    }
}