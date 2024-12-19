import fs from 'fs';
import path from 'path';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import dataStore from '../../../utils/dataStore';

const filePath = path.join(process.cwd(), 'dataStore.json');

function loadData() {
  if (fs.existsSync(filePath)) {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    // Return an empty object if the file is empty
    return fileContent.trim() === '' ? {} : JSON.parse(fileContent);
  }
  return {}; // Return an empty object if the file doesn't exist
}

export async function GET(req, { params }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { endpoint } = await params;

  // Load data into the in-memory store only in development
  if (process.env.NODE_ENV !== 'production') {
    const loadedData = loadData();
    Object.assign(dataStore, loadedData); // Merge loaded data into the in-memory store
  }

  if (!endpoint || !dataStore[endpoint]) {
    return new Response(
      JSON.stringify({ error: 'Endpoint not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ content: dataStore[endpoint] }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
}
