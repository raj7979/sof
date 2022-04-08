import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AuthenticationWorkflowService} from "../../Services/authentication-workflow.service";
import {EmrAuthService} from "../../Services/emr-auth.service";

@Component({
  selector: 'app-launch',
  templateUrl: './launch.component.html',
  styleUrls: ['./launch.component.css']
})
export class LaunchComponent implements OnInit {

  constructor(private router: Router,
              private route: ActivatedRoute,
              private oktaAuthService: EmrAuthService,
              private authenticationWorkflowService: AuthenticationWorkflowService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.oktaAuthService.launchUrl = window.location.href;
      this.oktaAuthService.launchBaseFhirUrl = params['iss'];
      this.oktaAuthService.launchParameter = params['launch'];

      console.log('___ Launch URL   : ' + this.oktaAuthService.launchUrl);
      console.log('___ FHIR Base URL: ' + this.oktaAuthService.launchBaseFhirUrl);
      console.log('___ Launch       : ' + this.oktaAuthService.launchParameter);
    });

    this.route.url.subscribe(segment => {
      this.oktaAuthService.clientId = segment[1].toString();
    });

    // Validate that the parameters necessary to launch are present
    if (this.validateSmartOnFhirLaunch(window.location.href) == false) {
      this.router.navigate(['/invalid-launch']);
    }

    if (this.authenticationWorkflowService.isLegalLaunch()) {
      this.router.navigate(['/hypertension']);

    } else {
      this.router.navigate(['/illegal-launch']);
    }
  }

  //
  // Private Methods
  //


  // Check the query parameters to check if both the 'iss' and the 'launch' parameters are present
  private validateSmartOnFhirLaunch(launchUrl: string): boolean {
    let isIssPresent: boolean = false;
    let isLaunchPresent: boolean = false;
    let urlComponent: string[] = launchUrl.split('?');
    if (urlComponent.length == 2) {
      let parameterList: string[] = urlComponent[1].split('&');
      if (parameterList.length > 1) {
        parameterList.forEach(item => {
          let parameter = item.split('=');
          if (parameter[0] == 'launch') {
            isLaunchPresent = true;
          }
          if (parameter[0] == 'iss') {
            isIssPresent = true;
          }
        });
      }
    }

    return isIssPresent && isLaunchPresent;
  }
}
