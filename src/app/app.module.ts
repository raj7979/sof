import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule} from '@angular/common/http'
import {FormsModule} from '@angular/forms';
import {OAuthModule} from 'angular-oauth2-oidc';

import {LandingComponent} from './Components/landing/landing.component'

import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatDividerModule} from '@angular/material/divider';
import {MatDialogModule} from '@angular/material/dialog';
import {MatChipsModule} from "@angular/material/chips";
import {DragDropModule} from '@angular/cdk/drag-drop';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";

import {MatTableModule} from "@angular/material/table";
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {OktaAuthCallbackComponent} from './SmartLaunch/Components/okta-auth/okta-auth-callback.component';
import {InvalidLaunchComponent} from './SmartLaunch/Components/invalid-launch/invalid-launch.component';
import {LaunchComponent} from './SmartLaunch/Components/launch/launch.component';

@NgModule({
  declarations: [
    AppComponent,
    LandingComponent,
    OktaAuthCallbackComponent,
    InvalidLaunchComponent,
    LaunchComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatFormFieldModule,
        MatInputModule,
        MatDividerModule,
        MatDialogModule,
        MatChipsModule,
        DragDropModule,
        MatIconModule,
        OAuthModule.forRoot(),
        MatTableModule,
        FontAwesomeModule,
        MatProgressSpinnerModule
    ],
  providers: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
