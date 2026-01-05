import { put } from "@vercel/blob";
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Directories to scan
const DIRECTORIES = [
  "G1 音频",
  "G2 音频",
  "GK 音频",
  "测试"
];

async function main() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    console.error("Error: BLOB_READ_WRITE_TOKEN is not defined in .env.local or environment variables.");
    process.exit(1);
  }

  console.log("Starting upload to Vercel Blob...");
  console.log("Using token: " + token.substring(0, 10) + "...");

  const results = {};
  let successCount = 0;
  let failCount = 0;

  for (const dir of DIRECTORIES) {
    if (!fs.existsSync(dir)) {
      console.warn(`Directory not found: ${dir}`);
      continue;
    }

    const files = fs.readdirSync(dir);
    for (const file of files) {
      // Check for MP3 files (case insensitive)
      if (file.toLowerCase().endsWith('.mp3')) {
        const filePath = path.join(dir, file);

        try {
            const stats = fs.statSync(filePath);

            if (stats.isFile()) {
            // We use the relative path as the blob path name: "Directory/Filename.mp3"
            // Vercel Blob handles spaces in paths fine (URL encoded in return value)
            const blobPath = `${dir}/${file}`;

            console.log(`Uploading: ${blobPath} ...`);

            // Note: If running this locally where files are LFS pointers, this will upload the pointer file content.
            // Ensure you have the actual MP3 files present (git lfs pull).
            const fileContent = fs.readFileSync(filePath);

            const blob = await put(blobPath, fileContent, {
                access: 'public',
                token: token,
                addRandomSuffix: false // Preserve the path/filename exactly
            });

            console.log(`  -> Success: ${blob.url}`);
            results[blobPath] = blob.url;
            successCount++;
            }
        } catch (err) {
            console.error(`  -> Failed to upload ${filePath}: ${err.message}`);
            failCount++;
        }
      }
    }
  }

  // Save the results to a JSON file
  const outputFilename = 'vercel_blob_mapping.json';
  fs.writeFileSync(outputFilename, JSON.stringify(results, null, 2));
  console.log(`\nUpload complete. ${successCount} files uploaded. ${failCount} failed.`);
  console.log(`Mapping saved to ${outputFilename}`);

  // Suggest next steps
  if (successCount > 0) {
      const firstUrl = Object.values(results)[0];
      try {
          // Extract the base URL (protocol + hostname + store id part)
          // URL format is usually: https://<store-id>.public.blob.vercel-storage.com/<path>
          const urlObj = new URL(firstUrl);
          const baseUrl = urlObj.origin;
          console.log(`\nTo update app.js, you might want to add this base URL:`);
          console.log(`'vercel': '${baseUrl}'`);
      } catch (e) {
          // ignore
      }
  }
}

main().catch(err => {
  console.error("Unhandled error:", err);
  process.exit(1);
});
