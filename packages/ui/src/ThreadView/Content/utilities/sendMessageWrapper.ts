import { v4 as uuid } from 'uuid';
import { username } from '@linen/serializers/user';
import {
  MessageFormat,
  SerializedMessage,
  UploadedFile,
  SerializedThread,
  SerializedUser,
} from '@linen/types';
import debounce from '@linen/utilities/debounce';

const debouncedSendMessage = debounce(
  ({
    message,
    files,
    communityId,
    channelId,
    threadId,
    imitationId,
    apiCreateMessage,
  }: {
    message: string;
    files: UploadedFile[];
    communityId: string;
    channelId: string;
    threadId: string;
    imitationId: string;
    apiCreateMessage(...args: any): Promise<any>;
  }) => {
    return apiCreateMessage({
      body: message,
      files,
      accountId: communityId,
      channelId,
      threadId,
      imitationId,
    });
  },
  100
);

export function sendMessageWrapper({
  currentUser,
  startSignUp,
  currentCommunity,
  allUsers,
  setThread,
  apiCreateMessage,
}: {
  currentUser: any;
  startSignUp?(...args: any): any;
  currentCommunity: any;
  allUsers: SerializedUser[];
  setThread: Function;
  apiCreateMessage(...args: any): Promise<any>;
}) {
  return async ({
    message,
    files,
    channelId,
    threadId,
  }: {
    message: string;
    files: UploadedFile[];
    channelId: string;
    threadId: string;
  }) => {
    if (!currentUser) {
      startSignUp?.({
        communityId: currentCommunity.id,
        onSignIn: {
          run: sendMessageWrapper,
          init: {
            currentCommunity,
            allUsers,
            setThread,
          },
          params: {
            message,
            channelId,
            threadId,
          },
        },
      });
      return;
    }
    const imitation: SerializedMessage = {
      id: uuid(),
      body: message,
      sentAt: new Date().toISOString(),
      usersId: currentUser.id,
      mentions: allUsers,
      attachments: files.map((file) => {
        return { name: file.id, url: file.url };
      }),
      reactions: [],
      threadId,
      messageFormat: MessageFormat.LINEN,
      externalId: null,
      author: {
        id: currentUser.id,
        externalUserId: currentUser.externalUserId,
        username: username(currentUser.displayName),
        displayName: currentUser.displayName,
        profileImageUrl: currentUser.profileImageUrl,
        authsId: null,
      },
    };

    setThread((thread: SerializedThread) => {
      return {
        ...thread,
        messages: [...thread.messages, imitation],
      };
    });

    return debouncedSendMessage({
      message,
      files,
      communityId: currentCommunity.id,
      channelId,
      threadId,
      imitationId: imitation.id,
      apiCreateMessage,
    }).then(
      ({
        message,
        imitationId,
      }: {
        message: SerializedMessage;
        imitationId: string;
      }) => {
        setThread((thread: SerializedThread) => {
          const messageId = message.id;
          const index = thread.messages.findIndex((t) => t.id === messageId);
          if (index >= 0) {
            return thread;
          }
          return {
            ...thread,
            messages: [
              ...thread.messages.filter(
                (message) => message.id !== imitationId
              ),
              message,
            ],
          };
        });
      }
    );
  };
}
