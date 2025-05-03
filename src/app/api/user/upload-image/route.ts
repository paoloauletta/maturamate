import { NextRequest, NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/db/drizzle";
import { usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    // Parse the request form data
    const formData = await request.formData();
    const imageFile = formData.get("image");

    if (!imageFile) {
      return NextResponse.json(
        { error: "No image file provided" },
        { status: 400 }
      );
    }

    console.log(
      "Received file:",
      "Type:",
      typeof imageFile,
      "isFile:",
      imageFile instanceof File,
      "isBlob:",
      imageFile instanceof Blob
    );

    // Generate a filename-safe string
    let filename = "profile-image";

    if (imageFile instanceof File) {
      filename = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      console.log(
        "File details:",
        "Name:",
        imageFile.name,
        "Size:",
        imageFile.size,
        "Type:",
        imageFile.type
      );
    }

    // Generate a mock URL (in a real implementation this would be a real CDN URL)
    const mockImageUrl = `https://example.com/user-images/${
      user.id
    }/${Date.now()}-${filename}`;
    console.log("Generated mock URL:", mockImageUrl);

    // Update the user profile with the new image URL
    await db
      .update(usersTable)
      .set({
        profile_picture: mockImageUrl,
      })
      .where(eq(usersTable.id, user.id));

    return NextResponse.json(
      {
        message: "Profile image updated successfully",
        imageUrl: mockImageUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile image:", error);
    return NextResponse.json(
      { error: "Failed to update profile image" },
      { status: 500 }
    );
  }
}
