import { Twitter, Instagram, Linkedin, Facebook } from 'lucide-react';
import type { SiteSettings } from '../hooks/useSiteSettings';

interface Props {
  settings: Pick<SiteSettings, 'linkedin_url' | 'social_twitter_url' | 'social_instagram_url' | 'social_facebook_url'>;
  size?: number;
  className?: string;
}

const networks = [
  {
    key: 'linkedin_url' as const,
    label: 'LinkedIn',
    Icon: Linkedin,
    hoverColor: 'hover:text-[#0A66C2]',
  },
  {
    key: 'social_twitter_url' as const,
    label: 'X (Twitter)',
    Icon: Twitter,
    hoverColor: 'hover:text-[#000000] dark:hover:text-white',
  },
  {
    key: 'social_instagram_url' as const,
    label: 'Instagram',
    Icon: Instagram,
    hoverColor: 'hover:text-[#E1306C]',
  },
  {
    key: 'social_facebook_url' as const,
    label: 'Facebook',
    Icon: Facebook,
    hoverColor: 'hover:text-[#1877F2]',
  },
] as const;

export function SocialIcons({ settings, size = 20, className = '' }: Props) {
  const visible = networks.filter(n => !!settings[n.key]);
  if (visible.length === 0) return null;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {visible.map(({ key, label, Icon, hoverColor }) => (
        <a
          key={key}
          href={settings[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className={`p-2 rounded-lg text-light-muted dark:text-dark-muted ${hoverColor} hover:bg-light-elevated dark:hover:bg-dark-elevated transition-all duration-200`}
        >
          <Icon size={size} />
        </a>
      ))}
    </div>
  );
}
