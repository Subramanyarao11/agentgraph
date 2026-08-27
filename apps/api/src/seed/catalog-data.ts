import type { DataSensitivity, RiskLevel, ToolAuthType, ToolCategory } from "@agentgraph/graph-schema";

/**
 * Hand-authored (not randomized) tool and dataset catalogs. These are the
 * "connectors" a real Wexa-style agent platform would integrate with — kept
 * fixed and realistic (rather than faker-generated) so the lineage/exposure/
 * impact demo queries produce coherent, explainable results instead of
 * noise: e.g. Salesforce genuinely reads/writes Customer Contacts, so
 * "which agents can reach PII" has a sensible answer.
 */

export interface ToolSeed {
  name: string;
  vendor: string;
  category: ToolCategory;
  authType: ToolAuthType;
  riskLevel: RiskLevel;
}

export const TOOL_CATALOG: ToolSeed[] = [
  { name: "Slack", vendor: "Salesforce", category: "communication", authType: "oauth2", riskLevel: "medium" },
  { name: "Gmail", vendor: "Google", category: "communication", authType: "oauth2", riskLevel: "medium" },
  { name: "Microsoft Teams", vendor: "Microsoft", category: "communication", authType: "oauth2", riskLevel: "medium" },
  { name: "Jira", vendor: "Atlassian", category: "project_management", authType: "oauth2", riskLevel: "low" },
  { name: "Asana", vendor: "Asana", category: "project_management", authType: "oauth2", riskLevel: "low" },
  { name: "Linear", vendor: "Linear", category: "project_management", authType: "api_key", riskLevel: "low" },
  { name: "Salesforce", vendor: "Salesforce", category: "crm", authType: "oauth2", riskLevel: "high" },
  { name: "HubSpot", vendor: "HubSpot", category: "crm", authType: "oauth2", riskLevel: "medium" },
  { name: "Zendesk", vendor: "Zendesk", category: "crm", authType: "oauth2", riskLevel: "medium" },
  { name: "Google Drive", vendor: "Google", category: "storage", authType: "oauth2", riskLevel: "medium" },
  { name: "Dropbox", vendor: "Dropbox", category: "storage", authType: "oauth2", riskLevel: "medium" },
  { name: "Notion", vendor: "Notion", category: "storage", authType: "oauth2", riskLevel: "low" },
  { name: "Confluence", vendor: "Atlassian", category: "storage", authType: "oauth2", riskLevel: "low" },
  { name: "Stripe", vendor: "Stripe", category: "finance", authType: "api_key", riskLevel: "high" },
  { name: "NetSuite", vendor: "Oracle", category: "finance", authType: "service_account", riskLevel: "high" },
  { name: "Workday", vendor: "Workday", category: "finance", authType: "service_account", riskLevel: "high" },
  { name: "Okta", vendor: "Okta", category: "identity", authType: "service_account", riskLevel: "high" },
  { name: "Azure AD", vendor: "Microsoft", category: "identity", authType: "service_account", riskLevel: "high" },
  { name: "Snowflake", vendor: "Snowflake", category: "analytics", authType: "service_account", riskLevel: "high" },
  { name: "Looker", vendor: "Google", category: "analytics", authType: "oauth2", riskLevel: "medium" },
  { name: "Amplitude", vendor: "Amplitude", category: "analytics", authType: "api_key", riskLevel: "low" },
  { name: "GitHub", vendor: "GitHub", category: "custom_api", authType: "oauth2", riskLevel: "medium" },
  { name: "PagerDuty", vendor: "PagerDuty", category: "custom_api", authType: "api_key", riskLevel: "medium" },
  { name: "ServiceNow", vendor: "ServiceNow", category: "custom_api", authType: "service_account", riskLevel: "high" },
  { name: "Internal Billing API", vendor: "In-house", category: "custom_api", authType: "api_key", riskLevel: "high" },
  { name: "Internal Customer 360 API", vendor: "In-house", category: "custom_api", authType: "service_account", riskLevel: "high" },
];

export interface DatasetSeed {
  name: string;
  system: string;
  sensitivity: DataSensitivity;
}

export const DATASET_CATALOG: DatasetSeed[] = [
  { name: "Customer Contacts", system: "Salesforce", sensitivity: "pii" },
  { name: "Sales Pipeline", system: "Salesforce", sensitivity: "confidential" },
  { name: "Customer Support Tickets", system: "Zendesk", sensitivity: "confidential" },
  { name: "Support Macros", system: "Zendesk", sensitivity: "public" },
  { name: "Employee Records", system: "Workday", sensitivity: "pii" },
  { name: "Payroll Data", system: "Workday", sensitivity: "pii" },
  { name: "Invoice Records", system: "Stripe", sensitivity: "confidential" },
  { name: "Billing Transactions", system: "Internal Billing API", sensitivity: "confidential" },
  { name: "Product Usage Events", system: "Amplitude", sensitivity: "internal" },
  { name: "Engineering Backlog", system: "Jira", sensitivity: "internal" },
  { name: "Marketing Campaign Metrics", system: "HubSpot", sensitivity: "internal" },
  { name: "Company Wiki", system: "Confluence", sensitivity: "internal" },
  { name: "Public Changelog", system: "Notion", sensitivity: "public" },
  { name: "Slack Channel Archive", system: "Slack", sensitivity: "confidential" },
  { name: "Email Threads", system: "Gmail", sensitivity: "confidential" },
  { name: "On-call Incident Logs", system: "PagerDuty", sensitivity: "confidential" },
  { name: "Identity Directory", system: "Okta", sensitivity: "pii" },
  { name: "Financial Ledger", system: "NetSuite", sensitivity: "confidential" },
  { name: "Customer 360 Profile", system: "Internal Customer 360 API", sensitivity: "pii" },
  { name: "Data Warehouse Tables", system: "Snowflake", sensitivity: "confidential" },
];

export type DataAccess = "read" | "write";

/** tool name -> dataset name -> access */
export const TOOL_DATASET_LINKS: Array<{ tool: string; dataset: string; access: DataAccess }> = [
  { tool: "Salesforce", dataset: "Customer Contacts", access: "write" },
  { tool: "Salesforce", dataset: "Sales Pipeline", access: "write" },
  { tool: "Zendesk", dataset: "Customer Support Tickets", access: "write" },
  { tool: "Zendesk", dataset: "Support Macros", access: "read" },
  { tool: "Workday", dataset: "Employee Records", access: "write" },
  { tool: "Workday", dataset: "Payroll Data", access: "write" },
  { tool: "Stripe", dataset: "Invoice Records", access: "write" },
  { tool: "Internal Billing API", dataset: "Billing Transactions", access: "write" },
  { tool: "Internal Billing API", dataset: "Invoice Records", access: "read" },
  { tool: "Amplitude", dataset: "Product Usage Events", access: "write" },
  { tool: "Jira", dataset: "Engineering Backlog", access: "write" },
  { tool: "Linear", dataset: "Engineering Backlog", access: "write" },
  { tool: "Asana", dataset: "Engineering Backlog", access: "write" },
  { tool: "HubSpot", dataset: "Marketing Campaign Metrics", access: "write" },
  { tool: "HubSpot", dataset: "Customer Contacts", access: "read" },
  { tool: "Confluence", dataset: "Company Wiki", access: "write" },
  { tool: "Notion", dataset: "Public Changelog", access: "write" },
  { tool: "Notion", dataset: "Company Wiki", access: "read" },
  { tool: "Google Drive", dataset: "Company Wiki", access: "read" },
  { tool: "Dropbox", dataset: "Company Wiki", access: "read" },
  { tool: "Slack", dataset: "Slack Channel Archive", access: "write" },
  { tool: "Microsoft Teams", dataset: "Slack Channel Archive", access: "write" },
  { tool: "Gmail", dataset: "Email Threads", access: "write" },
  { tool: "PagerDuty", dataset: "On-call Incident Logs", access: "write" },
  { tool: "ServiceNow", dataset: "On-call Incident Logs", access: "write" },
  { tool: "Okta", dataset: "Identity Directory", access: "read" },
  { tool: "Azure AD", dataset: "Identity Directory", access: "write" },
  { tool: "NetSuite", dataset: "Financial Ledger", access: "write" },
  { tool: "Internal Customer 360 API", dataset: "Customer 360 Profile", access: "write" },
  { tool: "Internal Customer 360 API", dataset: "Customer Contacts", access: "read" },
  { tool: "Snowflake", dataset: "Data Warehouse Tables", access: "write" },
  { tool: "Looker", dataset: "Data Warehouse Tables", access: "read" },
  { tool: "GitHub", dataset: "Engineering Backlog", access: "read" },
];

export interface AgentRoleSeed {
  role: string;
  description: string;
  preferredTools: string[];
}

export const AGENT_ROLES: AgentRoleSeed[] = [
  {
    role: "Customer Support Triage",
    description: "Classifies inbound support tickets, drafts first-response replies, and escalates urgent cases.",
    preferredTools: ["Zendesk", "Slack", "Internal Customer 360 API"],
  },
  {
    role: "Sales Lead Qualification",
    description: "Scores inbound leads against ICP criteria and routes qualified leads to the right rep.",
    preferredTools: ["Salesforce", "HubSpot", "Slack"],
  },
  {
    role: "Invoice Reconciliation",
    description: "Matches incoming invoices against purchase orders and flags discrepancies for finance review.",
    preferredTools: ["Stripe", "Internal Billing API", "NetSuite"],
  },
  {
    role: "Incident Response Coordinator",
    description: "Correlates alerts, pages the right on-call engineer, and drafts the incident timeline.",
    preferredTools: ["PagerDuty", "ServiceNow", "Slack"],
  },
  {
    role: "HR Onboarding Assistant",
    description: "Provisions new-hire accounts and walks new employees through onboarding checklists.",
    preferredTools: ["Workday", "Okta", "Gmail"],
  },
  {
    role: "Marketing Content Drafter",
    description: "Drafts campaign copy and social posts from a content brief, then queues them for review.",
    preferredTools: ["HubSpot", "Notion", "Slack"],
  },
  {
    role: "Expense Audit",
    description: "Reviews submitted expense reports against policy and flags anomalies.",
    preferredTools: ["NetSuite", "Internal Billing API", "Gmail"],
  },
  {
    role: "Recruiting Screener",
    description: "Screens inbound applications against the role rubric and schedules qualified candidates.",
    preferredTools: ["Workday", "Gmail", "Slack"],
  },
  {
    role: "Meeting Notes Summarizer",
    description: "Summarizes recorded meetings into action items and posts them to the right channel.",
    preferredTools: ["Microsoft Teams", "Slack", "Notion"],
  },
  {
    role: "Data Pipeline Monitor",
    description: "Watches warehouse pipeline runs and pages the data team when a job fails SLA.",
    preferredTools: ["Snowflake", "PagerDuty", "Looker"],
  },
  {
    role: "Contract Review",
    description: "Extracts key terms and flags non-standard clauses in inbound vendor contracts.",
    preferredTools: ["Google Drive", "Dropbox", "Gmail"],
  },
  {
    role: "Renewal Risk Detection",
    description: "Scores accounts for churn risk ahead of renewal using usage and support signals.",
    preferredTools: ["Salesforce", "Amplitude", "Zendesk"],
  },
  {
    role: "Order Fulfillment",
    description: "Validates order details and triggers downstream fulfillment steps.",
    preferredTools: ["Salesforce", "Internal Billing API", "Slack"],
  },
  {
    role: "Customer Health Scoring",
    description: "Aggregates product usage and support history into a rolling customer health score.",
    preferredTools: ["Amplitude", "Zendesk", "Internal Customer 360 API"],
  },
  {
    role: "Knowledge Base Curation",
    description: "Flags stale help-center articles and drafts updates from recent support tickets.",
    preferredTools: ["Zendesk", "Confluence", "Notion"],
  },
  {
    role: "Compliance Monitoring",
    description: "Scans access logs and account changes for policy violations.",
    preferredTools: ["Okta", "Azure AD", "ServiceNow"],
  },
  {
    role: "Vendor Risk Assessment",
    description: "Reviews new vendor submissions against security and financial risk criteria.",
    preferredTools: ["NetSuite", "Google Drive", "Slack"],
  },
  {
    role: "Churn Prediction Outreach",
    description: "Identifies at-risk accounts and drafts a personalized retention outreach sequence.",
    preferredTools: ["Salesforce", "HubSpot", "Amplitude"],
  },
  {
    role: "Bug Triage",
    description: "Labels and prioritizes incoming bug reports and assigns them to the right team.",
    preferredTools: ["Jira", "Linear", "GitHub"],
  },
  {
    role: "Release Notes Drafting",
    description: "Compiles merged changes since the last release into a customer-facing changelog entry.",
    preferredTools: ["GitHub", "Notion", "Jira"],
  },
];
