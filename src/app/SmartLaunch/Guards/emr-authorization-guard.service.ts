import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthenticationWorkflowService} from "../Services/authentication-workflow.service";
import {OAuthService} from "angular-oauth2-oidc";
import {EmrAuthService} from "../Services/emr-auth.service";
import {EmrOAuthConfiguration} from "../Interfaces/emr-oauth-configuration";

@Injectable({
  providedIn: 'root'
})
export class EmrAuthorizationGuardService implements CanActivate {

  constructor(private authWorkflowService: AuthenticationWorkflowService,
              private cambianOAuthService: OAuthService,
              private oktaAuthService: EmrAuthService,
              private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot,
                    state: RouterStateSnapshot) {

    let isOktaAuthorized: boolean = false;

    if (this.oktaAuthService.isEmrOAuthConfigured()) {
      isOktaAuthorized = await this.oktaAuthService.isAuthenticated();
      if (isOktaAuthorized) {
        return true;
      }
    }

    let emrOauthConfig:EmrOAuthConfiguration = await this.authWorkflowService.acquireEmrOAuthParameters();
    console.log("___   EmrAuthorizationGuardService # canActivate  .....  got OAuth config");
    if (this.authWorkflowService.isLegalLaunch() == false) {
      this.router.navigateByUrl('/illegal-launch')
      // return false;
    }
    console.log("___   EmrAuthorizationGuardService # canActivate  .....  OAuth config OK,  configure Okta auth service ... ");

    this.oktaAuthService.configure(emrOauthConfig.clientId,
                                   emrOauthConfig.issuer,
                                   emrOauthConfig.redirectUrl,
                                   emrOauthConfig.scopes,
                                   emrOauthConfig.isPKCE,
                                   emrOauthConfig.launch)

    isOktaAuthorized = await this.oktaAuthService.isAuthenticated();
    if (isOktaAuthorized == false) {
      this.oktaAuthService.login(state.url);
    }

    isOktaAuthorized = await this.oktaAuthService.isAuthenticated();
    if (isOktaAuthorized) {
      this.oktaAuthService.triggerEmrAccessToken();
      return true;
    }

    return false;
  }
}
