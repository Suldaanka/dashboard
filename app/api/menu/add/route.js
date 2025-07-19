import { NextResponse } from "next/server";
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { prisma } from "@/lib/prisma";
// Import the regular fs module, not the promises version for checking directory existence
import * as fs from 'fs';

export async function POST(req) {
  try {
    const formData = await req.formData();
    
    // Extract text fields with proper validation
    const name = formData.get("name")?.toString();
    const category = formData.get("category")?.toString();
    const price = parseFloat(formData.get("price")?.toString() || '0');
    const status = formData.get("status")?.toString();
    
    // Extract files (multiple)
    const files = formData.getAll("images");
    
    // Validate required fields
    if (!name || !category || isNaN(price) || !status || files.length === 0) {
      return NextResponse.json(
        { error: "All fields are required and must be valid" }, 
        { status: 400 }
      );
    }
    
    // Process files (example: save to disk)
    const savedFiles = [];
    
    // Ensure upload directory exists using synchronous fs methods
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    try {
      // Check if directory exists synchronously
      if (!fs.existsSync(uploadDir)) {
        // Create directory synchronously
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`Created directory: ${uploadDir}`);
      } else {
        console.log(`Directory already exists: ${uploadDir}`);
      }
    } catch (dirError) {
      console.error("Error with directory operations:", dirError);
      return NextResponse.json(
        { error: `Directory error: ${dirError.message}` }, 
        { status: 500 }
      );
    }
    
    // Process all files
    for (const file of files) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        
        // Generate unique filename
        const timestamp = Date.now() + Math.floor(Math.random() * 1000);
        const ext = file.name.split('.').pop();
        const filename = `${name.replace(/\s+/g, '-')}-${timestamp}.${ext}`;
        
        // Save to public/uploads directory
        const path = join(uploadDir, filename);
        await writeFile(path, buffer);
        savedFiles.push(`/uploads/${filename}`);
        console.log(`Saved file to: ${path}`);
      } catch (fileError) {
        console.error(`Error processing file ${file.name}:`, fileError);
        // Continue with other files even if one fails
      }
    }
    
    if (savedFiles.length === 0) {
      return NextResponse.json(
        { error: "Failed to save any of the uploaded files" }, 
        { status: 500 }
      );
    }
    
    try {
      // Store multiple image URLs as a JSON string in the database
      const newMenuItem = await prisma.menuItem.create({
        data: {
          name,
          price,
          status,
          category,
          imageUrl: JSON.stringify(savedFiles), // Store as JSON string
        },
      });
      
      return NextResponse.json({
        ...newMenuItem,
        imageUrls: savedFiles, // Return the actual array for client use
      }, { status: 201 });
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` }, 
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error adding menu item:", error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` }, 
      { status: 500 }
    );
  }
}