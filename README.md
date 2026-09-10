# svelte-adapter-deploy-stack (for AWS ECS Fargate) ☁️🚀

> SvelteKit adapter for deploying and managing AWS ECS Fargate infrastructure (Day 1 & Day 2 operations).

This adapter wraps `@sveltejs/adapter-node` to compile your SvelteKit application and automate the provisioning, deployment, and ongoing management of a highly available AWS Fargate architecture.

## Why?
Building the app is only half the battle. This adapter hooks directly into your SvelteKit build process to solve both Day 1 and Day 2 platform engineering challenges natively:
* **Day 1 (Deployment):** Automatically generates optimized Dockerfiles, Fargate Terraform modules, and GitHub Actions CI/CD pipelines natively tailored to your SvelteKit SSR app.
* **Day 2 (Management):** Zero-secret OIDC deployments, Trivy container/IaC vulnerability scanning, ALB health checks, and seamless teardown capabilities.

## Installation

First, remove the default SvelteKit auto-adapter to prevent conflicts, then install our AWS Fargate adapter as a development dependency:

```bash
npm uninstall @sveltejs/adapter-auto
npm install -D svelte-adapter-deploy-stack
```

## Usage

SvelteKit recently updated how adapters are configured. Follow the steps for your specific version.

### For Modern SvelteKit (Svelte 5+ via `sv` CLI)
Update your `vite.config.ts` to swap out the default adapter. Ensure you completely remove the old `@sveltejs/adapter-auto` import!

```typescript
import adapter from 'svelte-adapter-deploy-stack'; // <-- 1. Swap the import
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    sveltekit({
      // 2. Configure our adapter for Day 1 and Day 2 management
      adapter: adapter({
        // Optional: Pass flags to customize your Fargate infrastructure.
        // See full options: [https://github.com/anton-codes-iac/deploy-stack/blob/main/docs/guides/headless.md](https://github.com/anton-codes-iac/deploy-stack/blob/main/docs/guides/headless.md)
        region: 'us-east-2',
        size: 'micro'
      })
    })
  ]
});
```

### For Classic SvelteKit (Svelte 4)
If your project uses a `svelte.config.js` file at the root, update it to use the adapter instead:

```javascript
import adapter from 'svelte-adapter-deploy-stack';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      region: 'us-east-2',
      size: 'micro'
    })
  }
};

export default config;
```

## How it Works
1. **Build:** Run `npm run build`. SvelteKit compiles your SSR frontend.
2. **Generate:** The adapter intercepts the end of the build to safely generate the `terraform/`, `.github/`, and `Dockerfile` inside your project root.
3. **Deploy (Day 1):** Run `npx --yes deploy-stack apply` in your terminal to provision the AWS infrastructure.
4. **Manage (Day 2):** Push to GitHub. The generated CI/CD pipeline will automatically deploy all future changes securely using IAM OIDC (no long-lived AWS keys). 
5. **Teardown:** Run `npx --yes deploy-stack destroy` to completely remove all resources and stop AWS billing.

## 💰 AWS Costs & Disclaimer
**This tool provisions real AWS resources which will incur charges on your AWS bill.** An ECS Fargate cluster with an Application Load Balancer running 24/7 typically costs around ~$15 - $20/month minimum, depending on your region and configuration. 

*Disclaimer: The maintainers are not responsible for any unexpected AWS charges, security breaches, or data loss. Please monitor your AWS Billing Dashboard.*

## License
MIT