/** AUTOGENERATED - DO NOT EDIT **/
/* tslint:disable */
/* eslint-disable */

import {z} from "zod"

export const PermissiveBoolean = z.preprocess((value) => {
  if (typeof value === "string" && (value === "true" || value === "false")) {
    return value === "true"
  } else if (typeof value === "number" && (value === 1 || value === 0)) {
    return value === 1
  }
  return value
}, z.boolean())

export const s_AcrValue = z.enum([
  "phr",
  "phrh",
  "urn:okta:loa:1fa:any",
  "urn:okta:loa:1fa:pwd",
  "urn:okta:loa:2fa:any",
  "urn:okta:loa:2fa:any:ifpossible",
])

export const s_AmrValue = z.enum([
  "duo",
  "email",
  "fed",
  "google_otp",
  "kba",
  "oath_otp",
  "okta_verify",
  "opt",
  "pop",
  "pwd",
  "rsa",
  "sms",
  "symantec",
  "tel",
  "yubikey",
])

export const s_ApplicationType = z.enum(["browser", "native", "service", "web"])

export const s_BackchannelAuthorizeRequest = z.intersection(
  z.object({
    binding_message: z.string().optional(),
    id_token_hint: z.string(),
    login_hint: z.string(),
    request: z.string().optional(),
    request_expiry: z.coerce.number().min(1).max(300).optional(),
    scope: z.string(),
  }),
  z.record(z.unknown()),
)

export const s_BackchannelAuthorizeResponse = z.object({
  auth_req_id: z.string().optional(),
  expires_in: z.coerce.number().min(1).max(300).optional(),
  interval: z.coerce.number().optional(),
})

export const s_BindingMethod = z.enum(["none", "prompt", "transfer"])

export const s_ChallengeType = z.enum([
  "http://auth0.com/oauth/grant-type/mfa-oob",
  "http://auth0.com/oauth/grant-type/mfa-otp",
])

export const s_Channel = z.enum(["push", "sms", "voice"])

export const s_Claim = z.string()

export const s_CodeChallengeMethod = z.enum(["S256"])

export const s_DeviceAuthorizeRequest = z.object({
  client_id: z.string().optional(),
  scope: z.string().optional(),
})

export const s_DeviceAuthorizeResponse = z.object({
  device_code: z.string().optional(),
  expires_in: z.coerce.number().optional(),
  interval: z.coerce.number().optional(),
  user_code: z.string().optional(),
  verification_uri: z.string().optional(),
  verification_uri_complete: z.string().optional(),
})

export const s_EndpointAuthMethod = z.enum([
  "client_secret_basic",
  "client_secret_jwt",
  "client_secret_post",
  "none",
  "private_key_jwt",
])

export const s_Error = z.object({
  errorCauses: z
    .array(z.object({errorSummary: z.string().optional()}))
    .optional(),
  errorCode: z.string().optional(),
  errorId: z.string().optional(),
  errorLink: z.string().optional(),
  errorSummary: z.string().optional(),
})

export const s_GrantType = z.enum([
  "authorization_code",
  "client_credentials",
  "implicit",
  "interaction_code",
  "password",
  "refresh_token",
  "urn:ietf:params:oauth:grant-type:device_code",
  "urn:ietf:params:oauth:grant-type:jwt-bearer",
  "urn:ietf:params:oauth:grant-type:saml2-bearer",
  "urn:ietf:params:oauth:grant-type:token-exchange",
  "urn:openid:params:grant-type:ciba",
  "urn:okta:params:oauth:grant-type:otp",
  "urn:okta:params:oauth:grant-type:oob",
  "http://auth0.com/oauth/grant-type/mfa-otp",
  "http://auth0.com/oauth/grant-type/mfa-oob",
])

export const s_IntrospectionResponse = z.intersection(
  z.object({
    active: PermissiveBoolean.optional(),
    aud: z.string().optional(),
    client_id: z.string().optional(),
    device_id: z.string().optional(),
    exp: z.coerce.number().optional(),
    iat: z.coerce.number().optional(),
    iss: z.string().optional(),
    jti: z.string().optional(),
    nbf: z.coerce.number().optional(),
    scope: z.string().optional(),
    sub: z.string().optional(),
    token_type: z.string().optional(),
    uid: z.string().optional(),
    username: z.string().optional(),
  }),
  z.record(z.unknown()),
)

export const s_JsonWebKeyStatus = z.enum(["ACTIVE", "INACTIVE"])

export const s_JsonWebKeyType = z.enum(["EC", "RSA"])

export const s_JsonWebKeyUse = z.enum(["enc", "sig"])

export const s_LogoutWithPost = z.object({
  id_token_hint: z.string(),
  post_logout_redirect_uri: z.string().optional(),
  state: z.string().optional(),
})

export const s_OAuthError = z.object({
  error: z.string().optional(),
  error_description: z.string().optional(),
})

export const s_ParRequest = z.object({
  client_id: z.string().optional(),
  code_challenge: z.string().optional(),
  code_challenge_method: z.string().optional(),
  display: z.string().optional(),
  idp: z.string().optional(),
  idp_scope: z.string().optional(),
  login_hint: z.string().optional(),
  max_age: z.coerce.number().optional(),
  nonce: z.string().optional(),
  prompt: z.string().optional(),
  redirect_uri: z.string().optional(),
  request: z.string().optional(),
  response_mode: z.string().optional(),
  response_type: z.string().optional(),
  scope: z.string().optional(),
  sessionToken: z.string().optional(),
  state: z.string().optional(),
})

export const s_ParResponse = z.object({
  expires_in: z.coerce.number().optional(),
  request_uri: z.string().optional(),
})

export const s_Prompt = z.enum([
  "consent",
  "enroll_authenticator",
  "login",
  "login consent",
  "none",
])

export const s_ResponseMode = z.enum([
  "form_post",
  "fragment",
  "okta_post_message",
  "query",
])

export const s_ResponseType = z.enum(["code", "id_token", "none", "token"])

export const s_ResponseTypesSupported = z.enum([
  "code",
  "code id_token",
  "code id_token token",
  "code token",
  "id_token",
  "id_token token",
  "token",
])

export const s_Scope = z.string()

export const s_SigningAlgorithm = z.enum([
  "ES256",
  "ES384",
  "ES512",
  "HS256",
  "HS384",
  "HS512",
  "RS256",
  "RS384",
  "RS512",
])

export const s_SubjectType = z.enum(["pairwise", "public"])

export const s_TokenDeliveryMode = z.enum(["poll"])

export const s_TokenResponseTokenType = z.enum(["Bearer", "N_A"])

export const s_TokenType = z.enum([
  "urn:ietf:params:oauth:token-type:access_token",
  "urn:ietf:params:oauth:token-type:id_token",
  "urn:ietf:params:oauth:token-type:jwt",
  "urn:ietf:params:oauth:token-type:refresh_token",
  "urn:ietf:params:oauth:token-type:saml1",
  "urn:ietf:params:oauth:token-type:saml2",
  "urn:okta:oauth:token-type:web_sso_token",
  "urn:x-oath:params:oauth:token-type:device-secret",
])

export const s_TokenTypeHintIntrospect = z.enum([
  "access_token",
  "device_secret",
  "id_token",
  "refresh_token",
])

export const s_TokenTypeHintRevoke = z.enum([
  "access_token",
  "device_secret",
  "refresh_token",
])

export const s_UserInfo = z.intersection(
  z.object({sub: z.string().optional()}),
  z.record(z.unknown()),
)

export const s_sub_id = z.object({
  format: z.enum(["opaque"]).optional(),
  id: z.string().optional(),
})

export const s_AuthorizeWithPost = z.object({
  acr_values: z.intersection(s_AcrValue, z.string()).optional(),
  client_id: z.string(),
  code_challenge: z.string().optional(),
  code_challenge_method: z
    .intersection(s_CodeChallengeMethod, z.string())
    .optional(),
  display: z.string().optional(),
  enroll_amr_values: z.intersection(s_AmrValue, z.string()).optional(),
  idp: z.string().optional(),
  idp_scope: z.string().optional(),
  login_hint: z.string().optional(),
  max_age: z.coerce.number().optional(),
  nonce: z.string().optional(),
  prompt: z.intersection(s_Prompt, z.string()).optional(),
  redirect_uri: z.string(),
  request: z.string().optional(),
  request_uri: z.string().optional(),
  response_mode: z.intersection(s_ResponseMode, z.string()).optional(),
  response_type: z.intersection(s_ResponseTypesSupported, z.string()),
  scope: z.string(),
  sessionToken: z.string().optional(),
  state: z.string(),
})

export const s_ChallengeRequest = z.object({
  challenge_types_supported: z.array(s_ChallengeType).optional(),
  channel_hint: s_Channel.optional(),
  mfa_token: z.string(),
})

export const s_ChallengeResponse = z.object({
  binding_code: z.string().optional(),
  binding_method: s_BindingMethod.optional(),
  challenge_type: z.string().optional(),
  channel: s_Channel.optional(),
  expires_in: z.coerce.number().optional(),
  interval: z.coerce.number().optional(),
  oob_code: z.string().optional(),
})

export const s_GlobalTokenRevocationRequest = z.object({
  sub_id: s_sub_id.optional(),
})

export const s_IntrospectionRequest = z.object({
  token: z.string().optional(),
  token_type_hint: s_TokenTypeHintIntrospect.optional(),
})

export const s_JsonWebKey = z.object({
  alg: s_SigningAlgorithm.optional(),
  kid: z.string().optional(),
  kty: s_JsonWebKeyType.optional(),
  status: s_JsonWebKeyStatus.optional(),
  use: s_JsonWebKeyUse.optional(),
})

export const s_OAuthMetadata = z.object({
  authorization_endpoint: z.string().optional(),
  backchannel_authentication_request_signing_alg_values_supported: z
    .array(s_SigningAlgorithm)
    .optional(),
  backchannel_token_delivery_modes_supported: z
    .array(s_TokenDeliveryMode)
    .optional(),
  claims_supported: z.array(s_Claim).optional(),
  code_challenge_methods_supported: z.array(s_CodeChallengeMethod).optional(),
  device_authorization_endpoint: z.string().optional(),
  dpop_signing_alg_values_supported: z
    .array(z.enum(["ES256", "ES384", "ES512", "RS256", "RS384", "RS512"]))
    .optional(),
  end_session_endpoint: z.string().optional(),
  grant_types_supported: z.array(s_GrantType).optional(),
  introspection_endpoint: z.string().optional(),
  introspection_endpoint_auth_methods_supported: z
    .array(s_EndpointAuthMethod)
    .optional(),
  issuer: z.string().optional(),
  jwks_uri: z.string().optional(),
  pushed_authorization_request_endpoint: z.string().optional(),
  registration_endpoint: z.string().optional(),
  request_object_signing_alg_values_supported: z
    .array(s_SigningAlgorithm)
    .optional(),
  request_parameter_supported: PermissiveBoolean.optional(),
  response_modes_supported: z.array(s_ResponseMode).optional(),
  response_types_supported: z.array(s_ResponseTypesSupported).optional(),
  revocation_endpoint: z.string().optional(),
  revocation_endpoint_auth_methods_supported: z
    .array(s_EndpointAuthMethod)
    .optional(),
  scopes_supported: z.array(s_Scope).optional(),
  subject_types_supported: z.array(s_SubjectType).optional(),
  token_endpoint: z.string().optional(),
  token_endpoint_auth_methods_supported: z
    .array(s_EndpointAuthMethod)
    .optional(),
})

export const s_OobAuthenticateRequest = z.object({
  channel_hint: s_Channel,
  login_hint: z.string(),
})

export const s_OobAuthenticateResponse = z.object({
  binding_code: z.string().optional(),
  binding_method: s_BindingMethod.optional(),
  channel: s_Channel.optional(),
  expires_in: z.coerce.number().optional(),
  interval: z.coerce.number().optional(),
  oob_code: z.string().optional(),
})

export const s_RevokeRequest = z.object({
  token: z.string(),
  token_type_hint: s_TokenTypeHintRevoke.optional(),
})

export const s_TokenRequest = z.object({grant_type: s_GrantType.optional()})

export const s_TokenResponse = z.object({
  access_token: z.string().optional(),
  device_secret: z.string().optional(),
  expires_in: z.coerce.number().optional(),
  id_token: z.string().optional(),
  issued_token_type: s_TokenType.optional(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
  token_type: s_TokenResponseTokenType.optional(),
})

export const s_Client = z.object({
  application_type: s_ApplicationType.optional(),
  client_id: z.string().optional(),
  client_id_issued_at: z.coerce.number().optional(),
  client_name: z.string(),
  client_secret: z.string().nullable().optional(),
  client_secret_expires_at: z.coerce.number().min(0).nullable().optional(),
  frontchannel_logout_session_required: PermissiveBoolean.optional(),
  frontchannel_logout_uri: z.string().nullable().optional(),
  grant_types: z.array(s_GrantType).optional(),
  initiate_login_uri: z.string().optional(),
  jwks: z.object({keys: z.array(s_JsonWebKey).optional()}).optional(),
  jwks_uri: z.string().optional(),
  logo_uri: z.string().nullable().optional(),
  policy_uri: z.string().nullable().optional(),
  post_logout_redirect_uris: z.string().optional(),
  redirect_uris: z.array(z.string()).optional(),
  request_object_signing_alg: z.array(s_SigningAlgorithm).optional(),
  response_types: z.array(s_ResponseType).optional(),
  token_endpoint_auth_method: s_EndpointAuthMethod.optional(),
  tos_uri: z.string().nullable().optional(),
})

export const s_OAuthKeys = z.object({keys: z.array(s_JsonWebKey).optional()})

export const s_OidcMetadata = s_OAuthMetadata.merge(
  z.object({
    id_token_signing_alg_values_supported: z
      .array(s_SigningAlgorithm)
      .optional(),
    userinfo_endpoint: z.string().optional(),
  }),
)
