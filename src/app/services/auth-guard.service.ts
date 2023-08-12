import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(public authService: AuthService, public router: Router) { }

  private readonly adminUrl: string = "/manage-users";
  private readonly alwaysUrls: string[] = ["/dashboard", "/profile"];

  async canActivate(): Promise<boolean> {
    if (! (await this.authService.checkAuthenticated())) {
      await this.router.navigate(['login']);
      return false;
    }

    const url: string = this.router.getCurrentNavigation()?.finalUrl?.toString() ?? "";
    if ( url === this.adminUrl
    && !(await this.authService.isCurrentUserAnAdmin())) {
      await this.router.navigate(['error']);
      return false;
    }

    if (!this.alwaysUrls.includes(url)) {
      const userMetadata = await this.authService.getCurrentUserMetadata();
      return userMetadata?.active ?? false;
    } 
    
    return true;
  }
}
