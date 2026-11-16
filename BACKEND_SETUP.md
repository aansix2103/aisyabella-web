# AisyaBella Delete Student Endpoint - Setup Guide

## Backend Endpoint: `/api/delete-student`

### Architecture

- **Runtime**: Cloudflare Pages Functions
- **Language**: TypeScript
- **Authentication**: Firebase ID Token (JWT) verification
- **Authorization**: Custom claim `role: "admin"`
- **API**: Firebase REST API (no Admin SDK in Workers)

### File Structure

```
functions/
├── api/
│   └── delete-student.ts  (Main endpoint handler)
```

### Security Features

1. **JWT Verification**
   - Fetches Firebase public keys (cached)
   - Verifies token signature using Web Crypto API
   - Validates issuer, audience, expiration
   - Extracts custom claim `role`

2. **Service Account Access**
   - Uses Google OAuth 2.0 JWT flow
   - Generates access token from Service Account
   - Never stores private key in frontend

3. **Target Validation**
   - Checks target is student (role: "siswa")
   - Prevents deletion of admin accounts
   - Protects main admin UID: `iEGPg4wFBdfgtIbRvLycRBwdfvq2`

4. **Safe Deletion**
   - Verifies target before deletion
   - Deletes in order: Firestore docs → Auth user
   - Handles partial failures gracefully
   - Creates audit log for admin action

### Local Setup (Development)

1. **Get Service Account Key**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Save as JSON

2. **Create `.dev.vars` File**
   ```bash
   cp .dev.vars.example .dev.vars
   ```
   - Edit `.dev.vars`
   - Paste full serviceAccountKey.json content as value for `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Format: valid JSON string (single or multiline)

3. **Never commit `.dev.vars`** - already in `.gitignore`

### Testing Locally

(Note: Requires Wrangler CLI for Cloudflare Pages Functions)

```bash
# Install wrangler globally
npm install -g wrangler

# Run Pages Functions locally
wrangler pages dev --local
```

Endpoint available at: `http://localhost:8788/api/delete-student`

### API Usage

**Request**:
```bash
curl -X POST http://localhost:8788/api/delete-student \
  -H "Authorization: Bearer FIREBASE_ID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"studentUid":"TARGET_UID"}'
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "Student account UID deleted successfully",
  "deleted": {
    "userDoc": true,
    "attempts": 5,
    "activityLogs": 12,
    "authAccount": true
  }
}
```

**Response (Error)**:
```json
{
  "error": "Only admins can delete student accounts",
  "code": "PERMISSION_DENIED"
}
```

### Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| METHOD_NOT_ALLOWED | 405 | Only POST allowed |
| INVALID_CONTENT_TYPE | 400 | Must be application/json |
| UNAUTHORIZED | 401 | Missing or invalid auth header |
| INVALID_TOKEN | 401 | Token verification failed |
| PERMISSION_DENIED | 403 | Not admin or target is admin |
| INVALID_UID | 400 | studentUid missing/empty |
| CANNOT_DELETE_SELF | 400 | Admin tried to delete own account |
| PROTECTED_ACCOUNT | 400 | Target is protected admin |
| NOT_FOUND | 404 | Student account not found |
| INVALID_TARGET | 400 | Target is not a student (role != "siswa") |
| PARTIAL_FAILURE | 500 | Firestore deletion failed |
| PARTIAL_FAILURE_AUTH | 500 | Auth deletion failed after Firestore |
| SERVER_ERROR | 500 | Configuration or internal error |

### Production Deployment

1. **Set Cloudflare Secret**
   ```bash
   wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY
   # Paste entire serviceAccountKey.json when prompted
   ```

2. **Deploy**
   ```bash
   npm run build
   # Deploy to Cloudflare Pages
   ```

3. **Verify**
   - Test endpoint from production domain
   - Monitor error logs in Cloudflare Dashboard

### Security Checklist

- [ ] Service Account Key secured as Cloudflare Secret
- [ ] `.dev.vars` and `.dev.vars.*` in `.gitignore`
- [ ] Firebase Security Rules allow admin delete on users collection
- [ ] JWT verification working (token signature validated)
- [ ] Admin role check enforced
- [ ] Protected admin UID cannot be deleted
- [ ] Audit logs created for all deletions
- [ ] No secrets logged to console
- [ ] No credentials in code or bundle

### Known Limitations

- Batch query returns max 1000 docs (Firestore limit)
- If student has > 1000 attempts or logs, deletion will be incomplete
  - Return `BATCH_TOO_LARGE` error
  - Admin must delete in multiple requests or use manual script
- Token verification cached for 1 hour (public keys)

### Troubleshooting

**"Token verification failed"**
- Token expired or tampered with
- Check token is valid Firebase ID Token from correct project

**"Service account key not configured"**
- FIREBASE_SERVICE_ACCOUNT_KEY environment variable not set
- Check Cloudflare Secrets or `.dev.vars`

**"Student account not found"**
- Target UID not in Firestore users collection
- Check UID is correct

**"Partial deletion" errors**
- Some documents deleted but not all
- Check Firestore and Auth are accessible
- Retry or contact admin for manual verification

---

**Last Updated**: 2026-11-16
