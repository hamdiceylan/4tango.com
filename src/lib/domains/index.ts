export { PLATFORM_HOSTS, CUSTOM_DOMAIN_TARGET, isPlatformHost, addPlatformHost } from './platformHosts';
export { normalizeHostname } from './normalizeHostname';
export { validateHostname, isApexDomain, type ValidationResult } from './validateHostname';
export { verifyDnsCname, verifyDnsCnameCloudflare, type DnsVerificationResult } from './verifyDns';
export { resolveEventByHostname, isCustomDomainInUse, type DomainResolutionResult } from './resolveEventByHostname';
