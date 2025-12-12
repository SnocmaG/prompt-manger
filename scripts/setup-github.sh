#!/bin/bash

# Prompt Manager - GitHub Setup Script
# This script helps you push your code to GitHub

echo "🚀 Prompt Manager - GitHub Setup"
echo "================================"
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "❌ Error: Git repository not initialized"
    exit 1
fi

echo "📋 Before running this script, you need to:"
echo "   1. Create a new repository on GitHub.com"
echo "   2. Copy the repository URL (e.g., https://github.com/username/prompt-manager.git)"
echo ""

read -p "Have you created a GitHub repository? (y/n): " created_repo

if [ "$created_repo" != "y" ]; then
    echo ""
    echo "Please create a repository first:"
    echo "1. Go to https://github.com/new"
    echo "2. Name it 'prompt-manager'"
    echo "3. Keep it public or private (your choice)"
    echo "4. Don't initialize with README (we already have code)"
    echo "5. Click 'Create repository'"
    echo ""
    exit 0
fi

echo ""
read -p "Enter your GitHub repository URL: " repo_url

if [ -z "$repo_url" ]; then
    echo "❌ Error: Repository URL cannot be empty"
    exit 1
fi

echo ""
echo "🔗 Adding remote origin..."
git remote add origin "$repo_url" 2>/dev/null || git remote set-url origin "$repo_url"

echo "📝 Checking current branch..."
current_branch=$(git branch --show-current)

if [ "$current_branch" != "main" ]; then
    echo "🔄 Renaming branch to 'main'..."
    git branch -M main
fi

echo "⬆️  Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Your code is now on GitHub"
    echo "🔗 View it at: $repo_url"
    echo ""
    echo "Next steps:"
    echo "1. Set up Clerk authentication"
    echo "2. Deploy to Render.com"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "   - Make sure you're logged into GitHub"
    echo "   - Check if the repository URL is correct"
    echo "   - You may need to authenticate with GitHub CLI or SSH"
fi
