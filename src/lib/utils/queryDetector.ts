import { QueryType } from '../../types/threatIntel';

const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const md5Regex = /^[a-fA-F0-9]{32}$/;
const sha1Regex = /^[a-fA-F0-9]{40}$/;
const sha256Regex = /^[a-fA-F0-9]{64}$/;
const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/i;
const urlRegex = /^(https?:\/\/)([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
const cveRegex = /^CVE-\d{4}-\d{4,}$/i;

export function detectQueryType(query: string): QueryType | null {
  query = query.trim();

  if (ipRegex.test(query)) return 'ip';
  if (md5Regex.test(query) || sha1Regex.test(query) || sha256Regex.test(query)) return 'hash';
  if (urlRegex.test(query)) return 'url';
  if (domainRegex.test(query)) return 'domain';
  if (cveRegex.test(query)) return 'cve';

  return null;
}
