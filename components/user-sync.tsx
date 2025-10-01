"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function UserSync() {
  const { user, isLoaded } = useUser();
  const currentUser = useQuery(api.users.getCurrentUser);
  const createUser = useMutation(api.users.createUser);

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && user && currentUser === null) {
        // User is signed in with Clerk but doesn't exist in Convex yet
        try {
          await createUser({
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress || "",
            username: user.username || undefined,
            name: user.fullName || undefined,
          });
          console.log("User synced to Convex!");
        } catch (error) {
          console.error("Error syncing user:", error);
        }
      }
    };

    syncUser();
  }, [isLoaded, user, currentUser, createUser]);

  return null; // This component doesn't render anything
}
