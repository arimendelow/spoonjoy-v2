import { Avatar } from '../ui/avatar'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Heading, Subheading } from '../ui/heading'
import { Link } from '../ui/link'
import { Text } from '../ui/text'

export interface BioCardProps {
  name: string
  bio: string
  recipeCount: number
  cookbookCount: number
  avatarUrl?: string
  profileHref?: string
  location?: string
  joinedLabel?: string
  onEditProfile?: () => void
}

export function BioCard({
  name,
  bio,
  recipeCount,
  cookbookCount,
  avatarUrl,
  profileHref,
  location,
  joinedLabel,
  onEditProfile,
}: BioCardProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()

  return (
    <section className="rounded-2xl border border-zinc-950/10 bg-white p-4 shadow-xs dark:border-white/10 dark:bg-zinc-900 sm:p-5">
      <div className="flex items-start gap-3">
        <Avatar
          src={avatarUrl}
          initials={initials}
          alt={name}
          className="size-14 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
        />
        <div className="min-w-0 flex-1">
          {profileHref ? (
            <Link href={profileHref} className="hover:underline">
              <Heading level={2} className="truncate text-lg/6 font-semibold">
                {name}
              </Heading>
            </Link>
          ) : (
            <Heading level={2} className="truncate text-lg/6 font-semibold">
              {name}
            </Heading>
          )}

          {(location || joinedLabel) && (
            <Text className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {[location, joinedLabel].filter(Boolean).join(' • ')}
            </Text>
          )}
        </div>
      </div>

      <Text className="mt-4 text-sm/6">{bio}</Text>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge color="blue">{recipeCount} recipes</Badge>
        <Badge color="emerald">{cookbookCount} cookbooks</Badge>
      </div>

      {onEditProfile && (
        <div className="mt-5">
          <Button plain onClick={onEditProfile} className="w-full justify-center">
            Edit Profile
          </Button>
        </div>
      )}

      <div className="mt-5 border-t border-zinc-950/10 pt-4 dark:border-white/10">
        <Subheading level={3} className="text-sm">
          Kitchen Snapshot
        </Subheading>
        <Text className="mt-1 text-xs">
          Keeping your pantry fresh with small-batch recipes and practical weeknight staples.
        </Text>
      </div>
    </section>
  )
}
