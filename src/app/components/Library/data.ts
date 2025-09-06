export interface LibraryDocument {
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
  {
    title: "API Documentation - v1",
    filename: "api-documentation.md",
    excerpt: "This document describes the v1 API for the Whitepine application, which has been completely refactored for better data consistency, performance, and maintainability.",
    category: "API Documentation",
    section: "project-specs"
  },
  {
    title: "API Documentation Summary",
    filename: "api-documentation-summary.md",
    excerpt: "This document provides a comprehensive overview of the API documentation and integration resources for the Whitepine Full-Stack Application.",
    category: "API Documentation",
    section: "project-specs"
  },
  {
    title: "API Updates - Phase 3 Complete ✅",
    filename: "api-updates-phase3.md",
    excerpt: "Phase 3 of the data model refactor has been completed, focusing on updating the API routes to work with the new models and implementing the metrics worker system.",
    category: "API Documentation",
    section: "project-specs"
  },
  {
    title: "Authentication System Setup Guide",
    filename: "Authentication_System.md",
    excerpt: "This guide will help you set up the authentication system with Google OAuth integration for the Whitepine full-stack application.",
    category: "Technical Documentation",
    section: "project-specs"
  },
  {
    title: "AWS CloudFront Distribution Setup Guide",
    filename: "aws-cloudfront-setup.md",
    excerpt: "This guide walks through creating and configuring a CloudFront distribution to serve the Whitepine Full-Stack Application from the S3 bucket with global CDN capabilities.",
    category: "System Architecture",
    section: "project-specs"
  },
  {
    title: "AWS IAM Role and Policy Setup Guide",
    filename: "aws-iam-setup.md",
    excerpt: "This guide walks through creating the necessary IAM roles and policies for GitHub Actions to deploy to S3 and manage CloudFront distributions securely using OIDC authentication.",
    category: "System Architecture",
    section: "project-specs"
  },
  {
    title: "AWS S3 Bucket Setup Guide",
    filename: "aws-s3-setup.md",
    excerpt: "This guide walks through creating and configuring an S3 bucket for hosting the static files of the Whitepine Full-Stack Application.",
    category: "System Architecture",
    section: "project-specs"
  },
  {
    title: "BaseModal Component Documentation",
    filename: "BaseModal-Component.md",
    excerpt: "The BaseModal component is a reusable, accessible modal dialog component that provides consistent styling and behavior across the Whitepine application. It abstracts common modal functionality and nor...",
    category: "Media Management",
    section: "project-specs"
  },
  {
    title: "Complete Database Schema Documentation",
    filename: "database-schema.md",
    excerpt: "This document describes the complete database schema for the Whitepine application, covering all models including User management, Government entities, Obligations system, Claims, Evidence, Media mana...",
    category: "Database Design",
    section: "project-specs"
  },
  {
    title: "Data Model Refactor Implementation",
    filename: "data-model-refactor.md",
    excerpt: "This document outlines the implementation of the comprehensive data model refactor that addresses the core relationship constraints and improves data consistency.",
    category: "API Documentation",
    section: "project-specs"
  },
  {
    title: "Database Model Audit Report",
    filename: "database-model-audit.md",
    excerpt: "The current database models provide a solid foundation for modeling US government structure, but several critical relationships and constraints need to be addressed to ensure proper representation of ...",
    category: "Database Design",
    section: "project-specs"
  },
  {
    title: "Deployment Architecture Index",
    filename: "deployment-architecture-index.md",
    excerpt: "This document provides a comprehensive index of the deployment architecture for the Whitepine Full-Stack Application, including AWS infrastructure setup, GitHub Actions configuration, and deployment p...",
    category: "System Architecture",
    section: "project-specs"
  },
  {
    title: "Enhanced Government Models Implementation",
    filename: "enhanced-government-models-implementation.md",
    excerpt: "This document outlines the comprehensive implementation of enhanced database models for the US Government structure, including critical relationship fixes, new features, and frontend components.",
    category: "Database Design",
    section: "project-specs"
  },
  {
    title: "Forest Background System",
    filename: "Forest_Background_System.md",
    excerpt: "The Forest Background System provides a consistent, atmospheric background across all pages of the Whitepine application. Each page features a random forest treeline SVG that creates a subtle, darkeni...",
    category: "Media Management",
    section: "project-specs"
  },
  {
    title: "Frontend API Integration Guide",
    filename: "frontend-api-integration.md",
    excerpt: "This document provides guidelines and best practices for integrating the Whitepine Full-Stack Application backend API with the Next.js frontend.",
    category: "API Documentation",
    section: "project-specs"
  },
  {
    title: "Frontend Updates - Phase 4 Complete ✅",
    filename: "frontend-updates-phase4.md",
    excerpt: "Phase 4 of the data model refactor has been completed, focusing on updating the frontend components to work with the new API structure and data models.",
    category: "Technical Documentation",
    section: "project-specs"
  },
  {
    title: "Government Entity Relationships - Visual Diagram",
    filename: "Government_Entity_Relationships_Diagram.md",
    excerpt: "┌─────────────────────────────────────────────────────────────────────────────────┐",
    category: "Database Design",
    section: "project-specs"
  },
  {
    title: "Government Entity Relationships Database Structure",
    filename: "Government_Entity_Relationships.md",
    excerpt: "The Government Entity Relationships system provides a comprehensive hierarchical data model for representing the complete structure of government entities in the United States. This system uses MongoD...",
    category: "Database Design",
    section: "project-specs"
  },
  {
    title: "Identity Chips System",
    filename: "identity-chips-system.md",
    excerpt: "The Identity Chips system provides a comprehensive set of React components for displaying various types of identity data in the Whitepine application. Each chip represents a specific identity category...",
    category: "Database Design",
    section: "project-specs"
  },
  {
    title: "Identity System",
    filename: "identity-system.md",
    excerpt: "The Identity system provides a hierarchical classification of political identities and affiliations for the Whitepine application. It enables users to categorize themselves and others based on politic...",
    category: "API Documentation",
    section: "project-specs"
  },
  {
    title: "Initial Deployment Guide",
    filename: "initial-deployment.md",
    excerpt: "This guide walks through the complete process of performing the initial deployment of the Whitepine Full-Stack Application to production using the configured S3 + CloudFront infrastructure.",
    category: "System Architecture",
    section: "project-specs"
  },
  {
    title: "Media File Serving Setup",
    filename: "media-serving-setup.md",
    excerpt: "This application uses a hybrid approach for serving uploaded media files:",
    category: "Media Management",
    section: "project-specs"
  },
  {
    title: "Media Management System",
    filename: "media-system.md",
    excerpt: "The Media Management System allows users to upload, manage, and link various types of media files to government entities. This includes seals, flags, headshots, logos, building photos, documents, sign...",
    category: "Media Management",
    section: "project-specs"
  },
  {
    title: "Media Management System - Implementation Summary",
    filename: "media-management-summary.md",
    excerpt: "The Media Management System has been successfully implemented and integrated into the US Government Database, providing comprehensive functionality for managing media files associated with government ...",
    category: "Media Management",
    section: "project-specs"
  },
  {
    title: "Media Management System Documentation",
    filename: "media-management-system.md",
    excerpt: "The Media Management System provides comprehensive functionality for uploading, managing, and linking various types of media files to government entities in the US Government Database. This system sup...",
    category: "Media Management",
    section: "project-specs"
  },
  {
    title: "Multi-Environment AWS Deployment Architecture",
    filename: "multi-environment-aws-deployment.md",
    excerpt: "This document describes the complete multi-environment AWS deployment architecture for the Whitepine Full-Stack Application. The architecture supports three environments: **Development**, **Staging**,...",
    category: "System Architecture",
    section: "project-specs"
  },
  {
    title: "QOTD Editor System",
    filename: "qotd-editor-system.md",
    excerpt: "The QOTD (Quote of the Day) Editor is a comprehensive content management system designed for Developer users to manage the Quote of the Day functionality. It provides full CRUD operations for both quo...",
    category: "API Documentation",
    section: "project-specs"
  },
  {
    title: "Religious Identity Taxonomy Structure",
    filename: "religious-taxonomy-structure.md",
    excerpt: "This document outlines the comprehensive religious identity taxonomy implemented in the Whitepine application. The taxonomy is based on Pew Research Center data and provides a 4-level hierarchical str...",
    category: "API Documentation",
    section: "project-specs"
  },
  {
    title: "S3 + CloudFront Deployment Guide",
    filename: "s3-cloudfront-deployment.md",
    excerpt: "This project is configured for automated deployment to AWS S3 with CloudFront CDN using GitHub Actions.",
    category: "System Architecture",
    section: "project-specs"
  },
  {
    title: "The Political Capital Economic System",
    filename: "Political Capital.md",
    excerpt: "Political Capital (PC) is a civic currency designed to give citizens a fungible, rationed, and renewable form of influence.",
    category: "API Documentation",
    section: "project-specs"
  },
  {
    title: "US Government Database System",
    filename: "US_Government_Database_System.md",
    excerpt: "The US Government Database System is a comprehensive MongoDB-based data model that represents the entire structure of the United States government. It provides a normalized, hierarchical representatio...",
    category: "Database Design",
    section: "project-specs"
  },
  {
    title: "User Demographics and Political Identity API",
    filename: "user-demographics-api.md",
    excerpt: "This document describes the new API endpoints for managing user demographic information and political identities. Users can now store detailed demographic data and link themselves to multiple politica...",
    category: "API Documentation",
    section: "project-specs"
  },
  {
    title: "User Profile System",
    filename: "User_Profile_System.md",
    excerpt: "The User Profile System provides a comprehensive user management interface with avatars, voting history, and capital tracking. Users can view their profile, edit their information, and see their activ...",
    category: "Platform Features",
    section: "project-specs"
  },
  {
    title: "User Role System",
    filename: "User_Role_System.md",
    excerpt: "The User Role System provides role-based access control (RBAC) for the Whitepine application. It allows administrators to assign specific roles to users, which determine their permissions and access l...",
    category: "Platform Features",
    section: "project-specs"
  },
  {
    title: "Whitepine Brand Guide",
    filename: "brand.md",
    excerpt: "A civic platform rooted in the Great Tree of Peace, carrying forward the tradition of consensus, unity, and strength.",
    category: "Technical Documentation",
    section: "project-specs"
  },
  {
    title: "Whitepine Full-Stack Application - Library Index",
    filename: "library-index.md",
    excerpt: "This index provides comprehensive documentation for the Whitepine Full-Stack Application deployment architecture, setup procedures, and operational guidelines.",
    category: "API Documentation",
    section: "project-specs"
  },

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
