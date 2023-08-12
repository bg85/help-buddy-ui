import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  
  title = 'The Help Buddy';
  isAuthenticated = false;
  language = "es";

  constructor(public authService: AuthService, private router: Router, public translate: TranslateService) {
    this.authService.authenticationState.subscribe(user => {
      this.isAuthenticated = !!user;
    });
    
    translate.addLangs(['en', 'es']);  
    translate.setDefaultLang(this.language);
  }

  async ngOnInit(): Promise<void> {
  }
  
  async logout(): Promise<void> {
    await this.authService.signOut();
    await this.router.navigate(['login']);
  }

  changeLanguage() {
    this.translate.use(this.language);  
  }
}
