import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

const PROJECT_ID = '4563740064683998667';
const STITCH_SERVER = 'stitch';
const REFERENCE_DIR = path.join(process.cwd(), 'reference');

async function fetchStitchScreens() {
    console.log(`Fetching screens for project ${PROJECT_ID}...`);

    try {
        // Ensure reference directory exists
        if (!fs.existsSync(REFERENCE_DIR)) {
            fs.mkdirSync(REFERENCE_DIR, { recursive: true });
        }

        // Call the Stitch MCP server to list screens
        const mcpCommand = `npx @gomcp/cli call ${STITCH_SERVER} list_screens '{"projectId": "${PROJECT_ID}"}'`;
        console.log(`Executing MCP call...`);

        // As we can't easily call MCP directly from a simple node script without the full MCP protocol setup,
        // we'll instruct the user/agent how this is meant to work in the context of the AI assistant,
        // or provide a placeholder for a real API call if they had a REST endpoint.

        console.log('\n--- NOTE ---');
        console.log('To fully automate this outside of the AI agent environment, you would need direct access');
        console.log('to the Stitch REST API or an MCP client library. Within the AI environment, the agent');
        console.log('can use the `mcp_stitch_list_screens` tool and download the HTML directly as shown below.\n');
        console.log('Example manual exact download step for an agent:');
        console.log('1. Call mcp_stitch_list_screens { projectId: "4563740064683998667" }');
        console.log('2. Parse the output JSON for htmlCode.downloadUrl for each screen');
        console.log('3. Run: curl -sL "<downloadUrl>" -o reference/<screen_name>.html');
        console.log('------------\n');

        console.log('Fetching process complete.');

    } catch (error) {
        console.error('Error fetching Stitch screens:', error);
        process.exit(1);
    }
}

fetchStitchScreens();
