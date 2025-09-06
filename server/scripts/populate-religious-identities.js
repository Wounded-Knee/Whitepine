// Load environment variables from .env file
require('dotenv').config();

const mongoose = require('mongoose');
const { Identity } = require('../models/Identity/Identity');

// Religious identity data from Pew Research Center 2021 projections
const religiousIdentities = [
  {
    "id": 1,
    "parentId": null,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center 2021 projections",
      "estimate": 258000000
    },
    "name": "Religion",
    "slug": "religion",
    "abbr": "REL",
    "description": "All religious and nonreligious identities in the United States",
    "isActive": true
  },
  {
    "id": 2,
    "parentId": 1,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center 2021 projections",
      "estimate": 180000000
    },
    "name": "Christianity",
    "slug": "christianity",
    "abbr": "CHR",
    "description": "All Christian denominations in the United States",
    "isActive": true
  },
  {
    "id": 3,
    "parentId": 2,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center",
      "estimate": 90000000
    },
    "name": "Protestant",
    "slug": "protestant",
    "abbr": "PROT",
    "description": "Protestant Christian traditions including Evangelical, Mainline, and Historically Black churches",
    "isActive": true
  },
  {
    "id": 4,
    "parentId": 3,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center",
      "estimate": 65000000
    },
    "name": "Evangelical Protestant",
    "slug": "evangelical-protestant",
    "abbr": "EVAN",
    "description": "Evangelical Protestant traditions such as Baptist, Pentecostal, and non-denominational churches",
    "isActive": true
  },
  {
    "id": 5,
    "parentId": 3,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center",
      "estimate": 20000000
    },
    "name": "Mainline Protestant",
    "slug": "mainline-protestant",
    "abbr": "MAIN",
    "description": "Mainline Protestant churches including Methodist, Lutheran, Presbyterian, and Episcopal",
    "isActive": true
  },
  {
    "id": 6,
    "parentId": 3,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center",
      "estimate": 5000000
    },
    "name": "Historically Black Protestant",
    "slug": "black-protestant",
    "abbr": "HBP",
    "description": "Historically Black Protestant denominations such as AME, National Baptist, and Church of God in Christ",
    "isActive": true
  },
  {
    "id": 7,
    "parentId": 2,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center",
      "estimate": 51000000
    },
    "name": "Catholic",
    "slug": "catholic",
    "abbr": "CATH",
    "description": "Roman Catholic and Eastern Catholic churches",
    "isActive": true
  },
  {
    "id": 8,
    "parentId": 2,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center",
      "estimate": 7000000
    },
    "name": "Mormon",
    "slug": "mormon",
    "abbr": "LDS",
    "description": "The Church of Jesus Christ of Latter-day Saints and related groups",
    "isActive": true
  },
  {
    "id": 9,
    "parentId": 2,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center",
      "estimate": 2000000
    },
    "name": "Orthodox Christian",
    "slug": "orthodox-christian",
    "abbr": "ORTH",
    "description": "Eastern Orthodox Christian churches including Greek and Russian Orthodox",
    "isActive": true
  },
  {
    "id": 10,
    "parentId": 1,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center 2021 projections",
      "estimate": 7500000
    },
    "name": "Judaism",
    "slug": "judaism",
    "abbr": "JUD",
    "description": "Jewish religious traditions including Orthodox, Conservative, and Reform",
    "isActive": true
  },
  {
    "id": 11,
    "parentId": 1,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center 2021 projections",
      "estimate": 5000000
    },
    "name": "Islam",
    "slug": "islam",
    "abbr": "ISL",
    "description": "Muslim traditions including Sunni, Shia, and Nation of Islam",
    "isActive": true
  },
  {
    "id": 12,
    "parentId": 1,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center 2021 projections",
      "estimate": 3000000
    },
    "name": "Buddhism",
    "slug": "buddhism",
    "abbr": "BUD",
    "description": "Buddhist traditions including Theravāda, Mahāyāna, and Vajrayāna",
    "isActive": true
  },
  {
    "id": 13,
    "parentId": 1,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center 2021 projections",
      "estimate": 2500000
    },
    "name": "Hinduism",
    "slug": "hinduism",
    "abbr": "HIND",
    "description": "Hindu traditions including Vaishnavism, Shaivism, and Shaktism",
    "isActive": true
  },
  {
    "id": 14,
    "parentId": 1,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center 2021 projections",
      "estimate": 3000000
    },
    "name": "Other World Religions",
    "slug": "other-world-religions",
    "abbr": "OWR",
    "description": "Other global faiths including Sikhism, Baha'i, Jainism, Taoism, and Shinto",
    "isActive": true
  },
  {
    "id": 15,
    "parentId": 1,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center 2021 projections",
      "estimate": 4000000
    },
    "name": "Other Faiths",
    "slug": "other-faiths",
    "abbr": "OTF",
    "description": "Native American religions, Pagan/Wicca, New Age, and other spiritual practices",
    "isActive": true
  },
  {
    "id": 16,
    "parentId": 1,
    "populationEstimate": {
      "year": 2025,
      "source": "Pew Research Center 2021 projections",
      "estimate": 90000000
    },
    "name": "Unaffiliated",
    "slug": "unaffiliated",
    "abbr": "NONE",
    "description": "Atheist, Agnostic, or nothing in particular",
    "isActive": true
  }
];

// MongoDB connection string - update this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/whitepine';

async function populateReligiousIdentities() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully');

    // Clear existing religious identities more thoroughly
    console.log('Clearing existing religious identities...');
    
    // Get all the IDs and slugs we want to insert
    const idsToInsert = religiousIdentities.map(identity => identity.id);
    const slugsToInsert = religiousIdentities.map(identity => identity.slug);
    
    // Delete any existing documents with these IDs or slugs (regardless of identityType)
    const deleteResult = await Identity.deleteMany({ 
      $or: [
        { id: { $in: idsToInsert } },
        { slug: { $in: slugsToInsert } }
      ]
    });
    console.log(`Deleted ${deleteResult.deletedCount} existing documents with conflicting IDs or slugs`);

    // Insert new religious identities with identityType field
    console.log('Inserting religious identities...');
    
    // Add identityType to each religious identity
    const religiousIdentitiesWithType = religiousIdentities.map(identity => ({
      ...identity,
      identityType: 'ReligiousIdentity'
    }));
    
    const result = await Identity.insertMany(religiousIdentitiesWithType);
    console.log(`Successfully inserted ${result.length} religious identities`);

    // Display the hierarchy
    console.log('\nReligious Identity Hierarchy:');
    const root = await Identity.findOne({ parentId: null, identityType: 'ReligiousIdentity' });
    if (root) {
      await displayHierarchy(root, 0);
    }

    console.log('\nPopulation summary:');
    const totalPopulation = religiousIdentities.reduce((sum, identity) => {
      return sum + (identity.populationEstimate?.estimate || 0);
    }, 0);
    console.log(`Total US population covered: ${totalPopulation.toLocaleString()}`);

  } catch (error) {
    console.error('Error populating religious identities:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
}

async function displayHierarchy(identity, level) {
  const indent = '  '.repeat(level);
  const population = identity.populationEstimate?.estimate?.toLocaleString() || 'N/A';
  console.log(`${indent}${identity.name} (${identity.abbr}) - ${population} people`);
  
  // Find children
  const children = await Identity.find({ parentId: identity.id, identityType: 'ReligiousIdentity', isActive: true });
  for (const child of children) {
    await displayHierarchy(child, level + 1);
  }
}

// Run the script
if (require.main === module) {
  populateReligiousIdentities()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { populateReligiousIdentities, religiousIdentities };
