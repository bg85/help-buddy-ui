import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AngularFireAnalytics } from "@angular/fire/analytics";
import { of } from 'rxjs';
import { environment } from "src/environments/environment";
import { Payment } from "../models/payment";
import { Result } from "../models/result";

@Injectable({
    providedIn: 'root'
})
export class PaymentsService {

    constructor(private http: HttpClient, private analytics: AngularFireAnalytics) {
       
    }

    async registerPayment(paymentMetadata: Payment) {
        const result = new Result();

        try {
            const url = `${environment.apiUrl}/payments`;
            this.http.post(url, paymentMetadata).toPromise();
        }
        catch(error: any) {
            result.success = false;
            result.message = "Error registering payment.";
            this.analytics.logEvent("exception", { email: paymentMetadata.userEmail, exception: error, message: "Error registering a payment."});
            return result;
        }

        this.analytics.logEvent("register-payment", { email: paymentMetadata.userEmail });
        return result;
    }

    getPaymentHistory(email: string): Promise<Payment[]> {
        try {
            const url = `${environment.apiUrl}/payments/${btoa(email)}`;
            return this.http.get<Payment[]>(url).toPromise();
        }
        catch (error: any) {
            this.analytics.logEvent("exception", { email: email, exception: error, message: "Error getting payment history."});
            return of([]).toPromise();
        }
    }

    cancelSubscription(email: string, subscriptionId: string) {
        try {
            const url = `${environment.apiUrl}/payments/cancelSubscription/`;
            this.http.post(url, {email: email, subscriptionId: subscriptionId}).toPromise();
        }
        catch (error: any) {
            this.analytics.logEvent("exception", { email: email, exception: error, message: "Error cancelling subscription." });
            return;
        }

        this.analytics.logEvent("cancel-subscription", { email: email });
    }
}