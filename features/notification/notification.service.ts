// // import * as Notifications from 'expo-notifications';//TODO seperate DB function to repo folder
// // import { EventRepository } from '@/repositories/event.repository';
// // import { db } from '@/db/database';
// // import { generateId } from '@/utils/uuid';

// // const isSameDay = (d1: Date, d2: Date) => {
// //   return (
// //     d1.getFullYear() === d2.getFullYear() &&
// //     d1.getMonth() === d2.getMonth() &&
// //     d1.getDate() === d2.getDate()
// //   );
// // };

// // const isTomorrow = (eventDate: Date, now: Date) => {
// //   const tomorrow = new Date(now);
// //   tomorrow.setDate(now.getDate() + 1);

// //   return isSameDay(eventDate, tomorrow);
// // };

// // export const NotificationService = {
// //   checkEvents: async () => {
// //     console.log("🔔 Checking events for notifications...");

// //     const events = EventRepository.getAll?.() || [];

// //     const now = new Date();

// //     for (const e of events) {
// //       if (e.deletedAt) continue;

// //       const eventDate = new Date(e.eventDate);

// //       // 🔴 TODAY
// //       if (isSameDay(eventDate, now) && !e.notifiedToday) {
// //         await NotificationService.triggerNotification(e, "TODAY");
// //         NotificationService.markNotified(e.id, "TODAY");
// //       }

// //       // 🟡 TOMORROW
// //       // 🟡 TOMORROW (SCHEDULED)
// // if (isTomorrow(eventDate, now) && !e.notifiedTomorrow) {
// //   await NotificationService.scheduleMorningNotification(e);
// //   NotificationService.markNotified(e.id, "TOMORROW");
// // }
// //     }
// //   },

// //     triggerNotification: async (event: any, type: "TODAY" | "TOMORROW") => {
// //     const title =
// //       type === "TODAY" ? "📅 Event Today" : "⏰ Event Tomorrow";

// //     const message = `${event.content}`;

// //     console.log("🔔 Trigger:", title, message);

// //     // 🔔 SYSTEM NOTIFICATION
// //     await Notifications.scheduleNotificationAsync({
// //       content: {
// //         title,
// //         body: message,
// //       },
// //       trigger: null, // immediate
// //     });

// //     // 💾 SAVE TO DB (for notification page)
// //     db.runSync(
// //       `INSERT INTO notifications 
// //        (id, eventId, title, message, type, createdAt, read)
// //        VALUES (?, ?, ?, ?, ?, ?, ?)`,
// //       [
// //         generateId(),
// //         event.id,
// //         title,
// //         message,
// //         type,
// //         new Date().toISOString(),
// //         0,
// //       ]
// //     );
// //   },

// //     markNotified: (eventId: string, type: "TODAY" | "TOMORROW") => {
// //     if (type === "TODAY") {
// //       db.runSync(
// //         `UPDATE case_events 
// //          SET notifiedToday = 1, lastNotifiedAt = ? 
// //          WHERE id = ?`,
// //         [new Date().toISOString(), eventId]
// //       );
// //     }

// //     if (type === "TOMORROW") {
// //       db.runSync(
// //         `UPDATE case_events 
// //          SET notifiedTomorrow = 1, lastNotifiedAt = ? 
// //          WHERE id = ?`,
// //         [new Date().toISOString(), eventId]
// //       );
// //     }
// //   },

// //   scheduleMorningNotification: async (event: any) => {
// //   const now = new Date();

// //   // ⏰ Set to tomorrow 8:00 AM
// //   const triggerDate = new Date();
// //   triggerDate.setDate(now.getDate() + 1);
// //   triggerDate.setHours(8, 0, 0, 0);

// //   const title = "⏰ Event Tomorrow";
// //   const message = event.content;

// //   console.log("📅 Scheduling morning notification:", triggerDate);

// //   // 🔔 SYSTEM NOTIFICATION (scheduled)
// //   await Notifications.scheduleNotificationAsync({
// //     content: {
// //       title,
// //       body: message,
// //     },
// //     trigger: {
// //   type: Notifications.SchedulableTriggerInputTypes.DATE,
// //   date: triggerDate,
// // }
// //   });

// //   // 💾 Save to DB (history)
// //   db.runSync(
// //     `INSERT INTO notifications 
// //      (id, eventId, title, message, type, createdAt, read)
// //      VALUES (?, ?, ?, ?, ?, ?, ?)`,
// //     [
// //       generateId(),
// //       event.id,
// //       title,
// //       message,
// //       "TOMORROW",
// //       new Date().toISOString(),
// //       0,
// //     ]
// //   );
// // },
// // };


// import * as Notifications from 'expo-notifications';
// import * as BackgroundFetch from 'expo-background-fetch';
// import * as TaskManager from 'expo-task-manager';
// import { EventRepository } from '@/repositories/event.repository';
// import { db } from '@/db/database';
// import { generateId } from '@/utils/uuid';

// // Configuration
// const EVENT_CHECK_TASK = 'BACKGROUND_EVENT_CHECK';

// const isSameDay = (d1: Date, d2: Date) => {
//   return (
//     d1.getFullYear() === d2.getFullYear() &&
//     d1.getMonth() === d2.getMonth() &&
//     d1.getDate() === d2.getDate()
//   );
// };

// export const NotificationService = {
//   /**
//    * Main logic for checking events.
//    * Modified for Hourly Testing: Triggers if event is within the next 60 minutes.
//    */
//   checkEvents: async () => {
//     console.log("🔔 Checking events for notifications (Hourly Window Test)...");

//     const events = EventRepository.getAll?.() || [];
//     const now = new Date();

//     for (const e of events) {
//       if (e.deletedAt) continue;

//       const eventDate = new Date(e.eventDate);
      
//       // Calculate time difference
//       const diffInMs = eventDate.getTime() - now.getTime();
//       const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

//       // 🧪 TEST TRIGGER: If event is in the next 60 minutes and hasn't notified yet
//       if (diffInMinutes > 0 && diffInMinutes <= 60 && !e.notifiedToday) {
//         console.log(`🎯 Match Found: ${e.content} is in ${diffInMinutes} mins.`);
//         await NotificationService.triggerNotification(e, "TODAY");
//         NotificationService.markNotified(e.id, "TODAY");
//       }
      
//       // Keep your original "Tomorrow" logic if needed, or comment it out for pure hourly testing
//       // This part ensures a morning heads-up for IST (8:00 AM)
//       const tomorrow = new Date(now);
//       tomorrow.setDate(now.getDate() + 1);
//       if (isSameDay(eventDate, tomorrow) && !e.notifiedTomorrow) {
//         await NotificationService.scheduleMorningNotification(e);
//         NotificationService.markNotified(e.id, "TOMORROW");
//       }
//     }
//   },

//   triggerNotification: async (event: any, type: "TODAY" | "TOMORROW") => {
//     const title = type === "TODAY" ? "📅 Upcoming Event" : "⏰ Event Tomorrow";
//     const message = `${event.content}`;

//     console.log("🔔 Triggering System Notification:", title);

//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title,
//         body: message,
//         sound: true,
//         priority: Notifications.AndroidNotificationPriority.HIGH,
//       },
//       trigger: null, // immediate
//     });

//     db.runSync(
//       `INSERT INTO notifications 
//        (id, eventId, title, message, type, createdAt, read)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         generateId(),
//         event.id,
//         title,
//         message,
//         type,
//         new Date().toISOString(),
//         0,
//       ]
//     );
//   },

//   markNotified: (eventId: string, type: "TODAY" | "TOMORROW") => {
//     const field = type === "TODAY" ? "notifiedToday" : "notifiedTomorrow";
//     db.runSync(
//       `UPDATE case_events 
//        SET ${field} = 1, lastNotifiedAt = ? 
//        WHERE id = ?`,
//       [new Date().toISOString(), eventId]
//     );
//   },

//   /**
//    * Schedules a notification for 8:00 AM IST on the next day.
//    */
//   scheduleMorningNotification: async (event: any) => {
//     const now = new Date();
    
//     // Calculate 8:00 AM IST
//     // JavaScript uses device time; if device is in IST, this works directly.
//     const triggerDate = new Date();
//     triggerDate.setDate(now.getDate() + 1);
//     triggerDate.setHours(8, 0, 0, 0);

//     const title = "⏰ Event Tomorrow";
//     const message = event.content;

//     console.log("📅 Scheduling morning notification for:", triggerDate.toLocaleString('en-IN'));

//     await Notifications.scheduleNotificationAsync({
//       content: {
//         title,
//         body: message,
//       },
//       trigger: {
//         type: Notifications.SchedulableTriggerInputTypes.DATE,
//         date: triggerDate,
//       }
//     });

//     db.runSync(
//       `INSERT INTO notifications 
//        (id, eventId, title, message, type, createdAt, read)
//        VALUES (?, ?, ?, ?, ?, ?, ?)`,
//       [
//         generateId(),
//         event.id,
//         title,
//         message,
//         "TOMORROW",
//         new Date().toISOString(),
//         0,
//       ]
//     );
//   },

//   /**
//    * Call this from your app's entry point (_layout.tsx)
//    */
//   initBackgroundFetch: async () => {
//     const status = await BackgroundFetch.getStatusAsync();
//     if (status === BackgroundFetch.BackgroundFetchStatus.Restricted || status === BackgroundFetch.BackgroundFetchStatus.Denied) {
//       console.log("❌ Background execution is disabled");
//       return;
//     }

//     console.log("🚀 Registering Background Fetch Task...");
//     await BackgroundFetch.registerTaskAsync(EVENT_CHECK_TASK, {
//       minimumInterval: 60 * 60, // Check every 1 hour (testing)
//       stopOnTerminate: false,
//       startOnBoot: true,
//     });
//   }
// };

// /**
//  * Global Task Definition
//  * Must be defined in the global scope (outside of the object)
//  */
// TaskManager.defineTask(EVENT_CHECK_TASK, async () => {
//   try {
//     console.log("🌀 Background task wake up...");
//     await NotificationService.checkEvents();
//     return BackgroundFetch.BackgroundFetchResult.NewData;
//   } catch (error) {
//     console.error("❌ Background task failed:", error);
//     return BackgroundFetch.BackgroundFetchResult.Failed;
//   }
// });


import * as Notifications from 'expo-notifications';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { EventRepository } from '@/repositories/event.repository';
// import { db } from '@/db/database'; // Not strictly needed if we aren't blocking repeats

const EVENT_CHECK_TASK = 'BACKGROUND_EVENT_CHECK';

export const NotificationService = {
  checkEvents: async () => {
    console.log("🔔 Running 10-minute Repeat Test...");

    const events = EventRepository.getAll?.() || [];
    const now = new Date();

    for (const e of events) {
      if (e.deletedAt) continue;

      const eventDate = new Date(e.eventDate);
      const diffInMs = eventDate.getTime() - now.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      // 🧪 REPEAT TEST: Trigger every time task runs if event is in next 24 hours
      // Removed the "!e.notifiedToday" check so it triggers every cycle
      if (diffInMinutes > 0 && diffInMinutes <= 1440) { 
        console.log(`🎯 Repeating notification for: ${e.content}`);
        await NotificationService.triggerNotification(e);
      }
    }
  },

  triggerNotification: async (event: any) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "🧪 10-Min Repeat Test",
        body: `Event: ${event.content} (Sent at: ${new Date().toLocaleTimeString()})`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, 
    });
  },

  initBackgroundFetch: async () => {
    const status = await BackgroundFetch.getStatusAsync();
    if (status !== BackgroundFetch.BackgroundFetchStatus.Available) {
      console.log("❌ Background fetch not available");
      return;
    }

    console.log("🚀 Registering Task (Attempting 10m interval)...");
    await BackgroundFetch.registerTaskAsync(EVENT_CHECK_TASK, {
      minimumInterval: 10 * 60, // 10 minutes in seconds
      stopOnTerminate: false,
      startOnBoot: true,
    });
  }
};

TaskManager.defineTask(EVENT_CHECK_TASK, async () => {
  try {
    await NotificationService.checkEvents();
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});