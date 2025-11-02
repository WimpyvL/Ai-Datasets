
import { findDatasetUrls } from './discoveryAgent';
import { analyzeUrlForAccessMethod } from './analysisAgent';
import { generateStrategy, generateFileStrategy } from './strategyAgent';
import { refineStrategy } from './refinementAgent';
import type { DiscoveredLink } from '../../types';

// Web discovery orchestrator
export async function createFullIngestionPlan(datasetDescription: string): Promise<DiscoveredLink[]> {
    
    // Step 1: Discover potential URLs
    const discoveryResult = await findDatasetUrls(datasetDescription);
    if (!discoveryResult.urls || discoveryResult.urls.length === 0) {
        return [];
    }

    // Step 2 & 3: Analyze each URL and generate a strategy for it (in parallel)
    const sources = await Promise.all(
        discoveryResult.urls.map(async (url) => {
            const analysis = await analyzeUrlForAccessMethod(url);
            const strategyResult = await generateStrategy(analysis.accessMethod, analysis.target);
            return {
                url,
                accessMethod: analysis.accessMethod,
                justification: analysis.justification,
                strategy: strategyResult.strategy.trim(),
            };
        })
    );

    return sources;
}

// Local file plan orchestrator
export async function createPlanForLocalFile(file: File): Promise<DiscoveredLink> {
    const MAX_SNIPPET_SIZE = 4096; // 4KB
    const fileContentSnippet = await file.text().then(text => text.slice(0, MAX_SNIPPET_SIZE));

    const strategyResult = await generateFileStrategy(file.name, fileContentSnippet);

    return {
        url: file.name,
        accessMethod: 'LOCAL_FILE',
        justification: `An ingestion plan generated for the uploaded file '${file.name}'.`,
        strategy: strategyResult.strategy.trim(),
    };
}


export async function refineSourceStrategyWithCleaning(originalStrategy: string, cleaningInstructions: string): Promise<string> {
    if (!cleaningInstructions.trim()) {
        return originalStrategy;
    }
    return refineStrategy(originalStrategy, cleaningInstructions);
}
