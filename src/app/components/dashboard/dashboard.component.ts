import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  name: string = "";
  message: string = "Helping to help!";
  isAdmin: boolean = false;
  isActive: boolean = false;

  constructor(private authService: AuthService) { }

  async ngOnInit(): Promise<void> {
    let currentUser = await this.authService.getCurrentUserMetadata();
    this.name = `${currentUser.firstName} ${currentUser.lastName}`;
    this.isAdmin = await this.authService.isCurrentUserAnAdmin();
    this.isActive = (await this.authService.getCurrentUserMetadata()).active;
  }
}
