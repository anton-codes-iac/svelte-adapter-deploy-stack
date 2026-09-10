import nodeAdapter from '@sveltejs/adapter-node';
import { spawn } from 'child_process';

/**
 * A SvelteKit adapter that builds a Node server and automatically 
 * scaffolds AWS Fargate infrastructure via deploy-stack.
 */
export default function deployStackAdapter(options = {}) {
    // Initialize the official SvelteKit Node adapter
    const baseAdapter = nodeAdapter({
        out: options.out || 'build',
        precompress: options.precompress || false,
        envPrefix: options.envPrefix || ''
    });

    return {
        name: 'svelte-adapter-deploy-stack',

        async adapt(builder) {
            // Let the official adapter compile the Node.js server first
            await baseAdapter.adapt(builder);

            // BYPASS: If we are inside the Docker CI/CD build, stop here.
            if (process.env.DEPLOY_STACK_BYPASS === 'true') {
                console.log(`\n☁️  [svelte-adapter-deploy-stack] CI/CD environment detected. Bypassing infrastructure generation.`);
                return;
            }

            console.log(`\n☁️  [svelte-adapter-deploy-stack] Node build complete. Preparing AWS architecture...`);

            const root = process.cwd();

            // Prepare the headless arguments for deploy-stack
            const args = [
                '--yes',
                'deploy-stack',
                '--headless',
                '--framework=svelte',
                `--port=${options.port || 3000}`
            ];

            // Map dynamic deploy-stack options
            const ignoredOptions = ['out', 'precompress', 'envPrefix', 'port'];
            for (const [key, value] of Object.entries(options)) {
                if (ignoredOptions.includes(key)) continue;

                if (typeof value === 'boolean') {
                    if (value) args.push(`--${key}`);
                } else if (value) {
                    args.push(`--${key}=${value}`);
                }
            }

            const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';

            return new Promise((resolve, reject) => {
                const child = spawn(command, args, {
                    cwd: root,
                    stdio: 'inherit',
                    shell: false
                });

                child.on('close', (code) => {
                    if (code !== 0) {
                        console.error(`\n❌ [svelte-adapter-deploy-stack] Infrastructure generation failed.`);
                        reject(new Error(`deploy-stack exited with code ${code}`));
                    } else {
                        console.log(`\n✅ [svelte-adapter-deploy-stack] AWS Infrastructure generated successfully!`);
                        resolve();
                    }
                });
            });
        }
    };
}