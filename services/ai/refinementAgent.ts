import { ai } from './client';

const STRATEGY_REFINEMENT_PROMPT = `
You are an expert Data Pipeline Architect. Your task is to refine an existing data ingestion strategy by incorporating user-provided data cleaning and transformation steps.

**CRITICAL INSTRUCTIONS:**
1.  **Append, Don't Replace:** Read the user's cleaning instructions and add a new section titled "### Data Cleaning & Transformation" to the END of the original strategy.
2.  **Preserve Original Strategy:** The original strategy content (e.g., code snippets, configuration) must be kept intact at the beginning of the output.
3.  **Provide Actionable Steps:** In the new cleaning section, convert the user's high-level instructions into a clear, step-by-step process. Suggest tools or libraries where appropriate (e.g., Pandas in Python, or shell commands like \`sed\`/\`awk\`). Use markdown formatting for clarity (e.g. bullet points).
4.  **Maintain Formatting:** The final output must be a single, cohesive Markdown document.

**Original Strategy:**
\`\`\`markdown
{ORIGINAL_STRATEGY}
\`\`\`

**User's Cleaning & Transformation Instructions:**
"{CLEANING_INSTRUCTIONS}"
`;

export async function refineStrategy(originalStrategy: string, cleaningInstructions: string): Promise<string> {
    try {
        const prompt = STRATEGY_REFINEMENT_PROMPT
            .replace('{ORIGINAL_STRATEGY}', originalStrategy)
            .replace('{CLEANING_INSTRUCTIONS}', cleaningInstructions);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt
        });

        return response.text;

    } catch (error) {
        console.error("Error in Refinement Agent:", error);
        throw new Error("The AI failed to refine the strategy. Please try again.");
    }
}
