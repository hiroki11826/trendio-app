# Meta App Review Guide - Complete OAuth Flow Documentation

This document provides a comprehensive guide for demonstrating the Instagram OAuth flow and permission usage for Meta App Review.

## Table of Contents
1. [OAuth Flow Overview](#oauth-flow-overview)
2. [Step-by-Step User Journey](#step-by-step-user-journey)
3. [Permission Usage Demonstration](#permission-usage-demonstration)
4. [Recording the Demo Video](#recording-the-demo-video)
5. [Troubleshooting](#troubleshooting)

---

## OAuth Flow Overview

Our application implements a **multi-step OAuth flow** that clearly demonstrates permission usage at each stage:

```
User → Settings → Connect Instagram → Facebook Login → 
Select Page → Confirm Instagram Account → Connection Complete → 
Dashboard/Comments (showing data usage)
```

### Key Features for App Review

✅ **Explicit Page Selection**: Users see and select their Facebook Pages  
✅ **Instagram Account Confirmation**: Users explicitly confirm the Instagram account  
✅ **Permission Display**: All granted permissions are clearly listed  
✅ **Data Usage Demonstration**: Dashboard and Comments pages show actual API data  
✅ **Re-authentication Support**: Users can reconnect and update permissions  

---

## Step-by-Step User Journey

### Step 1: Navigate to Settings

**URL**: `/settings`

**What the reviewer sees**:
- Instagram connection card showing "Not Connected" status
- Clear "Connect" button with Instagram branding

**Screenshot points**:
- Highlight the Instagram section
- Show the "Connect" button

---

### Step 2: Instagram Connect Introduction

**URL**: `/instagram-connect`

**What the reviewer sees**:
1. **Welcome screen** with clear title: "Connect Instagram Account"
2. **Three-step process** explained:
   - Step 1: Login with Facebook
   - Step 2: Select Facebook Page
   - Step 3: Confirm Instagram Account
3. **Requirements section** listing:
   - Instagram Business or Creator account
   - Facebook Page linked to Instagram
   - Admin access to the Facebook Page
4. **"Connect with Facebook" button**

**Screenshot points**:
- Full page showing all three steps
- Requirements section
- Connect button

---

### Step 3: Facebook OAuth Dialog

**What happens**:
- Popup window opens with Facebook Login
- User logs in with Facebook credentials
- **Permission request screen appears** showing:
  - `pages_show_list` - Access to Facebook Pages
  - `pages_read_engagement` - Read engagement data
  - `instagram_basic` - Basic Instagram profile info
  - `instagram_manage_insights` - Instagram analytics
  - `instagram_manage_comments` - Manage Instagram comments
  - `business_management` - Business account management

**Screenshot points**:
- Facebook login screen
- **Permission request screen** (CRITICAL - must be visible)
- User clicking "Continue" or "Allow"

**Important**: The OAuth dialog uses `auth_type=rerequest` to ensure the permission screen is always shown, even for returning users.

---

### Step 4: Select Facebook Page

**URL**: `/instagram-connect` (step: select-page)

**What the reviewer sees**:
1. **Page selection screen** with title: "Select Facebook Page"
2. **List of Facebook Pages** the user manages, each showing:
   - Page name
   - Page category
   - Instagram connection status (if linked)
3. **Visual indication** of which pages have Instagram accounts
4. **Click to select** a page

**Screenshot points**:
- Full list of pages
- Highlight Instagram-connected indicator
- User clicking on a page

**API Call**: `GET /api/instagram/pages`
- Fetches user's Facebook Pages
- Shows Instagram Business Account linkage
- Uses `pages_show_list` permission

---

### Step 5: Confirm Instagram Account

**URL**: `/instagram-connect` (step: select-instagram)

**What the reviewer sees**:
1. **Confirmation screen** showing:
   - Selected Facebook Page name and icon
   - Arrow pointing down
   - Linked Instagram Business Account username
2. **Permissions Granted section** listing:
   - View Instagram insights and analytics
   - Read and reply to comments
   - Access follower demographics
   - View post performance data
3. **"Confirm Connection" button**

**Screenshot points**:
- Full confirmation screen
- Permissions list (CRITICAL)
- Both Facebook Page and Instagram account visible

**API Call**: `POST /api/instagram/connect`
- Saves the selected page and Instagram account
- Stores access tokens for API calls

---

### Step 6: Connection Complete

**URL**: `/instagram-connect` (step: complete)

**What the reviewer sees**:
1. **Success message**: "Connection Complete!"
2. **"What you can do now" section** showing:
   - View Analytics (with icon and description)
   - Manage Comments (with icon and description)
   - Discover Trends (with icon and description)
3. **Two action buttons**:
   - "Go to Dashboard"
   - "Manage Comments"

**Screenshot points**:
- Success screen
- Feature list
- Both action buttons

---

### Step 7: Dashboard - Data Usage

**URL**: `/dashboard`

**What the reviewer sees**:
1. **Instagram analytics card** showing:
   - Follower count
   - Profile views
   - Impressions
   - Reach
2. **Charts and graphs**:
   - Follower trend (last 12 weeks)
   - Engagement metrics
   - Gender demographics
   - Regional distribution
3. **"View Details" button** leading to detailed Instagram analytics

**Screenshot points**:
- Full dashboard with Instagram data
- Highlight specific metrics
- Show that data is from Instagram Graph API

**API Calls**:
- `GET /api/dashboard/instagram` - Fetches Instagram insights
- Uses `instagram_manage_insights` permission

---

### Step 8: Comments Management - Permission Usage

**URL**: `/comments`

**What the reviewer sees**:
1. **List of Instagram comments** from recent posts, showing:
   - Commenter username
   - Comment text
   - Timestamp
   - Post thumbnail
2. **Reply functionality**:
   - "Reply" button for each comment
   - Text input for reply
   - "Send" button
3. **AI Reply Suggestions**:
   - "AI Suggest" button
   - Generated reply options
4. **Successful reply** showing:
   - "Replied" badge on comment
   - Reply text displayed under original comment

**Screenshot points**:
- Comment list with multiple comments
- Reply interface
- AI suggestions (if used)
- **Successful reply posted** (CRITICAL)

**API Calls**:
- `GET /api/instagram/comments` - Fetches comments using `instagram_manage_comments`
- `POST /api/instagram/comments/:id/reply` - Posts reply using `instagram_manage_comments`
- `POST /api/instagram/comments/suggest-reply` - AI-generated replies

---

## Permission Usage Demonstration

### Required Permissions and Their Usage

| Permission | Usage in App | API Endpoint | Visible in UI |
|------------|--------------|--------------|---------------|
| `pages_show_list` | List user's Facebook Pages | `/api/instagram/pages` | Page selection screen |
| `pages_read_engagement` | Read page engagement data | `/api/dashboard/instagram` | Dashboard analytics |
| `instagram_basic` | Get Instagram profile info | `/api/dashboard/instagram` | Profile display |
| `instagram_manage_insights` | Fetch Instagram analytics | `/api/dashboard/instagram` | Charts and metrics |
| `instagram_manage_comments` | Read and reply to comments | `/api/instagram/comments` | Comments page |
| `business_management` | Manage business accounts | All Instagram endpoints | Throughout app |

---

## Recording the Demo Video

### Pre-Recording Checklist

- [ ] Test account has Instagram Business account
- [ ] Instagram account is linked to a Facebook Page
- [ ] Test account is admin of the Facebook Page
- [ ] Instagram account has recent posts with comments
- [ ] Clear browser cache and cookies
- [ ] Log out of all Facebook/Instagram accounts
- [ ] Prepare screen recording software (OBS, QuickTime, etc.)

### Recording Steps

1. **Start recording** before opening the app
2. **Navigate to Settings** (`/settings`)
3. **Click "Connect" on Instagram** card
4. **Show introduction screen** - pause for 2-3 seconds
5. **Click "Connect with Facebook"**
6. **Facebook Login** - enter credentials slowly
7. **Permission screen** - **PAUSE HERE** for 5 seconds to show all permissions
8. **Click "Continue"** to grant permissions
9. **Page selection** - show all pages, then select one
10. **Confirmation screen** - **PAUSE HERE** for 3 seconds to show permissions list
11. **Click "Confirm Connection"**
12. **Success screen** - pause for 2 seconds
13. **Click "Go to Dashboard"**
14. **Dashboard** - scroll through Instagram analytics
15. **Navigate to Comments** (`/comments`)
16. **Show comment list** - scroll through comments
17. **Click "Reply" on a comment**
18. **Type a reply** (or use AI Suggest)
19. **Click "Send"**
20. **Show successful reply** - comment should show "Replied" badge
21. **Verify on Instagram** (optional but recommended):
    - Open Instagram app/website
    - Navigate to the post
    - Show that the reply appears on Instagram

### Video Requirements

- **Length**: 3-5 minutes
- **Resolution**: 1080p minimum
- **Format**: MP4, MOV, or WebM
- **Audio**: Optional but recommended for narration
- **Captions**: Recommended for clarity

### Narration Script (Optional)

```
"Hello, I'm demonstrating our Instagram integration for [App Name].

First, I'll navigate to Settings and click Connect on the Instagram card.

Our app shows a clear onboarding flow explaining the three steps:
logging in with Facebook, selecting a Facebook Page, and confirming
the Instagram account.

Now I'll click Connect with Facebook. [Pause]

Here's the Facebook login screen. [Enter credentials]

Now Facebook is showing the permission request. As you can see, we're
requesting permissions for pages_show_list, instagram_manage_comments,
and other necessary permissions. [Pause to show permissions]

I'll click Continue to grant these permissions.

Now our app shows all my Facebook Pages. I can see which ones have
Instagram accounts linked. I'll select this page. [Click page]

The app now shows a confirmation screen with the Facebook Page and
the linked Instagram account. It also clearly lists all the permissions
that were granted. [Pause]

I'll click Confirm Connection.

Great! The connection is complete. The app shows what I can do now:
view analytics, manage comments, and discover trends.

Let me go to the Dashboard. [Click button]

Here you can see Instagram analytics: follower count, profile views,
impressions, and reach. There are also charts showing follower trends
and engagement metrics. All this data comes from the Instagram Graph API.

Now let me navigate to Comments. [Click Comments in sidebar]

Here's a list of recent comments on my Instagram posts. I can see the
commenter's username, their comment, and the post thumbnail.

Let me reply to this comment. [Click Reply]

I'll type a response. [Type reply]

Now I'll send it. [Click Send]

Perfect! The comment now shows a 'Replied' badge, and my reply appears
below the original comment.

This demonstrates that our app successfully uses the instagram_manage_comments
permission to read and reply to Instagram comments.

Thank you for watching this demonstration."
```

---

## Troubleshooting

### Issue: Permission screen doesn't appear

**Solution**: The OAuth URL includes `auth_type=rerequest` which forces the permission screen to appear. If it still doesn't show:
1. Log out of Facebook completely
2. Clear browser cookies for facebook.com
3. Try again

### Issue: No Facebook Pages appear

**Possible causes**:
1. User is not admin of any Facebook Pages
2. Facebook Pages are not linked to Instagram Business accounts
3. API token doesn't have `pages_show_list` permission

**Solution**:
1. Verify user is admin of at least one Facebook Page
2. Link Instagram Business account to Facebook Page
3. Re-authenticate to grant permissions

### Issue: Comments don't load

**Possible causes**:
1. Instagram account has no recent posts
2. Posts have no comments
3. `instagram_manage_comments` permission not granted

**Solution**:
1. Create test posts on Instagram
2. Add test comments (can use another account)
3. Re-authenticate to grant permissions

### Issue: Reply fails to post

**Possible causes**:
1. Comment is too old (>24 hours)
2. Page access token expired
3. Insufficient permissions

**Solution**:
1. Use recent comments (within 24 hours)
2. Reconnect Instagram account
3. Verify `instagram_manage_comments` permission

---

## Additional Resources

- [Meta App Review Documentation](https://developers.facebook.com/docs/app-review)
- [Instagram Graph API Reference](https://developers.facebook.com/docs/instagram-api)
- [Instagram Business Account Setup](https://help.instagram.com/502981923235522)
- [Facebook Page Creation](https://www.facebook.com/pages/creation/)

---

## Checklist for App Review Submission

- [ ] Demo video recorded (3-5 minutes)
- [ ] Video shows complete OAuth flow
- [ ] Permission request screen visible in video
- [ ] Page selection screen shown
- [ ] Instagram account confirmation shown
- [ ] Dashboard with Instagram data shown
- [ ] Comments list shown
- [ ] Comment reply successfully posted
- [ ] Reply visible on Instagram (optional but recommended)
- [ ] App Review form completed
- [ ] Privacy Policy URL provided
- [ ] Terms of Service URL provided
- [ ] Data Deletion Instructions URL provided
- [ ] Test user credentials provided (if required)

---

## Contact

If you have questions about the OAuth flow or App Review process, please refer to:
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- [DEVELOPMENT_GUIDELINES.md](DEVELOPMENT_GUIDELINES.md)
- Meta Developer Support: https://developers.facebook.com/support/

---

**Last Updated**: 2026-05-13  
**Version**: 1.0.0
