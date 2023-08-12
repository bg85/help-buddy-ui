import { Component } from "@angular/core";
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from "@angular/material/snack-bar";
import { TranslateService } from "@ngx-translate/core";
import { AuthService } from "src/app/services/auth.service";

@Component({
    selector: 'change-password-dialog',
    templateUrl: './change-password.dialog.html',
})
export class ChangePasswordDialog {

    public newPassword: string = "";
    public confirmNewPassword: string = "";
    public message: string = "";

    constructor(
        public dialogRef: MatDialogRef<ChangePasswordDialog>, 
        private authService: AuthService, private _snackBar: MatSnackBar,
        public translate: TranslateService) {}

    onNoClick(): void {
        this.dialogRef.close('N');
    }

    async changePassword(): Promise<void> {
        let result = await this.authService.changePassword(this.newPassword);
        if (result) {
            this.newPassword = this.confirmNewPassword = "";
            this.message = await this.translate.get("profile.changedPasswordMessage").toPromise();
            this._snackBar.open(this.message, await this.translate.get("profile.close").toPromise());
            this.dialogRef.close('Y');
        } else {
            this.message = await this.translate.get("profile.changePasswordError").toPromise();
            this._snackBar.open(this.message, await this.translate.get("profile.close").toPromise());
        }
    }

    doNotMatch(): boolean {
        return this.newPassword !== this.confirmNewPassword;
    }

}