import { ConnectParames } from '@/popup/service/types';
import { objToUrlSearch } from '@/utils';
const width = 380;
const height = 620;
const top = 0;
const left = 0;
export const createPopup = (params: ConnectParames) => {};

export const closePopup = () => {
  chrome.windows.getCurrent({}, w => {
    chrome.windows.remove(w.id as number);
  });
};
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(error => console.error(error));
