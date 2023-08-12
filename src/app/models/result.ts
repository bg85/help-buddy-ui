export class Result {
    public success: boolean;
    public message: string;

    constructor(init?: Partial<Result>) {
        const defaultResult: Partial<Result> = {
            message: "",
            success: false
        };
        Object.assign(this, defaultResult, init);
    }
}