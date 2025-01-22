

import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { BackgroundFetchResult } from 'expo-background-fetch';

const BACKGROUND_FETCH_TASK = 'background-fetch-task';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    // Perform your background task here
    console.log('Background fetch task executed');
    
    return BackgroundFetchResult.NewData;
  } catch (error) {
    console.error(error);
    return BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundFetchAsync() {
    console.log('Registering background fetch task');
    return BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
        minimumInterval: 10, // 15 minutes
        stopOnTerminate: false, // Android only
        startOnBoot: true, // Android only
    });
}

export async function unregisterBackgroundFetchAsync() {
  return BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
}