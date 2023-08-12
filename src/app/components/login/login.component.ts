import { Component, OnInit } from '@angular/core';
import { AngularFireAnalytics } from '@angular/fire/analytics';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  private returnUrl: string;
  
  form: FormGroup;
  public loginInvalid = false;
  public invalidLoginMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private analytics: AngularFireAnalytics
  ) { 
    this.returnUrl = this.route.snapshot.queryParams.returnUrl || '/dashboard';

    this.form = this.fb.group({
      username: ['', Validators.email],
      password: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    if (await this.authService.checkAuthenticated()) {
      await this.router.navigate([this.returnUrl]);
    }
  }

  async onSubmit(): Promise<void> {
    this.loginInvalid = false;
    if (this.form.valid) {
      try {
        const username = this.form.get('username')?.value;
        const password = this.form.get('password')?.value;

        await this.authService.validateUserMetadata(username);

        let result = await this.authService.signIn(username, password);

        if (result.success) {
          this.analytics.logEvent('login', { email: username });
          this.invalidLoginMessage = "";
          await this.router.navigate(['dashboard']);
        } else {
          this.invalidLoginMessage = result.message;
        }
      } catch (err) {
        this.analytics.logEvent('exception', {exception: err});
        this.loginInvalid = true;
      }
    }
  }
}
