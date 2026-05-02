import * as Notifications from 'expo-notifications';//TODO seperate DB function to repo folder
import { EventRepository } from '@/repositories/event.repository';
import { db } from '@/db/database';
import { generateId } from '@/utils/uuid';

const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const isTomorrow = (eventDate: Date, now: Date) => {
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);

  return isSameDay(eventDate, tomorrow);
};

export const NotificationService = {
  checkEvents: async () => {
    console.log("🔔 Checking events for notifications...");

    const events = EventRepository.getAll?.() || [];

    const now = new Date();

    for (const e of events) {
      if (e.deletedAt) continue;

      const eventDate = new Date(e.eventDate);

      // 🔴 TODAY
      if (isSameDay(eventDate, now) && !e.notifiedToday) {
        await NotificationService.triggerNotification(e, "TODAY");
        NotificationService.markNotified(e.id, "TODAY");
      }

      // 🟡 TOMORROW
      // 🟡 TOMORROW (SCHEDULED)
if (isTomorrow(eventDate, now) && !e.notifiedTomorrow) {
  await NotificationService.scheduleMorningNotification(e);
  NotificationService.markNotified(e.id, "TOMORROW");
}
    }
  },

    triggerNotification: async (event: any, type: "TODAY" | "TOMORROW") => {
    const title =
      type === "TODAY" ? "📅 Event Today" : "⏰ Event Tomorrow";

    const message = `${event.content}`;

    console.log("🔔 Trigger:", title, message);

    // 🔔 SYSTEM NOTIFICATION
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: message,
      },
      trigger: null, // immediate
    });

    // 💾 SAVE TO DB (for notification page)
    db.runSync(
      `INSERT INTO notifications 
       (id, eventId, title, message, type, createdAt, read)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        generateId(),
        event.id,
        title,
        message,
        type,
        new Date().toISOString(),
        0,
      ]
    );
  },

    markNotified: (eventId: string, type: "TODAY" | "TOMORROW") => {
    if (type === "TODAY") {
      db.runSync(
        `UPDATE case_events 
         SET notifiedToday = 1, lastNotifiedAt = ? 
         WHERE id = ?`,
        [new Date().toISOString(), eventId]
      );
    }

    if (type === "TOMORROW") {
      db.runSync(
        `UPDATE case_events 
         SET notifiedTomorrow = 1, lastNotifiedAt = ? 
         WHERE id = ?`,
        [new Date().toISOString(), eventId]
      );
    }
  },

  scheduleMorningNotification: async (event: any) => {
  const now = new Date();

  // ⏰ Set to tomorrow 8:00 AM
  const triggerDate = new Date();
  triggerDate.setDate(now.getDate() + 1);
  triggerDate.setHours(8, 0, 0, 0);

  const title = "⏰ Event Tomorrow";
  const message = event.content;

  console.log("📅 Scheduling morning notification:", triggerDate);

  // 🔔 SYSTEM NOTIFICATION (scheduled)
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body: message,
    },
    trigger: {
  type: Notifications.SchedulableTriggerInputTypes.DATE,
  date: triggerDate,
}
  });

  // 💾 Save to DB (history)
  db.runSync(
    `INSERT INTO notifications 
     (id, eventId, title, message, type, createdAt, read)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      generateId(),
      event.id,
      title,
      message,
      "TOMORROW",
      new Date().toISOString(),
      0,
    ]
  );
},
};