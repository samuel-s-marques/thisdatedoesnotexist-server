import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier'

declare module '@ioc:Adonis/Core/Request' {
  interface RequestContract {
    token: DecodedIdToken
  }
}
