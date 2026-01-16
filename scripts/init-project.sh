#!/bin/bash

# ============================================================================
# web-dev-team Hub - Project Initialization Script
# ============================================================================
# This script automates the creation of a new project from the Hub repo.
# It creates a new GitHub repo, detaches from Hub, and prepares for Site Kickoff.
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print functions
print_header() {
    echo ""
    echo -e "${BLUE}============================================================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}============================================================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_info() {
    echo -e "${BLUE}→ $1${NC}"
}

# ============================================================================
# Pre-flight Checks
# ============================================================================

print_header "web-dev-team Hub - Project Initialization"

echo "This script will:"
echo "  1. Create a new GitHub repository"
echo "  2. Remove Hub's git history"
echo "  3. Initialize fresh git repository"
echo "  4. Push to new repository"
echo "  5. Prepare for Site Kickoff"
echo ""

# Check for GitHub CLI
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) is not installed."
    echo "Please install it: https://cli.github.com/"
    exit 1
fi
print_success "GitHub CLI found"

# Check GitHub authentication
if ! gh auth status &> /dev/null; then
    print_error "GitHub CLI is not authenticated."
    echo "Please run: gh auth login"
    exit 1
fi
print_success "GitHub CLI authenticated"

# Check for git
if ! command -v git &> /dev/null; then
    print_error "Git is not installed."
    exit 1
fi
print_success "Git found"

# ============================================================================
# Gather Project Information
# ============================================================================

print_header "Project Information"

# Project name
read -p "Enter project name (e.g., acme-plumbing-website): " PROJECT_NAME

if [[ -z "$PROJECT_NAME" ]]; then
    print_error "Project name is required"
    exit 1
fi

# Validate project name (lowercase, hyphens only)
if [[ ! "$PROJECT_NAME" =~ ^[a-z0-9-]+$ ]]; then
    print_error "Project name must be lowercase with hyphens only"
    exit 1
fi

print_success "Project name: $PROJECT_NAME"

# Repository visibility
echo ""
echo "Repository visibility:"
echo "  1. Private (recommended)"
echo "  2. Public"
read -p "Select (1 or 2): " VISIBILITY_CHOICE

case $VISIBILITY_CHOICE in
    1)
        VISIBILITY="--private"
        print_success "Visibility: Private"
        ;;
    2)
        VISIBILITY="--public"
        print_success "Visibility: Public"
        ;;
    *)
        VISIBILITY="--private"
        print_warning "Invalid choice, defaulting to Private"
        ;;
esac

# Organization (optional)
echo ""
read -p "GitHub organization (leave blank for personal account): " ORG_NAME

if [[ -n "$ORG_NAME" ]]; then
    REPO_PATH="$ORG_NAME/$PROJECT_NAME"
    print_success "Repository: $REPO_PATH"
else
    REPO_PATH="$PROJECT_NAME"
    print_success "Repository: $PROJECT_NAME (personal account)"
fi

# Confirmation
echo ""
print_warning "Ready to create repository?"
echo "  Name: $PROJECT_NAME"
echo "  Path: $REPO_PATH"
echo "  Visibility: $(echo $VISIBILITY | sed 's/--//')"
echo ""
read -p "Continue? (y/n): " CONFIRM

if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
    print_info "Aborted"
    exit 0
fi

# ============================================================================
# Create GitHub Repository
# ============================================================================

print_header "Creating GitHub Repository"

print_info "Creating repository: $REPO_PATH"

if gh repo create "$REPO_PATH" $VISIBILITY --description "Website project created from web-dev-team Hub"; then
    print_success "Repository created successfully"
else
    print_error "Failed to create repository"
    exit 1
fi

# Get the full repository URL
if [[ -n "$ORG_NAME" ]]; then
    REPO_URL="https://github.com/$ORG_NAME/$PROJECT_NAME.git"
else
    GITHUB_USER=$(gh api user --jq '.login')
    REPO_URL="https://github.com/$GITHUB_USER/$PROJECT_NAME.git"
fi

print_success "Repository URL: $REPO_URL"

# ============================================================================
# Initialize Git
# ============================================================================

print_header "Initializing Git Repository"

# Remove Hub's git history
print_info "Removing Hub's git history..."
rm -rf .git
print_success "Hub git history removed"

# Initialize fresh git
print_info "Initializing fresh git repository..."
git init
print_success "Git initialized"

# Add all files
print_info "Adding files..."
git add .
print_success "Files added"

# Initial commit
print_info "Creating initial commit..."
git commit -m "Initial commit from web-dev-team Hub

Project: $PROJECT_NAME
Created: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Source: web-dev-team Hub"
print_success "Initial commit created"

# Add remote
print_info "Adding remote origin..."
git remote add origin "$REPO_URL"
print_success "Remote added"

# Push to main
print_info "Pushing to main branch..."
git branch -M main
git push -u origin main
print_success "Pushed to main"

# ============================================================================
# Update Project Files
# ============================================================================

print_header "Updating Project Files"

# Update project-profile.json with project name
if [[ -f "templates/project-profile.json" ]]; then
    print_info "Copying project-profile.json template..."
    cp templates/project-profile.json project-profile.json
    # Update project name in the file (basic sed replacement)
    sed -i.bak "s/\"projectName\": \"\"/\"projectName\": \"$PROJECT_NAME\"/" project-profile.json
    rm -f project-profile.json.bak
    print_success "project-profile.json created"
fi

# Create constraints.md from template
if [[ -f "templates/constraints.md" ]]; then
    print_info "Copying constraints.md template..."
    cp templates/constraints.md constraints.md
    sed -i.bak "s/\[PROJECT_NAME\]/$PROJECT_NAME/g" constraints.md
    sed -i.bak "s/\[DATE\]/$(date +%Y-%m-%d)/g" constraints.md
    rm -f constraints.md.bak
    print_success "constraints.md created"
fi

# ============================================================================
# Summary
# ============================================================================

print_header "Setup Complete!"

echo "Repository created and initialized successfully."
echo ""
echo "Repository URL: $REPO_URL"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo ""
echo "  1. Link Vercel project:"
echo "     - Go to vercel.com/new"
echo "     - Import $REPO_PATH"
echo "     - Configure build settings"
echo ""
echo "  2. Configure environment variables:"
echo "     - Copy .env.example to .env.local"
echo "     - Fill in all required values"
echo "     - Add same values to Vercel"
echo ""
echo "  3. Run Site Kickoff:"
echo "     - Open project-profile.json"
echo "     - Complete all required fields"
echo "     - Confirm LLM assignments"
echo ""
echo -e "${YELLOW}Remember:${NC}"
echo "  - This repo is now SEPARATE from the Hub"
echo "  - Never deploy the Hub repo directly"
echo "  - Complete Site Kickoff before any agent work"
echo ""
print_success "Happy building! 🚀"
