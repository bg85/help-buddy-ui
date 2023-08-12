export class WordingLookup {
    public id: string;
    public stepId: number;
    public text: string;

    constructor(init?: Partial<WordingLookup>) {
        const defaultWording: Partial<WordingLookup> = {
            id: "",
            text: ""
        };
        Object.assign(this, defaultWording, init);
    }
}