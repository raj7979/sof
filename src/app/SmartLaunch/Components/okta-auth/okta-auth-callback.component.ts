import {Component, OnInit} from '@angular/core';
import {EmrAuthService} from '../../Services/emr-auth.service';
import {ActivatedRoute} from '@angular/router';

@Component({ template: `` })
export class OktaAuthCallbackComponent implements OnInit {

  constructor(private okta: EmrAuthService, private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    // Handles the response from Okta and parses tokens
    console.log("____  ")
    this.okta.handleAuthentication();
  }
}
