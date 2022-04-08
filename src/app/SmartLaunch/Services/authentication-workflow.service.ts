import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {EmrWellKnown} from "../Interfaces/emr-well-known";
import {EmrOAuthConfiguration} from "../Interfaces/emr-oauth-configuration";
import {Router} from "@angular/router";
import {EmrAuthService} from "./emr-auth.service";
import {EmrOauthEndpoints} from "../Interfaces/emr-oauth-endpoints";
import {EmrCapabilityStatement} from "../Interfaces/emr-capability-statement";


@Injectable({
  providedIn: 'root'
})
export class AuthenticationWorkflowService {

  constructor(private emrAuthService: EmrAuthService,
              private router: Router,
              private oktaAuthService: EmrAuthService,
              private http: HttpClient) { }

  public clearLaunch() {
  }

  public isLegalLaunch(): boolean {
    console.log("______  isLegalLaunch: client_id=" +this.oktaAuthService.clientId +", launch=" +this.oktaAuthService.launchParameter +", iss=" +this.emrAuthService.issuer)
    return (this.oktaAuthService.clientId != null &&
            this.oktaAuthService.launchParameter != null &&
            this.oktaAuthService.launchBaseFhirUrl != null);
  }


  public async getFhirWellKnown(baseUrl: string) : Promise<EmrOauthEndpoints|undefined> {
    console.log("______  getFhirWellKnown: ");
    
    const httpOptions = {
      headers:  new HttpHeaders()
        .set('Content-Type', 'application/json')
    };

    let wellKnownInterfaceData : EmrWellKnown = await this.http.get(baseUrl + '.well-known/smart-configuration', httpOptions).toPromise<EmrWellKnown>();
    console.log("______  getFhirWellKnown: got well known response... ");

    if (wellKnownInterfaceData != undefined &&
        wellKnownInterfaceData.authorization_endpoint != undefined &&
        wellKnownInterfaceData.token_endpoint != undefined &&
        wellKnownInterfaceData.introspection_endpoint != undefined) 
    {
      let oauthEndpoints: EmrOauthEndpoints = new EmrOauthEndpoints();
      oauthEndpoints.authorize = wellKnownInterfaceData.authorization_endpoint;
      oauthEndpoints.token = wellKnownInterfaceData.token_endpoint;
      oauthEndpoints.introspect = wellKnownInterfaceData.introspection_endpoint;
      return oauthEndpoints;
    }
    return undefined;
  }

  public async getCapabilityStatement(baseUrl: string) : Promise<EmrOauthEndpoints | undefined> {
    const httpOptions = {
      headers:  new HttpHeaders()
        .set('Content-Type', 'application/json')
    };

    let oauthEndpoints: EmrOauthEndpoints = new EmrOauthEndpoints();
    let capabilityInterfaceData:EmrCapabilityStatement = await this.http.get(baseUrl + 'metadata', httpOptions).toPromise<EmrCapabilityStatement>();
    let authorizeEndpoint: string|undefined;
    let tokenEndpoint: string|undefined;
    let introspectEndpoint: string|undefined;
    if (capabilityInterfaceData !== undefined) {
      capabilityInterfaceData.rest?.forEach( rest => {
        if (rest.mode == 'server') {
          rest.security?.extension?.forEach(extension => {
            if (extension.url = 'http://fhir-registry.smarthealthit.org/StructureDefinition/oauth-uris') {
              extension.extension?.forEach(item => {
                if (item.url == 'authorize') {
                  authorizeEndpoint = <string> item.valueUri;
                } else if (item.url == 'token') {
                  tokenEndpoint = <string> item.valueUri;
                } else if (item.url == 'introspect') {
                  introspectEndpoint = <string> item.valueUri;
                }
              });
            }
          });
        }
      });

      if (authorizeEndpoint != undefined && tokenEndpoint != undefined && introspectEndpoint != undefined) {
        oauthEndpoints.authorize =authorizeEndpoint;
        oauthEndpoints.token = tokenEndpoint;
        oauthEndpoints.introspect = introspectEndpoint;
        return oauthEndpoints;
      }
      return undefined;
    }
    return undefined;
  }

  public isApplicationConfigured(): boolean {
    console.log("______  isApplicationConfigured : issuer=" + this.emrAuthService.issuer );
    let isAppConfigured: boolean = (this.emrAuthService.issuer != null &&
                                    this.emrAuthService.launchContextPatientId != null)
    if (isAppConfigured == false) {
      console.log('APPLICATION NOT CONFIGURED');
      console.log(' - launchContextProviderId? ' + (this.emrAuthService.issuer != null));
      console.log(' - launchContextPatientId?  ' + (this.emrAuthService.launchContextPatientId != null));
    }
    return isAppConfigured;
  }


  public async acquireEmrOAuthParameters() : Promise<EmrOAuthConfiguration> {
    if (this.isLegalLaunch() == false) {
      this.router.navigate(['/illegal-launch']);
    }

    let oauthEndpoints: EmrOauthEndpoints | undefined;
    if (this.isApplicationConfigured() == false) {
     //this.parseLaunchParameters();
     this.oktaAuthService.launchBaseFhirUrl="https://apps-health.kai-oscar.com/kaiemr/api/fhir/r4/clinic/"

      oauthEndpoints = await this.getFhirWellKnown(<string> this.oktaAuthService.launchBaseFhirUrl);
      if (oauthEndpoints === undefined) {
        oauthEndpoints = await this.getCapabilityStatement(<string> this.oktaAuthService.launchBaseFhirUrl);
      }

      if (oauthEndpoints == undefined) {
        this.router.navigate(['/illegal-launch']);
      }
    }

    var emrOauthConfig:EmrOAuthConfiguration = this.oktaAuthService.retrieveEmrOAuthParameters();
    if (oauthEndpoints !== undefined) {
      let issuerExtract:RegExpMatchArray | null = oauthEndpoints.authorize.match(this.authIssuerRegEx);
      if (issuerExtract != null) {
        emrOauthConfig.isPKCE = true;
        emrOauthConfig.clientId = <string>this.oktaAuthService.clientId;
        emrOauthConfig.issuer = issuerExtract[1];
        emrOauthConfig.redirectUrl = 'oktacallback';
        emrOauthConfig.scopes = this.emrScopes.split(',');

        this.oktaAuthService.storeEmrOAuthParameters(emrOauthConfig);
      }
    }
    console.log("___  acquireEmrOAuthParameters: emrOauthConfig.redirectUrl=" +emrOauthConfig.redirectUrl)

    return new Promise(resolve => {
      resolve(emrOauthConfig);
    });
  }


  private authIssuerRegEx = '(.*)\\/v1\\/authorize';
  private emrScopes = 'patient/Patient.read';  // comma separated list
}
