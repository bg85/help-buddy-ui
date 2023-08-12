import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Payment } from 'src/app/models/payment';
import { UserMetadata } from 'src/app/models/user-metadata';
import { AuthService } from 'src/app/services/auth.service';
import { PaymentsService } from 'src/app/services/payments.service';
import { ChangePasswordDialog } from './change-password.dialog';
import { ConfirmCancelSubscriptionDialog } from './confirm-cancel-subscription.dialog';
import { environment } from "src/environments/environment";
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { TranslateService } from '@ngx-translate/core';

declare var paypal_one_time: any;
declare var paypal_subscriptions: any;

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit {

  public user: UserMetadata;
  @ViewChild('paypal_one_time') paypalOneTimeElement: ElementRef;
  @ViewChild('paypal_subscriptions') paypalSubscriptionsElement: ElementRef;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatTable) table: MatTable<any>;

  displayedColumns: string[] = ['date', 'amount', 'orderId'];
  dataSource: MatTableDataSource<Payment>;

  isLoadingResults = true;
  hasData = true;

  constructor(
    public dialog: MatDialog, 
    private readonly _snackBar: MatSnackBar, 
    private readonly authService: AuthService, 
    private readonly paymentsService: PaymentsService,
    private analytics: AngularFireAnalytics,
    public translate: TranslateService) { 
  }

  async ngOnInit(): Promise<void> {
    const self = this;
   
    await this.loadUserInfo();

    if (!this.user.subscribed) {
      this.setupPaypalOneTimePayment();

      this.setupPaypalSubscriptionsPayment();
    }
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ChangePasswordDialog, {
      width: '300px',
      data: { }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'Y') {
        this.analytics.logEvent("changed-password", { email: this.user.email });
      }
    });
  }

  async ngAfterViewInit() {
    if (!this.user) {
      await this.loadUserInfo();
    }

    await this.loadPaymentHistory();

    this.dataSource.paginator = this.paginator;
  }

  activeUntil(): Date | null {
    if (!this.user.lastPayment) {
      return null;
    }
    
    let numberDate = new Date(this.user.lastPayment).getDate();
    let activeUntil = new Date();
    activeUntil.setDate(numberDate + 30);
    return activeUntil;
  }

  private async loadUserInfo(): Promise<void> {
    this.user = await this.authService.getCurrentUserMetadata();
  }

  private setupPaypalOneTimePayment() {
    const self = this;

    paypal_one_time.Buttons({  
      createOrder: function(data: any, actions: any) {
        return actions.order.create({
          purchase_units: [
            {
              "description": "The help buddy. One month service.",
              "amount":
              {
                "currency_code": "USD",
                "value": 20
              }
            }]
        });
      },
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
      },
      onApprove: async function (data: any, actions: any) {  
        var paymentResult = await actions.order.capture();
        if (paymentResult.status === "COMPLETED") {
          const paymentMetadata = new Payment({amount: 20.0, paypalEmail: paymentResult.payer.email_address, userEmail: self.user.email, date: paymentResult.update_time, orderId: paymentResult.id});
          await self.paymentsService.registerPayment(paymentMetadata);
          self.user.active = true;
          self.user.lastPayment = paymentMetadata.date;
          await self.loadPaymentHistory();
          this.table.renderRows();
          self.analytics.logEvent("one-time-payment", { email: self.user.email });
          self._snackBar.open(await self.translate.get("profile.thankyouPayment").toPromise(), await self.translate.get("profile.close").toPromise());
        } else {
          self.analytics.logEvent("error", { email: self.user.email, message: "Error processing payment."});
          self._snackBar.open(await self.translate.get("profile.errorPayment").toPromise(), await self.translate.get("profile.close").toPromise());
        }
      },  
      onCancel: function (data: any) {  
        // Show a cancel page, or return to cart  
      },  
      onError: function (err: any) {  
        // Show an error page here, when an error occurs  
        self.analytics.logEvent("error", { email: self.user.email, message: "Error processing payment.", exception: err});
      }  
    }).render(this.paypalOneTimeElement.nativeElement);
  }

  openCancelSubscriptionDialog(): void {
    const dialogRef = this.dialog.open(ConfirmCancelSubscriptionDialog, {
      width: '300px',
      data: this.user
    });

    dialogRef.afterClosed().subscribe(async result => {
      if (result === 'Y') {
        var today = new Date();
        var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth()+1);
        this.user.active = true;
        this.user.subscribed = false;
        this.user.lastPayment = lastDayOfMonth.toString();
        this.user.subscriptionId = "";

        this.analytics.logEvent("subscription-cancel", { email: this.user.email });
        this._snackBar.open(await this.translate.get("profile.subscriptionCancelled").toPromise(), await this.translate.get("profile.close").toPromise());
      }
    });
  }

  private setupPaypalSubscriptionsPayment() {
    const self = this;

    paypal_subscriptions.Buttons({  
      createSubscription: function(data: any, actions: any) {
        return actions.subscription.create({
          plan_id: environment.planId
        });
      },
      style: {
        shape: 'rect',
        color: 'gold',
        layout: 'vertical',
        label: 'subscribe'
      },
      onApprove: async function (data: any, actions: any) { 
        if (data.subscriptionID && data.subscriptionID !== "") {
          const paymentMetadata = new Payment({amount: 20.0, paypalEmail: "", userEmail: self.user.email, date: new Date().toString(), orderId: data.orderID, subscriptionId: data.subscriptionID});
          await self.paymentsService.registerPayment(paymentMetadata);
          self.user.active = true;
          self.user.subscribed = true;
          self.user.lastPayment = paymentMetadata.date;
          self.user.subscriptionId = data.subscriptionID;
          self.analytics.logEvent("subscription-create", { email: self.user.email });
          self._snackBar.open(await self.translate.get("profile.thankyouSubscription").toPromise(), await self.translate.get("profile.close").toPromise());
        } else {
          self.analytics.logEvent("error", { email: self.user.email, message: "Error creating subscription."});
          self._snackBar.open(await self.translate.get("profile.errorPayment").toPromise(), await self.translate.get("profile.close").toPromise());
        }
      },  
      onCancel: function (data: any) {  
        // Show a cancel page, or return to cart  
      },  
      onError: function (err: any) {  
        // Show an error page here, when an error occurs  
        self.analytics.logEvent("error", { email: self.user.email, message: "Error creating subscription.", exception: err}); 
      }  
  
    }).render(this.paypalSubscriptionsElement.nativeElement);
  }

  isNotAllowedToPay() {
    var result = this.user?.subscribed ?? false;
    return result;
  }

  async loadPaymentHistory() {
    this.isLoadingResults = true;
    
    const paymentResults = await this.paymentsService.getPaymentHistory(this.user.email);
    this.hasData = paymentResults.length > 0;

    this.dataSource = new MatTableDataSource(paymentResults);
    
    this.isLoadingResults = false;
  }
}
