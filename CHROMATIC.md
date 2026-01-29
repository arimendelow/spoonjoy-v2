# Chromatic Visual Regression Testing

Chromatic is configured for visual regression testing of Storybook components.

## Setup Required

To complete the Chromatic setup, you need to:

### 1. Create a Chromatic Account

1. Go to [chromatic.com](https://www.chromatic.com/)
2. Sign up with your GitHub account
3. This links Chromatic to your GitHub for PR integration

### 2. Link This Project

1. In the Chromatic dashboard, click "Add project"
2. Select the `spoonjoy-v2` repository from GitHub
3. Chromatic will provide you with a **project token**

### 3. Store the Project Token

For local development:
```bash
export CHROMATIC_PROJECT_TOKEN=your_token_here
```

For CI/CD (GitHub Actions), add the token as a repository secret:
1. Go to repo Settings > Secrets and variables > Actions
2. Add a new secret named `CHROMATIC_PROJECT_TOKEN`
3. Paste your project token as the value

## Usage

### Running Chromatic Locally

```bash
npm run chromatic
```

This builds Storybook and uploads snapshots to Chromatic for comparison.

### Configuration

The `chromatic.config.json` file contains:

- `buildScriptName`: Uses the existing `build-storybook` script
- `onlyChanged`: Only snapshots stories affected by code changes (faster builds)
- `externals`: Treats `public/` assets as external (avoids false positives from asset changes)
- `skip`: Skips Chromatic on dependabot branches

### CI Integration

Once your token is set up, add this to your GitHub Actions workflow:

```yaml
- name: Run Chromatic
  uses: chromaui/action@latest
  with:
    projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
    exitZeroOnChanges: true
```

## How Visual Testing Works

1. Chromatic captures a snapshot of each story
2. On subsequent runs, it compares new snapshots against baselines
3. Visual differences are flagged for review in the Chromatic UI
4. You approve or reject changes, which updates the baseline

## Useful Links

- [Chromatic Documentation](https://www.chromatic.com/docs/)
- [Storybook Integration Guide](https://www.chromatic.com/docs/storybook/)
- [GitHub Actions Setup](https://www.chromatic.com/docs/github-actions/)
