#!/bin/bash

# Install git hooks for 4Tango
# Usage: ./scripts/install-hooks.sh

set -e

HOOKS_DIR=".git/hooks"

echo "Installing git hooks..."

# Create pre-push hook
cat > "$HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash

# 4Tango Pre-push Hook
# Runs checks before pushing to main branch

BRANCH=$(git branch --show-current)
REMOTE="$1"

# Only run checks when pushing to main
if [ "$BRANCH" = "main" ]; then
    echo ""
    echo "🔍 Running pre-push checks for main branch..."
    echo ""

    # Quick infrastructure check
    if ! npm run infra 2>/dev/null; then
        echo ""
        echo "❌ Infrastructure mismatch detected!"
        echo ""
        echo "Options:"
        echo "  1. Sync infra to prod first:  npm run infra:sync"
        echo "  2. Skip hook (not recommended): git push --no-verify"
        echo ""
        echo "Do you want to sync infrastructure to prod now? (y/N)"
        read -r response < /dev/tty
        if [[ "$response" =~ ^[Yy]$ ]]; then
            echo ""
            echo "Running infrastructure sync..."
            npm run infra:sync
            echo ""
            echo "Re-running infrastructure check..."
            if ! npm run infra 2>/dev/null; then
                echo "❌ Still have differences. Please fix manually."
                exit 1
            fi
        else
            echo "Push aborted. Sync infrastructure first."
            exit 1
        fi
    fi

    # Health check
    if ! npm run status:health 2>/dev/null; then
        echo "⚠️  Health check detected issues. Continue anyway? (y/N)"
        read -r response < /dev/tty
        if [[ ! "$response" =~ ^[Yy]$ ]]; then
            echo "Push aborted."
            exit 1
        fi
    fi

    echo ""
    echo "✅ Pre-push checks passed. Proceeding with push..."
    echo ""
fi

exit 0
EOF

chmod +x "$HOOKS_DIR/pre-push"

echo "✓ Installed pre-push hook"
echo ""
echo "Git hooks installed! The pre-push hook will:"
echo "  - Run infrastructure check before pushing to main"
echo "  - Run health check before pushing to main"
echo ""
echo "To disable: rm .git/hooks/pre-push"
