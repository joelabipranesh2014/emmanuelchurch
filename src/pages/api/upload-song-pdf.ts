import type { APIRoute } from 'astro';
import { storage } from '../../lib/firebase-admin';

// Mark this API route as server-rendered (not static)
export const prerender = false;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const STORAGE_PATH = 'song-pdfs';

// POST - Upload song PDF file
export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('pdfFile') as File;
        const title = formData.get('title') as string;

        if (!file || !title) {
            return new Response(JSON.stringify({ error: 'Missing required fields: title and pdfFile are required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            return new Response(JSON.stringify({ error: 'Only PDF files are allowed' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return new Response(JSON.stringify({ error: 'File size exceeds 10MB limit' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
        const filename = `${timestamp}-${sanitizedTitle}.pdf`;
        const filePath = `${STORAGE_PATH}/${filename}`;

        // Convert file to buffer and upload to Firebase Storage
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Get the default bucket (uses the bucket from Firebase Admin initialization)
        const bucket = storage.bucket();
        
        if (!bucket) {
            throw new Error('Firebase Storage bucket is not configured. Please enable Firebase Storage in Firebase Console.');
        }
        
        console.log(`📤 Uploading to bucket: ${bucket.name}`);
        const storageFile = bucket.file(filePath);
        
        try {
            await storageFile.save(buffer, {
                metadata: {
                    contentType: 'application/pdf',
                },
            });
        } catch (uploadError: any) {
            // Provide more specific error for bucket not found
            if (uploadError?.code === 404 || uploadError?.message?.includes('not found') || uploadError?.message?.includes('does not exist')) {
                throw new Error(`Storage bucket "${bucket.name}" does not exist. Please enable Firebase Storage in Firebase Console. Go to Firebase Console → Storage → Get Started.`);
            }
            throw uploadError;
        }

        // Make the file publicly accessible and get the download URL
        await storageFile.makePublic();
        const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

        return new Response(JSON.stringify({ 
            success: true,
            url: downloadURL,
            filename: filename,
            title: title
        }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error: any) {
        console.error('Upload error:', error);
        
        // Provide helpful error messages
        let errorMessage = 'Failed to upload file';
        let hint = undefined;
        
        if (error?.message?.includes('bucket') || error?.code === 404 || error?.message?.includes('does not exist')) {
            errorMessage = error.message || 'Firebase Storage bucket not found';
            hint = `To fix this:
1. Go to https://console.firebase.google.com/
2. Select project: emmanuel-church-e7274
3. Click "Storage" in the left menu
4. Click "Get Started"
5. Choose "Start in test mode"
6. Select a location and click "Done"
7. Restart your dev server`;
        } else if (error?.message) {
            errorMessage = error.message;
        }
        
        return new Response(JSON.stringify({ 
            error: errorMessage,
            details: error?.message || error?.code,
            hint: hint
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

