export class Payment {
    public id: string;
    public userEmail: string;
    public paypalEmail: string;
    public date: string;
    public amount: number;
    public orderId: string;
    public subscriptionId: string;

    constructor(init?: Partial<Payment>) {
        const defaultPayment: Partial<Payment> = {
            id: "",
            paypalEmail: "",
            date: "",
            amount: 0.0,
            orderId: "",
            subscriptionId: ""

        };
        Object.assign(this, defaultPayment, init);
    }
}