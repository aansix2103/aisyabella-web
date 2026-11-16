import { jwtVerify, importSPKI } from 'jose';

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

const PROJECT_ID = 'ai-generator-aisyabella';
const FIREBASE_ISSUER = `https://securetoken.google.com/${PROJECT_ID}`;
const ADMIN_PROTECTED_UID = 'iEGPg4wFBdfgtIbRvLycRBwdfvq2';
const FIRESTORE_ROOT = `artifacts/aisyabella-tka-math/public/data`;
const BATCH_SIZE = 500; // Firestore batch limit
const MAX_BODY_SIZE = 10 * 1024; // 10KB max request body size

interface DeleteStudentRequest {
  studentUid?: string;
}

interface DeleteStudentResponse {
  success?: boolean;
  message?: string;
  deleted?: {
    userDoc?: boolean;
    attempts?: number;
    activityLogs?: number;
    authAccount?: boolean;
  };
  error?: string;
  code?: string;
}

// ============================================================================
// HELPER: FETCH FIREBASE PUBLIC KEYS
// ============================================================================

let cachedPublicKeys: Record<string, string> | null = null;
let cachedKeyExpiry = 0;

async function getFirebasePublicKeys(): Promise<Record<string, string>> {
  const now = Date.now();

  if (cachedPublicKeys && cachedKeyExpiry > now) {
    return cachedPublicKeys;
  }

  try {
    const response = await fetch(
      'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Firebase public keys');
    }

    const data = (await response.json()) as Record<string, string>;
    const cacheControl = response.headers.get('cache-control');
    const maxAge = cacheControl?.match(/max-age=(\d+)/)?.[1];
    const ttl = maxAge ? parseInt(maxAge) * 1000 : 3600000; // 1 hour default

    cachedPublicKeys = data;
    cachedKeyExpiry = now + ttl;

    return data;
  } catch (error) {
    console.error('Error fetching Firebase public keys:', error);
    throw new Error('Failed to verify token: unable to fetch public keys');
  }
}

// ============================================================================
// HELPER: VERIFY FIREBASE ID TOKEN
// ============================================================================

async function verifyFirebaseToken(token: string): Promise<{
  uid: string;
  role?: string;
  aud: string;
  iss: string;
  exp: number;
}> {
  if (!token) {
    throw new Error('No token provided');
  }

  const publicKeys = await getFirebasePublicKeys();

  // Get key ID from token header
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  let decodedHeader: { kid?: string };
  try {
    const headerJson = Buffer.from(parts[0], 'base64').toString('utf-8');
    decodedHeader = JSON.parse(headerJson);
  } catch {
    throw new Error('Invalid token header');
  }

  const keyId = decodedHeader.kid;
  if (!keyId || !publicKeys[keyId]) {
    throw new Error('Token signed with unknown key');
  }

  try {
    const publicKey = await importSPKI(publicKeys[keyId], 'RS256');
    const verified = await jwtVerify(token, publicKey, {
      issuer: FIREBASE_ISSUER,
      audience: PROJECT_ID,
    });

    const { uid, role } = verified.payload as { uid?: string; role?: string };

    if (!uid) {
      throw new Error('Token missing uid claim');
    }

    return {
      uid,
      role,
      aud: verified.payload.aud as string,
      iss: verified.payload.iss as string,
      exp: (verified.payload.exp || 0) * 1000,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
    throw new Error('Token verification failed');
  }
}

// ============================================================================
// HELPER: GET SERVICE ACCOUNT JWT
// ============================================================================

async function getServiceAccountAccessToken(
  serviceAccountJson: string
): Promise<string> {
  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountJson);
  } catch {
    throw new Error('Invalid service account JSON');
  }

  if (!serviceAccount.private_key || !serviceAccount.client_email) {
    throw new Error('Service account missing required fields');
  }

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  // Sign JWT manually using Web Crypto API
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString(
    'base64url'
  );
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const message = `${header}.${body}`;

  // Import private key
  const pemKey = serviceAccount.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\n/g, '');
  const binaryKey = Buffer.from(pemKey, 'base64');

  const keyObject = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    keyObject,
    new TextEncoder().encode(message)
  );

  const signatureB64 = Buffer.from(signature).toString('base64url');
  const jwt = `${message}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }).toString(),
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to get access token from service account');
  }

  const tokenData = (await tokenResponse.json()) as { access_token?: string };
  if (!tokenData.access_token) {
    throw new Error('No access token in response');
  }

  return tokenData.access_token;
}

// ============================================================================
// HELPER: FIRESTORE REST API CALLS
// ============================================================================

async function getFirestoreDocument(
  path: string,
  accessToken: string
): Promise<Record<string, unknown> | null> {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Firestore GET failed: ${response.statusText}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  return data;
}

async function queryFirestoreDocuments(
  collectionPath: string,
  fieldName: string,
  fieldValue: string,
  accessToken: string
): Promise<Array<{ name: string; fields: Record<string, unknown> }>> {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${collectionPath}`;
  const allResults: Array<{ name: string; fields: Record<string, unknown> }> = [];
  let pageToken: string | undefined;
  let pageCount = 0;

  do {
    pageCount++;

    const body: Record<string, unknown> = {
      structuredQuery: {
        from: [{ collectionId: collectionPath.split('/').pop() }],
        where: {
          fieldFilter: {
            field: { fieldPath: fieldName },
            op: 'EQUAL',
            value: { stringValue: fieldValue },
          },
        },
      },
    };

    if (pageToken) {
      body.pageToken = pageToken;
    }

    const response = await fetch(`${url}:runQuery`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Firestore query failed: ${response.statusText}`);
    }

    const results: Array<{ document?: { name: string; fields: Record<string, unknown> }; readTime?: string }> =
      await response.json();

    // Extract documents and next page token
    const documents = results
      .filter((r) => r.document)
      .map((r) => ({
        name: r.document!.name,
        fields: r.document!.fields,
      }));

    allResults.push(...documents);

    // Check for pagination
    const lastResult = results[results.length - 1];
    pageToken = (lastResult as { readTime?: string; [key: string]: unknown }).pageToken as string | undefined;

    // Safety: max 10 pages to prevent infinite loops
    if (pageCount > 10) {
      throw new Error(`Query exceeded max pages (${pageCount}). Too many documents to delete.`);
    }
  } while (pageToken);

  return allResults;
}

async function deleteFirestoreDocument(
  path: string,
  accessToken: string
): Promise<void> {
  const url = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Firestore DELETE failed: ${response.statusText}`);
  }
}

async function deleteFirebaseAuthUser(
  uid: string,
  accessToken: string
): Promise<void> {
  // Use Firebase Admin API endpoint (v1) with Service Account access token
  const url = `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT_ID}/accounts:delete`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ localId: uid }),
  });

  if (!response.ok) {
    // Parse error response body if available
    let errorDetail = response.statusText;
    try {
      const errorBody = (await response.json()) as { error?: { message?: string } };
      if (errorBody.error?.message) {
        errorDetail = errorBody.error.message;
      }
    } catch {
      // Ignore JSON parse errors, use statusText
    }

    // Treat 404 or USER_NOT_FOUND as idempotent (already deleted or never existed)
    if (response.status === 404 || errorDetail.includes('USER_NOT_FOUND')) {
      // Account already deleted or never existed - treat as success
      return;
    }

    throw new Error(`Firebase Auth DELETE failed: ${errorDetail}`);
  }
}

// ============================================================================
// MAIN HANDLER - Cloudflare Pages Functions
// ============================================================================

export async function onRequest(context: {
  request: Request;
  env: { FIREBASE_SERVICE_ACCOUNT_KEY?: string };
}): Promise<Response> {
  const { request, env } = context;

  // === METHOD VALIDATION ===
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED',
      } as DeleteStudentResponse),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // === REQUEST BODY SIZE VALIDATION ===
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
    return new Response(
      JSON.stringify({
        error: 'Request body too large',
        code: 'PAYLOAD_TOO_LARGE',
      } as DeleteStudentResponse),
      { status: 413, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // === CONTENT-TYPE VALIDATION ===
  const contentType = request.headers.get('content-type');
  if (!contentType?.includes('application/json')) {
    return new Response(
      JSON.stringify({
        error: 'Invalid Content-Type',
        code: 'INVALID_CONTENT_TYPE',
      } as DeleteStudentResponse),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // === AUTHORIZATION HEADER ===
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({
        error: 'Missing or invalid authorization header',
        code: 'UNAUTHORIZED',
      } as DeleteStudentResponse),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const idToken = authHeader.slice(7);

  // === VERIFY ADMIN TOKEN ===
  let adminUid: string;
  let adminRole: string | undefined;
  try {
    const verified = await verifyFirebaseToken(idToken);
    adminUid = verified.uid;
    adminRole = verified.role;

    if (adminRole !== 'admin') {
      return new Response(
        JSON.stringify({
          error: 'Only admins can delete student accounts',
          code: 'PERMISSION_DENIED',
        } as DeleteStudentResponse),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    return new Response(
      JSON.stringify({
        error: 'Invalid or expired token',
        code: 'INVALID_TOKEN',
      } as DeleteStudentResponse),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // === PARSE REQUEST BODY ===
  let body: DeleteStudentRequest;
  try {
    body = (await request.json()) as DeleteStudentRequest;
  } catch {
    return new Response(
      JSON.stringify({
        error: 'Invalid JSON body',
        code: 'INVALID_JSON',
      } as DeleteStudentResponse),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const studentUid = body.studentUid?.trim();

  // === VALIDATE STUDENT UID ===
  if (!studentUid) {
    return new Response(
      JSON.stringify({
        error: 'studentUid is required',
        code: 'INVALID_UID',
      } as DeleteStudentResponse),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (studentUid === adminUid) {
    return new Response(
      JSON.stringify({
        error: 'Cannot delete own admin account',
        code: 'CANNOT_DELETE_SELF',
      } as DeleteStudentResponse),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (studentUid === ADMIN_PROTECTED_UID) {
    return new Response(
      JSON.stringify({
        error: 'Cannot delete protected admin account',
        code: 'PROTECTED_ACCOUNT',
      } as DeleteStudentResponse),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // === GET SERVICE ACCOUNT CREDENTIALS ===
  const serviceAccountKey = env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!serviceAccountKey) {
    console.error('Service account key not configured');
    return new Response(
      JSON.stringify({
        error: 'Server configuration error',
        code: 'SERVER_ERROR',
      } as DeleteStudentResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let accessToken: string;
  try {
    accessToken = await getServiceAccountAccessToken(serviceAccountKey);
  } catch (error) {
    console.error('Failed to get access token:', error);
    return new Response(
      JSON.stringify({
        error: 'Server authentication error',
        code: 'SERVER_ERROR',
      } as DeleteStudentResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // === VERIFY TARGET IS STUDENT ===
  try {
    const userDoc = await getFirestoreDocument(
      `${FIRESTORE_ROOT}/users/${studentUid}`,
      accessToken
    );

    if (!userDoc) {
      return new Response(
        JSON.stringify({
          error: 'Student account not found',
          code: 'NOT_FOUND',
        } as DeleteStudentResponse),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const fields = userDoc.fields as Record<string, { stringValue?: string }>;
    const role = fields.role?.stringValue;

    if (role === 'admin') {
      return new Response(
        JSON.stringify({
          error: 'Cannot delete admin account',
          code: 'PERMISSION_DENIED',
        } as DeleteStudentResponse),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (role !== 'siswa') {
      return new Response(
        JSON.stringify({
          error: 'Target account is not a student',
          code: 'INVALID_TARGET',
        } as DeleteStudentResponse),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error verifying target:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to verify student account',
        code: 'VERIFICATION_ERROR',
      } as DeleteStudentResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // === QUERY ATTEMPTS ===
  let attemptsDocs: Array<{ name: string; fields: Record<string, unknown> }> = [];
  try {
    attemptsDocs = await queryFirestoreDocuments(
      `${FIRESTORE_ROOT}/attempts`,
      'userId',
      studentUid,
      accessToken
    );
  } catch (error) {
    console.error('Error querying attempts:', error);
  }

  // === QUERY ACTIVITY LOGS ===
  let activityLogsDocs: Array<{ name: string; fields: Record<string, unknown> }> = [];
  try {
    activityLogsDocs = await queryFirestoreDocuments(
      `${FIRESTORE_ROOT}/activityLogs`,
      'userId',
      studentUid,
      accessToken
    );
  } catch (error) {
    console.error('Error querying activity logs:', error);
  }

  // === VALIDATE BATCH SIZE ===
  const totalDocs = 1 + attemptsDocs.length + activityLogsDocs.length;
  if (totalDocs > BATCH_SIZE * 2) {
    return new Response(
      JSON.stringify({
        error: 'Too many documents to delete in single operation',
        code: 'BATCH_TOO_LARGE',
      } as DeleteStudentResponse),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const result: DeleteStudentResponse = { deleted: {} };

  // === DELETE FIRESTORE DOCUMENTS ===
  try {
    // Delete attempts - track deletions per document
    let deletedAttempts = 0;
    for (const doc of attemptsDocs) {
      try {
        await deleteFirestoreDocument(doc.name, accessToken);
        deletedAttempts++;
      } catch (error) {
        console.error(`Failed to delete attempt ${doc.name}:`, error);
        // Continue to next doc, don't abort entire operation
      }
    }
    result.deleted!.attempts = deletedAttempts;

    // Delete activity logs - track deletions per document
    let deletedLogs = 0;
    for (const doc of activityLogsDocs) {
      try {
        await deleteFirestoreDocument(doc.name, accessToken);
        deletedLogs++;
      } catch (error) {
        console.error(`Failed to delete activity log ${doc.name}:`, error);
        // Continue to next doc, don't abort entire operation
      }
    }
    result.deleted!.activityLogs = deletedLogs;

    // Delete user doc
    await deleteFirestoreDocument(`${FIRESTORE_ROOT}/users/${studentUid}`, accessToken);
    result.deleted!.userDoc = true;
  } catch (error) {
    console.error('Error deleting Firestore documents:', error);
    return new Response(
      JSON.stringify({
        error: 'Partial deletion: Firestore documents',
        code: 'PARTIAL_FAILURE',
        deleted: result.deleted,
      } as DeleteStudentResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // === DELETE AUTH USER ===
  try {
    await deleteFirebaseAuthUser(studentUid, accessToken);
    result.deleted!.authAccount = true;
  } catch (error) {
    console.error('Error deleting auth user:', error);
    return new Response(
      JSON.stringify({
        error: 'Partial deletion: Firebase Authentication account',
        code: 'PARTIAL_FAILURE_AUTH',
        deleted: result.deleted,
      } as DeleteStudentResponse),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // === LOG AUDIT (CREATE NEW ACTIVITY LOG FOR ADMIN) ===
  try {
    const auditLog = {
      fields: {
        userId: { stringValue: adminUid },
        activity: { stringValue: 'Delete Student Account' },
        description: {
          stringValue: `Admin ${adminUid} deleted student account ${studentUid}. Deleted: ${attemptsDocs.length} attempts, ${activityLogsDocs.length} logs, 1 user doc, 1 auth account.`,
        },
        createdAt: { stringValue: new Date().toISOString() },
      },
    };

    await fetch(
      `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/${FIRESTORE_ROOT}/activityLogs`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(auditLog),
      }
    );
  } catch (error) {
    console.error('Warning: Failed to create audit log:', error);
    // Don't fail the request if audit log fails
  }

  // === SUCCESS ===
  result.success = true;
  result.message = `Student account ${studentUid} deleted successfully`;

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
