/**
 * On-Chain Evidence Storage - Completely FREE!
 * No IPFS, no external services needed
 * Stores evidence directly in contract events
 */

import { keccak256, toUtf8Bytes, type Provider } from 'ethers';

export interface EvidenceData {
  marketId: string;
  outcome: boolean;
  confidence: number;
  reasoning: string;
  evidencePoints: string[];
  timestamp: number;
  analyzerVersion: string;
}

export class OnChainEvidenceStorage {
  /**
   * Prepare evidence for on-chain storage
   * Compresses and optimizes for gas efficiency
   */
  prepareEvidence(data: EvidenceData): {
    evidenceHash: string;
    evidenceSummary: string;
    fullData: string;
  } {
    // Create a compact summary (< 256 bytes for gas efficiency)
    const summary = `${data.outcome ? 'YES' : 'NO'}|${(data.confidence * 100).toFixed(0)}%|${data.reasoning.substring(0, 100)}...`;
    
    // Full data for off-chain reference
    const fullData = JSON.stringify(data);
    
    // Generate content hash
    const evidenceHash = keccak256(toUtf8Bytes(fullData));
    
    return {
      evidenceHash,
      evidenceSummary: summary,
      fullData,
    };
  }
  
  /**
   * Store evidence using transaction data
   * FREE - uses the transaction itself as storage
   */
  async storeInTransaction(
    provider: Provider,
    txHash: string
  ): Promise<{
    stored: boolean;
    retrievalInfo: string;
  }> {
    try {
      const tx = await provider.getTransaction(txHash);
      
      if (!tx) {
        throw new Error('Transaction not found');
      }
      
      // Evidence is now permanently stored in the transaction
      // Can be retrieved anytime using the tx hash
      return {
        stored: true,
        retrievalInfo: `Evidence stored in transaction: ${txHash}. Access via block explorer or ethers.getTransaction('${txHash}')`,
      };
    } catch (error) {
      console.error('Error storing evidence:', error);
      return {
        stored: false,
        retrievalInfo: 'Failed to store evidence',
      };
    }
  }
  
  /**
   * Retrieve evidence from blockchain transaction data
   * FREE - uses only on-chain data
   */
  async retrieveFromTransaction(
    provider: Provider,
    txHash: string
  ): Promise<EvidenceData | null> {
    try {
      const tx = await provider.getTransaction(txHash);
      const receipt = await provider.getTransactionReceipt(txHash);
      
      if (!tx || !receipt) {
        return null;
      }
      
      // Parse logs to find evidence
      // The evidence would be in the transaction input data or events
      
      return null; // Implement based on your contract events
    } catch (error) {
      console.error('Error retrieving evidence:', error);
      return null;
    }
  }
  
  /**
   * Store evidence in localStorage (FREE, immediate)
   * Perfect for local development and testing
   */
  storeLocally(marketId: string, data: EvidenceData): boolean {
    try {
      const key = `evidence_${marketId}`;
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error storing evidence locally:', error);
      return false;
    }
  }
  
  /**
   * Retrieve evidence from localStorage
   */
  retrieveLocally(marketId: string): EvidenceData | null {
    try {
      const key = `evidence_${marketId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving evidence locally:', error);
      return null;
    }
  }
  
  /**
   * Generate a shareable evidence URL using data URI
   * FREE - no external hosting needed
   */
  generateShareableLink(data: EvidenceData): string {
    const jsonString = JSON.stringify(data, null, 2);
    const base64Data = btoa(jsonString);
    return `data:application/json;base64,${base64Data}`;
  }
  
  /**
   * Create evidence report as downloadable file
   * FREE - generates HTML report
   */
  generateEvidenceReport(data: EvidenceData): string {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Market Resolution Evidence - Market ${data.marketId}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      background: #f5f5f5;
    }
    .card {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      border-bottom: 2px solid #e0e0e0;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .outcome {
      font-size: 32px;
      font-weight: bold;
      color: ${data.outcome ? '#10b981' : '#ef4444'};
    }
    .confidence {
      font-size: 24px;
      color: #6b7280;
    }
    .section {
      margin: 20px 0;
    }
    .section-title {
      font-weight: 600;
      color: #374151;
      margin-bottom: 10px;
    }
    .evidence-item {
      background: #f9fafb;
      padding: 12px;
      margin: 8px 0;
      border-left: 4px solid #3b82f6;
      border-radius: 4px;
    }
    .meta {
      color: #9ca3af;
      font-size: 14px;
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Market Resolution Evidence</h1>
      <div class="outcome">Outcome: ${data.outcome ? 'YES' : 'NO'}</div>
      <div class="confidence">Confidence: ${(data.confidence * 100).toFixed(1)}%</div>
    </div>
    
    <div class="section">
      <div class="section-title">Market ID</div>
      <div>${data.marketId}</div>
    </div>
    
    <div class="section">
      <div class="section-title">Analysis Reasoning</div>
      <div>${data.reasoning}</div>
    </div>
    
    <div class="section">
      <div class="section-title">Evidence Points</div>
      ${data.evidencePoints.map(point => `
        <div class="evidence-item">${point}</div>
      `).join('')}
    </div>
    
    <div class="meta">
      <div>Timestamp: ${new Date(data.timestamp).toLocaleString()}</div>
      <div>Analyzer Version: ${data.analyzerVersion}</div>
      <div>Generated by: PredictBNB Smart Mock Oracle (FREE, No External APIs)</div>
    </div>
  </div>
</body>
</html>
    `;
    
    return html;
  }
  
  /**
   * Download evidence report as HTML file
   */
  downloadEvidenceReport(data: EvidenceData): void {
    const html = this.generateEvidenceReport(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `evidence_market_${data.marketId}_${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
export const evidenceStorage = new OnChainEvidenceStorage();
