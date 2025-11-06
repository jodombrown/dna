import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

interface LikeUser {
  user_id: string;
  full_name: string;
  username: string;
  avatar_url?: string;
  headline?: string;
}

interface LikedByModalProps {
  isOpen: boolean;
  onClose: () => void;
  likedBy: LikeUser[];
}

export function LikedByModal({ isOpen, onClose, likedBy }: LikedByModalProps) {
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            Liked by {likedBy.length} {likedBy.length === 1 ? 'person' : 'people'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-3">
            {likedBy.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => {
                  navigate(`/dna/${user.username}`);
                  onClose();
                }}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar_url} alt={user.full_name} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(user.full_name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{user.full_name}</p>
                  {user.headline && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {user.headline}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
