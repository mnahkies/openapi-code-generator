/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

export type t_AcrValue =
  | "phr"
  | "phrh"
  | "urn:okta:loa:1fa:any"
  | "urn:okta:loa:1fa:pwd"
  | "urn:okta:loa:2fa:any"
  | "urn:okta:loa:2fa:any:ifpossible"

export type t_AmrValue =
  | "duo"
  | "email"
  | "fed"
  | "google_otp"
  | "kba"
  | "oath_otp"
  | "okta_verify"
  | "opt"
  | "pop"
  | "pwd"
  | "rsa"
  | "sms"
  | "symantec"
  | "tel"
  | "yubikey"

export type t_ApplicationType = "browser" | "native" | "service" | "web"

export type t_BackchannelAuthorizeResponse = {
  auth_req_id?: string | undefined
  expires_in?: number | undefined
  interval?: number | undefined
}

export type t_BindingMethod = "none" | "prompt" | "transfer"

export type t_ChallengeResponse = {
  binding_code?: string | undefined
  binding_method?: t_BindingMethod | undefined
  challenge_type?: string | undefined
  channel?: t_Channel | undefined
  expires_in?: number | undefined
  interval?: number | undefined
  oob_code?: string | undefined
}

export type t_ChallengeType =
  | "http://auth0.com/oauth/grant-type/mfa-oob"
  | "http://auth0.com/oauth/grant-type/mfa-otp"

export type t_Channel = "push" | "sms" | "voice"

export type t_Claim = string

export type t_Client = {
  application_type?: t_ApplicationType | undefined
  readonly client_id?: string | undefined
  readonly client_id_issued_at?: number | undefined
  client_name: string
  readonly client_secret?: (string | null) | undefined
  readonly client_secret_expires_at?: (number | null) | undefined
  frontchannel_logout_session_required?: boolean | undefined
  frontchannel_logout_uri?: (string | null) | undefined
  grant_types?: t_GrantType[] | undefined
  initiate_login_uri?: string | undefined
  jwks?:
    | {
        keys?: t_JsonWebKey[] | undefined
      }
    | undefined
  jwks_uri?: string | undefined
  logo_uri?: (string | null) | undefined
  policy_uri?: (string | null) | undefined
  post_logout_redirect_uris?: string | undefined
  redirect_uris?: string[] | undefined
  request_object_signing_alg?: t_SigningAlgorithm[] | undefined
  response_types?: t_ResponseType[] | undefined
  token_endpoint_auth_method?: t_EndpointAuthMethod | undefined
  tos_uri?: (string | null) | undefined
}

export type t_CodeChallengeMethod = "S256"

export type t_DeviceAuthorizeResponse = {
  device_code?: string | undefined
  expires_in?: number | undefined
  interval?: number | undefined
  user_code?: string | undefined
  verification_uri?: string | undefined
  verification_uri_complete?: string | undefined
}

export type t_EndpointAuthMethod =
  | "client_secret_basic"
  | "client_secret_jwt"
  | "client_secret_post"
  | "none"
  | "private_key_jwt"

export type t_Error = {
  errorCauses?:
    | {
        errorSummary?: string | undefined
      }[]
    | undefined
  errorCode?: string | undefined
  errorId?: string | undefined
  errorLink?: string | undefined
  errorSummary?: string | undefined
}

export type t_GrantType =
  | "authorization_code"
  | "client_credentials"
  | "implicit"
  | "interaction_code"
  | "password"
  | "refresh_token"
  | "urn:ietf:params:oauth:grant-type:device_code"
  | "urn:ietf:params:oauth:grant-type:jwt-bearer"
  | "urn:ietf:params:oauth:grant-type:saml2-bearer"
  | "urn:ietf:params:oauth:grant-type:token-exchange"
  | "urn:openid:params:grant-type:ciba"
  | "urn:okta:params:oauth:grant-type:otp"
  | "urn:okta:params:oauth:grant-type:oob"
  | "http://auth0.com/oauth/grant-type/mfa-otp"
  | "http://auth0.com/oauth/grant-type/mfa-oob"

export type t_IntrospectionResponse = {
  active?: boolean | undefined
  aud?: string | undefined
  client_id?: string | undefined
  device_id?: string | undefined
  exp?: number | undefined
  iat?: number | undefined
  iss?: string | undefined
  jti?: string | undefined
  nbf?: number | undefined
  scope?: string | undefined
  sub?: string | undefined
  token_type?: string | undefined
  uid?: string | undefined
  username?: string | undefined
  [key: string]: unknown | undefined
}

export type t_JsonWebKey = {
  alg?: t_SigningAlgorithm | undefined
  kid?: string | undefined
  kty?: t_JsonWebKeyType | undefined
  status?: t_JsonWebKeyStatus | undefined
  use?: t_JsonWebKeyUse | undefined
}

export type t_JsonWebKeyStatus = "ACTIVE" | "INACTIVE"

export type t_JsonWebKeyType = "EC" | "RSA"

export type t_JsonWebKeyUse = "enc" | "sig"

export type t_OAuthError = {
  error?: string | undefined
  error_description?: string | undefined
}

export type t_OAuthKeys = {
  keys?: t_JsonWebKey[] | undefined
}

export type t_OAuthMetadata = {
  authorization_endpoint?: string | undefined
  backchannel_authentication_request_signing_alg_values_supported?:
    | t_SigningAlgorithm[]
    | undefined
  backchannel_token_delivery_modes_supported?: t_TokenDeliveryMode[] | undefined
  claims_supported?: t_Claim[] | undefined
  code_challenge_methods_supported?: t_CodeChallengeMethod[] | undefined
  device_authorization_endpoint?: string | undefined
  dpop_signing_alg_values_supported?:
    | ("ES256" | "ES384" | "ES512" | "RS256" | "RS384" | "RS512")[]
    | undefined
  end_session_endpoint?: string | undefined
  grant_types_supported?: t_GrantType[] | undefined
  introspection_endpoint?: string | undefined
  introspection_endpoint_auth_methods_supported?:
    | t_EndpointAuthMethod[]
    | undefined
  issuer?: string | undefined
  jwks_uri?: string | undefined
  pushed_authorization_request_endpoint?: string | undefined
  registration_endpoint?: string | undefined
  request_object_signing_alg_values_supported?: t_SigningAlgorithm[] | undefined
  request_parameter_supported?: boolean | undefined
  response_modes_supported?: t_ResponseMode[] | undefined
  response_types_supported?: t_ResponseTypesSupported[] | undefined
  revocation_endpoint?: string | undefined
  revocation_endpoint_auth_methods_supported?:
    | t_EndpointAuthMethod[]
    | undefined
  scopes_supported?: t_Scope[] | undefined
  subject_types_supported?: t_SubjectType[] | undefined
  token_endpoint?: string | undefined
  token_endpoint_auth_methods_supported?: t_EndpointAuthMethod[] | undefined
}

export type t_OidcMetadata = t_OAuthMetadata & {
  id_token_signing_alg_values_supported?: t_SigningAlgorithm[] | undefined
  userinfo_endpoint?: string | undefined
}

export type t_OobAuthenticateResponse = {
  binding_code?: string | undefined
  binding_method?: t_BindingMethod | undefined
  channel?: t_Channel | undefined
  expires_in?: number | undefined
  interval?: number | undefined
  oob_code?: string | undefined
}

export type t_ParResponse = {
  expires_in?: number | undefined
  request_uri?: string | undefined
}

export type t_Prompt =
  | "consent"
  | "enroll_authenticator"
  | "login"
  | "login consent"
  | "none"

export type t_ResponseMode =
  | "form_post"
  | "fragment"
  | "okta_post_message"
  | "query"

export type t_ResponseType = "code" | "id_token" | "none" | "token"

export type t_ResponseTypesSupported =
  | "code"
  | "code id_token"
  | "code id_token token"
  | "code token"
  | "id_token"
  | "id_token token"
  | "token"

export type t_Scope = string

export type t_SigningAlgorithm =
  | "ES256"
  | "ES384"
  | "ES512"
  | "HS256"
  | "HS384"
  | "HS512"
  | "RS256"
  | "RS384"
  | "RS512"

export type t_SubjectType = "pairwise" | "public"

export type t_TokenDeliveryMode = "poll"

export type t_TokenResponse = {
  access_token?: string | undefined
  device_secret?: string | undefined
  expires_in?: number | undefined
  id_token?: string | undefined
  issued_token_type?: t_TokenType | undefined
  refresh_token?: string | undefined
  scope?: string | undefined
  token_type?: t_TokenResponseTokenType | undefined
}

export type t_TokenResponseTokenType = "Bearer" | "N_A"

export type t_TokenType =
  | "urn:ietf:params:oauth:token-type:access_token"
  | "urn:ietf:params:oauth:token-type:id_token"
  | "urn:ietf:params:oauth:token-type:jwt"
  | "urn:ietf:params:oauth:token-type:refresh_token"
  | "urn:ietf:params:oauth:token-type:saml1"
  | "urn:ietf:params:oauth:token-type:saml2"
  | "urn:okta:oauth:token-type:web_sso_token"
  | "urn:x-oath:params:oauth:token-type:device-secret"

export type t_TokenTypeHintIntrospect =
  | "access_token"
  | "device_secret"
  | "id_token"
  | "refresh_token"

export type t_TokenTypeHintRevoke =
  | "access_token"
  | "device_secret"
  | "refresh_token"

export type t_UserInfo = {
  sub?: string | undefined
  [key: string]: unknown | undefined
}

export type t_sub_id = {
  format?: "opaque" | undefined
  id?: string | undefined
}

export type t_AuthorizeQuerySchema = {
  acr_values?: t_AcrValue | undefined
  client_id: string
  code_challenge?: string | undefined
  code_challenge_method?: t_CodeChallengeMethod | undefined
  display?: string | undefined
  enroll_amr_values?: t_AmrValue | undefined
  idp?: string | undefined
  idp_scope?: string | undefined
  login_hint?: string | undefined
  max_age?: number | undefined
  nonce?: string | undefined
  prompt?: t_Prompt | undefined
  redirect_uri: string
  request?: string | undefined
  request_uri?: string | undefined
  response_mode?: t_ResponseMode | undefined
  response_type: t_ResponseTypesSupported
  scope: string
  sessionToken?: string | undefined
  state: string
}

export type t_AuthorizeCustomAsParamSchema = {
  authorizationServerId: string
}

export type t_AuthorizeCustomAsQuerySchema = {
  acr_values?: t_AcrValue | undefined
  client_id: string
  code_challenge?: string | undefined
  code_challenge_method?: t_CodeChallengeMethod | undefined
  display?: string | undefined
  enroll_amr_values?: t_AmrValue | undefined
  idp?: string | undefined
  idp_scope?: string | undefined
  login_hint?: string | undefined
  max_age?: number | undefined
  nonce?: string | undefined
  prompt?: t_Prompt | undefined
  redirect_uri: string
  request?: string | undefined
  request_uri?: string | undefined
  response_mode?: t_ResponseMode | undefined
  response_type: t_ResponseTypesSupported
  scope: string
  sessionToken?: string | undefined
  state: string
}

export type t_AuthorizeCustomAsWithPostParamSchema = {
  authorizationServerId: string
}

export type t_AuthorizeCustomAsWithPostRequestBodySchema = {
  acr_values?: (t_AcrValue & string) | undefined
  client_id: string
  code_challenge?: string | undefined
  code_challenge_method?: (t_CodeChallengeMethod & string) | undefined
  display?: string | undefined
  enroll_amr_values?: (t_AmrValue & string) | undefined
  idp?: string | undefined
  idp_scope?: string | undefined
  login_hint?: string | undefined
  max_age?: number | undefined
  nonce?: string | undefined
  prompt?: (t_Prompt & string) | undefined
  redirect_uri: string
  request?: string | undefined
  request_uri?: string | undefined
  response_mode?: (t_ResponseMode & string) | undefined
  response_type: t_ResponseTypesSupported & string
  scope: string
  sessionToken?: string | undefined
  state: string
}

export type t_AuthorizeWithPostRequestBodySchema = {
  acr_values?: (t_AcrValue & string) | undefined
  client_id: string
  code_challenge?: string | undefined
  code_challenge_method?: (t_CodeChallengeMethod & string) | undefined
  display?: string | undefined
  enroll_amr_values?: (t_AmrValue & string) | undefined
  idp?: string | undefined
  idp_scope?: string | undefined
  login_hint?: string | undefined
  max_age?: number | undefined
  nonce?: string | undefined
  prompt?: (t_Prompt & string) | undefined
  redirect_uri: string
  request?: string | undefined
  request_uri?: string | undefined
  response_mode?: (t_ResponseMode & string) | undefined
  response_type: t_ResponseTypesSupported & string
  scope: string
  sessionToken?: string | undefined
  state: string
}

export type t_BcAuthorizeRequestBodySchema = {
  binding_message?: string | undefined
  id_token_hint: string
  login_hint: string
  request?: string | undefined
  request_expiry?: number | undefined
  scope: string
  [key: string]: unknown | undefined
}

export type t_BcAuthorizeCustomAsParamSchema = {
  authorizationServerId: string
}

export type t_BcAuthorizeCustomAsRequestBodySchema = {
  binding_message?: string | undefined
  id_token_hint: string
  login_hint: string
  request?: string | undefined
  request_expiry?: number | undefined
  scope: string
  [key: string]: unknown | undefined
}

export type t_ChallengeRequestBodySchema = {
  challenge_types_supported?: t_ChallengeType[] | undefined
  channel_hint?: t_Channel | undefined
  mfa_token: string
}

export type t_ChallengeCustomAsParamSchema = {
  authorizationServerId: string
}

export type t_ChallengeCustomAsRequestBodySchema = {
  challenge_types_supported?: t_ChallengeType[] | undefined
  channel_hint?: t_Channel | undefined
  mfa_token: string
}

export type t_CreateClientRequestBodySchema = {
  application_type?: t_ApplicationType | undefined
  readonly client_id?: string | undefined
  readonly client_id_issued_at?: number | undefined
  client_name: string
  readonly client_secret?: (string | null) | undefined
  readonly client_secret_expires_at?: (number | null) | undefined
  frontchannel_logout_session_required?: boolean | undefined
  frontchannel_logout_uri?: (string | null) | undefined
  grant_types?: t_GrantType[] | undefined
  initiate_login_uri?: string | undefined
  jwks?:
    | {
        keys?: t_JsonWebKey[] | undefined
      }
    | undefined
  jwks_uri?: string | undefined
  logo_uri?: (string | null) | undefined
  policy_uri?: (string | null) | undefined
  post_logout_redirect_uris?: string | undefined
  redirect_uris?: string[] | undefined
  request_object_signing_alg?: t_SigningAlgorithm[] | undefined
  response_types?: t_ResponseType[] | undefined
  token_endpoint_auth_method?: t_EndpointAuthMethod | undefined
  tos_uri?: (string | null) | undefined
}

export type t_DeleteClientParamSchema = {
  clientId: string
}

export type t_DeviceAuthorizeRequestBodySchema = {
  client_id?: string | undefined
  scope?: string | undefined
}

export type t_DeviceAuthorizeCustomAsParamSchema = {
  authorizationServerId: string
}

export type t_DeviceAuthorizeCustomAsRequestBodySchema = {
  client_id?: string | undefined
  scope?: string | undefined
}

export type t_GenerateNewClientSecretParamSchema = {
  clientId: string
}

export type t_GetClientParamSchema = {
  clientId: string
}

export type t_GetWellKnownOAuthConfigurationCustomAsParamSchema = {
  authorizationServerId: string
}

export type t_GetWellKnownOAuthConfigurationCustomAsQuerySchema = {
  client_id?: string | undefined
}

export type t_GetWellKnownOpenIdConfigurationQuerySchema = {
  client_id?: string | undefined
}

export type t_GetWellKnownOpenIdConfigurationCustomAsParamSchema = {
  authorizationServerId: string
}

export type t_GetWellKnownOpenIdConfigurationCustomAsQuerySchema = {
  client_id?: string | undefined
}

export type t_GlobalTokenRevocationRequestBodySchema = {
  sub_id?: t_sub_id | undefined
}

export type t_IntrospectRequestBodySchema = {
  token?: string | undefined
  token_type_hint?: t_TokenTypeHintIntrospect | undefined
}

export type t_IntrospectCustomAsParamSchema = {
  authorizationServerId: string
}

export type t_IntrospectCustomAsRequestBodySchema = {
  token?: string | undefined
  token_type_hint?: t_TokenTypeHintIntrospect | undefined
}

export type t_ListClientsQuerySchema = {
  after?: string | undefined
  limit?: number | undefined
  q?: string | undefined
}

export type t_LogoutQuerySchema = {
  id_token_hint: string
  post_logout_redirect_uri?: string | undefined
  state?: string | undefined
}

export type t_LogoutCustomAsParamSchema = {
  authorizationServerId: string
}

export type t_LogoutCustomAsQuerySchema = {
  id_token_hint: string
  post_logout_redirect_uri?: string | undefined
  state?: string | undefined
}

export type t_LogoutCustomAsWithPostParamSchema = {
  authorizationServerId: string
}

export type t_LogoutCustomAsWithPostRequestBodySchema = {
  id_token_hint: string
  post_logout_redirect_uri?: string | undefined
  state?: string | undefined
}

export type t_LogoutWithPostRequestBodySchema = {
  id_token_hint: string
  post_logout_redirect_uri?: string | undefined
  state?: string | undefined
}

export type t_OauthKeysQuerySchema = {
  client_id?: string | undefined
}

export type t_OauthKeysCustomAsParamSchema = {
  authorizationServerId: string
}

export type t_OobAuthenticateRequestBodySchema = {
  channel_hint: t_Channel
  login_hint: string
}

export type t_OobAuthenticateCustomAsParamSchema = {
  authorizationServerId: string
}

export type t_OobAuthenticateCustomAsRequestBodySchema = {
  channel_hint: t_Channel
  login_hint: string
}

export type t_ParRequestBodySchema = {
  client_id?: string | undefined
  code_challenge?: string | undefined
  code_challenge_method?: string | undefined
  display?: string | undefined
  idp?: string | undefined
  idp_scope?: string | undefined
  login_hint?: string | undefined
  max_age?: number | undefined
  nonce?: string | undefined
  prompt?: string | undefined
  redirect_uri?: string | undefined
  request?: string | undefined
  response_mode?: string | undefined
  response_type?: string | undefined
  scope?: string | undefined
  sessionToken?: string | undefined
  state?: string | undefined
}

export type t_ParCustomAsParamSchema = {
  authorizationServerId: string
}

export type t_ParCustomAsRequestBodySchema = {
  client_id?: string | undefined
  code_challenge?: string | undefined
  code_challenge_method?: string | undefined
  display?: string | undefined
  idp?: string | undefined
  idp_scope?: string | undefined
  login_hint?: string | undefined
  max_age?: number | undefined
  nonce?: string | undefined
  prompt?: string | undefined
  redirect_uri?: string | undefined
  request?: string | undefined
  response_mode?: string | undefined
  response_type?: string | undefined
  scope?: string | undefined
  sessionToken?: string | undefined
  state?: string | undefined
}

export type t_ParOptionsRequestHeaderSchema = {
  origin?: string | undefined
}

export type t_ParOptionsCustomAsParamSchema = {
  authorizationServerId: string
}

export type t_ParOptionsCustomAsRequestHeaderSchema = {
  origin?: string | undefined
}

export type t_ReplaceClientParamSchema = {
  clientId: string
}

export type t_ReplaceClientRequestBodySchema = {
  application_type?: t_ApplicationType | undefined
  readonly client_id?: string | undefined
  readonly client_id_issued_at?: number | undefined
  client_name: string
  readonly client_secret?: (string | null) | undefined
  readonly client_secret_expires_at?: (number | null) | undefined
  frontchannel_logout_session_required?: boolean | undefined
  frontchannel_logout_uri?: (string | null) | undefined
  grant_types?: t_GrantType[] | undefined
  initiate_login_uri?: string | undefined
  jwks?:
    | {
        keys?: t_JsonWebKey[] | undefined
      }
    | undefined
  jwks_uri?: string | undefined
  logo_uri?: (string | null) | undefined
  policy_uri?: (string | null) | undefined
  post_logout_redirect_uris?: string | undefined
  redirect_uris?: string[] | undefined
  request_object_signing_alg?: t_SigningAlgorithm[] | undefined
  response_types?: t_ResponseType[] | undefined
  token_endpoint_auth_method?: t_EndpointAuthMethod | undefined
  tos_uri?: (string | null) | undefined
}

export type t_RevokeRequestBodySchema = {
  token: string
  token_type_hint?: t_TokenTypeHintRevoke | undefined
}

export type t_RevokeCustomAsParamSchema = {
  authorizationServerId: string
}

export type t_RevokeCustomAsRequestBodySchema = {
  token: string
  token_type_hint?: t_TokenTypeHintRevoke | undefined
}

export type t_TokenRequestBodySchema = {
  grant_type?: t_GrantType | undefined
}

export type t_TokenCustomAsParamSchema = {
  authorizationServerId: string
}

export type t_TokenCustomAsRequestBodySchema = {
  grant_type?: t_GrantType | undefined
}

export type t_TokenOptionsRequestHeaderSchema = {
  origin?: string | undefined
}

export type t_TokenOptionsCustomAsParamSchema = {
  authorizationServerId: string
}

export type t_TokenOptionsCustomAsRequestHeaderSchema = {
  origin?: string | undefined
}

export type t_UserinfoCustomAsParamSchema = {
  authorizationServerId: string
}
