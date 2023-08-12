import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Payment } from 'src/app/models/payment';
import { UserMetadata } from 'src/app/models/user-metadata';
import { AuthService } from 'src/app/services/auth.service';
import { PaymentsService } from 'src/app/services/payments.service';

@Component({
  selector: 'app-manage-users',
  templateUrl: './manage-users.component.html',
  styleUrls: ['./manage-users.component.css']
})
export class ManageUsersComponent implements OnInit {

  user: UserMetadata = new UserMetadata();
  payment: Payment = new Payment();
  displayMessage: string = "";
  paymentDisplayMessage: string = "";

  constructor(private readonly snackBar: MatSnackBar, private readonly authService: AuthService, private readonly paymentsService: PaymentsService) { }

  ngOnInit(): void {
  }

  async createUser() {
    const result = await this.authService.createUser(this.user);
    this.displayMessage = result.message;
    this.snackBar.open("The user was created.", "Close");
  }

  hasMessage(){
    return this.displayMessage !== "";
  }

  hasPaymentMessage(){
    return this.paymentDisplayMessage !== "";
  }

  async registerPayment() {
    this.payment.date = new Date().toString();
    await this.paymentsService.registerPayment(this.payment);
    this.snackBar.open("The payment was registered.", "Close");
  }
}
