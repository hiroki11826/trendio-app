# Instagram OAuth Flow - Implementation Summary

## What Was Implemented

### 1. Multi-Step Instagram Connect Page (`/instagram-connect`)

A comprehensive onboarding flow that clearly demonstrates permission usage:

**Step 1: Introduction**
- Explains the 3-step process
- Lists requirements (Business account, Facebook Page, Admin access)
- Shows "Connect with Facebook" button

**Step 2: Facebook OAuth**
- Opens popup with Facebook Login
- Shows permission request screen (forced with `auth_type=rerequest`)
- Requests all necessary permissions explicitly

**Step 3: Page Selection**
- Displays all user's Facebook Pages
- Shows which pages have Instagram accounts linked
- User selects a page

**Step 4: Instagram Confirmation**
- Shows selected Facebook Page
- Shows linked Instagram Business Account
- Lists all granted permissions
- User confirms connection

**Step 5: Completion**
- Success message
- Feature highlights (Analytics, Comments, Trends)
- Navigation to Dashboard or Comments

### 2. Server Endpoints

**GET `/api/instagram/pages`**
- Fetches user's Facebook Pages with Instagram accounts
- Uses `pages_show_list` permission
- Returns page details and Instagram account info

**POST `/api/instagram/connect`**
- Saves selected page and Instagram account
- Updates Meta connection with page tokens
- Creates/updates Instagram user in database

### 3. Updated OAuth Scopes

The Meta OAuth now explicitly requests:
- `pages_show_list` - List Facebook Pages
- `pages_read_engagement` - Read page engagement
- `pages_read_user_content` - Read page content
- `instagram_basic` - Basic Instagram profile
- `instagram_manage_insights` - Instagram analytics
- `instagram_manage_comments` - Manage comments
- `business_management` - Business account management

### 4. Translations

Added comprehensive translations for the new flow in:
- English (`en/common.ts`)
- Japanese (`ja/common.ts`)

All UI text is properly internationalized.

### 5. Settings Page Update

Updated the Instagram connect button to navigate to the new `/instagram-connect` page instead of opening a popup directly.

## Key Features for Meta App Review

✅ **Explicit Permission Display**: Permission request screen is always shown  
✅ **Page Selection UI**: Users see and select their Facebook Pages  
✅ **Instagram Account Confirmation**: Users explicitly confirm the Instagram account  
✅ **Permission List**: All granted permissions are clearly listed  
✅ **Data Usage Demonstration**: Dashboard and Comments show actual API data  
✅ **End-to-End Flow**: Complete journey from connect to data usage  

## How to Test

1. **Start the application**:
   ```bash
   # Frontend
   cd project-6120693
   npm run dev

   # Backend
   cd server
   npm run dev
   ```

2. **Navigate to Settings**: `http://localhost:5173/settings`

3. **Click "Connect" on Instagram card**

4. **Follow the onboarding flow**:
   - Click "Connect with Facebook"
   - Log in with Facebook
   - Grant permissions (permission screen will appear)
   - Select a Facebook Page
   - Confirm Instagram account
   - View success screen

5. **Verify data usage**:
   - Go to Dashboard - see Instagram analytics
   - Go to Comments - see comments and reply functionality

## For Meta App Review Video

Follow the detailed instructions in [META_APP_REVIEW_GUIDE.md](META_APP_REVIEW_GUIDE.md):

1. Record the complete flow from Settings to Comments
2. Pause on permission screens to show what's being requested
3. Show successful comment reply
4. Demonstrate that data is fetched from Instagram Graph API

## Files Changed

### New Files
- `project-6120693/src/pages/instagram-connect/page.tsx` - Main connect flow
- `META_APP_REVIEW_GUIDE.md` - Comprehensive review guide
- `OAUTH_FLOW_SUMMARY.md` - This file

### Modified Files
- `server/src/server.ts` - Added `/api/instagram/pages` and `/api/instagram/connect` endpoints
- `project-6120693/src/router/config.tsx` - Added `/instagram-connect` route
- `project-6120693/src/pages/settings/page.tsx` - Updated connect button
- `project-6120693/src/i18n/local/en/common.ts` - Added English translations
- `project-6120693/src/i18n/local/ja/common.ts` - Added Japanese translations

## Technical Details

### OAuth Flow Sequence

```
1. User clicks "Connect" in Settings
   ↓
2. Navigate to /instagram-connect
   ↓
3. User clicks "Connect with Facebook"
   ↓
4. Popup opens: /api/auth/meta/login?token=...&locale=...
   ↓
5. Facebook OAuth with auth_type=rerequest
   ↓
6. Callback: /api/auth/meta/callback
   ↓
7. postMessage to parent window
   ↓
8. Frontend fetches pages: GET /api/instagram/pages
   ↓
9. User selects page
   ↓
10. Frontend confirms: POST /api/instagram/connect
    ↓
11. Success screen
    ↓
12. Navigate to Dashboard or Comments
```

### Permission Usage

| Permission | Endpoint | UI Location |
|------------|----------|-------------|
| `pages_show_list` | `/api/instagram/pages` | Page selection screen |
| `instagram_manage_insights` | `/api/dashboard/instagram` | Dashboard analytics |
| `instagram_manage_comments` | `/api/instagram/comments` | Comments page |
| `instagram_manage_comments` | `/api/instagram/comments/:id/reply` | Comment reply |

## Next Steps

1. **Test the flow** with a real Instagram Business account
2. **Record the demo video** following the guide
3. **Submit for App Review** with the video
4. **Monitor review status** and respond to any feedback

## Troubleshooting

If you encounter issues, refer to:
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - General troubleshooting
- [META_APP_REVIEW_GUIDE.md](META_APP_REVIEW_GUIDE.md) - App Review specific issues

Common issues:
- **Permission screen doesn't appear**: Clear cookies and try again
- **No pages found**: Verify Facebook Page is linked to Instagram
- **Comments don't load**: Ensure posts have recent comments (<24h)

## Support

For questions or issues:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [META_APP_REVIEW_GUIDE.md](META_APP_REVIEW_GUIDE.md)
3. Consult [Meta Developer Documentation](https://developers.facebook.com/docs/instagram-api)

---

**Implementation Date**: 2026-05-13  
**Status**: Ready for App Review  
**Version**: 1.0.0
