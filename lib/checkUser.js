import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";

export const checkUser = async () => {
  let user;

  try {
    user = await currentUser();
  } catch (error) {
    console.error("Error fetching Clerk user:", error?.errors || error);
    return null;
  }

  if (!user) return null;

  try {
    const existingUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
    const email = user.emailAddresses?.[0]?.emailAddress || null;

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email,
      },
    });

    return newUser;
  } catch (error) {
    console.error("Error accessing or creating user in DB:", error.message);
    return null;
  }
};
