{{/*
Return the secret containing the Keycloak client secret
*/}}
{{- define "ui.keycloak.secretName" -}}
{{- $secretName := .Values.idp.existingSecret -}}
{{- if and $secretName ( not .Values.idp.debug ) -}}
    {{- printf "%s" (tpl $secretName $) -}}
{{- else -}}
    {{- printf "%s-node-ui-keycloak-secret" .Release.Name -}}
{{- end -}}
{{- end -}}

{{/*
Return the secret key that contains the Keycloak client secret
*/}}
{{- define "ui.keycloak.secretKey" -}}
{{- $secretName := .Values.idp.existingSecret -}}
{{- if .Values.idp.debug -}}
    {{- print "nodeUiClientSecret" -}}
{{- else if and $secretName .Values.idp.existingSecretKey -}}
    {{- printf "%s" .Values.idp.existingSecretKey -}}
{{- else -}}
    {{- print "nodeUiClientSecret" -}}
{{- end -}}
{{- end -}}

{{/*
Generate a random clientSecret value for the node-ui client in keycloak if none provided
*/}}
{{- define "ui.keycloak.clientSecret" -}}
{{- if .Values.idp.debug -}}
    {{- print "UU4ySGVPMkxlWE1ZMTBWclA0Y2YyeDVKSFRGSW5tNGY=" -}}
{{- else -}}
{{/*    {{- print ( randAlphaNum 22 | b64enc | quote ) -}}*/}}
    {{- /* Create "node_ui_secret" dict inside ".Release" to store various stuff. */ -}}
    {{- if not (index .Release "node_ui_secret") -}}
        {{-   $_ := set .Release "node_ui_secret" dict -}}
    {{- end -}}
    {{- /* Some random ID of this password, in case there will be other random values alongside this instance. */ -}}
    {{- $key := printf "%s_%s" .Release.Name "password" -}}
    {{- /* If $key does not yet exist in .Release.node_ui_secret, then... */ -}}
    {{- if not (index .Release.node_ui_secret $key) -}}
        {{- /* ... store random password under the $key */ -}}
        {{-   $_ := set .Release.node_ui_secret $key (randAlphaNum 32) -}}
    {{- end -}}
        {{- /* Retrieve previously generated value. */ -}}
        {{- print (index .Release.node_ui_secret $key | b64enc) -}}
{{- end -}}
{{- end -}}

{{/*
Return the Keycloak endpoint
*/}}
{{- define "ui.keycloak.endpoint" -}}
{{- if .Values.idp.host -}}
    {{- .Values.idp.host -}}
{{- else -}}
    {{- printf "http://%s-keycloak-headless:8080" .Release.Name -}}
{{- end -}}
{{- end -}}
