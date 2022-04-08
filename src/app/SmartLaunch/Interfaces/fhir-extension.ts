export interface FhirExtension {
  url?: string;
  extension?: [
    {
      url?: string;
      valueUri?: string;
    }
  ]
}
