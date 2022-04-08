import {Component, OnInit} from '@angular/core';
import {EmrAuthService} from "../../SmartLaunch/Services/emr-auth.service";
import {JWT} from "../../SmartLaunch/Interfaces/jwt";

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent implements OnInit {

  token?: string = 'Undefined';
  tokenHeader?: string = 'Undefined';
  tokenPayload?: string = 'Undefined';
  tokenSignature?: string = 'Undefined';
  tokenJsonPayload?: string = "{}"
  decodedTokenPayload?: string = "";
  tokenObject?: Object;
  jwt?: JWT;

  context?: string = "";
  baseFhir?: string = "";

  constructor(private emrAuth: EmrAuthService) { }

  ngOnInit(): void {
    if (this.token != undefined) {
      this.token = this.emrAuth.oktaAuth.getAccessToken();
      let tokenElements = this.token?.split('.');
      // @ts-ignore
      this.tokenHeader = tokenElements[0];
      // @ts-ignore
      this.tokenPayload = tokenElements[1];
      // @ts-ignore
      this.tokenSignature = tokenElements[2];
    }

    this.decodedTokenPayload = atob(<string> this.tokenPayload);
    this.tokenJsonPayload = JSON.stringify(this.decodedTokenPayload, null, 2);
    this.tokenObject = JSON.parse(this.decodedTokenPayload);
    // @ts-ignore
    this.baseFhir = this.emrAuth.launchBaseFhirUrl;
    // @ts-ignore
    this.context = JSON.stringify(this.tokenObject.context);

    this.jwt = <JWT> JSON.parse(this.decodedTokenPayload);
  }
}
