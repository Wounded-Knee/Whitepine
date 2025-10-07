'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { Avatar } from '@/components/avatar';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export function UserBadge() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <Link href="/profile">
      <Card className="p-3 hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center gap-3">
          <Avatar
            avatarUrl={session.user.image}
            name={session.user.name || 'User'}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{session.user.name}</h3>
            <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
          </div>
        </div>
      </Card>
    </Link>
  );
}

