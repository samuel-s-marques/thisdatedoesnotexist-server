import { CronJob } from "cron";
import firestore from "../config/firestore.config";

class SwipeService {
  cronJob: CronJob;

  private static instance: SwipeService;

  private constructor() {
    this.cronJob = new CronJob("* * * * *", async () => {
      try {
        await this.checkSwipes();
        console.log("Checked swipes.");
      } catch (error) {
        console.error(error);
      }
    });

    if (!this.cronJob.running) {
      this.cronJob.start();
    }
  }

  public static getInstance(): SwipeService {
    if (!SwipeService.instance) {
      SwipeService.instance = new SwipeService();
    }

    return SwipeService.instance;
  }

  public async checkSwipes() {
    try {
      const usersRef = firestore.collection("users");
      const snapshot = await usersRef.where("swipes", "<", 20).get();

      if (snapshot.empty) {
        console.log("No users with swipes under 20 found.");
        return;
      }

      const batch = firestore.batch();

      snapshot.forEach((doc) => {
        console.log(`User ${doc.id} has swipes under 20.`);

        const userRef = usersRef.doc(doc.id);
        batch.update(userRef, { swipes: 20 });
      });

      await batch.commit();
      console.log("Swipes updated successfully.");
    } catch (error) {
      console.error("Error checking swipes: ", error);
    }
  }
}

export default SwipeService;
