import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import * as fs from "fs";
import { prisma } from "@/lib/prisma";

export async function POST(req, context) {
  const params = await context.params;
  const id = params.id;

  try {
    const formData = await req.formData();

    const name = formData.get("name")?.toString();
    const price = parseFloat(formData.get("price") || "0");
    const category = formData.get("category")?.toString();
    const status = formData.get("status")?.toString();

    const existingImages = JSON.parse(formData.get("existingImages") || "[]");
    const newImages = formData.getAll("newImages");

    if (!name || !category || isNaN(price) || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure the upload folder exists
    const uploadDir = join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const maxFileSize = 5 * 1024 * 1024;

    const newImageUrls = [];

    for (const file of newImages) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Unsupported file type: ${file.name}` },
          { status: 400 }
        );
      }

      if (file.size > maxFileSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}` },
          { status: 400 }
        );
      }

      const ext = file.name.split(".").pop();
      const timestamp = Date.now() + Math.floor(Math.random() * 1000);
      const filename = `${name.replace(/\s+/g, "-")}-${timestamp}.${ext}`;
      const path = join(uploadDir, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      await writeFile(path, buffer);
      newImageUrls.push(`/uploads/${filename}`);
    }

    // Combine existing and new images
    const finalImageUrls = [...existingImages, ...newImageUrls];

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        price,
        category,
        status,
        imageUrl: JSON.stringify(finalImageUrls),
      },
    });

    return NextResponse.json({ success: true, menuItem: updated }, { status: 200 });
  } catch (error) {
    // Error handled with response
    return NextResponse.json(
      { error: "Failed to update menu item" },
      { status: 500 }
    );
  }
}

