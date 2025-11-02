
import { ai } from './client';
import type { AccessMethod } from './analysisAgent';

const STRATEGY_PROMPTS = {
    DIRECT_DOWNLOAD: `
    You are a Data Engineer. A user needs to download a file.
    **Download URL:** {TARGET}
    **Task:** Provide a simple, single-line \`curl\` command to download this file.
    **Output:** Respond with ONLY the curl command inside a \`bash\` code block. Do not add any explanation.
    `,
    API: `
    You are a senior API Developer. A user wants to access data from an API.
    **API Endpoint:** {TARGET}
    **Task:**
    1. Provide a sample JavaScript \`fetch\` request to get data from this endpoint.
    2. Propose a simple, likely JSON schema for the data returned by the API.
    **Output:** Provide the \`fetch\` script in a \`javascript\` code block, and the schema in a \`json\` code block.
    `,
    WEB_CRAWL: `
    You are a Web Scraping expert. A user needs to crawl a website.
    **Target URL:** {TARGET}
    **Task:**
    1.  Provide a complete, tailored Firecrawl JSON configuration for this URL. The 'url' field must be the target URL. Adjust 'maxDepth', 'waitFor', 'onlyMainContent', etc., based on a reasonable guess for this type of site.
    2.  Propose a JSON schema for the data you expect to extract from this specific source.
    **Output:** Provide the Firecrawl config in a \`json\` code block, and the schema in another \`json\` code block.
    `,
    LOCAL_FILE: `
    You are a Data Engineer. A user has uploaded a local file.
    **File Name:** {FILE_NAME}
    **Content Snippet (first 4KB):**
    ---
    {CONTENT_SNIPPET}
    ---
    **Task:**
    1.  Based on the file name and content, provide a Python script using a suitable library (like Pandas for CSV, \`json\` for JSON) to read the file. The script should demonstrate loading the file and printing the first 5 rows or the basic structure.
    2.  Propose a simple, likely JSON schema for the data based on the content snippet.
    **Output:** Provide the Python script in a \`python\` code block, and the schema in a \`json\` code block.
    `
};

export interface StrategyResult {
    strategy: string; // This will be a markdown string with code blocks
}

export async function generateStrategy(
    accessMethod: AccessMethod,
    target: string
): Promise<StrategyResult> {
    try {
        const promptTemplate = STRATEGY_PROMPTS[accessMethod];
        if (!promptTemplate) {
            throw new Error(`No strategy prompt for access method: ${accessMethod}`);
        }

        const prompt = promptTemplate.replace(/{TARGET}/g, target);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt
        });

        return { strategy: response.text };

    } catch (error) {
        console.error(`Error in Strategy Agent for target ${target}:`, error);
        return { strategy: `> An error occurred while generating a strategy for this link.` };
    }
}

export async function generateFileStrategy(
    fileName: string,
    contentSnippet: string
): Promise<StrategyResult> {
    try {
        const prompt = STRATEGY_PROMPTS.LOCAL_FILE
            .replace('{FILE_NAME}', fileName)
            .replace('{CONTENT_SNIPPET}', contentSnippet);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt
        });

        return { strategy: response.text };

    } catch (error) {
        console.error(`Error in File Strategy Agent for file ${fileName}:`, error);
        return { strategy: `> An error occurred while generating a strategy for this file.` };
    }
}
