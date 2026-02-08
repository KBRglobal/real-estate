import { PDFParse } from "pdf-parse";
import sharp from "sharp";
import type { ExtractedBlock } from "@shared/prospect-schemas";

export interface PDFExtractionResult {
  text: string;
  pageCount: number;
  blocks: ExtractedBlock[];
  tables: Array<{
    page: number;
    headers: string[];
    rows: string[][];
  }>;
  images: Array<{
    page: number;
    data: Buffer;
    format: string;
  }>;
  metadata: {
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
    producer?: string;
    creationDate?: Date;
    modDate?: Date;
  };
}

export interface TableData {
  headers: string[];
  rows: string[][];
  page: number;
}

/**
 * Extract text and metadata from PDF file
 */
export async function extractPdfContent(pdfBuffer: Buffer): Promise<PDFExtractionResult> {
  try {
    // Convert Node.js Buffer to Uint8Array for pdf-parse
    const uint8Array = new Uint8Array(pdfBuffer);
    const parser = new PDFParse({ data: uint8Array });
    const textResult = await parser.getText();
    const infoResult = await parser.getInfo();
    
    const blocks: ExtractedBlock[] = [];
    const tables: TableData[] = [];
    
    // Parse text into blocks based on structure
    const lines = textResult.text.split('\n').filter((line: string) => line.trim());
    let currentPage = 1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      // Detect section headers (all caps, short lines, or lines ending with :)
      const isHeader = (
        (line === line.toUpperCase() && line.length < 50 && line.length > 2) ||
        line.endsWith(':') ||
        /^[A-Z][A-Z\s]+$/.test(line)
      );
      
      // Detect potential table rows (multiple tabs/spaces separating values)
      const isTableRow = /\t|  {2,}/.test(line) && line.split(/\t|  {2,}/).length >= 3;
      
      if (isHeader) {
        blocks.push({
          type: "header",
          content: line,
          page: currentPage,
        });
      } else if (isTableRow) {
        // Group consecutive table rows
        const tableRows: string[][] = [];
        let headers: string[] = [];
        
        // Check if previous block was a header - use as table header
        if (blocks.length > 0 && blocks[blocks.length - 1].type === "header") {
          headers = [blocks[blocks.length - 1].content || ""];
        }
        
        // Parse this row
        const cells = line.split(/\t|  {2,}/).map((c: string) => c.trim()).filter((c: string) => c);
        if (headers.length === 0 && cells.length > 0) {
          headers = cells;
        } else {
          tableRows.push(cells);
        }
        
        // Look ahead for more table rows
        while (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (/\t|  {2,}/.test(nextLine)) {
            const nextCells = nextLine.split(/\t|  {2,}/).map((c: string) => c.trim()).filter((c: string) => c);
            if (nextCells.length >= 2) {
              tableRows.push(nextCells);
              i++;
              continue;
            }
          }
          break;
        }
        
        if (tableRows.length > 0) {
          tables.push({
            headers,
            rows: tableRows,
            page: currentPage,
          });
          blocks.push({
            type: "table",
            content: JSON.stringify({ headers, rows: tableRows }),
            page: currentPage,
          });
        }
      } else {
        blocks.push({
          type: "text",
          content: line,
          page: currentPage,
        });
      }
    }
    
    // Cleanup parser resources
    await parser.destroy();
    
    return {
      text: textResult.text,
      pageCount: textResult.total,
      blocks,
      tables,
      images: [], // Image extraction requires additional processing
      metadata: {
        title: infoResult.info?.Title,
        author: infoResult.info?.Author,
        subject: infoResult.info?.Subject,
        creator: infoResult.info?.Creator,
        producer: infoResult.info?.Producer,
        creationDate: infoResult.info?.CreationDate ? new Date(infoResult.info.CreationDate) : undefined,
        modDate: infoResult.info?.ModDate ? new Date(infoResult.info.ModDate) : undefined,
      },
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error(`Failed to extract PDF content: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract tables from text - identify pricing/payment tables
 */
export function extractTables(blocks: ExtractedBlock[]): TableData[] {
  const tables: TableData[] = [];
  
  for (const block of blocks) {
    if (block.type === "table" && block.content) {
      try {
        const tableData = JSON.parse(block.content);
        tables.push({
          ...tableData,
          page: block.page,
        });
      } catch {
        // Skip invalid table JSON
      }
    }
  }
  
  return tables;
}

/**
 * Identify pricing-related tables
 */
export function identifyPricingTables(tables: TableData[]): TableData[] {
  const pricingKeywords = [
    'price', 'pricing', 'cost', 'aed', 'usd', 'payment', 'plan',
    'bedroom', 'br', 'unit', 'type', 'size', 'sqft', 'sqm',
    'מחיר', 'תשלום', 'יחידה'
  ];
  
  return tables.filter(table => {
    const headerText = table.headers.join(' ').toLowerCase();
    const hasRelevantHeaders = pricingKeywords.some(keyword => 
      headerText.includes(keyword)
    );
    
    // Also check first row if headers are empty
    if (!hasRelevantHeaders && table.rows.length > 0) {
      const firstRowText = table.rows[0].join(' ').toLowerCase();
      return pricingKeywords.some(keyword => firstRowText.includes(keyword));
    }
    
    return hasRelevantHeaders;
  });
}

/**
 * Extract payment plan milestones from tables
 */
export function extractPaymentMilestones(tables: TableData[]): Array<{
  percentage: number;
  description: string;
  timing?: string;
}> {
  const paymentKeywords = ['payment', 'plan', 'milestone', 'booking', 'handover', 'construction', 'תשלום'];
  const milestones: Array<{ percentage: number; description: string; timing?: string }> = [];
  
  for (const table of tables) {
    const headerText = table.headers.join(' ').toLowerCase();
    const isPaymentTable = paymentKeywords.some(k => headerText.includes(k));
    
    if (isPaymentTable || table.headers.length === 0) {
      for (const row of table.rows) {
        // Look for percentage patterns
        for (let i = 0; i < row.length; i++) {
          const cell = row[i];
          const percentMatch = cell.match(/(\d+(?:\.\d+)?)\s*%/);
          if (percentMatch) {
            const percentage = parseFloat(percentMatch[1]);
            const description = row.filter((_, idx) => idx !== i).join(' ').trim();
            milestones.push({
              percentage,
              description: description || cell,
            });
          }
        }
      }
    }
  }
  
  return milestones;
}

/**
 * Process and optimize images
 */
export async function processImage(
  imageBuffer: Buffer,
  options: {
    maxWidth?: number;
    maxHeight?: number;
    format?: 'jpeg' | 'webp' | 'png';
    quality?: number;
  } = {}
): Promise<Buffer> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    format = 'webp',
    quality = 85
  } = options;
  
  let processor = sharp(imageBuffer);
  
  // Resize if needed
  const metadata = await processor.metadata();
  if (metadata.width && metadata.height) {
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      processor = processor.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }
  }
  
  // Convert to desired format
  switch (format) {
    case 'webp':
      processor = processor.webp({ quality });
      break;
    case 'jpeg':
      processor = processor.jpeg({ quality });
      break;
    case 'png':
      processor = processor.png({ quality });
      break;
  }
  
  return processor.toBuffer();
}

/**
 * Generate thumbnail for an image
 */
export async function generateThumbnail(
  imageBuffer: Buffer,
  size: number = 300
): Promise<Buffer> {
  return sharp(imageBuffer)
    .resize(size, size, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 80 })
    .toBuffer();
}

/**
 * Parse unit types from text content
 */
export function parseUnitTypes(text: string): Array<{
  type: string;
  sizeFrom?: number;
  sizeTo?: number;
  sizeUnit: 'sqft' | 'sqm';
}> {
  const units: Array<{
    type: string;
    sizeFrom?: number;
    sizeTo?: number;
    sizeUnit: 'sqft' | 'sqm';
  }> = [];
  
  // Patterns for unit types
  const unitPatterns = [
    /(\d+)\s*(?:BR|BHK|Bedroom)/gi,
    /Studio/gi,
    /Penthouse/gi,
    /Duplex/gi,
    /Townhouse/gi,
    /Villa/gi,
  ];
  
  // Size patterns
  const sizePattern = /(\d{3,5})\s*(?:-|to|–)\s*(\d{3,5})\s*(sqft|sq\.?\s*ft|sqm|sq\.?\s*m)/gi;
  const singleSizePattern = /(\d{3,5})\s*(sqft|sq\.?\s*ft|sqm|sq\.?\s*m)/gi;
  
  // Extract unit types
  for (const pattern of unitPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const type = match[0].replace(/\s+/g, '').toUpperCase();
      if (!units.find(u => u.type === type)) {
        units.push({
          type,
          sizeUnit: 'sqft',
        });
      }
    }
  }
  
  // Extract sizes and associate with units
  let sizeMatch;
  while ((sizeMatch = sizePattern.exec(text)) !== null) {
    const sizeFrom = parseInt(sizeMatch[1]);
    const sizeTo = parseInt(sizeMatch[2]);
    const unit = sizeMatch[3].toLowerCase().includes('m') ? 'sqm' : 'sqft';
    
    // Associate with first unit without size
    const unitWithoutSize = units.find(u => !u.sizeFrom);
    if (unitWithoutSize) {
      unitWithoutSize.sizeFrom = sizeFrom;
      unitWithoutSize.sizeTo = sizeTo;
      unitWithoutSize.sizeUnit = unit;
    }
  }
  
  return units;
}

/**
 * Extract developer info from text
 */
export function extractDeveloperInfo(text: string): {
  name?: string;
  notableProjects?: string[];
} {
  const developers = [
    'EMAAR', 'DAMAC', 'NAKHEEL', 'MERAAS', 'SOBHA', 
    'AZIZI', 'DANUBE', 'DEYAAR', 'ELLINGTON', 'SELECT GROUP',
    'BINGHATTI', 'OMNIYAT', 'ALDAR', 'MAG', 'SAMANA'
  ];
  
  const upperText = text.toUpperCase();
  const foundDeveloper = developers.find(d => upperText.includes(d));
  
  return {
    name: foundDeveloper,
    notableProjects: [],
  };
}

/**
 * Extract location info from text
 */
export function extractLocationInfo(text: string): {
  area?: string;
  nearbyLandmarks?: Array<{ name: string; distance: string }>;
} {
  const areas = [
    'Business Bay', 'Dubai Marina', 'Downtown Dubai', 'Palm Jumeirah',
    'JVC', 'JBR', 'MBR City', 'Dubai Hills', 'Creek Harbour',
    'Dubai South', 'Al Barari', 'Arabian Ranches', 'Jumeirah',
    'DIFC', 'Dubai Silicon Oasis', 'Meydan'
  ];
  
  const foundArea = areas.find(area => 
    text.toLowerCase().includes(area.toLowerCase())
  );
  
  // Extract distances to landmarks
  const landmarkPattern = /(\d+)\s*(min(?:utes?)?|km|m)\s*(?:from|to|away)\s+([A-Za-z\s]+)/gi;
  const landmarks: Array<{ name: string; distance: string }> = [];
  
  let match;
  while ((match = landmarkPattern.exec(text)) !== null) {
    landmarks.push({
      name: match[3].trim(),
      distance: `${match[1]} ${match[2]}`,
    });
  }
  
  return {
    area: foundArea,
    nearbyLandmarks: landmarks.length > 0 ? landmarks : undefined,
  };
}

/**
 * Calculate extraction confidence score
 */
export function calculateConfidence(result: PDFExtractionResult): number {
  let score = 0;
  let maxScore = 0;
  
  // Text extraction quality
  maxScore += 30;
  if (result.text.length > 100) score += 10;
  if (result.text.length > 500) score += 10;
  if (result.text.length > 1000) score += 10;
  
  // Block detection
  maxScore += 30;
  const headers = result.blocks.filter(b => b.type === "header").length;
  if (headers > 0) score += 10;
  if (headers > 3) score += 10;
  if (headers > 5) score += 10;
  
  // Table detection
  maxScore += 20;
  if (result.tables.length > 0) score += 10;
  if (result.tables.length > 2) score += 10;
  
  // Metadata
  maxScore += 20;
  if (result.metadata.title) score += 10;
  if (result.metadata.author) score += 10;
  
  return score / maxScore;
}
