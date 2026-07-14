import StatusBadge from '@/components/StatusBadge';
import { ReplyWithUser } from '@/lib/types';
import { timeAgo } from '@/lib/utils';

interface ReplyItemProps {
  reply: ReplyWithUser;
}

export default function ReplyItem({ reply }: ReplyItemProps) {
  const isAdminUser = reply.user.role === 'ADMIN';
  return (
    <div className="flex gap-2 py-1">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold ${
          isAdminUser
            ? 'bg-crimson-900 border border-crimson-700 text-crimson-200'
            : 'bg-obsidian-600 border border-obsidian-500 text-silver-900'
        }`}
      >
        {reply.user.name[0]?.toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-[10px] font-semibold ${isAdminUser ? 'text-crimson-400' : 'text-silver-800'}`}>
            {reply.user.name}
          </span>
          <StatusBadge statusLevel={reply.user.statusLevel} size="sm" />
          <span className="text-obsidian-500 text-[9px]">{timeAgo(reply.timestamp)}</span>
        </div>
        <p className="text-silver-900 text-[11px] leading-relaxed mt-0.5 break-words">{reply.content}</p>
      </div>
    </div>
  );
}
