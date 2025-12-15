---
modified: 2025-12-14T18:41:36.198Z
title: 🚀 Azure FREE Tier Deployment Guide
---

# 🚀 Azure FREE Tier Deployment Guide

Deploy AI Recruitment Agent to Azure for **FREE** using Azure App Service F1 tier.

---

## 📋 Prerequisites Checklist

- [x] Azure CLI installed (v2.80.0 ✓)
- [x] Azure subscription (Microsoft Azure Sponsorship ✓)
- [x] Logged in to Azure CLI ✓
- [ ] Environment variables ready (see Step 4)

---

## 🎯 Deployment Options

| Feature | App Service (F1 FREE) | Static Web Apps (FREE) |
|---------|----------------------|------------------------|
| **Cost** | FREE forever | FREE forever |
| **Next.js SSR** | ✅ Full support | ⚠️ Limited |
| **Server APIs** | ✅ Full Node.js | ✅ Azure Functions |
| **RAM** | 1 GB | Serverless |
| **CPU** | 60 min/day | Serverless |
| **Custom Domain** | ✅ Yes | ✅ Yes |
| **SSL** | ✅ Free | ✅ Free |

**Recommendation: Azure App Service (F1)** - Full Next.js SSR support for this app.

---

## 🔧 Step-by-Step Deployment

### Step 1: Login to Azure (if not already)

```powershell
az login
```

Verify login:
```powershell
az account show --query "[name, id]" -o tsv
```

---

### Step 2: Create Azure Resources

Open PowerShell and run these commands:

```powershell
# Set variables
$resourceGroup = "ai-recruitment-rg"
$location = "eastus"
$appServicePlan = "ai-recruitment-plan-free"
$webAppName = "talentai-recruitment"  # Change this to be unique!

# 2.1: Create Resource Group
Write-Host "Creating Resource Group..." -ForegroundColor Green
az group create --name $resourceGroup --location $location

# 2.2: Create App Service Plan (FREE F1 tier)
Write-Host "Creating FREE App Service Plan..." -ForegroundColor Green
az appservice plan create `
  --name $appServicePlan `
  --resource-group $resourceGroup `
  --sku F1 `
  --is-linux

# 2.3: Create Web App
Write-Host "Creating Web App..." -ForegroundColor Green
az webapp create `
  --resource-group $resourceGroup `
  --plan $appServicePlan `
  --name $webAppName `
  --runtime "NODE:20-lts"

Write-Host "✅ Web App created at: https://$webAppName.azurewebsites.net" -ForegroundColor Cyan
```

⚠️ **Important:** Replace `talentai-recruitment` with a unique name (Azure requires globally unique URLs).

---

### Step 3: Configure Deployment Source

**Option A: GitHub Actions (Recommended)**

```powershell
$resourceGroup = "ai-recruitment-rg"
$webAppName = "talentai-recruitment"

# Configure for GitHub Actions deployment
az webapp deployment source config-local-git `
  --resource-group $resourceGroup `
  --name $webAppName

# Get deployment credentials
az webapp deployment list-publishing-credentials `
  --resource-group $resourceGroup `
  --name $webAppName `
  --query "[publishingUserName, publishingPassword]" -o tsv
```

**Option B: Direct ZIP Deploy**

```powershell
# Build the app first
npm run build

# Create deployment package
Compress-Archive -Path ".next", "public", "package.json", "next.config.mjs" -DestinationPath "deploy.zip" -Force

# Deploy
az webapp deployment source config-zip `
  --resource-group $resourceGroup `
  --name $webAppName `
  --src "deploy.zip"
```

---

### Step 4: Configure Environment Variables

Get your values from `.env.local` and set them in Azure:

```powershell
$resourceGroup = "ai-recruitment-rg"
$webAppName = "talentai-recruitment"

az webapp config appsettings set `
  --resource-group $resourceGroup `
  --name $webAppName `
  --settings `
    NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL" `
    NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY" `
    NEXT_PUBLIC_USERS_TABLE_NAME="users" `
    NEXT_PUBLIC_INTERVIEWS_TABLE_NAME="interviews" `
    NEXT_PUBLIC_INTERVIEW_RESULTS_TABLE_NAME="interview_results" `
    NEXT_PUBLIC_HOST_URL="https://$webAppName.azurewebsites.net" `
    OPENROUTER_API_KEY="YOUR_OPENROUTER_KEY" `
    VAPI_API_KEY="YOUR_VAPI_KEY" `
    GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID" `
    GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_SECRET" `
    NEXT_PUBLIC_AUTH_REDIRECT_URL="https://$webAppName.azurewebsites.net/auth/callback" `
    SCM_DO_BUILD_DURING_DEPLOYMENT="true" `
    WEBSITE_NODE_DEFAULT_VERSION="20-lts"
```

---

### Step 5: Update Supabase Auth Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project → **Authentication** → **URL Configuration**
3. Add your Azure URL to:
   - **Site URL**: `https://YOUR-APP-NAME.azurewebsites.net`
   - **Redirect URLs**: `https://YOUR-APP-NAME.azurewebsites.net/auth/callback`

---

### Step 6: Deploy Using GitHub Actions

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure App Service

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          NEXT_PUBLIC_USERS_TABLE_NAME: users
          NEXT_PUBLIC_INTERVIEWS_TABLE_NAME: interviews
          NEXT_PUBLIC_INTERVIEW_RESULTS_TABLE_NAME: interview_results
          NEXT_PUBLIC_HOST_URL: ${{ secrets.NEXT_PUBLIC_HOST_URL }}
      
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v3
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: .

```

**Add GitHub Secrets:**
1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**
2. Add these secrets:
   - `AZURE_WEBAPP_NAME`: Your web app name
   - `AZURE_WEBAPP_PUBLISH_PROFILE`: Get from Azure Portal → Your App → Download publish profile
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
   - `NEXT_PUBLIC_HOST_URL`: `https://YOUR-APP-NAME.azurewebsites.net`

---

## 🔍 Verify Deployment

1. Open your browser and go to: `https://YOUR-APP-NAME.azurewebsites.net`
2. Check logs if issues:

```powershell
az webapp log tail --resource-group ai-recruitment-rg --name YOUR-APP-NAME
```

---

## ⚠️ FREE Tier Limitations

| Limit | Value |
|-------|-------|
| CPU time | 60 minutes/day |
| Memory | 1 GB RAM |
| Storage | 1 GB |
| Custom domains | 1 |
| Auto-scale | ❌ Not available |
| Always On | ❌ Not available (app sleeps after 20 min idle) |

**For production use**, consider upgrading to **B1 Basic** (~$13/month) for:
- No CPU limits
- Always On feature
- Better performance

---

## 🧹 Cleanup (if needed)

Delete all resources:
```powershell
az group delete --name ai-recruitment-rg --yes --no-wait
```

---

## 📞 Quick Commands Reference

```powershell
# View app logs
az webapp log tail --resource-group ai-recruitment-rg --name YOUR-APP-NAME

# Restart app
az webapp restart --resource-group ai-recruitment-rg --name YOUR-APP-NAME

# View app settings
az webapp config appsettings list --resource-group ai-recruitment-rg --name YOUR-APP-NAME -o table

# Scale up (when needed)
az appservice plan update --name ai-recruitment-plan-free --resource-group ai-recruitment-rg --sku B1
```

---

## ✅ Deployment Complete!

Your AI Recruitment Agent is now live at:
**https://YOUR-APP-NAME.azurewebsites.net**

