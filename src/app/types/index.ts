// TypeScript types based on database schema and API structure
// These types conform exactly to the MongoDB models and API responses

// ============================================================================
// BASE TYPES
// ============================================================================

export type UserRole = 'user' | 'moderator' | 'admin' | 'developer';
export type AuthProvider = 'local' | 'google' | 'apple';
export type MediaType = 'image' | 'document' | 'video';
export type EntityType = 'User' | 'Obligation' | 'Claim' | 'Evidence' | 'Jurisdiction' | 'GoverningBody' | 'Office' | 'Position';
export type ObligationStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
export type ObligationDisposition = 'Discharged' | 'Violated' | 'Partially Discharged' | 'No Action Taken';

// ============================================================================
// USER TYPES
// ============================================================================

export interface AuthProviderData {
  provider: AuthProvider;
  providerUserId: string;
}

export interface UserProfile {
  bio?: string;
  location?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  password?: string; // Only present for local auth, select: false in schema
  firstName: string;
  lastName: string;
  roles: UserRole[];
  isActive: boolean;
  lastLogin?: Date;
  profile?: UserProfile;
  authProviders: AuthProviderData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  identifier: string; // email or username
  password: string;
}

// ============================================================================
// ROLE TYPES
// ============================================================================

export interface Role {
  _id: string;
  name: string;
  scopes: string[];
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// MEDIA TYPES
// ============================================================================

export interface Media {
  _id: string;
  filename: string;
  originalName: string;
  mediaType: MediaType;
  bytes: number;
  mime: string;
  description?: string;
  entityType?: EntityType;
  entityId?: string;
  isPrimary: boolean;
  url?: string;
  uploadedBy: string; // User._id
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// GOVERNMENT TYPES
// ============================================================================

export interface Identifier {
  ocd_id?: string;
  fips?: string;
  geoid?: string;
  ansi?: string;
  usgm_id?: string;
  other?: Record<string, string>;
}

export interface Jurisdiction {
  _id: string;
  name: string;
  slug: string;
  level: 'country' | 'state' | 'county' | 'city' | 'district' | 'special';
  entity_type: 'jurisdiction' | 'body' | 'office' | 'position' | 'election' | 'legislation';
  parent?: string; // Jurisdiction._id
  path: string; // materialized path like /usa/state/california/county/san-mateo
  depth: number;
  media?: string[]; // Media._id[]
  primary_media?: string; // Media._id
  identifiers?: Identifier;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoverningBody {
  _id: string;
  name: string;
  slug: string;
  jurisdiction: string; // Jurisdiction._id
  branch: 'executive' | 'legislative' | 'judicial' | 'administrative';
  entity_type: 'jurisdiction' | 'body' | 'office' | 'position' | 'election' | 'legislation';
  parent?: string; // GoverningBody._id
  path: string;
  depth: number;
  media?: string[]; // Media._id[]
  primary_media?: string; // Media._id
  identifiers?: Identifier;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface District {
  _id: string;
  name: string;
  slug: string;
  jurisdiction: string; // Jurisdiction._id
  district_type: 'electoral' | 'school' | 'special' | 'administrative';
  boundaries?: string; // GeoJSON or description
  population?: number;
  media?: string[]; // Media._id[]
  primary_media?: string; // Media._id
  identifiers?: Identifier;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Office {
  _id: string;
  name: string;
  slug: string;
  office_type: 'elected' | 'appointed' | 'civil_service' | 'contract' | 'volunteer';
  governing_body?: string; // GoverningBody._id
  jurisdiction?: string; // Jurisdiction._id
  constituency: 'general' | 'district' | 'ward' | 'precinct' | 'at-large';
  district?: string; // District._id
  selection_method: 'election' | 'appointment' | 'inheritance' | 'merit' | 'other';
  term_length?: number; // in months
  term_limit?: number; // maximum terms
  salary?: number;
  is_part_time: boolean;
  media?: string[]; // Media._id[]
  primary_media?: string; // Media._id
  identifiers?: Identifier;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  _id: string;
  title: string;
  office: string; // Office._id
  person: string; // User._id
  start_date: Date;
  end_date?: Date;
  is_current: boolean;
  party?: string;
  media?: string[]; // Media._id[]
  primary_media?: string; // Media._id
  identifiers?: Identifier;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Election {
  _id: string;
  name: string;
  slug: string;
  jurisdiction: string; // Jurisdiction._id
  election_type: 'primary' | 'general' | 'special' | 'runoff' | 'recall' | 'referendum' | 'initiative';
  election_date: Date;
  registration_deadline?: Date;
  early_voting_start?: Date;
  early_voting_end?: Date;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  description?: string;
  media?: string[]; // Media._id[]
  primary_media?: string; // Media._id
  identifiers?: Identifier;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Legislation {
  _id: string;
  title: string;
  slug: string;
  governing_body: string; // GoverningBody._id
  bill_number?: string;
  status: 'introduced' | 'in_committee' | 'passed_committee' | 'passed_chamber' | 'passed_both' | 'signed' | 'vetoed' | 'failed';
  introduction_date?: Date;
  last_action_date?: Date;
  description?: string;
  full_text?: string;
  summary?: string;
  media?: string[]; // Media._id[]
  primary_media?: string; // Media._id
  identifiers?: Identifier;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface GovernmentVote {
  _id: string;
  legislation: string; // Legislation._id
  person: string; // User._id
  vote: 'yes' | 'no' | 'abstain' | 'absent';
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Committee {
  _id: string;
  name: string;
  slug: string;
  governing_body: string; // GoverningBody._id
  committee_type: 'standing' | 'select' | 'joint' | 'conference' | 'subcommittee';
  description?: string;
  media?: string[]; // Media._id[]
  primary_media?: string; // Media._id
  identifiers?: Identifier;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactInfo {
  _id: string;
  entity_type: 'jurisdiction' | 'governing_body' | 'office' | 'position';
  entity_id: string;
  contact_type: 'phone' | 'email' | 'address' | 'website' | 'social';
  value: string;
  is_primary: boolean;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// OBLIGATION TYPES
// ============================================================================

export interface Obligation {
  _id: string;
  title: string;
  description: string;
  categoryId: string; // Taxonomy._id
  creator: string; // User._id
  status: ObligationStatus;
  boundPartyType: 'governing body' | 'office' | 'position' | 'legislation' | 'jurisdiction' | 'individual';
  boundPartyId: string; // ObjectId reference
  bindingPartyType: 'governing body' | 'office' | 'position' | 'legislation' | 'jurisdiction' | 'individual';
  bindingPartyId: string; // ObjectId reference
  dueDate?: Date;
  tags?: string[];
  obligationType: string; // discriminator key
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PoliticalPromise extends Obligation {
  promiseType: 'campaign' | 'policy' | 'legislative' | 'administrative';
  evidence?: string[]; // Evidence._id[]
}

// ============================================================================
// CLAIM TYPES
// ============================================================================

export interface Claim {
  _id: string;
  title: string;
  description?: string;
  disposition: 'pending' | 'accepted' | 'rejected' | 'under_review';
  evidence?: string[]; // Evidence._id[]
  obligation: string; // Obligation._id
  obligationAttribute: 'fulfillment' | 'violation' | 'progress' | 'status';
  creator: string; // User._id
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// EVIDENCE TYPES
// ============================================================================

export interface Evidence {
  _id: string;
  title: string;
  description?: string;
  relationship: 'supports' | 'contradicts' | 'neutral' | 'context';
  dateCollected?: Date;
  dateCreated?: Date;
  location?: string;
  language?: string;
  relatedEvidence?: string[]; // Evidence._id[]
  mediaReferences?: string[]; // Media._id[]
  tags?: string[];
  creator: string; // User._id
  owner: string; // User._id
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// IDENTITY TYPES
// ============================================================================

export interface Identity {
  _id: string;
  id: number; // Legacy numeric ID
  parentId?: number; // Legacy numeric parent ID
  populationEstimate?: number;
  name: string;
  slug: string;
  abbr?: string;
  description?: string;
  isActive: boolean;
  identityType: string; // discriminator key
  createdAt: Date;
  updatedAt: Date;
}

export interface PoliticalIdentity extends Identity {
  color: string; // Hex color code
}

export interface UserIdentity {
  _id: string;
  userId: string; // User._id
  identityId: string; // Identity._id (ObjectId)
  rank: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// TAXONOMY TYPES
// ============================================================================

export interface Taxonomy {
  _id: string;
  name: string;
  slug: string;
  type: string;
  parent?: string; // Taxonomy._id
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  meta?: {
    pagination?: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
    filters?: Record<string, any>;
    sort?: {
      field: string;
      direction: 'asc' | 'desc';
    };
  };
}

export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort?: string;
  sort_order?: 'asc' | 'desc';
  filter?: Record<string, any>;
  fields?: string;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => void;
  updateUser: (userData: Partial<User>) => void;
  hasRole: (role: string) => boolean;
  hasScope: (scope: string) => boolean;
}

export interface PoliticalIdentityContextType {
  selectedIdentity: PoliticalIdentity | null;
  setSelectedIdentity: (identity: PoliticalIdentity | null) => void;
  availableIdentities: PoliticalIdentity[];
}

// ============================================================================
// EXPORTS
// ============================================================================

// Types are exported individually above - no default export needed
