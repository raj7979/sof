


# Create new SMART on FHIR App in Okta

## Overview

Each SMART App will ideally be associated with a separate Okta "app" (aka client).
There are a couple of reasons for this:
 1. User access control to applications is determined by assigning users to Okta app


## Provisioning

### Create a PKCE app for the SMART App
 The following JSON body will create a PKCE app.  The relevant attributes for PKCE is "            "application_type": "browser"
 ".   Also notice it specifies "code" for response_types and does not allow implicit grant_type.
```shell
{
    "name": "oidc_client",
    "label": "SMART App Client PKCE - API 2",
    "signOnMode": "OPENID_CONNECT",
    "credentials": {
      "oauthClient": {
        "token_endpoint_auth_method": "client_secret_post"
      }
    },
    "profile": {
        "label": "Sample Client"
    },
    "settings": {
        "oauthClient": {
            "client_uri": "https://www.cambian.com",
            "logo_uri": "https://www.cambian.com/wp-content/uploads/2020/11/Cambian-Logo.png",
            "redirect_uris": [
                "http://localhost:4200/oktacallback",
                "http://localhost:4200/landing",
                "http://localhost:4200/"
            ],
            "post_logout_redirect_uris": [
                "http://localhost:4200/"
            ],
            "response_types": [
                "code"
            ],
            "grant_types": [
                "authorization_code",
                "refresh_token"
            ],
            "application_type": "browser"
        }
    }
}
```

### Assign user to app
- get users from OSCAR App list of users
    ```shell
    {{oktaurl}}/api/v1/apps/{{appId}}/users
    ```
- assign user to app using the Okta API. 
    ``` shell
    POST {{oktaurl}}/api/v1/apps/0oa20h4f9uWtsD7ZJ1d7/users
    {
        "id": "00u20diekimgcYGVh1d7",
        "scope": "USER",
        "credentials": {
        "userName": "user#$#$SUFFIX#$#$0oa20cp9dkJrXOxfF1d7"
    }
    ```


### Assign app (client) to authz server, 
This is provisioned by updating the policies for the authorization server

#### To provision using the API:

1. The policies for the Authz server can be found with the following API request. 
   These policies are not the same as the policies in /api/v1/policies API, so
   the policyId does not map between endpoints.
   
   The conditions.clients
    ```shell
    {{oktaurl}}/api/v1/authorizationServers/{{authorizationServerId}}/policies
    [
        {
            "id": "00p18q8s6d0p30Voj1d7",
            "status": "ACTIVE",
            "name": "OSCAR-CUSTOM-AS Policy",
            "description": "Policy for OSCAR Custom AS",
            "priority": 1,
            "system": false,
            "conditions": {
                "clients": {
                    "include": [
                        "0oa18qgfys4YKWypy1d7",
                        "0oa1d0ok7uN0kJwcM1d7",
                        "0oa1d0uq4vZ9PdLGE1d7"
                    ]
                }
            },
            "created": "2021-08-25T12:53:49.000Z",
            "lastUpdated": "2021-10-06T14:14:09.000Z",
            "_links": {
                "self": {
                    "href": "https://wellhealth.oktapreview.com/api/v1/authorizationServers/aus18qevhpT8rtoR91d7/policies/00p18q8s6d0p30Voj1d7",
                    "hints": {
                        "allow": [
                            "GET",
                            "PUT",
                            "DELETE"
                        ]
                    }
                },
                "rules": {
                    "href": "https://wellhealth.oktapreview.com/api/v1/authorizationServers/aus18qevhpT8rtoR91d7/policies/00p18q8s6d0p30Voj1d7/rules",
                    "hints": {
                        "allow": [
                            "GET"
                        ]
                    }
                },
                "deactivate": {
                    "href": "https://wellhealth.oktapreview.com/api/v1/authorizationServers/aus18qevhpT8rtoR91d7/policies/00p18q8s6d0p30Voj1d7/lifecycle/deactivate",
                    "hints": {
                        "allow": [
                            "POST"
                        ]
                    }
                }
            },
            "type": "OAUTH_AUTHORIZATION_POLICY"
        }
    ]
    ```
2. To add an SMART App to the Authz server, update the conditions.clients.include to
   include the SMART App's clientId (from the Okta app configured above).  
   This clientId needs to be appended to the list of other existing clientIds.

```shell
{{oktaurl}}/api/v1/authorizationServers/{{authorizationServerId}}/policies/{{policyId}}
https://my.oktapreview.com/api/v1/authorizationServers/aus20cwkcr7GDSFDS1d7/policies/00p20crgo7qRuZy6H1d7
{
    "id": "00p20crgo7qRuZy6H1d7",
    "name": "OSCAR-CUSTOM-AS Policy",
    "description": "Policy for OSCAR Custom AS",
    "priority": 1,
    "system": false,
    "conditions": {
        "clients": {
            "include": [
                "0oa20cp9dkJrXOxfF1d7",
                "0oa20h4f9uWtsD7ZJ1d7"
            ]
        }
    },
    "type": "OAUTH_AUTHORIZATION_POLICY"
}
```

#### To manually provision using Okta Admin site

the following link can be used for authz with id=aus20cwkcr7GDSFDS1d7

    https://wellhealth-admin.oktapreview.com/admin/oauth2/as/aus20cwkcr7GDSFDS1d7#policies

Or the API can be used 

### Use the clientId for SMART App in the launch request:



## Notes

### Dynamic Client Registration
Dynamic Client Registration is suggested as a good option for creating clients.  THe following 
docs from Okta may be helpful.

https://developer.okta.com/docs/reference/api/oauth-clients/#client-application-operations

The Dynamic Client Registration API provides operations to register and manage client Applications for use with Okta's OAuth 2.0 and OpenID Connect endpoints. This API largely follows the contract defined in RFC7591: OAuth 2.0 Dynamic Client Registration Protocol (opens new window)and OpenID Connect Dynamic Client Registration 1.0 (opens new window).
