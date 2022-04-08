import {Component, OnInit} from '@angular/core';
import {OAuthService} from 'angular-oauth2-oidc';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'sample-sof-app';
  isAuthenticated: boolean = false;

  constructor(private oauthService: OAuthService) {
  }

  ngOnInit(): void {
  }

  public login() {
    console.log('Login button manually clicked..')
    this.oauthService.initLoginFlow(); // Initializes either code flow or implicit flow depending on configuration
  }

  public logout() {
    this.oauthService.logOut(); //Clears used token store (by default sessionStorage) & forwards user to auth server logout endpoint if configured
  }

  public get userName() {
    var claims: any = this.oauthService.getIdentityClaims();
    if (!claims) return null;
    return claims.given_name + claims.family_name;//claims.name
  }

}
