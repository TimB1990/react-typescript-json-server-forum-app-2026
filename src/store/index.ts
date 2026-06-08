import { useSyncExternalStore } from 'react';
import { UserStore } from './userStore';
import { CategoryStore } from './categoryStore'
import { ThreadStore } from './threadStore';
import { GroupStore } from './groupStore';
import { MessageStore } from './messageStore';
import { RepliesStore } from './repliesStore';

// Generic hook creator
function createUseStore<T>(store: { subscribe: any, getState: () => T }) {
    return () => useSyncExternalStore(store.subscribe, store.getState);
}

// Export hooks for components
export const useUserStore = createUseStore(UserStore);
export const useCategoryStore = createUseStore(CategoryStore);
export const useThreadStore = createUseStore(ThreadStore)
export const useGroupStore = createUseStore(GroupStore)
export const useMessageStore = createUseStore(MessageStore)
export const useRepliesStore = createUseStore(RepliesStore)

// Export stores for actions
export { UserStore, GroupStore, CategoryStore, ThreadStore, MessageStore, RepliesStore };