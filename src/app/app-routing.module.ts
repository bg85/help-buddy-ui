import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ActiveNotesComponent } from './components/active-notes/active-notes.component';
import { NotesComponent } from './components/notes/notes.component';
import { AuthGuardService } from './services/auth-guard.service';
import { ManageUsersComponent } from './components/manage-users/manage-users.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';

const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [ AuthGuardService ] },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [ AuthGuardService ] },
  { path: 'profile', component: ProfileComponent, canActivate: [ AuthGuardService ] },
  { path: 'active-notes', component: ActiveNotesComponent, canActivate: [ AuthGuardService ] },
  { path: 'notes', component: NotesComponent, canActivate: [ AuthGuardService ] },
  { path: 'manage-users', component: ManageUsersComponent, canActivate: [ AuthGuardService ] },
  { path: 'error', component: ErrorPageComponent, canActivate: [ AuthGuardService ] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
