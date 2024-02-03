import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import admin from 'firebase-admin'

export default class FirebaseAuth {
  public async handle({ request, response }: HttpContextContract, next: () => Promise<void>) {
    const token = request.header('Authorization')

    if (!token) {
      return response.unauthorized({ error: 'No token provided' })
    }

    if (!token.startsWith('Bearer ')) {
      return response.unauthorized({ error: 'Invalid token' })
    }

    try {
      const decodedToken = await admin.auth().verifyIdToken(token.split(' ')[1])

      if (!decodedToken) {
        return response.unauthorized({ error: 'Invalid token' })
      }

      request.token = decodedToken
      await next()
    } catch (error) {
      return response.unauthorized({ error: 'Invalid credentials', message: error })
    }
  }
}
