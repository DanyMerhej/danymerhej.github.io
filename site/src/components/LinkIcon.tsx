import { Github, Globe, Instagram, Smartphone } from 'lucide-react';
import type { ProjectLink } from '../data/site';

export function LinkIcon({ kind, className }: { kind: ProjectLink['kind']; className?: string }) {
  if (kind === 'store') return <Smartphone className={className} />;
  if (kind === 'social') return <Instagram className={className} />;
  if (kind === 'code') return <Github className={className} />;
  return <Globe className={className} />;
}
