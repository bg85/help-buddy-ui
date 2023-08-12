import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { AngularFireAuth } from "@angular/fire/auth";
import firebase from "firebase/app"
import {v4 as uuidv4} from 'uuid';
import { UserMetadata } from '../models/user-metadata';
import { environment } from 'src/environments/environment';
import { Result } from '../models/result';
import { AngularFireAnalytics } from '@angular/fire/analytics';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private adminEmail: string = "thehelpbuddy@gmail.com";
  authenticationState: Observable<firebase.User | null>;

  constructor(private angularFireAuth: AngularFireAuth, private http: HttpClient, private analytics: AngularFireAnalytics) {
    this.authenticationState = this.angularFireAuth.authState;
  }

  async signIn(email: string, password: string) : Promise<Result> {
    let signingResult = null;

    try {
      signingResult = await this.angularFireAuth.signInWithEmailAndPassword(email, password);
    } catch (error) {
      this.analytics.logEvent("exception", { email: email, exception: error, message: "Error sign in with email and password." });
    }

    return Promise.resolve(signingResult?.user 
      ? new Result({success: true})
      : new Result({success: false, message: "Invalid username and password combination."}));
  }
      
  async checkAuthenticated(): Promise<boolean> {
    return !!(await this.getCurrentUser());
  }

  async signOut(): Promise<void> {
    await this.angularFireAuth.signOut();
  }

  async getCurrentUserMetadata(): Promise<UserMetadata> {
    const user = await this.getCurrentUser();
    return user && user.email ? (await this.getUserMetadata(user.email)) : Promise.resolve(new UserMetadata());
  }

  async isCurrentUserAnAdmin(): Promise<boolean> {
    const email = (await this.getCurrentUser())?.email;
    return ( email === this.adminEmail);
  }

  async createUser(user: UserMetadata) :Promise<Result> {
    
    let result = new Result();

    //create user metadata
    try {
      const url = `${environment.apiUrl}/users`;
      this.http.post(url, user).toPromise();
    }
    catch (error: any) {
      result.success = false;
      result.message = "Error creating user metadata.";
      this.analytics.logEvent("exception", { email: user?.email, exception: error, message: "Error creating user metadata." });
      return result;
    }

    //create firebase user
    try {
      const password = uuidv4();
      const creationResult = await this.angularFireAuth.createUserWithEmailAndPassword(user.email, password);
    } catch(error: any) {
      result.success = false;
      result.message = `Code: ${error.code}. Message: ${error.message}`;
      this.analytics.logEvent("exception", { email: user?.email, exception: error, message: "Error creating user with email and password." });
      return result;
    }

    //send reset password email
    try {
      const emailResult = await this.angularFireAuth.sendPasswordResetEmail(user.email);
      result.success = true;
      result.message = "User created."
      this.analytics.logEvent("create-user", { emaill: user.email });
    } catch(error: any) {
      result.success = false;
      result.message = `Code: ${error.code}. Message: ${error.message}`;
      this.analytics.logEvent("exception", {email: user?.email, exception: error, message: "Error sending password email."});
    }

    return result;
  }

  async changePassword(newPassword: string): Promise<Boolean> {
    const user = firebase.auth().currentUser;

    try {
      await user?.updatePassword(newPassword);
      this.analytics.logEvent("change-password", { email: user?.email });
      return true;
    } catch(error: any) {
      console.log(error);
      this.analytics.logEvent("exception", {email: user?.email, exception: error, message: "Error changing password." });
      return false;
    }
  }

  async validateUserMetadata(email: string): Promise<void>  {
    const userMetadata = await this.getUserMetadata(email);
    if (!this.isCurrentUserAnAdmin() && userMetadata.lastPayment && !userMetadata.subscribed) {
      let endDate = new Date(userMetadata.lastPayment);
      endDate.setDate(endDate.getDate() + 30);
      if (endDate < new Date()) {
        userMetadata.active = false;
        await this.updateUserMetadata(userMetadata)
      }
    }
  }

  private async updateUserMetadata(userMetadata: UserMetadata): Promise<void> {
    try {
      const url = `${environment.apiUrl}/users`;
      this.http.put(url, userMetadata).toPromise();
    }
    catch (error: any){
      this.analytics.logEvent("exception", { email: userMetadata.email, exception: error, message: "Error updating user metadata."});
    }
  }

  private async getCurrentUser(): Promise<firebase.User | null> {
    return await this.angularFireAuth.user.pipe(first()).toPromise();
  }

  private async getUserMetadata(email: string): Promise<UserMetadata> {
    try {
      const url = `${environment.apiUrl}/users/${btoa(email)}`;
      return await this.http.get<UserMetadata>(url).toPromise();
    } catch (error: any){
      this.analytics.logEvent("exception", { email: email, exception: error, message: "Error getting user metadata."});
      return new UserMetadata();
    }
  }
}