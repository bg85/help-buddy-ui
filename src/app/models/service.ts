import { ServiceLookup } from "./service-lookup";
import { Step } from "./step";

export class Service {
    public lookup: ServiceLookup;
    public steps: Step[];

    constructor(init?: Partial<Service>) {
        const defaultService: Partial<Service> = {
            steps: []
        };
        Object.assign(this, defaultService, init);
    }
}