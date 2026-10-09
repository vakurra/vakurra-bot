import type { ReactNode } from "react";

import content from "../styles/content.module.css";

type BotIdentityProps = {
  name: ReactNode;
  username: string;
  profilePhotoUrl: string | null;
  badge?: ReactNode;
  meta?: ReactNode;
  trailing?: ReactNode;
  avatarClassName?: string;
  fallbackLetter?: string;
};

export function BotIdentity({
  name,
  username,
  profilePhotoUrl,
  badge,
  meta,
  trailing,
  avatarClassName,
  fallbackLetter,
}: BotIdentityProps) {
  const avatarClass = `${content.avatar} ${avatarClassName ?? ""}`;

  return (
    <div className={content.botMain}>
      {profilePhotoUrl ? (
        <img
          className={avatarClass}
          src={profilePhotoUrl}
          alt=""
        />
      ) : (
        <div
          className={`${avatarClass} ${content.avatarFallback}`}
          aria-hidden="true"
        >
          {(fallbackLetter || username).trim().charAt(0).toUpperCase()}
        </div>
      )}

      <div className={content.info}>
        <div className={content.identityTitle}>
          {name}
          {badge}
        </div>
        <p className={content.username}>@{username}</p>
        {meta}
      </div>

      {trailing}
    </div>
  );
}
