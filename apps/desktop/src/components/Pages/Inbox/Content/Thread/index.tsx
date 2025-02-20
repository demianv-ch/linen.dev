import { useEffect } from 'react';
import classNames from 'classnames';
import Header from './Header';
import Messages from './Messages';
// import JoinChannelLink from 'components/Link/JoinChannelLink';
import MessageForm from './MessageForm';
import { fetchMentions, upload } from './MessageForm/api';
import {
  Permissions,
  SerializedMessage,
  SerializedThread,
  SerializedUser,
  Settings,
  ThreadState,
  UploadedFile,
} from '@linen/types';
import { Mode } from '@linen/hooks/mode';
import useThreadWebsockets from '@linen/hooks/websockets/thread';
import styles from './index.module.scss';

interface Props {
  thread: SerializedThread;
  channelId: string;
  channelName: string;
  threadUrl?: string | null;
  isSubDomainRouting: boolean;
  settings: Settings;
  permissions: Permissions;
  currentUser: SerializedUser | null;
  mode?: Mode;
  token: string | null;
  sendMessage({
    message,
    files,
    channelId,
    threadId,
  }: {
    message: string;
    files: UploadedFile[];
    channelId: string;
    threadId: string;
  }): Promise<void>;
  updateThread({ state, title }: { state?: ThreadState; title?: string }): void;
  onClose?(): void;
  onSend?(): void;
  onMessage(
    message: SerializedMessage,
    messageId: string,
    imitationId: string
  ): void;
  onMount?(): void;
  onReaction?({
    threadId,
    messageId,
    type,
    active,
  }: {
    threadId: string;
    messageId: string;
    type: string;
    active: boolean;
  }): void;
}

export default function Thread({
  thread,
  channelId,
  channelName,
  threadUrl,
  isSubDomainRouting,
  settings,
  permissions,
  currentUser,
  mode,
  token,
  sendMessage,
  updateThread,
  onClose,
  onSend,
  onMount,
  onReaction,
  onMessage,
}: Props) {
  const { id, state, viewCount, incrementId } = thread;

  useEffect(() => {
    onMount?.();
  }, []);

  // TODO add /api/v2/count
  // useEffect(() => {
  //   fetch(`/api/count?incrementId=${incrementId}`, { method: 'PUT' });
  // }, []);

  useThreadWebsockets({
    id: thread?.id,
    token,
    permissions,
    onMessage,
  });

  function isThreadCreator(
    currentUser: SerializedUser | null,
    thread: SerializedThread
  ): boolean {
    const creator = thread.messages[0].author;
    if (!currentUser || !creator) {
      return false;
    }
    return currentUser.id === creator.id;
  }

  const manage = permissions.manage || isThreadCreator(currentUser, thread);

  return (
    <div className={classNames(styles.container)}>
      <Header
        thread={thread}
        channelName={channelName}
        onClose={onClose}
        onCloseThread={() => updateThread({ state: ThreadState.CLOSE })}
        onReopenThread={() => updateThread({ state: ThreadState.OPEN })}
        onSetTitle={(title) => updateThread({ title })}
        manage={manage}
      />
      <div className={styles.thread}>
        <Messages
          thread={thread}
          permissions={permissions}
          isSubDomainRouting={isSubDomainRouting}
          currentUser={currentUser}
          settings={settings}
          onReaction={onReaction}
        />

        <div className={styles.footer}>
          <div className={styles.count}>
            <span className={styles.subtext}>View count: {viewCount + 1}</span>
          </div>
          {/* {threadUrl && (
            <JoinChannelLink
              href={threadUrl}
              communityType={settings.communityType}
            />
          )} */}
        </div>
      </div>
      {permissions.chat && (
        <div className={styles.chat}>
          {manage && state === ThreadState.OPEN ? (
            <MessageForm
              autoFocus
              id={`thread-message-form-${thread.id}`}
              onSend={(message: string, files: UploadedFile[]) => {
                onSend?.();
                return sendMessage({ message, files, channelId, threadId: id });
              }}
              onSendAndClose={(message: string, files: UploadedFile[]) => {
                onSend?.();
                return Promise.all([
                  sendMessage({ message, files, channelId, threadId: id }),
                  updateThread({ state: ThreadState.CLOSE }),
                ]);
              }}
              fetchMentions={(term?: string) => {
                if (!term) return Promise.resolve([]);
                return fetchMentions(term, settings.communityId);
              }}
              upload={(data, options) => {
                return upload(
                  { communityId: settings.communityId, data },
                  options
                );
              }}
            />
          ) : (
            <MessageForm
              autoFocus
              id={`thread-message-form-${thread.id}`}
              onSend={(message: string, files: UploadedFile[]) => {
                onSend?.();
                return Promise.all([
                  sendMessage({ message, files, channelId, threadId: id }),
                ]);
              }}
              fetchMentions={(term?: string) => {
                if (!term) return Promise.resolve([]);
                return fetchMentions(term, settings.communityId);
              }}
              upload={(data, options) => {
                return upload(
                  { communityId: settings.communityId, data },
                  options
                );
              }}
            />
          )}
        </div>
      )}
    </div>
  );
}
