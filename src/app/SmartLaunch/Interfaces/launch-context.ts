/*
The following interface provides attribute for attributes typically expected for SMART on FHIR launches,
as well as optional and experimental parameters.  More information can be found:
1) Launch Context Parameters: http://www.hl7.org/fhir/smart-app-launch/scopes-and-launch-context/#launch-context-arrives-with-your-access_token
2) Optional Context Parameters: http://www.hl7.org/fhir/smart-app-launch/scopes-and-launch-context/#notes-on-launch-context-parameters
3) Experimental Context Parameters: http://www.hl7.org/fhir/smart-app-launch/scopes-and-launch-context/#styling

Parameters:

issuer: (additional)
        Added to context parameter to help with uniquely identifying the other context parameters.  The issuer is not
        considered to be part of the launch context, though it is available in the minted JWT token.  Added for
        convenience purposes

patient:
        String value with a patient id, indicating that the app was launched in the context of FHIR Patient 123.
        If the app has any patient-level scopes, they will be scoped to Patient 123.

encounter:
        String value with an encounter id, indicating that the app was launched in the context of FHIR Encounter 123.

practitioner:
        String value with a practitioner id, indicating that the app was launched in context from a patient view.

need_patient_banner:
        Boolean value indicating whether the app was launched in a UX context where a patient banner is
        required (when true) or not required (when false). An app receiving a value of false should not take up screen
        real estate displaying a patient banner.

intent: (optional)
        String value describing the intent of the application launch.  Some example intents that the app could respond
        to are included in the docuentation, such as :
              summary-timeline-view - A default UI context, showing a data summary
              recent-history-timeline - A history display, showing a list of entries
              encounter-focused-timeline - A timeline focused on the currently in-context encounter

color_background: (experimental)
	The color used as the background of the app.

color_error: (experimental)
		The color used when UI elements need to indicate an area or item of concern or dangerous action, such as a button
		to be used to delete an item, or a display an error message.

color_highlight: (experimental)
		The color used when UI elements need to indicate an area or item of focus, such as a button used to submit a form,
		or a loading indicator.

color_modal_backdrop: (experimental)
		The color used when displaying a backdrop behind a modal dialog or window.

color_success: (experimental)
		The color used when UI elements need to indicate a positive outcome, such as a notice that an action was completed
		successfully.

color_text: (experimental)
		The color used for body text in the app.

dim_border_radius: (experimental)
		The base corner radius used for UI element borders (0px results in square corners).

dim_font_size: (experimental)
		The base size of body text displayed in the app.

dim_spacing_size: (experimental)
		The base dimension used to space UI elements.

font_family_body: (experimental)
		The list of typefaces to use for body text and elements.

font_family_heading: (experimental)
		The list of typefaces to use for content heading text and elements.
 */

export interface LaunchContext {
  // enriched
  issuer?: string;
  baseFhirUrl?: string;

  // expected parameters according to SoF spec
  patient?: string;
  encounter?: string;
  practitioner?: string;
  need_patient_banner?: string;
  intent?: string;
  fhirContext?: string;

  // optional - these are examples
  summaryTimelineView?: string;
  recentHistoryTimeline?: string;
  encounterFocusedTimeline?: string;

  // experimental
  smart_style_url?: string;
  color_background?: string;
  color_error?: string;
  color_highlight?: string;
  color_modal_backdrop?: string;
  color_success?: string;
  color_text?: string;
  dim_border_radius?: string;
  dim_font_size?: string;
  dim_spacing_size?: string;
  font_family_body?: string;
  font_family_heading?: string;
}

// list of expected parameters according to SoF spec
export const context_props = [ 
        'patient',
        'encounter',
        'practitioner',
        'need_patient_banner',
        'intent',
        'fhirContext'
]
