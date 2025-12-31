import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("mails").order("desc").collect();
    },
});

export const send = mutation({
    args: {
        subject: v.string(),
        sender: v.string(),
        preview: v.string(),
        body: v.string(),
        color: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("mails", {
            subject: args.subject,
            sender: args.sender,
            preview: args.preview,
            body: args.body,
            color: args.color,
            isRead: false,
            timestamp: Date.now(),
        });
    },
});

export const getById = query({
    args: { id: v.id("mails") },
    handler: async (ctx, args) => {
        const mail = await ctx.db.get(args.id);
        return mail;
    },
});
