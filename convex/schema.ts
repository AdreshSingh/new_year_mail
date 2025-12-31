import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    mails: defineTable({
        subject: v.string(),
        sender: v.string(),
        preview: v.string(),
        body: v.string(),
        color: v.string(),
        isRead: v.boolean(),
        timestamp: v.number(),
    }),
});
