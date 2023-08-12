export class UserMetadata {
    public id: string;
    public email: string;
    public firstName: string;
    public lastName: string;
    public active: boolean;
    public subscribed: boolean;
    public role: string;
    public institution: string;
    public lastPayment: string;
    public subscriptionId: string;

    constructor(init?: Partial<UserMetadata>) {
        const defaultUser: Partial<UserMetadata> = {
            id: "",
            email: "",
            firstName: "",
            lastName: "",
            role: "",
            institution: "",
            lastPayment: "",
            active: false,
            subscriptionId: ""
        };
        Object.assign(this, defaultUser, init);
    }
}