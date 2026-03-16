import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Hash,
  Users,
  MessageCircle,
  Send,
  Plus,
  Search,
  X,
} from 'lucide-react';
import { mockChatMessages, mockChatRooms, mockProjects, mockMembers } from '@/mocks';
import type { ChatMessage, ChatRoom, Member } from '@/types';
import ChatMessageBubble from './ChatMessage';
import { ProjectMemberAvatar, Button, Badge } from '@/components/ui';

const CURRENT_USER_ID = 'mem-1';

export default function ChatPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const project = projectId ? mockProjects.find((p) => p.id === projectId) : undefined;
  const allMembers: Member[] = project?.members.map((pm) => pm.member) ?? mockMembers;

  const [rooms, setRooms] = useState<ChatRoom[]>(() => {
    const projectRooms = mockChatRooms.filter((r) => r.projectId === projectId);
    const hasGeneral = projectRooms.some((r) => r.type === 'general');
    if (!hasGeneral && projectId && allMembers.length > 0) {
      const generalRoom: ChatRoom = {
        id: `room-general-${projectId}`,
        projectId,
        name: 'General',
        type: 'general',
        members: project?.members.map((pm) => pm.member) ?? allMembers,
        createdAt: new Date().toISOString(),
      };
      return [generalRoom, ...projectRooms];
    }
    return projectRooms;
  });

  const [activeRoomId, setActiveRoomId] = useState<string>(() =>
    `room-general-${projectId ?? ''}`,
  );
  const [allMessages, setAllMessages] = useState<ChatMessage[]>(() =>
    mockChatMessages.filter((m) => m.projectId === projectId && m.channel === 'group'),
  );
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);

  const activeRoom = rooms.find((r) => r.id === activeRoomId);
  const roomMessages = allMessages.filter((m) => m.roomId === activeRoomId);

  const channels = rooms.filter((r) => r.type === 'general' || r.type === 'channel');

  // Direct messages = all project members except current user (always visible)
  const dmMembers = useMemo(
    () => allMembers.filter((m) => m.id !== CURRENT_USER_ID),
    [allMembers],
  );

  const filteredChannels = searchQuery
    ? channels.filter((r) => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : channels;
  const filteredDmMembers = searchQuery
    ? dmMembers.filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : dmMembers;

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [roomMessages.length, activeRoomId]);

  useEffect(() => {
    if (projectId) {
      const projectRooms = mockChatRooms.filter((r) => r.projectId === projectId);
      const hasGeneral = projectRooms.some((r) => r.type === 'general');
      const proj = mockProjects.find((p) => p.id === projectId);
      const members = proj?.members.map((pm) => pm.member) ?? mockMembers;
      if (!hasGeneral && members.length > 0) {
        const generalRoom: ChatRoom = {
          id: `room-general-${projectId}`,
          projectId,
          name: 'General',
          type: 'general',
          members,
          createdAt: new Date().toISOString(),
        };
        setRooms([generalRoom, ...projectRooms]);
      } else {
        setRooms(projectRooms);
      }
      setActiveRoomId(`room-general-${projectId}`);
      setAllMessages(mockChatMessages.filter((m) => m.projectId === projectId && m.channel === 'group'));
    }
  }, [projectId]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || !projectId) return;

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      projectId,
      roomId: activeRoomId,
      sender: mockMembers[0],
      content: trimmed,
      timestamp: new Date().toISOString(),
      channel: 'group',
    };
    setAllMessages((prev) => [...prev, newMessage]);
    setInput('');
  };

  const handleCreateChannel = (name: string, memberIds: string[]) => {
    if (!projectId) return;
    const selectedMembers = allMembers.filter((m) => memberIds.includes(m.id));
    if (!selectedMembers.some((m) => m.id === CURRENT_USER_ID)) {
      selectedMembers.unshift(mockMembers[0]);
    }
    const newRoom: ChatRoom = {
      id: `room-${Date.now()}`,
      projectId,
      name,
      type: 'channel',
      members: selectedMembers,
      createdAt: new Date().toISOString(),
    };
    setRooms((prev) => [...prev, newRoom]);
    setActiveRoomId(newRoom.id);
    setShowCreateModal(false);
  };

  const handleOpenDM = (member: Member) => {
    const dmId = `dm-${member.id}`;
    const existing = rooms.find((r) => r.id === dmId);
    if (existing) {
      setActiveRoomId(dmId);
      return;
    }
    const currentUser = mockMembers[0];
    const newRoom: ChatRoom = {
      id: dmId,
      projectId: projectId!,
      name: member.name,
      type: 'direct',
      members: [currentUser, member],
      createdAt: new Date().toISOString(),
    };
    setRooms((prev) => [...prev, newRoom]);
    setActiveRoomId(dmId);
  };

  const onlineIds = new Set(allMembers.slice(0, 3).map((m) => m.id));

  const projectMembers = project?.members ?? [];
  const getRoomIcon = (room: ChatRoom) => {
    if (room.type === 'direct') {
      const other = room.members.find((m) => m.id !== CURRENT_USER_ID) ?? room.members[0];
      return (
        <ProjectMemberAvatar
          member={other}
          projectMembers={projectMembers}
          size="sm"
          online={onlineIds.has(other.id)}
        />
      );
    }
    if (room.type === 'general') {
      return (
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 text-primary">
          <Users className="h-4 w-4" />
        </div>
      );
    }
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
        <Hash className="h-4 w-4" />
      </div>
    );
  };

  const getLastMessage = (roomId: string) => {
    const msgs = allMessages.filter((m) => m.roomId === roomId);
    return msgs[msgs.length - 1];
  };

  const getDmRoomForMember = (member: Member) =>
    rooms.find((r) => r.type === 'direct' && r.members.some((m) => m.id === member.id));

  return (
    <div className="flex h-[calc(100vh-12rem)] gap-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
      {/* Left: Room list */}
      <div className="flex w-72 flex-shrink-0 flex-col border-r border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-indigo-600" />
            <h2 className="text-sm font-bold text-slate-900">Chat</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
            title="New group channel"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:border-primary focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Room list */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {/* Channels */}
          <p className="mb-1 mt-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Channels
          </p>
          {filteredChannels.map((room) => {
            const last = getLastMessage(room.id);
            const isActive = room.id === activeRoomId;
            return (
              <button
                key={room.id}
                type="button"
                onClick={() => setActiveRoomId(room.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                {getRoomIcon(room)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`truncate text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {room.name}
                    </span>
                    <span className="text-xs text-slate-400">{room.members.length}</span>
                  </div>
                  {last && (
                    <p className="truncate text-xs text-slate-400">
                      {last.sender !== 'ai' ? `${last.sender.name.split(' ')[0]}: ` : ''}
                      {last.content}
                    </p>
                  )}
                </div>
              </button>
            );
          })}

          {/* Direct Messages - always show project members */}
          <p className="mb-1 mt-4 px-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Direct Messages
          </p>
          {filteredDmMembers.map((member) => {
            const dmRoom = getDmRoomForMember(member);
            const last = dmRoom ? getLastMessage(dmRoom.id) : null;
            const isActive = dmRoom?.id === activeRoomId;
            return (
              <button
                key={member.id}
                type="button"
                onClick={() => handleOpenDM(member)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ProjectMemberAvatar
                  member={member}
                  projectMembers={projectMembers}
                  size="sm"
                  online={onlineIds.has(member.id)}
                />
                <div className="min-w-0 flex-1">
                  <span className={`block truncate text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {member.name}
                  </span>
                  {last && (
                    <p className="truncate text-xs text-slate-400">{last.content}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: Chat area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {activeRoom ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3">
              {getRoomIcon(activeRoom)}
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-bold text-slate-900">{activeRoom.name}</h3>
                <p className="text-xs text-slate-500">
                  {activeRoom.type === 'direct'
                    ? 'Direct message'
                    : `${activeRoom.members.length} members`}
                </p>
              </div>
              <div className="flex -space-x-2">
                {activeRoom.members.slice(0, 4).map((m) => (
                  <ProjectMemberAvatar
                    key={m.id}
                    member={m}
                    projectMembers={projectMembers}
                    size="sm"
                    online={onlineIds.has(m.id)}
                  />
                ))}
                {activeRoom.members.length > 4 && (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-medium text-slate-600">
                    +{activeRoom.members.length - 4}
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-5 space-y-4">
              {roomMessages.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                  <MessageCircle className="mb-3 h-10 w-10" />
                  <p className="text-sm font-medium">No messages yet</p>
                  <p className="text-xs">Start the conversation!</p>
                </div>
              )}
              {roomMessages.map((msg) => (
                <ChatMessageBubble
                  key={msg.id}
                  message={msg}
                  isOwn={msg.sender !== 'ai' && msg.sender.id === CURRENT_USER_ID}
                  projectMembers={projectMembers}
                />
              ))}
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-slate-200 p-4">
              <div className="flex min-w-0 gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={`Message ${activeRoom.name}...`}
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button variant="primary" size="md" onClick={handleSend} aria-label="Send">
                  <Send className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-slate-400">
            <p>Select a conversation to start chatting</p>
          </div>
        )}
      </div>

      {/* Create Channel Modal - only group channels */}
      {showCreateModal && (
        <CreateChannelModal
          members={allMembers}
          projectMembers={projectMembers}
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateChannel}
        />
      )}
    </div>
  );
}

interface CreateChannelModalProps {
  members: Member[];
  projectMembers: import('@/types').ProjectMember[];
  onClose: () => void;
  onCreate: (name: string, memberIds: string[]) => void;
}

function CreateChannelModal({ members, projectMembers = [], onClose, onCreate }: CreateChannelModalProps) {
  const [name, setName] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const otherMembers = members.filter((m) => m.id !== CURRENT_USER_ID);

  const toggleMember = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    if (selectedIds.length === 0) return;
    onCreate(name.trim(), selectedIds);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">New Group Channel</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-slate-700">Channel Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Design Team, Sprint 3..."
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="mb-5">
          <label className="mb-2 block text-sm font-medium text-slate-700">Add members</label>
          <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border border-slate-200 p-2">
            {otherMembers.map((m) => {
              const selected = selectedIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMember(m.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                    selected ? 'bg-primary-50 text-primary' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <ProjectMemberAvatar member={m} projectMembers={projectMembers} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-slate-400">{m.email}</p>
                  </div>
                  {selected && <Badge variant="primary">Selected</Badge>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleSubmit}
            disabled={selectedIds.length === 0 || !name.trim()}
          >
            Create Channel
          </Button>
        </div>
      </div>
    </div>
  );
}
