import firestore from '../config/firebase_database'
import { Timestamp } from 'firebase-admin/firestore'

class SwipeService {
  private static instance: SwipeService

  public static getInstance(): SwipeService {
    if (!SwipeService.instance) {
      SwipeService.instance = new SwipeService()
    }

    return SwipeService.instance
  }

  public async checkSwipes() {
    try {
      const usersRef = firestore.collection('users')
      const now = Timestamp.now()
      // TODO: Change this to 24 hours
      let time = now.toMillis() - 5 * 60 * 1000

      const snapshot = await usersRef.where('lastSwipe', '<', new Date(time)).get()

      if (snapshot.empty) {
        console.log('No users with swipes under 20 found.')
        return
      }

      const batch = firestore.batch()

      snapshot.forEach((doc) => {
        console.log(`User ${doc.id} has swipes under 20.`)

        const userRef = usersRef.doc(doc.id)
        batch.update(userRef, { swipes: 20, lastSwipe: null })
      })

      await batch.commit()
      console.log('Swipes updated successfully.')
    } catch (error) {
      console.error('Error checking swipes: ', error)
    }
  }
}

export default SwipeService
