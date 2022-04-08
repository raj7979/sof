import {Injectable} from '@angular/core';
import {Router} from '@angular/router';
import {AccessToken, OktaAuth} from '@okta/okta-auth-js';
import {LaunchContext, context_props} from "../Interfaces/launch-context";
import {JWT} from "../Interfaces/jwt";
import {EmrOAuthConfiguration} from "../Interfaces/emr-oauth-configuration";
import {BehaviorSubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class EmrAuthService {

  public oktaAuth = new OktaAuth({
    clientId: '0oa2jnny1mJQc3gwR1d7',
    issuer: 'https://wellhealth.oktapreview.com/oauth2/aus1trldvwYSoOtK01d7',
    redirectUri: 'oktacallback',
    //tokenUrl: "http://silverfir:8080/kaiemr/smart/proxy/v1/token",
    scopes: ['patient/Patient.read', 'patient/Observation.read', 'launch', 'openid', 'email', 'profile'],
    pkce: true
  });

  private emrAuthenticatedSource  = new BehaviorSubject('');
  public emrAccessTokenObservable =  this.emrAuthenticatedSource.asObservable();

  private configuredLaunchParam : string = '';

  constructor(private router: Router) {
    console.log("###______  EmrAuthService # constructor -- options=" +JSON.stringify(this.oktaAuth.options) );
  }

  public configure(clientId: string, issuer: string, redirectUrl: string, scopes: string[], isPkce: boolean, launchParameter: string)  {
    console.log("______  EmrAuthService#:configure -- issuer=" + issuer + ", clientId=" + clientId + ", redirectUrl=" + redirectUrl);

    this.configuredLaunchParam = launchParameter;

    this.oktaAuth = new OktaAuth({
      clientId: '0oa2jnny1mJQc3gwR1d7',
      issuer: 'https://wellhealth.oktapreview.com/oauth2/aus1trldvwYSoOtK01d7',
      redirectUri: 'oktacallback',
      //tokenUrl: "http://silverfir:8080/kaiemr/smart/proxy/v1/token",
      scopes: ['patient/Patient.read', 'patient/Observation.read', 'launch', 'openid', 'email', 'profile'],
      pkce: true
      //  , state: launchParameter // if not set, then Okta will set it
    });
    console.log("        EmrAuthService#:configure -- using default state" );
    // from okta --  state param:  A client-provided string that will be passed to the server endpoint
    // and returned in the OAuth response. The value can be used to validate the OAuth response and
    //  prevent cross-site request forgery (CSRF). Defaults to a random string.

    console.log("###______  EmrAuthService # configure -- options=" +JSON.stringify(this.oktaAuth.options) );

  }

  public async isAuthenticated(): Promise<boolean> {
    let isSessionAuthenticated: boolean = false;
    console.log("______  EmrAuthService#isAuthenticated -- get accessToken " );

    // Next two lines may be helpful for catching network traces with the /authorize request
    // to see the parameters that are sent, in paricular the &launch param
    // await new Promise(r => setTimeout(r, 7000));
    // console.log("!!!!!!!!!!!!!!!!!   sleeping in isAuthenticated, hit debug quick!!!!!" );

    // Checks if there is a current accessToken in the TokenManger.
    let accessToken:string = await this.oktaAuth.tokenManager.get('accessToken');
    if (!!accessToken) {
      isSessionAuthenticated = !this.oktaAuth.tokenManager.hasExpired(accessToken);
    }

    return new Promise(resolve => {
      resolve(isSessionAuthenticated);
    });
  }


  public login(originalUrl: string) {
    // Save current URL before redirect
    sessionStorage.setItem('okta-app-url', originalUrl || this.router.url);
    console.log("#####______  EmrAuthService # login -- originalUrl=" +originalUrl );
    console.log("#####______  EmrAuthService # login -- options=" +JSON.stringify(this.oktaAuth.options) );

    // get the stored launch parameter, it will be use din the Okta request
    let launchQueryParam : string = this.launchParameter || this.configuredLaunchParam;
    console.log("#####______  EmrAuthService # login -- call getWithRedirect with extra param launch=" +launchQueryParam );

    // Launches the login redirect.  For OIDC this passes the scopes{ scopes: ['openid', 'email', 'profile'] }
    this.oktaAuth.token.getWithRedirect( { extraParams: { launch: launchQueryParam} } );

    //  From Okta Support:
    // A new release is done https://github.com/okta/okta-auth-js/releases/tag/okta-auth-js-5.9.0

    // When making the /authorize call add an object extraParams with as many key/values that you need. For example,
    // authClient.token.getWithRedirect({ extraParams: { launch: 'launch', launch2: 'launch2' }})
    // will result in,
    // .../v1/authorize?client_id=0oa1...&launch=launch&launch2=launch2
        
  }

  // Handles the response from Okta and parses tokens
  public async handleAuthentication() {
    console.log("______  EmrAuthService #  handleAuthentication .... Handles the response from Okta and parses token" );
    console.log("###______  EmrAuthService # handleAuthentication -- options=" +JSON.stringify(this.oktaAuth.options) );

    // useful to pause app so Chrome debugger can be started
    // await new Promise(r => setTimeout(r, 7000));
    // console.log("!!!!!!!!!!!!!!!!!   sleeping in handleAuthentication, hit debug quick!!!!!" );

    if (this.oktaAuth.isLoginRedirect()) {
      const tokenContainer = await this.oktaAuth.token.parseFromUrl();

      console.log("______  EmrAuthService #  handleAuthentication .... add token to TokenManager" );
      this.oktaAuth.tokenManager.add('accessToken', tokenContainer.tokens.accessToken as AccessToken);

      // Retrieve the saved URL and navigate back
      const url = sessionStorage.getItem('okta-app-url') as string;
      this.router.navigateByUrl(url);
    }
  }

  // TODO - this is never called in this app, see bp app for example
  // This gets input from accessToken that will no longer have access to the context
  public extractLaunchContext(accessToken: string): LaunchContext|undefined {
    let launchContext!: LaunchContext;
    console.log("______  EmrAuthService # extractLaunchContext ....s" );

    // get launch context params from tokenReponse
    // context_props.forEach(prop => {

    //   if (launchContext.hasOwnProperty(prop)) {
    //     launchContext[prop as keyof LaunchContext] = tokenResponse[prop];
    //     console.log(prop + " -> " + launchContext[prop]);
    //   }
    // });
    //  let accessToken : string = tokenResponse['access_token'];

    if (accessToken != undefined) {
      let components: string[] = accessToken.split('.');
      let decodedPayload: string = atob(components[1])
      let jwtToken:JWT = <JWT> JSON.parse(decodedPayload);
      launchContext = <LaunchContext> jwtToken.context;
      launchContext.issuer = jwtToken.iss;
      launchContext.baseFhirUrl = <string> this.launchBaseFhirUrl;
    }
    return launchContext;
  }

  public async logout() {
    await this.oktaAuth.signOut({
      postLogoutRedirectUri: 'http://localhost:4200/'
    });
  }

  public triggerEmrAccessToken() {
    if (this.isAuthenticated()) {
      this.changeEmrAuthenticated(<string>this.oktaAuth.getAccessToken());
    }
  }



  public get issuer(): string | null {
    return this.getSession('issuer');
  }
  public set issuer(value: string | null) {
    this.setSession('issuer', value);
  }

  public get launchUrl(): string | null {
    return this.getSession('launchUrl');
  }
  public set launchUrl(value: string | null) {
    this.setSession('launchUrl', value);
  }

  public get launchParameter(): string | null {
    return this.getSession('launchParameter');
  }

  public set launchParameter(value: string | null) {
    this.setSession('launchParameter', value);
  }


  public get launchContextPractitionerId(): string | null {
    return this.getSession('launchContextPractitionerId');
  }
  public set launchContextPractitionerId(value: string | null) {
    this.setSession('launchContextPractitionerId', value);
  }

  public get launchContextPatientId(): string | null {
    return this.getSession('launchContextPatientId');
  }
  public set launchContextPatientId(value: string | null) {
    this.setSession('launchContextPatientId', value);
  }



  // For Okta, this is the Authorization Server Id
  public get clientId(): string | null {
    return this.getSession('clientId');
  }
  public set clientId(value: string | null) {
    this.setSession('clientId', value);
  }

  public get launchBaseFhirUrl(): string | null {
    return this.getSession('launchBaseFhirUrl');
  }
  public set launchBaseFhirUrl(value: string | null) {
    let lastChar = value?.substr(-1);
    if (lastChar !== '/') {
      this.setSession('launchBaseFhirUrl', value + '/');
    } else {
      this.setSession('launchBaseFhirUrl', value);
    }
  }


  public storeEmrOAuthParameters(emrOauthConfig:EmrOAuthConfiguration) : void {
    console.log("______  EmrAuthService#storeEmrOAuthParameters " );

    if (emrOauthConfig.isPKCE) {
      sessionStorage.setItem('emrOauthConfigPKCE', 'true');
    } else {
      sessionStorage.setItem('emrOauthConfigPKCE', 'false');
    }
    sessionStorage.setItem('emrOauthConfigClientId', emrOauthConfig.clientId);
    sessionStorage.setItem('emrOauthConfigIssuer', emrOauthConfig.issuer);
    sessionStorage.setItem('emrOauthConfigRedirectUrl', emrOauthConfig.redirectUrl);
    sessionStorage.setItem('emrOauthConfigScopes', emrOauthConfig.scopes.join());
  }


  public isEmrOAuthConfigured(): boolean {
    console.log("______  EmrAuthService#isEmrOAuthConfigured " );

    return sessionStorage.getItem('emrOauthConfigPKCE') != null &&
      sessionStorage.getItem('emrOauthConfigClientId') != null &&
      sessionStorage.getItem('emrOauthConfigIssuer') != null &&
      sessionStorage.getItem('emrOauthConfigRedirectUrl') != null &&
      sessionStorage.getItem('emrOauthConfigScopes') != null;
  }

  public retrieveEmrOAuthParameters(): EmrOAuthConfiguration {
    console.log("______  EmrAuthService#retrieveEmrOAuthParameters " );

    let emrOauthConfig:EmrOAuthConfiguration = new EmrOAuthConfiguration();
    let isPKCE = sessionStorage.getItem('emrOauthConfigPKCE');
    if (isPKCE == 'true') {
      emrOauthConfig.isPKCE = true;
    } else {
      emrOauthConfig.isPKCE = false;
    }
    emrOauthConfig.clientId = <string> sessionStorage.getItem('emrOauthConfigClientId');
    emrOauthConfig.issuer = <string> sessionStorage.getItem('emrOauthConfigIssuer');
    emrOauthConfig.redirectUrl = <string> sessionStorage.getItem('emrOauthConfigRedirectUrl');
    let scopes:string|null = sessionStorage.getItem('emrOauthConfigScopes');
    if (scopes != null) {
      emrOauthConfig.scopes = scopes.split(',');
    }
    emrOauthConfig.launch = <string> this.launchParameter;

    return emrOauthConfig;
  }


  //
  // Private Methods
  //
  private getSession(key: string) : string|null {
    let value:string|null = sessionStorage.getItem(key);
    if (value == undefined || value == null || value == '') {
      return null;
    } else {
      return value;
    }
  }

  private setSession(key: string | null, value:  string | null) :void {
    if ((key != undefined && key.length > 0) &&
      (value != undefined && value != null && value.length > 0)) {
      sessionStorage.setItem(key, value);
    }
  }


  private changeEmrAuthenticated(message: string) {
    if (message != undefined && message.length > 0) {
      this.emrAuthenticatedSource.next(message)
    }
  }
}
