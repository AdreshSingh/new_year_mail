import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const CONVEX_URL = process.env.EXPO_PUBLIC_CONVEX_URL as string;
console.log("Using Convex URL:", CONVEX_URL);

const convex = new ConvexReactClient(CONVEX_URL, {
    unsavedChangesWarning: false,
});

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
    return <ConvexProvider client={convex}>{children}</ConvexProvider>;
}
