# Tel Interceptor for Dynamics

## Overview

The **Telepone Interceptor for Dynamics** is a browser extension for Microsoft Edge and Google Chrome that intercepts telephone (`tel:`) hyperlink clicks within **Microsoft Dynamics 365 Contact Center** and redirects them to the embedded **Contact Center softphone**.

The extension provides:

- Localised user feedback
- Phone number validation
- Seamless softphone integration
- Intelligent Dynamics application detection
- Secure, browser-based processing

---

# Architecture

## Component Structure

The extension follows a **multi-layered architecture** consisting of four primary components.

### 1. Manifest Configuration (`manifest.json`)

**Purpose:** Defines extension metadata, permissions and resource declarations.

#### Key Features

- Content script injection across `dynamics.com` URLs
- Web-accessible resources for Dynamics domains
- Background service worker processing
- Required permissions for tabs and scripting

---

### 2. Background Service Worker (`background.js`)

**Purpose:** Handles cross-tab communication and message routing.

#### Responsibilities

- Listens for dial requests from content scripts
- Queries open browser tabs for Dynamics instances
- Broadcasts dial requests to appropriate Dynamics tabs

---

### 3. Content Script (`content.js`)

**Purpose:** Primary entry point for intercepting `tel:` hyperlinks.

#### Responsibilities

- Detects supported Dynamics pages
- Intercepts `tel:` hyperlink click events
- Injects the Dynamics listener script
- Routes messages between the browser extension and Dynamics page context

> **Note:** The extension only activates for the **Customer Service Workspace** application. All other sites continue to use their default browser behaviour. This configured in the content.js file.

---

### 4. Dynamics Listener (`dynamics-listener.js`)

**Purpose:** Implements Dynamics-specific dialling functionality.

#### Core Functions

- Phone number validation and formatting
- Dynamics XRM API integration
- Localised user interface dialogs
- Contact Center softphone integration

---

# Data Flows

## 1. Initialisation Flow

```text
Page Load
    ↓
Content Script Injection
    ↓
Dynamics Page Detection
    ↓
Dynamics Listener Injection
```

### Process

1. The content script loads according to the manifest configuration.
2. `isDynamicsPage()` validates the current URL.
3. If the page is recognised as a supported Dynamics page:
   - `dynamics-listener.js` is injected.
   - Event listeners are registered.
4. The listener becomes available to process dial requests.

---

## 2. Telephone Link Interception Flow

```text
Tel Link Click
     ↓
Event Capture
     ↓
Validation
     ↓
Background Message
     ↓
Tab Broadcast
     ↓
Dial Action
```

### Process

1. A user clicks a `tel:` hyperlink.
2. The content script captures the click event.
3. Dynamics page validation is performed.
4. If validation succeeds:
   - Default browser behaviour is prevented.
   - The phone number is extracted.
   - The number is sent to the background service worker.
5. The background service broadcasts the message to active Dynamics tabs.
6. The Dynamics listener processes the dial request.

---

## 3. Phone Number Processing Flow

```text
Number Received
      ↓
Dialler Validation
      ↓
Number Validation
      ↓
Dial or Display Error
```

### Process

1. The listener receives the dial request.
2. `shouldEnableDialer()` validates the Dynamics environment.
3. `isValidPhoneNumber()` validates the phone number format.
4. One of two outcomes occurs:

#### Valid Number

A custom `onclicktoact` event is raised, triggering the Contact Center softphone.

#### Invalid Number

A localised error message is displayed to the user.

---

# Key Mechanisms

## Phone Number Validation

The extension implements strict international phone number validation based on the **ITU-T E.164** standard.

### Validation Rules

- Must begin with `+`
- Must contain digits only after the `+`
- Length must be between **7 and 15 digits**
- No spaces permitted
- No hyphens permitted
- No special characters permitted

### Examples

✅ Valid

```text
+441234567890
+33123456789
+491234567890
```

❌ Invalid

```text
0123456789
+44 1234 567890
+44-1234-567890
abc123
```

---

## Dynamics 365 Integration

The extension integrates with Dynamics 365 using several platform APIs and mechanisms.

### XRM Utility API

Used to access:

- User context
- User settings
- Language settings

### Multi-Session Validation

Checks that the user is operating within the correct Dynamics workspace context.

### Custom Event Dispatch

Triggers the Contact Center softphone using a custom:

```javascript
onclicktoact
```

event.

---

# Localisation

The extension supports automatic localisation based on:

```javascript
userSettings.languageId
```

from the Dynamics user profile.

## Supported Languages

| Language | LCID |
| --- | --- |
| English | 1033 |
| German | 1031 |
| French | 1036 |
| Italian | 1040 |
| Norwegian (Bokmål) | 1044 |
| Hungarian | 1038 |
| Spanish | 1034 |

If a translation is unavailable, the extension automatically falls back to **English**.

---

# Error Handling & User Feedback

The extension includes comprehensive error handling.

## Invalid Numbers

A localised modal dialog informs the user that the number cannot be dialled.

## Missing Dynamics APIs

Graceful degradation occurs, with diagnostic information written to the browser console.

## Runtime Errors

Errors can be surfaced using available Dynamics XRM reporting mechanisms.

## Automatic Dialog Dismissal

Error dialogs automatically close after **3 seconds**.

---

# Security Considerations

## Content Security Policy (CSP)

The extension adheres to browser security standards:

- No use of `eval()`
- No unsafe JavaScript execution
- Resources scoped to Dynamics domains only
- Inline styles used only where necessary for injected UI components

---

## Permission Model

### Minimal Permissions

Only the following permissions are requested:

- Tabs
- Scripting

### Restricted Domain Scope

Web-accessible resources are limited to:

```text
*.dynamics.com
```

### No Broad Host Access

The extension does not require broad host permissions.

---

## Data Privacy

The extension is designed with privacy in mind.

### Data Processing

- No external API calls
- No outbound data transmission
- No persistent storage of user information
- Processing occurs entirely within the browser session

---

# Performance Characteristics

| Area | Behaviour |
| --- | --- |
| Memory Usage | Minimal, active only on Dynamics pages |
| CPU Usage | Event-driven, no polling |
| Network Usage | No external network requests |
| Load Time | Immediate activation with negligible overhead |

---

# Installation & Deployment

## Development Setup

1. Clone the repository locally.
2. Enable **Developer Mode** in Edge or Chrome.
3. Load the extension as an **Unpacked Extension**.
4. Navigate to a Dynamics 365 environment for testing.

---

## Production Deployment

1. Package the extension into a `.crx` file.
2. Publish via:
   - Chrome Web Store
   - Microsoft Edge enterprise distribution
   - Internal organisational deployment mechanisms
3. Apply organisational policies where required.

---

# Deployment Strategy

## Packaging

A packaged `.crx` file is created via:

**Edge Browser → Manage Extensions → Pack Extension**

> Ensure **Developer Mode** is enabled.

For subsequent releases:

1. Reuse the existing `.pem` signing certificate.
2. Increment the version number in `manifest.json`.
3. Repackage the extension.

---

## Update Manifest (`updates.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<gupdate xmlns="http://www.google.com/update2/response"
         protocol="2.0">
    <app appid="<appid from extension>">
        <updatecheck
            codebase="https://<orgurl>/<folder>/TelIntercept.crx"
            version="1.2" />
    </app>
</gupdate>
```

---

# User Guide & Support

## Extension Status Indicator

### Unsupported Pages

When the active page URL does **not** contain:

```text
dynamics.com
```

the extension icon appears **greyed out**.

---

### Supported Dynamics Pages

When browsing a supported Dynamics page, the extension icon turns **pink**.

<img width="50" height="50" alt="image" src="https://github.com/user-attachments/assets/29fc6a16-0035-484c-9843-e4f8d240ba0b" />

---

## How the Extension Works

The extension activates only when a hyperlink beginning with:

```text
tel:
```

is clicked.

### Validation Logic

The extension checks that the current URL contains the **Customer Service Workspace Application ID** (set this in the content.js file):

```text
appid=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxx
```

### If the Application ID Matches

The extension will:

1. Prevent the browser's default dial action.
2. Stop redirection to the default calling application (typically Microsoft Teams or other dialling app).
3. Redirect the call to the embedded Contact Center softphone.
4. Automatically populate the destination telephone number.

### If the Application ID Does Not Match

The extension takes **no action**.

The browser's default behaviour will continue, typically resulting in Microsoft Teams being launched to place the call.

---

# Summary

The **Tel Interceptor for Dynamics** provides a secure, lightweight and highly scalable method of intercepting telephone hyperlinks within **Dynamics 365 Contact Center** and redirecting them to the embedded softphone experience.

By combining:

- **Strict phone number validation**
- **Localised user experiences**
- **Minimal permissions**
- **Enterprise deployment support**
- **Zero external data transmission**

the solution delivers a robust telephony experience while maintaining the security, privacy and performance standards expected in enterprise environments.
