import OpenAI from 'openai';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import dataStore from '../../utils/dataStore';
import { headers } from 'next/headers';


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Save data locally (only for development)
function saveData(data) {
    if (process.env.NODE_ENV !== 'production') {
        const fs = require('fs');
        const path = require('path');
        const filePath = path.join(process.cwd(), 'dataStore.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
}

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return new Response(
            JSON.stringify({ error: 'Unauthorized' }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        const body = await req.json();
        const { type, details, endpoint } = body;

        if (!type || !details || !endpoint) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Generate content via OpenAI API
        const aiResponse = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'Provide only a list of items. No introductions, explanations, or quotation marks.'
                },
                {
                    role: 'user',
                    content: `Generate a list of ${details} related to ${type}.`
                }
            ]
        });

        const cleanContent = (rawContent) => {
            return rawContent
                .split('\n')
                // Remove introductory phrases
                .filter(line => !line.toLowerCase().includes('here are') &&
                    !line.toLowerCase().includes('list of'))
                // Clean up list formatting and trim
                .map(line => line.replace(/^\d+\.\s*/, '').trim())
                // Remove empty lines and very short lines (likely not content)
                .map(item => item.replace(/["""]/g, '')) 
                // Remove quotes 
                .filter(Boolean)  // Remove empty lines meaning 
                .filter(line => line.length > 3); 
        };

        // Convert the response string to an array
        const rawContent = aiResponse.choices[0].message.content.trim();
        const generatedContent = cleanContent(rawContent);

        // Store generated content in-memory
        dataStore[endpoint] = { type, details, content: generatedContent };

        // Save locally in development
        // saveData(dataStore);

        return new Response(
            JSON.stringify({ message: 'Content generated', endpoint, content: generatedContent }),
            { status: 201, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ error: 'Failed to generate content', details: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
