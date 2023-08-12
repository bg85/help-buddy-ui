import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserMetadata } from "src/app/models/user-metadata";
import { PaymentsService } from "src/app/services/payments.service";

@Component({
    selector: 'confirm-cancel-subscription-dialog',
    templateUrl: './confirm-cancel-subscription.dialog.html',
})
export class ConfirmCancelSubscriptionDialog {

    constructor(
        public dialogRef: MatDialogRef<ConfirmCancelSubscriptionDialog>, 
        @Inject(MAT_DIALOG_DATA) public data: UserMetadata,
        private readonly paymentService: PaymentsService) {
        }

    onNoClick(): void {
        this.dialogRef.close('N');
    }

    async cancelSubscription(): Promise<void> {
        this.paymentService.cancelSubscription(this.data.email, this.data.subscriptionId);
        this.dialogRef.close('Y');
    }
}