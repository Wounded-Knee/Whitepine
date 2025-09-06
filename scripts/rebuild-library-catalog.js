#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_SPECS_DIR = path.join(__dirname, '../public/library/project-specs');
const OUTPUT_FILE = path.join(__dirname, '../src/app/components/Library/data.ts');

// Document categories mapping
const CATEGORY_MAPPING = {
  'api': 'API Documentation',
  'auth': 'Technical Documentation',
  'database': 'Database Design',
  'deployment': 'System Architecture',
  'government': 'Database Design',
  'media': 'Media Management',
  'user': 'Platform Features',
  'vigor': 'Platform Features',
  'capital': 'Platform Features',
  'role': 'System Architecture',
  'profile': 'Platform Features',
  'aws': 'System Architecture',
  'github': 'System Architecture',
  'security': 'Technical Documentation',
  'performance': 'Technical Documentation',
  'testing': 'Technical Documentation',
  'frontend': 'Technical Documentation',
  'backend': 'Technical Documentation',
  'schema': 'Database Design',
  'integration': 'API Documentation'
};

// Function to extract title from markdown content
function extractTitle(content) {
  const titleMatch = content.match(/^#\s+(.+)$/m);
  return titleMatch ? titleMatch[1].trim() : null;
}

// Function to extract excerpt from markdown content
function extractExcerpt(content) {
  // Remove the first heading
  const withoutTitle = content.replace(/^#\s+.+$/m, '');
  
  // Find the first paragraph or description
  const lines = withoutTitle.split('\n').filter(line => line.trim());
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip empty lines, headings, and code blocks
    if (line && !line.startsWith('#') && !line.startsWith('```') && !line.startsWith('---')) {
      // Remove markdown formatting
      const cleanLine = line
        .replace(/^\*\*(.+)\*\*$/, '$1') // Remove bold
        .replace(/^\*(.+)\*$/, '$1') // Remove italic
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links
        .replace(/`([^`]+)`/g, '$1'); // Remove code
      
      if (cleanLine.length > 20) {
        return cleanLine.length > 200 ? cleanLine.substring(0, 200) + '...' : cleanLine;
      }
    }
  }
  
  return 'Technical documentation for the Whitepine Full-Stack Application.';
}

// Function to determine category from filename and content
function determineCategory(filename, content) {
  const lowerFilename = filename.toLowerCase();
  const lowerContent = content.toLowerCase();
  
  // Check for specific keywords in filename
  for (const [keyword, category] of Object.entries(CATEGORY_MAPPING)) {
    if (lowerFilename.includes(keyword)) {
      return category;
    }
  }
  
  // Check for keywords in content
  if (lowerContent.includes('api') || lowerContent.includes('endpoint')) {
    return 'API Documentation';
  }
  if (lowerContent.includes('database') || lowerContent.includes('schema') || lowerContent.includes('mongodb')) {
    return 'Database Design';
  }
  if (lowerContent.includes('deployment') || lowerContent.includes('aws') || lowerContent.includes('infrastructure')) {
    return 'System Architecture';
  }
  if (lowerContent.includes('media') || lowerContent.includes('upload') || lowerContent.includes('file')) {
    return 'Media Management';
  }
  if (lowerContent.includes('user') || lowerContent.includes('profile') || lowerContent.includes('auth')) {
    return 'Platform Features';
  }
  if (lowerContent.includes('vigor') || lowerContent.includes('capital')) {
    return 'Platform Features';
  }
  
  return 'Technical Documentation';
}

// Function to scan project-specs directory
function scanProjectSpecs() {
  const documents = [];
  
  try {
    const files = fs.readdirSync(PROJECT_SPECS_DIR);
    
    for (const file of files) {
      if (file.endsWith('.md')) {
        const filePath = path.join(PROJECT_SPECS_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        const title = extractTitle(content);
        const excerpt = extractExcerpt(content);
        const category = determineCategory(file, content);
        
        if (title) {
          documents.push({
            title,
            filename: file,
            excerpt,
            category,
            section: 'project-specs'
          });
        }
      }
    }
  } catch (error) {
    console.error('Error scanning project-specs directory:', error);
    return [];
  }
  
  return documents;
}

// Function to generate the data.ts file
function generateDataFile(projectSpecsDocuments) {
  const template = `export interface LibraryDocument {
  title: string
  filename: string
  excerpt: string
  category: string
  date?: string
  section: string
}

export interface LibrarySection {
  id: string
  name: string
  description: string
  backgroundImage: string
  categories: string[]
}

export const librarySections: LibrarySection[] = [
  {
    id: 'project-specs',
    name: 'Project Specs',
    description: 'Technical specifications, feature guides, and development guidelines for the Whitepine platform.',
    backgroundImage: '/hero/qotd/yosemite-valley.webp',
    categories: ['Platform Features', 'Technical Documentation', 'System Architecture', 'Database Design', 'API Documentation', 'Media Management']
  },
  {
    id: 'whimsy',
    name: 'Whimsy',
    description: 'Philosophical musings, cultural analyses, and imaginative explorations of democracy, technology, and human nature.',
    backgroundImage: '/hero/qotd/0725_Nature_bear.jpg',
    categories: [
      'Cultural Analysis',
      'Philosophy',
      'Political Thought',
      'Constitutional Thought',
      'Political Analysis',
      'Indigenous Wisdom',
      'Historical Analysis',
      'Literary Analysis',
      'Constitutional Innovation',
      'Media Studies',
      'American Mythology'
    ]
  }
]

export const libraryDocuments: LibraryDocument[] = [
  // Project Specs Documents
${projectSpecsDocuments.map(doc => `  {
    title: "${doc.title.replace(/"/g, '\\"')}",
    filename: "${doc.filename}",
    excerpt: "${doc.excerpt.replace(/"/g, '\\"')}",
    category: "${doc.category}",
    section: "project-specs"
  }`).join(',\n')},

  // Whimsy Documents
  {
    title: "Back to the Future as Prophetic Media",
    filename: "Back to the Future II.md",
    excerpt: "A dissertation exploring how Back to the Future Part II functioned as cultural foresight, with Biff Tannen's character eerily predicting Donald Trump's political rise through subconscious pattern recognition.",
    category: "Media Studies",
    section: "whimsy"
  },
  {
    title: "Back to the Future",
    filename: "Back to the Future.md",
    excerpt: "Further exploration of the prophetic nature of the Back to the Future franchise and its cultural significance as a time capsule of collective foresight.",
    category: "Media Studies",
    section: "whimsy"
  },
  {
    title: "Moral Evaluation",
    filename: "Moral_Evaluation.md",
    excerpt: "Philosophical exploration of moral evaluation systems and their role in democratic processes and civic engagement.",
    category: "Philosophy",
    section: "whimsy"
  },
  {
    title: "Ron Paul",
    filename: "Ron Paul.md",
    excerpt: "Reflections on Ron Paul's political philosophy and libertarian principles in the context of American democracy.",
    category: "Political Thought",
    section: "whimsy"
  },
  {
    title: "John Wayne #1",
    filename: "John Wayne #1.md",
    excerpt: "Cultural analysis of John Wayne's impact on American identity and political mythology in the 20th century.",
    category: "American Mythology",
    section: "whimsy"
  },
  {
    title: "Federalist #86",
    filename: "Federalist #86.md",
    excerpt: "Contemporary interpretation of Federalist Paper #86 proposing a Civilian Voice Branch as a fourth branch of government to amplify the people's voice.",
    category: "Constitutional Innovation",
    section: "whimsy"
  },
  {
    title: "Donald Trump",
    filename: "Donald Trump.md",
    excerpt: "Analysis of Donald Trump's political phenomenon and its cultural implications for American democracy.",
    category: "Political Analysis",
    section: "whimsy"
  },
  {
    title: "Federalist #87",
    filename: "Federalist #87.md",
    excerpt: "Modern reading of Federalist Paper #87 and its application to current political challenges and constitutional governance.",
    category: "Constitutional Thought",
    section: "whimsy"
  },
  {
    title: "Sitting Bull",
    filename: "Sitting Bull.md",
    excerpt: "Reflections on Sitting Bull's leadership and the intersection of indigenous wisdom with democratic principles and governance.",
    category: "Indigenous Wisdom",
    section: "whimsy"
  },
  {
    title: "Davy Crockett",
    filename: "Davy Crockett.md",
    excerpt: "Exploration of Davy Crockett's legacy and the American frontier mythos in shaping national identity.",
    category: "American Mythology",
    section: "whimsy"
  },
  {
    title: "Vietnam #1",
    filename: "Vietnam #1.md",
    excerpt: "Analysis of the Vietnam War's impact on American political consciousness and democratic institutions in the modern era.",
    category: "Historical Analysis",
    section: "whimsy"
  },
  {
    title: "Twain #1",
    filename: "Twain #1.md",
    excerpt: "Mark Twain's insights on democracy, human nature, and the American experiment through literary analysis.",
    category: "Literary Analysis",
    section: "whimsy"
  },
  {
    title: "A. Lincoln",
    filename: "A. Lincoln.md",
    excerpt: "Abraham Lincoln's vision for a Civilian Voice Branch - a new branch of government to amplify the people's voice and ensure government serves the people.",
    category: "Constitutional Innovation",
    section: "whimsy"
  }
]

export const getDocumentsBySection = (sectionId: string): LibraryDocument[] => {
  return libraryDocuments.filter(doc => doc.section === sectionId)
}

export const getCategoriesBySection = (sectionId: string): string[] => {
  const section = librarySections.find(s => s.id === sectionId)
  return section ? section.categories : []
}
`;

  return template;
}

// Main execution
function main() {
  console.log('🔍 Scanning project-specs directory...');
  
  const projectSpecsDocuments = scanProjectSpecs();
  
  console.log(`📚 Found ${projectSpecsDocuments.length} documents in project-specs`);
  
  // Sort documents by title
  projectSpecsDocuments.sort((a, b) => a.title.localeCompare(b.title));
  
  console.log('📝 Generating data.ts file...');
  
  const dataFileContent = generateDataFile(projectSpecsDocuments);
  
  try {
    fs.writeFileSync(OUTPUT_FILE, dataFileContent, 'utf8');
    console.log(`✅ Successfully updated ${OUTPUT_FILE}`);
    console.log(`📊 Total documents: ${projectSpecsDocuments.length}`);
    
    // Log document categories
    const categories = {};
    projectSpecsDocuments.forEach(doc => {
      categories[doc.category] = (categories[doc.category] || 0) + 1;
    });
    
    console.log('📂 Document categories:');
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`   ${category}: ${count} documents`);
    });
    
  } catch (error) {
    console.error('❌ Error writing data.ts file:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  scanProjectSpecs,
  generateDataFile,
  extractTitle,
  extractExcerpt,
  determineCategory
};
