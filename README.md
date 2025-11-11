# Azure AI Foundry Agent Service Entra Test Chat

A React + TypeScript Single Page Application (SPA) that connects directly to Azure AI Foundry Agents API using Entra ID authentication. No backend required.

## Try It Now

**Live Demo**: [https://mdspinali.github.io/Azure-AI-Foundry-Agent-Service-Entra-Test-Chat/](https://mdspinali.github.io/Azure-AI-Foundry-Agent-Service-Entra-Test-Chat/)

(Replace with your GitHub Pages URL once deployed)

## Architecture

```
┌─────────────────────┐
│   React SPA         │
│   (Browser)         │
│                     │
│  ┌──────────────┐   │
│  │ MSAL.js      │   │──┐
│  │ (Entra Auth) │   │  │
│  └──────────────┘   │  │
│                     │  │  1. Get Entra Token
│  ┌──────────────┐   │  │     (audience: https://ai.azure.com)
│  │ OpenAI SDK   │   │  │
│  │ (for Azure)  │   │◄─┘
│  └──────────────┘   │
└─────────┬───────────┘
          │
          │ 2. HTTPS + Bearer Token
          │
          ▼
     ┌─────────┐
     │  APIM   │  (Optional)
     │ Gateway │
     └────┬────┘
          │
          │ 3. Proxy to Azure AI Foundry
          │
          ▼
┌─────────────────────┐
│  Azure AI Foundry   │
│  Agents API         │
│                     │
│  - /threads         │
│  - /runs            │
│  - /messages        │
└─────────────────────┘

Note: APIM Gateway is optional. Without it, the SPA 
      connects directly to Azure AI Foundry.
```

### Key Components

- **ConfigProvider**: Manages Azure endpoint, Entra client ID, and settings with localStorage persistence
- **AuthProvider**: Handles Entra ID authentication using MSAL redirect flow
- **ChatProvider**: Integrates OpenAI SDK configured for Azure AI Foundry
- **ChatInterface**: Clean, modern chat UI

## Features

- **No Backend Required** - Direct browser-to-Azure calls
- **Entra ID Authentication** - Token-based auth, no API keys exposed
- **Configurable UI** - All settings adjustable and persisted
- **Assistants API** - Full support for Azure AI Foundry Agents
- **Persistent Config** - Settings survive page refresh
- **Clean UI** - Minimal, modern interface

## Prerequisites

### 1. Azure AI Foundry Project

You must use an Azure AI Foundry **project** (not hub-based projects):

1. Create an AI Foundry project in Azure Portal
2. Deploy or create an Agent
3. Note your **Project Endpoint** - It follows this format:
   ```
   https://YOUR-RESOURCE-NAME.services.ai.azure.com/api/projects/YOUR-PROJECT-NAME
   ```
   Example: `https://my-ai-resource.services.ai.azure.com/api/projects/my-project`
4. Note your **Agent ID** (format: `asst_...`)

### 2. Entra ID App Registration

Create an app registration in Azure Portal:

#### Basic Settings
1. Go to **Azure Portal** → **Entra ID** → **App registrations** → **New registration**
2. **Name**: `Azure AI Chat SPA` (or your choice)
3. **Supported account types**: Single tenant (or as needed)
4. **Redirect URI**: 
   - Platform: **Single-page application (SPA)**
   - URI: `http://localhost:5173` (for development) and your production URL
5. Click **Register**
6. **Copy and save** the following from the Overview page:
   - **Application (client) ID** - You will need this for configuration
   - **Directory (tenant) ID** - You will need this for configuration

#### API Permissions
1. Go to **API permissions** tab
2. Click **Add a permission** → **APIs my organization uses**
3. Search for: **Azure Machine Learning Services**
4. Select **Delegated permissions**
5. Check: **user_impersonation**
6. Click **Add permissions**
7. Click **Grant admin consent** (if you have admin rights)

> **Important**: The scope `https://ai.azure.com/.default` requires the "Azure Machine Learning Services" API permission.

#### Authentication Settings
1. **Authentication** tab → **Single-page application** section
2. Ensure redirect URIs are listed
3. **Implicit grant and hybrid flows**: Leave unchecked (not needed for MSAL.js 2.x)

### 3. Azure AI Foundry IAM

1. Go to your **AI Foundry Project** in Azure Portal
2. **Access Control (IAM)** → **Add role assignment**
3. Role: **Azure AI Developer** or **Azure AI User**
4. Assign to: Your user account or group
5. Save

## Setup & Installation

### 1. Clone and Install

```bash
git clone <your-repo>
cd entra_test_client
npm install
```

### 2. Configure Application

Start the dev server:
```bash
npm run dev
```

Open `http://localhost:5173` (or the port shown in terminal) and click the **Settings** button (gear icon in top-right).

Enter your configuration:

- **Azure AI Foundry Endpoint**: Your project endpoint from Azure Portal
  - Format: `https://YOUR-RESOURCE.services.ai.azure.com/api/projects/YOUR-PROJECT`
  - Example: `https://my-ai-resource.services.ai.azure.com/api/projects/my-project`
- **Entra ID Client ID**: The Application (client) ID you copied earlier
- **Tenant ID**: The Directory (tenant) ID you copied earlier
- **Scopes**: `https://ai.azure.com/.default` (leave as default)
- **Agent ID**: Your AI agent ID from Azure AI Foundry (format: `asst_abc123`)

Click **Save** - your settings will be stored in browser localStorage.

## Using the Application

### First Time Setup

1. Open the application in your browser
2. Click the **Settings** button (gear icon in top-right corner)
3. Enter all required configuration values (see Configuration section above)
4. Click **Save**
5. Click **Sign In**
6. You will be redirected to Microsoft login page
7. Sign in with your Azure account
8. After successful authentication, you'll return to the chat interface

### Chatting with Your Agent

1. Once signed in, you'll see the chat interface
2. Type your message in the input box at the bottom
3. Press **Enter** or click **Send**
4. The agent will process your message and respond
5. Your conversation history is maintained in the current thread

### Settings Management

- Click the **Settings** button anytime to modify configuration
- Your settings persist across browser sessions (stored in localStorage)
- Click **Reset to Defaults** to clear all settings
- After changing settings, you may need to sign in again

### Sign Out

Click the **Sign Out** button in the top-right corner to end your session.

## Configuration Details

### Required Settings

| Setting | Description | Example |
|---------|-------------|---------|
| Azure Endpoint | AI Foundry project API endpoint (full path including /api/projects/) | `https://resource.services.ai.azure.com/api/projects/project-name` |
| Client ID | Entra app registration Application (client) ID | `12345678-1234-1234-1234-123456789abc` |
| Tenant ID | Azure AD Directory (tenant) ID | `87654321-4321-4321-4321-cba987654321` |
| Scopes | OAuth scope for AI services | `https://ai.azure.com/.default` |
| Agent ID | Your AI agent identifier from Azure AI Foundry | `asst_abc123xyz` |

### Scope Explanation

The scope `https://ai.azure.com/.default` tells MSAL:
- **Resource**: `https://ai.azure.com` (this becomes the `aud` claim in the token)
- **Permissions**: `/.default` requests all delegated permissions granted to the app

This matches Azure AI Foundry's expected token audience.

## Optional: API Management (APIM) Proxy

If you want to use Azure API Management as a proxy (for rate limiting, analytics, etc.), you can configure APIM to sit between your SPA and Azure AI Foundry.

### APIM Setup Steps

1. **Create APIM instance** in Azure Portal
2. **Import API**:
   - Create a new API in APIM
   - Use the OpenAPI spec from `/APIM/openai-spec.yaml` if available, or manually define endpoints
3. **Configure Policy**:
   - Go to your API → **All operations** → **Policies**
   - Edit the inbound policy using `/APIM/api_policies.xml` as a template

### Policy Configuration

The policy template at `/APIM/api_policies.xml` contains placeholders you need to replace:

**Placeholders to replace:**

- `WEB_APP_URL` - Replace with your SPA's URL (e.g., `https://mdspinali.github.io/Azure-AI-Foundry-Agent-Service-Entra-Test-Chat/` or `http://localhost:5173`)
- `TENANT_ID` - Replace with your Azure AD tenant ID
- `<Azure AI Foundry project endpoint>` - Replace with your full project endpoint:
  ```
  https://YOUR-RESOURCE.services.ai.azure.com/api/projects/YOUR-PROJECT
  ```

**Example:**
```xml
<origin>WEB_APP_URL</origin>
```
Replace with:
```xml
<origin>https://mdspinali.github.io/Azure-AI-Foundry-Agent-Service-Entra-Test-Chat/</origin>
```

### Update App Configuration for APIM

If using APIM, update your application's **Azure Endpoint** setting to point to your APIM gateway instead of directly to Azure AI Foundry:

```
https://your-apim-name.azure-api.net/your-api-path
```

The APIM policy will then forward requests to Azure AI Foundry with proper authentication.

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and building
- **@azure/msal-react** & **@azure/msal-browser** for Entra ID authentication
- **openai** SDK (v4+) configured for Azure
- Pure CSS (no UI framework dependencies)

## Security

- **No API keys in code** - Uses Entra ID tokens
- **Token-based authentication** - Tokens auto-refresh
- **No backend required** - Direct secure calls to Azure
- **RBAC controlled** - Access managed via Azure IAM
- **HTTPS only** - All communication encrypted

## Troubleshooting

### "Unauthorized. Access token is missing or invalid"

**Solution**:
1. Verify you added **Azure Machine Learning Services** API permission
2. Ensure scope is `https://ai.azure.com/.default`
3. Check you have RBAC role on AI Foundry project
4. Try signing out and back in to get a fresh token

### "Agent ID Required"

**Solution**: Configure your Agent ID in Settings. Get it from AI Foundry portal under your agent details.

### Sign-in redirect loop

**Solution**:
1. Verify redirect URI in Entra app registration matches your app URL exactly
2. Check browser console for MSAL errors
3. Clear localStorage and try again

### CORS errors

**Solution**: Azure AI Foundry supports CORS by default. If using APIM, ensure CORS policy is configured.

## Production Deployment

1. **Build the app**: `npm run build`
2. **Deploy `dist/` folder** to your hosting (Azure Static Web Apps, etc.)
3. **Update Entra redirect URI** to production URL
4. **Update settings** in the app UI with production values

### Azure Static Web Apps

```bash
# Install Azure SWA CLI
npm install -g @azure/static-web-apps-cli

# Deploy
swa deploy
```

## License

MIT License - See LICENSE file for details.

## Disclaimer

This project is provided "AS IS" without warranty of any kind, express or implied. This is an independent implementation and is NOT affiliated with, endorsed by, supported by, or in any way officially connected with Microsoft Corporation or any of its subsidiaries or affiliates.

The use of Microsoft Azure services, Azure AI Foundry, and Microsoft Entra ID through this application is subject to Microsoft's terms of service and policies. Users are solely responsible for:

- Compliance with all applicable Microsoft service agreements
- All costs associated with Azure resource usage
- Security and proper configuration of their Azure resources
- Obtaining appropriate licenses and permissions for Microsoft services

Microsoft, Azure, Azure AI Foundry, and Microsoft Entra ID are trademarks of Microsoft Corporation.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**NO SUPPORT**: This project is provided without any support, maintenance, or service level agreements. Use at your own risk.

## Contributing

Issues and PRs welcome!
