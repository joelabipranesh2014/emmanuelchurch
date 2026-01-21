import type { APIRoute } from 'astro';
import { db } from '../../../lib/firebase-admin';

// Mark this API route as server-rendered (not static)
export const prerender = false;

const SERMONS_COLLECTION = 'sermons';

// PUT - Update a sermon
export const PUT: APIRoute = async ({ params, request }) => {
    try {
        const id = params.id;
        if (!id) {
            return new Response(JSON.stringify({ error: 'Sermon ID is required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const sermonData = await request.json();
        const sermonRef = db.collection(SERMONS_COLLECTION).doc(id);
        const sermonSnap = await sermonRef.get();

        if (!sermonSnap.exists) {
            return new Response(JSON.stringify({ error: 'Sermon not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        await sermonRef.update(sermonData);
        const updatedSnap = await sermonRef.get();
        const updatedData = {
            id: updatedSnap.id,
            ...updatedSnap.data(),
            createdAt: updatedSnap.data()?.createdAt?.toDate?.()?.toISOString() || updatedSnap.data()?.createdAt
        };

        return new Response(JSON.stringify(updatedData), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error updating sermon:', error);
        return new Response(JSON.stringify({ error: 'Failed to update sermon' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

// DELETE - Delete a sermon
export const DELETE: APIRoute = async ({ params }) => {
    try {
        const id = params.id;
        if (!id) {
            return new Response(JSON.stringify({ error: 'Sermon ID is required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        const sermonRef = db.collection(SERMONS_COLLECTION).doc(id);
        const sermonSnap = await sermonRef.get();

        if (!sermonSnap.exists) {
            return new Response(JSON.stringify({ error: 'Sermon not found' }), {
                status: 404,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }

        await sermonRef.delete();

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    } catch (error) {
        console.error('Error deleting sermon:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete sermon' }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }
};

