import {FhirExtension} from "./fhir-extension";

export interface EmrCapabilityStatement {
   resourceType?: string;
  id?: string;
  status?: string;
  rest?: [
    {
      mode?: string;
      security?: {
        cors?: boolean;
        extension?: FhirExtension[];
      }
    }
  ]
}
