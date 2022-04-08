import {NgModule} from '@angular/core';
import {Router, RouterModule, Routes} from '@angular/router';
import {LandingComponent} from "./Components/landing/landing.component";
import {OktaAuthCallbackComponent} from "./SmartLaunch/Components/okta-auth/okta-auth-callback.component";
import {OAuthService} from "angular-oauth2-oidc";
import {EmrAuthorizationGuardService} from "./SmartLaunch/Guards/emr-authorization-guard.service";
import {InvalidLaunchComponent} from "./SmartLaunch/Components/invalid-launch/invalid-launch.component";
import {LaunchComponent} from "./SmartLaunch/Components/launch/launch.component";

const routes: Routes = [
  {
    path:'launch/:clientid',
    component:LaunchComponent
  },
  {
    path:'illegal-launch',
    component:InvalidLaunchComponent
  },
  {
    path:'oktacallback',
    component:OktaAuthCallbackComponent
  },
  {
    path:'landing',
    component:LandingComponent,
    canActivate: [EmrAuthorizationGuardService]
  },
  {
    path:'**',
    redirectTo: 'landing',
    pathMatch: 'full'
  },
  {
    path:'',
    redirectTo: 'landing',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: true })],
//  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {

  private _launchParameters!: Array<string>;

  constructor(private router: Router, private oauthService: OAuthService) {
  }

  private getQueryParameters(url: string) : string[] {
    let parameterList = new Array();
    if (url.indexOf('?') >= 0) {
      let urlSplit = url.split('?')[1];
      if (urlSplit.indexOf('&') >= 0) {
        let parameters = urlSplit.split('&');
        parameters.forEach(param => {
          parameterList.push(param.split('='));
        });
      }
    }
    return parameterList;
  }



  private get launchParameters(): Array<string> {
    return this._launchParameters;
  }

  private set launchParameters(value: Array<string>) {
    this._launchParameters = value;
  }

  private isLaunchParametersEmpty() : boolean {
    return(this._launchParameters === undefined || this._launchParameters.length == 0);
  }

}
