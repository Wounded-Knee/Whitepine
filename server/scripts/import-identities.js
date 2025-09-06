const mongoose = require('mongoose');
const { Identity } = require('../models/Identity/Identity');
require('dotenv').config();

// Identity data to import
const identityData = [
  { "id": 1, "parentId": null, "name": "Partisan", "slug": "partisan", "abbr": "PART", "color": "#CCCCCC", "description": "Identities aligned with political parties or independents." },
  { "id": 2, "parentId": 1, "name": "Democrat", "slug": "democrat", "abbr": "D", "color": "#0000FF", "description": "Members or supporters of the Democratic Party." },
  { "id": 3, "parentId": 2, "name": "Liberal", "slug": "liberal", "abbr": "LIB", "color": "#1E90FF", "description": "Left-leaning Democrats focused on social progress and reform." },
  { "id": 4, "parentId": 2, "name": "Progressive", "slug": "progressive", "abbr": "PROG", "color": "#1E90FF", "description": "Democrats emphasizing structural change, equity, and grassroots movements." },
  { "id": 5, "parentId": 2, "name": "Moderate Democrat", "slug": "moderate-democrat", "abbr": "MOD-D", "color": "#6495ED", "description": "Centrists within the Democratic Party seeking compromise across parties." },
  { "id": 6, "parentId": 2, "name": "Establishment Democrat", "slug": "establishment-democrat", "abbr": "EST-D", "color": "#4169E1", "description": "Traditional Democrats aligned with party leadership and mainstream positions." },
  { "id": 7, "parentId": 1, "name": "Republican", "slug": "republican", "abbr": "R", "color": "#FF0000", "description": "Members or supporters of the Republican Party." },
  { "id": 8, "parentId": 7, "name": "Conservative", "slug": "conservative", "abbr": "CON", "color": "#8B0000", "description": "Republicans focused on limited government, tradition, and free markets." },
  { "id": 9, "parentId": 7, "name": "Moderate Republican", "slug": "moderate-republican", "abbr": "MOD-R", "color": "#CD5C5C", "description": "Centrists in the Republican Party with more flexible positions." },
  { "id": 10, "parentId": 7, "name": "Establishment Republican", "slug": "establishment-republican", "abbr": "EST-R", "color": "#B22222", "description": "Mainstream Republicans aligned with traditional party leadership." },
  { "id": 11, "parentId": 7, "name": "MAGA / Trump Republican", "slug": "maga-trump-republican", "abbr": "MAGA", "color": "#FF4500", "description": "Populist Republicans aligned with Donald Trump and 'America First' ideals." },
  { "id": 12, "parentId": 1, "name": "Independent", "slug": "independent", "abbr": "I", "color": "#808080", "description": "Voters not formally aligned with a major party." },
  { "id": 13, "parentId": 12, "name": "Left-leaning Independent", "slug": "left-leaning-independent", "abbr": "IND-L", "color": "#4682B4", "description": "Independents with progressive or liberal leanings." },
  { "id": 14, "parentId": 12, "name": "Right-leaning Independent", "slug": "right-leaning-independent", "abbr": "IND-R", "color": "#A52A2A", "description": "Independents with conservative leanings." },
  { "id": 15, "parentId": 12, "name": "Centrist Independent", "slug": "centrist-independent", "abbr": "IND-C", "color": "#C0C0C0", "description": "Independents focused on pragmatic or middle-ground solutions." },
  { "id": 16, "parentId": 1, "name": "Third Party", "slug": "third-party", "abbr": "3P", "color": "#AAAAAA", "description": "Identities aligned with alternative political parties." },
  { "id": 17, "parentId": 16, "name": "Libertarian", "slug": "libertarian", "abbr": "L", "color": "#FFD700", "description": "Supporters of minimal government and maximum individual liberty." },
  { "id": 18, "parentId": 16, "name": "Green", "slug": "green", "abbr": "G", "color": "#008000", "description": "Supporters of the Green Party focused on environmental issues and social justice." },
  { "id": 19, "parentId": 16, "name": "Constitution Party", "slug": "constitution-party", "abbr": "C", "color": "#800000", "description": "Supporters advocating strict adherence to the U.S. Constitution." },
  { "id": 20, "parentId": 16, "name": "Forward Party", "slug": "forward-party", "abbr": "FWD", "color": "#00AEEF", "description": "Supporters of the centrist Forward Party founded by Andrew Yang." },
  { "id": 21, "parentId": 16, "name": "No Labels", "slug": "no-labels", "abbr": "NL", "color": "#AAAAAA", "description": "Backers of the bipartisan No Labels movement promoting unity." },
  { "id": 22, "parentId": null, "name": "Ideological", "slug": "ideological", "abbr": "IDEO", "color": "#CCCCCC", "description": "Identities based on political philosophy or ideology." },
  { "id": 23, "parentId": 22, "name": "Liberal / Progressive", "slug": "liberal-progressive", "abbr": "LIB", "color": "#1E90FF", "description": "Advocates of left-leaning reform, social equity, and expanded rights." },
  { "id": 24, "parentId": 23, "name": "Social Democrat", "slug": "social-democrat", "abbr": "SD", "color": "#4169E1", "description": "Supports democratic institutions and strong social welfare programs." },
  { "id": 25, "parentId": 23, "name": "Democratic Socialist", "slug": "democratic-socialist", "abbr": "DSA", "color": "#DC143C", "description": "Supports socialist economics combined with democratic governance." },
  { "id": 26, "parentId": 23, "name": "Leftist", "slug": "leftist", "abbr": "LEFT", "color": "#8A2BE2", "description": "Broader left identity beyond mainstream liberalism, often radical." },
  { "id": 27, "parentId": 22, "name": "Conservative", "slug": "conservative-ideological", "abbr": "CON", "color": "#8B0000", "description": "Values tradition, limited government, and strong markets." },
  { "id": 28, "parentId": 27, "name": "Social Conservative", "slug": "social-conservative", "abbr": "SOCON", "color": "#A52A2A", "description": "Prioritizes traditional social norms and religious values." },
  { "id": 29, "parentId": 27, "name": "Fiscal Conservative", "slug": "fiscal-conservative", "abbr": "FISC", "color": "#B22222", "description": "Focuses on balanced budgets, low taxes, and limited spending." },
  { "id": 30, "parentId": 27, "name": "Religious Conservative", "slug": "religious-conservative", "abbr": "REL-CON", "color": "#800000", "description": "Aligns political positions with religious beliefs." },
  { "id": 31, "parentId": 22, "name": "Moderate / Centrist", "slug": "moderate-centrist", "abbr": "MOD", "color": "#C0C0C0", "description": "Seeks balance, compromise, and pragmatic solutions." },
  { "id": 32, "parentId": 22, "name": "Libertarian", "slug": "libertarian-ideological", "abbr": "LIBT", "color": "#FFD700", "description": "Believes in civil liberties and minimal government." },
  { "id": 33, "parentId": 32, "name": "Civil Libertarian", "slug": "civil-libertarian", "abbr": "CIV-LIB", "color": "#DAA520", "description": "Focuses on protecting individual freedoms and rights." },
  { "id": 34, "parentId": 32, "name": "Small Government Libertarian", "slug": "small-government-libertarian", "abbr": "SG-LIB", "color": "#FFD700", "description": "Emphasizes minimal government regulation and intervention." },
  { "id": 35, "parentId": 22, "name": "Populist", "slug": "populist", "abbr": "POP", "color": "#A52A2A", "description": "Frames politics as 'the people' versus 'the elites'." },
  { "id": 36, "parentId": 35, "name": "Left Populist", "slug": "left-populist", "abbr": "POP-L", "color": "#CD5C5C", "description": "Seeks redistribution of power and wealth from elites to the people." },
  { "id": 37, "parentId": 35, "name": "Right Populist", "slug": "right-populist", "abbr": "POP-R", "color": "#8B0000", "description": "Nationalist, anti-elitist, often culturally conservative." },
  { "id": 38, "parentId": null, "name": "Cultural / Issue-Based", "slug": "cultural-issue-based", "abbr": "CULT", "color": "#CCCCCC", "description": "Identities tied to single issues or cultural causes." },
  { "id": 39, "parentId": 38, "name": "Feminist", "slug": "feminist", "abbr": "FEM", "color": "#FF69B4", "description": "Supports gender equality and women's rights." },
  { "id": 40, "parentId": 38, "name": "Pro-Choice", "slug": "pro-choice", "abbr": "PC", "color": "#9370DB", "description": "Supports abortion rights and reproductive freedom." },
  { "id": 41, "parentId": 38, "name": "Pro-Life", "slug": "pro-life", "abbr": "PL", "color": "#2E8B57", "description": "Opposes abortion, viewing it as taking human life." },
  { "id": 42, "parentId": 38, "name": "Gun Rights Advocate", "slug": "gun-rights-advocate", "abbr": "2A", "color": "#000000", "description": "Supports strong Second Amendment protections." },
  { "id": 43, "parentId": 38, "name": "Environmental Activist", "slug": "environmental-activist", "abbr": "ENV", "color": "#228B22", "description": "Prioritizes environmental protection and climate action." },
  { "id": 44, "parentId": 43, "name": "Climate Voter", "slug": "climate-voter", "abbr": "CLIM", "color": "#32CD32", "description": "Votes primarily on climate policy issues." },
  { "id": 45, "parentId": 43, "name": "Green New Deal Supporter", "slug": "green-new-deal-supporter", "abbr": "GND", "color": "#32CD32", "description": "Supports large-scale government-led climate and economic reforms." },
  { "id": 46, "parentId": 38, "name": "Labor Union Supporter", "slug": "labor-union-supporter", "abbr": "LAB", "color": "#B22222", "description": "Advocates for worker protections and union power." },
  { "id": 47, "parentId": 38, "name": "Small Business Advocate", "slug": "small-business-advocate", "abbr": "SBA", "color": "#4682B4", "description": "Prioritizes entrepreneurship and support for small businesses." },
  { "id": 48, "parentId": 38, "name": "Civil Rights Advocate", "slug": "civil-rights-advocate", "abbr": "CR", "color": "#800080", "description": "Focuses on equality and justice for marginalized groups." },
  { "id": 49, "parentId": 48, "name": "Racial Justice Advocate", "slug": "racial-justice-advocate", "abbr": "RJA", "color": "#9932CC", "description": "Supports racial equity and anti-discrimination efforts." },
  { "id": 50, "parentId": 38, "name": "Religious Right", "slug": "religious-right", "abbr": "RR", "color": "#8B4513", "description": "Christian conservative identity emphasizing family and tradition." },
  { "id": 51, "parentId": 38, "name": "Secular Progressive", "slug": "secular-progressive", "abbr": "SEC-PROG", "color": "#9370DB", "description": "Emphasizes secular governance and progressive values." },
  { "id": 52, "parentId": null, "name": "Movement", "slug": "movement", "abbr": "MOV", "color": "#CCCCCC", "description": "Identities tied to named movements." },
  { "id": 53, "parentId": 52, "name": "MAGA / Trump Republican", "slug": "maga-trump-republican-movement", "abbr": "MAGA", "color": "#FF4500", "description": "Populist right-wing movement aligned with Donald Trump." },
  { "id": 54, "parentId": 52, "name": "Progressive Democrat / Berniecrat", "slug": "progressive-democrat-berniecrat", "abbr": "BERN", "color": "#1E90FF", "description": "Movement of left Democrats aligned with Bernie Sanders." },
  { "id": 55, "parentId": 52, "name": "Tea Party Conservative", "slug": "tea-party-conservative", "abbr": "TEA", "color": "#B8860B", "description": "Movement emphasizing fiscal conservatism and small government." },
  { "id": 56, "parentId": 52, "name": "Green New Deal / Climate Movement", "slug": "green-new-deal-climate-movement", "abbr": "GND", "color": "#32CD32", "description": "Movement advocating large-scale climate and economic reforms." },
  { "id": 57, "parentId": 52, "name": "Libertarian Movement", "slug": "libertarian-movement", "abbr": "LIBT", "color": "#FFD700", "description": "Movement centered on expanding personal liberty and reducing government." },
  { "id": 58, "parentId": null, "name": "Identity-As-Politics", "slug": "identity-as-politics", "abbr": "ID-POL", "color": "#CCCCCC", "description": "Political identity expressed through personal or group belonging." },
  { "id": 59, "parentId": 58, "name": "Working-Class Voter", "slug": "working-class-voter", "abbr": "WC", "color": "#708090", "description": "Defines politics through economic class identity." },
  { "id": 60, "parentId": 58, "name": "Suburban Mom Voter", "slug": "suburban-mom-voter", "abbr": "SMV", "color": "#FFB6C1", "description": "Self-identity emphasizing family issues and suburban community." },
  { "id": 61, "parentId": 58, "name": "Rural Conservative", "slug": "rural-conservative", "abbr": "RC", "color": "#A52A2A", "description": "Identity based in rural life, values, and traditions." },
  { "id": 62, "parentId": 58, "name": "Urban Progressive", "slug": "urban-progressive", "abbr": "UP", "color": "#20B2AA", "description": "Identity based in urban life and progressive culture." },
  { "id": 63, "parentId": 58, "name": "Immigrant Rights Advocate", "slug": "immigrant-rights-advocate", "abbr": "IRA", "color": "#4682B4", "description": "Supports rights and protections for immigrants." },
  { "id": 64, "parentId": 58, "name": "Veteran Voter", "slug": "veteran-voter", "abbr": "VET", "color": "#556B2F", "description": "Defines identity through military service and veterans' issues." },
  { "id": 65, "parentId": 58, "name": "Religious Voter", "slug": "religious-voter", "abbr": "REL", "color": "#8B4513", "description": "Defines political identity through religious belonging." },
  { "id": 66, "parentId": 65, "name": "Catholic", "slug": "catholic", "abbr": "CAT", "color": "#800000", "description": "Identifies faith as central to political positions." },
  { "id": 67, "parentId": 65, "name": "Evangelical", "slug": "evangelical", "abbr": "EVAN", "color": "#A0522D", "description": "Evangelical Christian identity shaping politics." },
  { "id": 68, "parentId": 65, "name": "Mormon", "slug": "mormon", "abbr": "LDS", "color": "#6B8E23", "description": "Latter-Day Saint faith shaping political outlook." },
  { "id": 69, "parentId": 65, "name": "Other Faith", "slug": "other-faith", "abbr": "REL-O", "color": "#808000", "description": "Other religious traditions shaping political outlook." },
  { "id": 70, "parentId": null, "name": "Anti-Identities", "slug": "anti-identities", "abbr": "ANTI", "color": "#CCCCCC", "description": "Identities based on rejection of political systems or labels." },
  { "id": 71, "parentId": 70, "name": "Anti-Establishment", "slug": "anti-establishment", "abbr": "ANTI-EST", "color": "#696969", "description": "Rejects political establishment as corrupt or unrepresentative." },
  { "id": 72, "parentId": 70, "name": "Anti-Partisan", "slug": "anti-partisan", "abbr": "ANTI-PART", "color": "#808080", "description": "Rejects parties, seeks post-partisan or independent politics." },
  { "id": 73, "parentId": 70, "name": "Anti-Elitist", "slug": "anti-elitist", "abbr": "ANTI-ELITE", "color": "#2F4F4F", "description": "Rejects influence of elites in politics." },
  { "id": 74, "parentId": 70, "name": "Anti-Government", "slug": "anti-government", "abbr": "ANTI-GOV", "color": "#000000", "description": "Rejects government as inherently illegitimate." },
  { "id": 75, "parentId": 70, "name": "Apolitical", "slug": "apolitical", "abbr": "APOL", "color": "#D3D3D3", "description": "Chooses not to engage in politics at all." },
  { "id": 76, "parentId": null, "name": "Meta-Identities", "slug": "meta-identities", "abbr": "META", "color": "#CCCCCC", "description": "Broad, philosophical political identities." },
  { "id": 77, "parentId": 76, "name": "Patriot", "slug": "patriot", "abbr": "PAT", "color": "#B22222", "description": "Defines political identity through loyalty to the nation." },
  { "id": 78, "parentId": 76, "name": "Nationalist", "slug": "nationalist", "abbr": "NAT", "color": "#8B0000", "description": "Emphasizes sovereignty, national identity, and pride." },
  { "id": 79, "parentId": 76, "name": "Globalist", "slug": "globalist", "abbr": "GLO", "color": "#4169E1", "description": "Identifies with internationalism and global cooperation." },
  { "id": 80, "parentId": 76, "name": "Constitutionalist", "slug": "constitutionalist", "abbr": "CONST", "color": "#696969", "description": "Defines identity through strict adherence to the U.S. Constitution." },
  { "id": 81, "parentId": 76, "name": "Civil Libertarian", "slug": "civil-libertarian", "abbr": "CIV-LIB", "color": "#DAA520", "description": "Prioritizes personal freedoms and civil liberties." },
  { "id": 82, "parentId": 76, "name": "Anarchist", "slug": "anarchist", "abbr": "AN", "color": "#000000", "description": "Rejects state authority entirely." },
  { "id": 83, "parentId": 76, "name": "Communist", "slug": "communist", "abbr": "COM", "color": "#FF0000", "description": "Advocates for communal ownership and elimination of class structures." },
  { "id": 84, "parentId": 76, "name": "Socialist", "slug": "socialist", "abbr": "SOC", "color": "#DC143C", "description": "Advocates for collective control of resources and social equity." },
  { "id": 85, "parentId": 76, "name": "Capitalist", "slug": "capitalist", "abbr": "CAP", "color": "#006400", "description": "Defines identity through belief in free markets and private ownership." }
];

// Function to calculate hierarchy levels and paths
function calculateHierarchy(identities) {
  const identityMap = new Map();
  const result = [];

  // First pass: create map and set initial values
  identities.forEach(identity => {
    identityMap.set(identity.id, {
      ...identity,
      level: 0,
      path: []
    });
  });

  // Second pass: calculate levels and paths
  identities.forEach(identity => {
    const current = identityMap.get(identity.id);
    let level = 0;
    let path = [identity.id];
    let currentId = identity.parentId;

    // Walk up the tree to calculate level and path
    while (currentId !== null && identityMap.has(currentId)) {
      level++;
      path.unshift(currentId);
      currentId = identityMap.get(currentId).parentId;
    }

    current.level = level;
    current.path = path;
    result.push(current);
  });

  return result;
}

async function importIdentities() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    
    // Ensure we connect to the 'whitepine' database
    let mongoUri = process.env.MONGODB_URI;
    if (!mongoUri.includes('/whitepine')) {
      // Add database name if not present
      if (mongoUri.includes('?')) {
        mongoUri = mongoUri.replace('?', '/whitepine?');
      } else {
        mongoUri = mongoUri + '/whitepine';
      }
    }
    
    // Fix double slashes that might occur
    mongoUri = mongoUri.replace('//whitepine', '/whitepine');
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('Connected to MongoDB');

    // Clear existing identities
    console.log('Clearing existing identities...');
    await Identity.deleteMany({});
    console.log('Existing identities cleared');

    // Calculate hierarchy
    console.log('Calculating hierarchy...');
    const identitiesWithHierarchy = calculateHierarchy(identityData);

    // Import identities
    console.log('Importing identities...');
    const result = await Identity.insertMany(identitiesWithHierarchy);
    console.log(`✅ Successfully imported ${result.length} identities`);

    // Display hierarchy summary
    console.log('\n📊 Hierarchy Summary:');
    const levelCounts = {};
    identitiesWithHierarchy.forEach(identity => {
      levelCounts[identity.level] = (levelCounts[identity.level] || 0) + 1;
    });

    Object.keys(levelCounts).sort((a, b) => parseInt(a) - parseInt(b)).forEach(level => {
      console.log(`Level ${level}: ${levelCounts[level]} identities`);
    });

    // Display top-level categories
    console.log('\n🏛️ Top-level Categories:');
    const topLevel = identitiesWithHierarchy.filter(identity => identity.level === 0);
    topLevel.forEach(identity => {
      console.log(`- ${identity.name} (${identity.abbr})`);
    });

    // Close connection
    await mongoose.connection.close();
    console.log('\nMongoDB connection closed');
    console.log('\n🎉 Identity import completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run import if this script is executed directly
if (require.main === module) {
  importIdentities();
}

module.exports = importIdentities;
