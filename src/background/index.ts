import { fetchTokenFlag, getTokenPair, getPairWithPairAddress } from '@/api/https/twitter';
import { saveDeviceInfo } from '@/background/common/information';
import init, { getConfig } from './common/initRequest';
import keysing from './keysing';
import { createPopup } from './popupOperation';
import chromeStorage from '@/popup/background/controller/cache/chromeStorage';
import { getConfigList } from '@/popup/utils/public';
import { lockController } from './keysing/lockTimer';
import { cachePair } from '@/popup/background/controller/cache/api';
const dataStorage = {};
let inviteUrlConfig;
let passWork = '';

chrome.runtime.onStartup.addListener(async function () {
  try {
    (async () => {
      init();
    })();
  } catch (error) {}
});
chrome.runtime.onInstalled.addListener(async opt => {
  init();
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
  });

  const tabId = tab.id;

  await chrome.sidePanel.setOptions({
    path: 'popup.html',
    enabled: true
  });
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  await chromeStorage.set('isPanelBehavior', true);

  let { information } = await chromeStorage.get('information');
  if (!information) {
    saveDeviceInfo();
  } else {
  }

  if (opt.reason === 'install') {
    chrome.tabs.create({
      url: 'popup.html?r=chill'
    });
  }
});
chrome.runtime.onMessage.addListener((message, sender: any, sendResponse) => {
  try {
    if (keysing.messageConfirm(message.type)) {
      keysing.messageProcess(message, (key: string, value: any) => {
        if (key === 'SET') {
          Object.assign(dataStorage, value);
          sendResponse({ status: 'success' });
        }
        if (key === 'GET') {
          sendResponse({ value: dataStorage[message.key] });
        }
      });
    } else if (message.type == 'createSidePanel') {
      try {
        if (message.isPanelBehavior) {
          getCover();
        } else {
          chrome.windows.getCurrent({ populate: false }, window => {
            chrome.tabs.sendMessage(message.tabId, { type: 'CLOSE_IFRAME' }, function (response) {
              getSidePanel();
              return true;
            });
          });
        }
      } catch (error) {}
      sendResponse('createSidePanel_re');
    } else if (message.type == 'hideIframe') {
      getCover('1');
      sendResponse('hideIframe');
    } else if (message.type == 'sidePanelStatus') {
      sendResponse('Received');
    } else if (message.type == 'getPassWord') {
      sendResponse(passWork);
    } else if (message.type == 'setPassWord') {
      passWork = message.data;
    }
    if (message.type == 'CONNECT_WALLECT_SIDEPANEL') {
      (async () => {
        await chrome.sidePanel.open({
          windowId: sender.tab.windowId
        });

        await chrome.sidePanel.setOptions({
          path: 'popup.html',
          enabled: true
        });

        await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
        await chromeStorage.set('isPanelBehavior', true);
        getTokenList(message);
      })();
      sendResponse('CONNECT_WALLECT_SIDEPANEL_RE');
      return true;
    }
    if (message.type == 'CONNECT_WALLECT') {
      getTokenList(message);

      sendResponse('CONNECT_WALLECT_RE');
      return true;
    }
    if (message.type == 'CONNECT_TO_TRANSFER_SIDEPANEL') {
      (async () => {
        await chrome.sidePanel.open({
          windowId: sender.tab.windowId
        });
        await chrome.sidePanel.setOptions({
          path: 'popup.html',
          enabled: true
        });

        await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
        await chromeStorage.set('isPanelBehavior', true);
        getTokenList(message, 'twitter');
      })();
      sendResponse('CONNECT_TO_TRANSFER_SIDEPANEL');
      return true;
    }
    if (message.type == 'CONNECT_TO_TRANSFER') {
      getTokenList(message, 'twitter');

      sendResponse('CONNECT_TO_TRANSFER');
      return true;
    }
    if (message.type == 'KEYSING_SECRETCODE_SET') {
    } else if (message.type == 'FLOATING_BALL_ENABLE') {
      setTimeout(async () => {
        let { floatingBall } = await chromeStorage.get('floatingBall');
        if (floatingBall == undefined) {
          floatingBall = true;
          await chromeStorage.set('floatingBall', true);
        }
        let { spherePosition } = await chromeStorage.get('spherePosition');
        if (spherePosition == undefined) {
          await chromeStorage.set('spherePosition', 'right');
        }
        sendResponse({ enable: floatingBall });
      }, 10);

      return true;
    } else if (message.type == 'TWITTER_ENABLE') {
      setTimeout(async () => {
        let { enableTwitter } = await chromeStorage.get('enableTwitter');
        if (enableTwitter == undefined) {
          enableTwitter = true;
          await chromeStorage.set('floatingBall', true);
        }
        sendResponse({ enable: enableTwitter });
      }, 10);

      return true;
    } else if (message.type == 'REQUES_TWITTER') {
      fetchTokenFlag(message.pathname).then(async (res: any) => {
        if (res && res.data && res.data.length > 0) {
          const pairInfo = await getTokenPair(res.data[0].chainId, res.data[0].tokenAddress);

          sendResponse({ token: res.data[0], pairInfo });
        } else {
          sendResponse(null);
        }
      });
      return true;
    } else if (message.type == 'REQUES_TWITTER_PAIR') {
      getPairWithPairAddress(message.chainId, message.pairAddress).then((pairInfo: any) => {
        sendResponse(pairInfo);
      });
      return true;
    }
  } catch (error) {}
});
chrome.windows.onRemoved.addListener(function (windowId) {});

const checkUrl = thisUrl => {
  return (
    thisUrl.indexOf('chrome-extension') != -1 ||
    thisUrl.indexOf('chrome://extensions') != -1 ||
    thisUrl.indexOf('chrome://newtab') != -1
  );
};
const getTokenList = async (message, type = '') => {
  let { isPanelBehavior } = await chromeStorage.get('isPanelBehavior');
  if (type) {
    if (!isPanelBehavior) {
      getCoverTwitter('1');
    } else {
    }
  } else {
    if (isPanelBehavior) {
    } else {
      getCover(message?.status);
    }
  }

  if (message.url) {
    chrome.runtime.sendMessage({ type: 'TRANSFER', url: message.url }).then((response: any) => {});
  } else if (message.chainId && message.tokenAddress) {
    await chromeStorage.set('swapMessage', message);
    chrome.runtime.sendMessage(
      {
        type: 'TRANSFER',
        chainId: message.chainId,
        tokenAddress: message.tokenAddress,
        pairAddress: message.pairAddress || ''
      },
      (response: any) => {}
    );
  } else if (message.keyword) {
    await chromeStorage.set('swapMessage', message);
    chrome.runtime.sendMessage({ type: 'TRANSFER', keyword: message.keyword }, (response: any) => {});
  }
};

chrome.tabs.onCreated.addListener(function (window) {
  let thisUrl = window.pendingUrl;
  if (thisUrl) {
    if (checkUrl(thisUrl)) {
      chromeStorage.set('hasUrlIframe', false);
    } else {
      chromeStorage.set('hasUrlIframe', true);
    }
  }
});
export const getConfigInviteUrl = chillConfigList => {
  let inviteUrl = '';
  let list = chillConfigList?.configList || [];
  if (list && list.length > 0) {
    let arr = list.filter(item => {
      return item.dataKey == 'inviteLink';
    });
    if (arr && arr.length > 0) {
      inviteUrl = arr[0].dataValue;
    }
  }
  return inviteUrl;
};
chrome.tabs.query({}, function async(tabs: any) {
  (async () => {
    let { inviteCode } = await chromeStorage.get('inviteCode');
    let { chillConfigList } = await chromeStorage.get('chillConfigList');

    if (!chillConfigList) {
      let res = await getConfig();
      if (res) {
        let { chillConfigList } = await chromeStorage.get('chillConfigList');
        inviteUrlConfig = getConfigInviteUrl(chillConfigList);
      }
    } else {
      inviteUrlConfig = getConfigInviteUrl(chillConfigList);
    }
    if (inviteUrlConfig) {
      if (!inviteCode) {
        let inviteUrl, code;
        tabs.map(item => {
          if (item.url.indexOf(inviteUrlConfig) != -1) {
            inviteUrl = item.url;
          } else {
          }
        });
        if (inviteUrl && inviteUrl.indexOf('?r=') != -1) {
          code = inviteUrl.split('?r=')[1];
        }
        if (inviteUrl) {
          await chromeStorage.set('inviteCodeInitialize', 1);
        }
        if (code) {
          await chromeStorage.set('inviteCode', code);
        }
      } else {
      }
    } else {
    }
  })();
});
const getUrlChange = async (type = '', isUrl = '') => {
  let { isPanelBehavior } = await chromeStorage.get('isPanelBehavior');

  chrome.tabs.query({ active: true, currentWindow: true }, async function (tabs: any) {
    let thisUrl = tabs[0] ? tabs[0].url : '';
    if (!type) {
      if (tabs[0] && tabs[0].id) {
        if (isPanelBehavior) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'CLOSE_IFRAME' }, function (response) {});
        } else {
          getSidePanel();
          if (!isUrl) {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'SUSPENDED_BALL' }, function (response) {});
          }
        }
      }
    }
    if (thisUrl) {
      if (checkUrl(thisUrl)) {
        chromeStorage.set('hasUrlIframe', false);
      } else {
        chromeStorage.set('hasUrlIframe', true);
      }
    }
  });
};
chrome.tabs.onActivated.addListener(async activeInfo => {
  getUrlChange('', '1');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) {
    if (
      changeInfo.url &&
      !changeInfo.url?.includes('chrome-extension:') &&
      !changeInfo.url?.includes('&isFromChill=true')
    ) {
      chrome.runtime.sendMessage({ type: 'TRANSFER', url: changeInfo.url }).then((response: any) => {});
    }
  }
});

chrome.webNavigation.onCompleted.addListener(async function (details) {
  getUrlChange('1');
  if (
    details.url &&
    !details.url?.includes('chrome-extension:') &&
    !details.url?.includes('about:blank') &&
    !details.url?.includes('&isFromChill=true')
  ) {
    chrome.runtime.sendMessage({ type: 'TRANSFER', url: details.url }).then((response: any) => {});
  }
  if (details.url && details.url.indexOf('?r=') != -1) {
    const code = details.url.split('?r=')[1];

    if (code) {
      await chromeStorage.set('inviteCode', code);
    }
  }
});

chrome.action.onClicked.addListener(async tab => {
  if (tab.url) {
    let thisUrl = `${tab.url}`;
    if (checkUrl(thisUrl)) {
      getSidePanel();
      await chromeStorage.set('isPanelBehavior', true);
      return;
    }
    getCurrentWindow('1', tab);
  } else {
    await chromeStorage.set('isPanelBehavior', true);
    getSidePanel();
  }
});
const clostH5Iframe = async () => {
  chromeStorage.set('isCloseH5Iframe', '1');
  chrome.tabs.query({ active: true, currentWindow: true }, function async(tabs: any) {
    if (tabs[0] && tabs[0].id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: 'CLOSE_IFRAME' }, function (response) {});
    }
  });
};
chrome.windows.onFocusChanged.addListener(function (windowId) {
  if (windowId == chrome.windows.WINDOW_ID_CURRENT) {
  } else {
  }
});

const getCurrentWindow = async (e = '', tab = {}) => {
  let { isPanelBehavior } = await chromeStorage.get('isPanelBehavior');
  chrome.windows.getCurrent({ populate: false }, async window => {
    const windowWidth = window.width;

    if (Number(windowWidth) < 1900) {
      if (isPanelBehavior) {
        getSidePanel();
        await chromeStorage.set('isPanelBehavior', true);
        return;
      }
      await chromeStorage.set('isPanelBehavior', false);
      getCover(e);
    } else {
      if (!isPanelBehavior && isPanelBehavior != undefined) {
        getCover(e);
        await chromeStorage.set('isPanelBehavior', false);
        return;
      }
      await chromeStorage.set('isPanelBehavior', true);
      getSidePanel();
    }
  });
};
const getSidePanel = async () => {
  try {
    chrome.sidePanel.getPanelBehavior(async e => {
      const [tab] = await chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
      });

      const tabId = tab.id;
      await chrome.sidePanel.setOptions({
        path: 'popup.html',
        enabled: true
      });
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      await chrome.sidePanel.open({ windowId: tab.windowId });

      await chromeStorage.set('isPanelBehavior', true);
    });
  } catch (error) {}
};
let iframeStatus = true;
const getCover = (e = '') => {
  try {
    let url = `chrome-extension://${chrome.runtime.id}/popup.html`;
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs.length > 0) {
        let currentTab: any = tabs[0].id;
        if (iframeStatus) {
          iframeStatus = false;
          chrome.tabs.sendMessage(currentTab, { type: 'INJECT_IFRAME', url: url, status: e }, function (data) {
            chromeStorage.set('isPanelBehavior', false);

            iframeStatus = true;
          });
        }
      }
    });
  } catch (error) {
    iframeStatus = true;
  }
};
const getCoverTwitter = (e = '') => {
  let url = `chrome-extension://${chrome.runtime.id}/popup.html`;
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab: any = tabs[0].id;
    chrome.tabs.sendMessage(currentTab, { type: 'INJECT_IFRAME_TWITTER', url: url, status: e }, function (data) {});
  });
};
